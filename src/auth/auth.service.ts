import { JwtService } from '@nestjs/jwt';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { InjectModel } from '@nestjs/mongoose';
import { HUserDocument, User } from 'src/DB/Models/user.model';
import { Model } from 'mongoose';
import { compare, hash } from 'src/common/security/hash.security';
import { MailService } from 'src/mail/mail.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ProviderEnum } from 'src/common/enums/user.enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<HUserDocument>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await hash(otp);

    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 5);

    if (existingUser) {
      throw new ConflictException(
        'An Account with this email address already exists',
      );
    }

    const hashedPassword = await hash(createUserDto.password);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      confirmEmailOtp: hashedOTP,
      otpExpiresAt: expireTime,
    });

    const savedUser = await newUser.save();

    await this.mailService.sendVerficationOtp(savedUser.email, otp);

    return savedUser;
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDto) {
    const user = await this.userModel.findOne({
      email: confirmEmailDto.email,
    });

    if (!user) {
      throw new NotFoundException(
        'No Account Record Matches This Email Address',
      );
    }

    if (user.confirmEmail) {
      throw new BadRequestException(
        'This Email Account Has Already Been Confirmed',
      );
    }

    if (
      !user.confirmEmailOTP ||
      !(await compare(confirmEmailDto.confirmEmailOtp, user.confirmEmailOTP))
    ) {
      throw new BadRequestException(
        'The Verification Code Is Provided Incorrect',
      );
    }

    if (new Date() > user.otpExpiresAt!) {
      throw new BadGatewayException(
        'The Verification Code Has Expired. Please Sign Up Again',
      );
    }

    user.confirmEmail = new Date();
    user.confirmEmailOTP = undefined;

    await user.save();

    return {
      message: 'Email Confirmed Successfully',
    };
  }

  async login(login: any) {
    const { email, password } = login;

    const user = await this.userModel.findOne({
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.SYSTEM,
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const accessToken = this.jwtService.sign(
      {
        id: user._id,
        email: user.email,
      },
      {
        secret: process.env.ACCESS_TOKEN_SECRET!,
        expiresIn: '1d',
      },
    );

    return {
      message: 'Login Success',
      accessToken,
    };
  }

  async getProfile(@Req() req: any) {
    const user = await this.userModel
      .findById(req.user?.['id'])
      .select('-password');

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    return user;
  }
}
