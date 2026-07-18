import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: object) {
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '1d',
    });
  }

  verifyToken<T extends object = Record<string, unknown>>(token: string): T {
    return this.jwtService.verify<T>(token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  decodeToken<T = string | Record<string, unknown> | null>(token: string): T {
    return this.jwtService.decode<T>(token);
  }
}
