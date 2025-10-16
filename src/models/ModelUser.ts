import { CommonPlatform, CommonStatus, UserRole } from './common';

export type CreateMemberDto = {
  avatarUrl: string;
  name: string;
  parent: string;
  password: string;
  rootUserId: string;
  userName: string;
};

export type ILoginQr = {
  code: string;
  userId?: string;
};

export type IResponseLoginUser = {
  accessToken: string;
  expiresIn: number;
  user: IUser;
};

export type IUser = {
  _id: string;
  ancestors?: string[];
  avatarUrl: string;
  createdAt: Date;
  email: string;
  extraInfo: any;
  isOnline: boolean;
  name: string;
  parent?: string;
  password?: string;
  permissions?: Record<string, any>;
  platform: CommonPlatform;
  role: UserRole;
  status: CommonStatus;
  system: string;
  userId: string;
  userName: string;
};

export type IUserFacebook = {
  email: string;
  id: string;
  name: string;
  picture: {
    data: {
      url: string;
    };
  };
};

export type LoginDto = {
  accessToken: string;
  email: string;
  id: string;
  image: string;
  name?: string;
  platform: string;
};

export type LoginSystemDto = {
  password: string;
  system: string;
  userName: string;
};

export type UpdateMemberDto = {
  _id: string;
  avatarUrl: string;
  name: string;
  password?: string;
  rootUserId: string;
  userName: string;
};
