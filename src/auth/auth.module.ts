import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { WsModule } from '../ws/ws.module';

@Module({
  imports: [
    UsersModule,
    WsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): JwtModuleOptions => {
        const secret = cfg.get<string>('JWT_SECRET', 'change_me');

        // Importante: castear a StringValue (ej: "1d", "12h", "3600s")
        const expiresIn = cfg.get<string>('JWT_EXPIRES_IN', '1d') as StringValue;

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}