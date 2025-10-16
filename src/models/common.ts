import { CSSProperties, ReactElement, ReactNode } from 'react';

import { ICondition } from './ModelPage';

export enum ActionWebview {
  LOGIN_FACEBOOK = 'LOGIN_FACEBOOK',
  LOGIN_FACEBOOK_SUCCESS = 'LOGIN_FACEBOOK_SUCCESS',
  OPEN_CODE_SCANNER = 'OPEN_CODE_SCANNER',
  POP = 'POP',
  PUSH = 'PUSH',
}

export enum CommonPlatform {
  apple = 'apple',
  business = 'business',
  facebook = 'facebook',
  page_group = 'page_group',
  personal_zalo = 'personal_zalo',
  tiktok_shop = 'tiktok_shop',
  xiai = 'xiai',
  zalo_oa = 'zalo_oa',
}

export enum CommonStatus {
  activated = 'activated', // hoạt động
  deactivated = 'deactivated', // ngừng hoạt động
}

export enum CommonStatusBot {
  deactivated,
  activated,
}

export enum EGender {
  'Male',
  'Female',
}

export enum GenderEnum {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  OTHER = 'OTHER',
}

export enum KeyRegex {
  GENDER = '#SEX{{MALE | FEMALE | UNKNOWN}}',
  PSID = '{{psid}}',
  RANDOM = '#{SPIN_1 | SPIN_2}',
  USER_FULL_NAME = '{{user_full_name}}',
}

export enum PageRole {
  ADMIN = 'ADMIN',
  CREATE_CONTENT = 'CREATE_CONTENT',
  MODERATE = 'MODERATE',
  VIEWER = 'VIEWER',
}

export enum PrefixPlatformEnum {
  business = 'b',
  page_group = 'pg',
  personal_zalo = 'pzl',
  tiktok_shop = 'tts',
  zalo_oa = 'oa',
}

export enum RepeatType {
  DAILY = 1,
  MONTHLY = 3,
  NONE = 0,
  WEEKLY = 2,
}

export enum RoleInPageEnum {
  ADMINISTER = 'ADMINISTER',
}

export enum SourceScopedUser {
  ADS = 'ADS',
  CUSTOMER_CHAT_PLUGIN = 'CUSTOMER_CHAT_PLUGIN',
  INBOX = 'INBOX',
  POST = 'POST',
  SHORTLINK = 'SHORTLINK',
}

export enum TypeAttachment {
  document = 'document',
  link = 'link',
  media = 'media',
}

export enum TypeConversation {
  COMMENT = 'COMMENT',
  INBOX = 'INBOX',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export type AppPropsWithLayout = {
  Component: NextPageWithLayout;
};

export type CommonFilter = {
  name?: string;
};

export type IAttachment = {
  attachmentId: string;
  expiresIn: number;
  filename: string;
  filetype: string;
  size: number;
  thumbnailUrl: string;
  url: string;
};

export type IconProps = {
  className?: string;
  height?: number;
  style?: CSSProperties;
  width?: number;
};

export type IFilterPageAttachment = {
  type: TypeAttachment;
} & CommonFilter;

export type IFilterUser = {
  conditions?: ICondition[];
  sequences?: string[];
  tags?: string[];
  typeFilter?: 'all' | 'any';
} & CommonFilter;

export type IFlowsFilter = {} & CommonFilter;

export type IPaging = {
  limit: number;
  page: number;
};

export type IResponse<T> = {
  data: T;
  pagination: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    nextPage: number;
    page: number;
    pagingCounter: number;
    prevPage: number;
    totalDocs: number;
    totalPages: number;
  };
};

export type ITimeRange = {
  since: Date;
  until: Date;
};

export type LayoutProps = {
  children: ReactNode;
};
export type NextPageWithLayout = {
  Layout?: (page: LayoutProps) => ReactElement;
};
