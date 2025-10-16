import { Flag, UsersThree } from 'phosphor-react-native';
import { ReactNode } from 'react';

export type ItemInsight = {
  condition?: boolean;
  icon: Element;
  key: string;
  label: ReactNode;
};

export type StatisticsFanpageTable = {
  customer_comment_count: number;
  customer_inbox_count: number;
  hour: Date;
  inbox_interactive_count: number;
  new_customer_count: number;
  new_inbox_count: number;
  order_count: number;
  page_comment_count: number;
  page_id: string;
  page_inbox_count: number;
  phone_number_count: number;
  today_uniq_website_referral: number;
  today_website_guest_referral: number;
  total_interactions?: number;
  uniq_phone_number_count: number;
};

export const handleListInsight = () => {
  const listItemInsight: ItemInsight[] = [
    {
      icon: Flag,
      key: 'page',
      label: 'Trang',
    },
    {
      icon: UsersThree,
      key: 'staff',
      label: 'Nhân viên',
    },
    // {
    //   label: 'Tương tác',
    //   key: 'interact',
    //   icon: PiChat,
    // },
    // {
    //   label: 'Thẻ hội thoại',
    //   key: 'tag',
    //   icon: PiTag
    // },
  ];

  return listItemInsight;
};

export type StatisticsStaffTable = {
  average_response_time: number;
  comment_count: number;
  hour: Date;
  inbox_count: number;
  order_count: number;
  page_id: string;
  phone_number_count: number;
  private_reply_count: number;
  total_interaction?: number;
  unique_comment_count: number;
  unique_inbox_count: number;
  user_id: string;
  user_name: string;
};
