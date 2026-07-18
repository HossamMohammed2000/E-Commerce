import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);

    return {
      success: true,
      message:
        'Registration successful. Please check your inbox for verification code.',
      user,
    };
  }

  @Patch('confirm-email')
  async confirmEmail(@Body() confirmEmail: ConfirmEmailDto) {
    return await this.authService.confirmEmail(confirmEmail);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() login: any) {
    return await this.authService.login(login);
  }

  @Get('getProfile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: any) {
    return await this.authService.getProfile(req);
  }
}
