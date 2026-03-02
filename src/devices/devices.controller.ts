import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DevicesService } from './devices.service';
import { SendCommandDto } from './dto/send-command.dto';

@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post(':deviceId/commands')
  async sendCommand(@Param('deviceId') deviceId: string, @Body() dto: SendCommandDto) {
    return this.devicesService.sendCommandToDevice(deviceId, dto);
  }
}