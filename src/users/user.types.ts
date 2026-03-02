export type UserEntity = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = Omit<UserEntity, 'passwordHash'>;