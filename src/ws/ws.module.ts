import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WsGateway } from './ws.gateway';

@Module({
  // JwtModule para poder verificar token dentro del gateway
  imports: [JwtModule.register({})],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class WsModule {}