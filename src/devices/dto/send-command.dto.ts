import { IsObject, IsOptional, IsString } from 'class-validator';

export class SendCommandDto {
  @IsString()
  type: string; // ej: "relay.set", "servo.move", "reboot"

  @IsOptional()
  @IsObject()
  data?: Record<string, any>; // payload libre
}