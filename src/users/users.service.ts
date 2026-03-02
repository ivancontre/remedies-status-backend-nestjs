import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async createUser(params: { email: string; name: string; passwordHash: string }) {
    const exists = await this.userModel.exists({ email: params.email.toLowerCase() });
    if (exists) throw new ConflictException('Email ya está registrado');

    const user = await this.userModel.create({
      email: params.email.toLowerCase(),
      name: params.name,
      passwordHash: params.passwordHash,
    });

    // por default passwordHash está select:false, así que user.toJSON() ya no lo incluye
    return user;
  }

  async findByEmailWithPassword(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no existe');
    return user;
  }

  async listUsers() {
    return this.userModel.find().sort({ createdAt: -1 });
  }
}