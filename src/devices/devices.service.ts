import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MqttService } from '../mqtt/mqtt.service';
import { SendCommandDto } from './dto/send-command.dto';

@Injectable()
export class DevicesService {
  constructor(
    private readonly mqtt: MqttService,
    private readonly cfg: ConfigService,
  ) {}

  async sendCommandToDevice(deviceId: string, dto: SendCommandDto) {
    // (Opcional) validar que el device exista en Mongo
    // const device = await this.devicesRepo.findById(deviceId)
    // if (!device) throw new NotFoundException('Device no existe')

    const env = this.cfg.get<string>('APP_ENV', 'dev');
    const topic = `v1/${env}/devices/${deviceId}/cmd`;

    const message = {
      type: dto.type,
      data: dto.data ?? {},
      ts: new Date().toISOString(),
      // Muy útil si luego quieres correlación:
      msgId: cryptoRandomId(),
    };

    // QoS recomendado: 1 para comandos importantes
    await this.mqtt.publish(topic, message, { qos: 1, retain: false });

    return { ok: true, topic, message };
  }
}

function cryptoRandomId() {
  // simple, sin deps
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}