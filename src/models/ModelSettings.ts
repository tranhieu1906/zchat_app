import { ReactNode } from 'react';

import { IconProps } from './common';
import { IUser } from './ModelUser';

export type ItemSetting = {
  children: {
    condition?: boolean;
    icon?: React.FC<IconProps>;
    key: string;
    label: string;
  }[];
  label: React.ReactNode;
};

export type PermissionItem = {
  children?: PermissionItem[];
  feature: string;
  hiddenPermission?: ('create' | 'delete' | 'read' | 'update')[];
  key: string;
};

// export const handleListItemSetting = (page: IPage, user?: IUser) => {
//   const listItemSetting: ItemSetting[] = [
//     {
//       children: [
//         {
//           condition: hasPermission(
//             user?.permissions,
//             PermissionsGroup.generalSetting,
//             ['read'],
//           ),
//           key: 'general',
//           label: 'Cấu hình chung',
//         },
//         // { label: 'Notifications', key: 'notifications' },
//         // { label: 'Team Members', key: 'teamMembers' },
//         // { label: 'Logs', key: 'logs' },
//         // { label: 'Billing', key: 'billing' },
//       ],
//       label: 'Chính',
//     },
//     {
//       children: [
//         {
//           condition: hasPermission(
//             user?.permissions,
//             PermissionsGroup.chatSetting,
//             ['read'],
//           ),
//           key: 'chat',
//           label: 'Trò chuyện trực tiếp',
//         },
//         {
//           condition: hasPermission(
//             user?.permissions,
//             PermissionsGroup.autoAssignmentSetting,
//             ['read'],
//           ),
//           key: 'autoAssignment',
//           label: 'Tự động phân công',
//         },
//       ],
//       label: 'Tin nhắn',
//     },
//     {
//       children: [
//         {
//           condition:
//             page.platform === CommonPlatform.facebook &&
//             hasPermission(
//               user?.permissions,
//               PermissionsGroup.messengerSetting,
//               ['read'],
//             ),
//           icon: MessengerIcon,
//           key: 'messenger',
//           label: 'Messenger',
//         },
//         {
//           condition: page.platform === CommonPlatform.personal_zalo,
//           icon: ZaloIcon,
//           key: 'zalo',
//           label: 'Zalo',
//         },
//         // { label: 'Instagram', key: 'instagram', icon: InstagramIcon  },
//         // { label: 'SMS', key: 'sms', icon: SMSIcon },
//         // { label: 'Email', key: 'email', icon: EmailIcon },
//         // { label: 'WhatsApp', key: 'whatsApp', icon: WhatsAppIcon },
//         // { label: 'Telegram', key: 'telegram', icon: TelegramIcon },
//       ],
//       label: 'Nền tảng',
//     },
//     {
//       children: [
//         // { label: 'Growth Tools', key: 'growTools' },
//         // { label: 'Fields', key: 'fields' },
//         {
//           condition: hasPermission(
//             user?.permissions,
//             PermissionsGroup.tagsSetting,
//             ['read'],
//           ),
//           key: 'tags',
//           label: 'Thẻ khách hàng',
//         },
//         {
//           condition: hasPermission(
//             user?.permissions,
//             PermissionsGroup.quickReplySetting,
//             ['read'],
//           ),
//           key: 'quickReply',
//           label: 'Tin nhắn nhanh',
//         },
//       ],
//       label: 'Automation',
//     },
//     {
//       children: [
//         // { label: 'API', key: 'api' },
//         // { label: 'Apps', key: 'apps' },
//         {
//           condition: hasPermission(
//             user?.permissions,
//             PermissionsGroup.integrationsSetting,
//             ['read'],
//           ),
//           key: 'integrations',
//           label: 'Tích hợp',
//         },
//         // { label: 'Payment', key: 'payment' },
//         // { label: 'Installed Templates', key: 'templates' },
//       ],
//       label: 'Tiện ích',
//     },
//   ];

//   return listItemSetting;
// };

export enum ETypeAssignment {
  accountAssignment = 'accountAssignment',
  autoAssignOff = 'autoAssignOff',
  selfAssignment = 'selfAssignment',
  teamAssignment = 'teamAssignment',
}

export type ContentSetting = {
  content: ReactNode;
  description?: ReactNode;
  title: string;
};

export type ListContentSetting = {
  contentCenter?: React.ReactNode;
  contentLeft?: React.ReactNode;
  contentRight?: React.ReactNode;
};

export type LoginOdooDto = {
  baseUrl: string;
  email: string;
  pageId: string;
  password: string;
};

export type TeamAssignment = {
  id: string;
  name: string;
  ratio: number;
  userIds: string[];
};

export type UserAssignment = {
  id: string;
  ratio: number;
};

export const listPermission: PermissionItem[] = [
  {
    feature: 'Thiết lập trang',
    hiddenPermission: ['create'],
    key: 'pageSetup',
  },
  {
    children: [
      {
        feature: 'Luồng tin nhắn',
        key: 'flow',
      },
      {
        feature: 'Từ khoá',
        key: 'keyword',
      },
      {
        feature: 'Kịch bản chăm sóc',
        key: 'sequence',
      },
    ],
    feature: 'Automation',
    key: 'automation',
  },
  {
    children: [
      {
        feature: 'Cấu hình chung',
        hiddenPermission: ['create', 'delete'],
        key: 'generalSetting',
      },
      {
        feature: 'Trò chuyện trực tiếp',
        key: 'chatSetting',
      },
      {
        feature: 'Tự động phân công',
        hiddenPermission: ['create', 'delete'],
        key: 'autoAssignmentSetting',
      },
      {
        feature: 'Messenger',
        key: 'messengerSetting',
      },
      {
        feature: 'Thẻ khách hàng',
        key: 'tagsSetting',
      },
      {
        feature: 'Tin nhắn nhanh',
        key: 'quickReplySetting',
      },
      {
        feature: 'Tích hợp',
        key: 'integrationsSetting',
      },
    ],
    feature: 'Cài đặt',
    key: 'setting',
  },
];

export enum TypePermission {
  system = 'system',
  user = 'user',
}

export type CreatePermissionDto = {
  name: string;
  note: string;
  permissions: PermissionPayload;
};

export type IPermission = {
  _id: string;
  createdAt: Date;
  createdBy: IUser;
  name: string;
  note: string;
  permissions: Record<string, any>;
  system: string;
  type: TypePermission;
  updatedAt: Date;
};

export type PermissionPayload = Record<string, Record<string, boolean>>;

export type UpdatePermissionDto = {
  _id: string;
} & CreatePermissionDto;
