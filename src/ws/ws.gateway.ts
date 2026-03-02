import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/ws',
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService, private readonly cfg: ConfigService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ||
        (client.handshake.headers?.authorization?.toString().startsWith('Bearer ')
          ? client.handshake.headers.authorization.toString().slice(7)
          : undefined);

      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.cfg.get<string>('JWT_SECRET', 'change_me'),
      });

      // Guardar info del usuario en socket
      client.data.user = { userId: payload.sub, email: payload.email };
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // opcional: logs
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  @SubscribeMessage('ping')
  ping(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    return { event: 'pong', data: { ok: true, body, user: client.data.user ?? null } };
  }
}