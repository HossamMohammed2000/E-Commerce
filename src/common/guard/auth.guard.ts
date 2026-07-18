
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { HUserDocument, User } from 'src/DB/Models/user.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
constructor(
    @InjectModel(User.name) private readonly userModel:Model<HUserDocument>,
    private jwtService: JwtService){}

 async canActivate(
    context: ExecutionContext,
  ):Promise<boolean>{
    const request = context.switchToHttp().getRequest();


    const authHeader = request.headers.authorization

    if(!authHeader)
        throw new UnauthorizedException("Missing Authorization Header");

    const token = authHeader.split(" ")[1];
 if(!token)
    throw new UnauthorizedException("Invalid Token Format");
const payload = await this.jwtService.verify(token , {
    secret:process.env.ACCESS_TOKEN_SECRET,
});
const user = await this.userModel.findById(payload.id);
if(!user)
    throw new NotFoundException("User Not Found");
request.user = user;
    return true;
  }
}
