import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

type PublishOpts = { qos?: 0 | 1 | 2; retain?: boolean };

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client!: mqtt.MqttClient;

  constructor(private readonly cfg: ConfigService) {}

  onModuleInit() {
    const url = this.cfg.get<string>('MQTT_URL')!;
    const username = this.cfg.get<string>('MQTT_USERNAME') || undefined;
    const password = this.cfg.get<string>('MQTT_PASSWORD') || undefined;
    const clientId = this.cfg.get<string>('MQTT_CLIENT_ID') || undefined;

    this.client = mqtt.connect(url, {
      username,
      password,
      clientId,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30_000,
      keepalive: 60,
    });

    this.client.on('connect', () => console.log('[MQTT] connected'));
    this.client.on('reconnect', () => console.log('[MQTT] reconnecting'));
    this.client.on('error', (e) => console.error('[MQTT] error', e?.message || e));
  }

  async publish(topic: string, payload: any, opts: PublishOpts = {}) {
    const message = JSON.stringify(payload);
    const { qos = 1, retain = false } = opts;

    await new Promise<void>((resolve, reject) => {
      this.client.publish(topic, message, { qos, retain }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  onModuleDestroy() {
    if (this.client) this.client.end(true);
  }
}