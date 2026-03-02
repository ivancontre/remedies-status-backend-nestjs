import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class MqttController {
  private readonly logger = new Logger(MqttController.name);

  // Recibe mensajes publicados a "users/ping"
  @EventPattern('users/ping')
  handlePing(@Payload() data: any) {
    this.logger.log(`MQTT users/ping: ${JSON.stringify(data)}`);
    // aquí podrías ejecutar lógica (ej: crear usuario, activar algo, etc.)
  }
}