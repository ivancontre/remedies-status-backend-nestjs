import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MqttService } from '../mqtt/mqtt.service';
import { WsGateway } from '../ws/ws.gateway';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mqttService: MqttService,
    private readonly wsGateway: WsGateway,
  ) {}

  async register(params: { email: string; name: string; password: string }) {
    const passwordHash = await bcrypt.hash(params.password, 12);

    const user = await this.usersService.createUser({
      email: params.email,
      name: params.name,
      passwordHash,
    });

    // ✅ Publica evento MQTT
    // await this.mqttService.publish('users/created', {
    //   id: user.id,
    //   email: user.email,
    //   name: user.name,
    //   createdAt: (user as any).createdAt,
    // });

    // Notificar por websocket (broadcast)
    // this.wsGateway.broadcast('user.created', {
    //   id: user.id,
    //   email: user.email,
    //   name: user.name,
    //   createdAt: (user as any).createdAt,
    // });

    const token = await this.signToken(user.id, user.email);
    return { user, token };
  }

  async login(params: { email: string; password: string }) {
    const user = await this.usersService.findByEmailWithPassword(params.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(params.password, (user as any).passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const safeUser = await this.usersService.findById(user.id);

    // (opcional) evento de login
    await this.mqttService.publish('users/logged_in', {
      id: safeUser.id,
      email: safeUser.email,
      at: new Date().toISOString(),
    });

    const token = await this.signToken(safeUser.id, safeUser.email);
    return { user: safeUser, token };
  }

  private async signToken(userId: string, email: string) {
    return this.jwtService.signAsync({ sub: userId, email });
  }
}