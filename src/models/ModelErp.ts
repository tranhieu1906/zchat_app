export enum StaffRole {
  accounter = 'accounter',
  carepage = 'carepage',
  crm_teams_manager = 'crm_teams_manager',
  customer_care = 'customer_care',
  hr_user = 'hr_user',
  manager = 'manager',
  marketing = 'marketing',
  marketing_leader = 'marketing_leader',
  marketing_teams_manager = 'marketing_teams_manager',
  sale_leader = 'sale_leader',
  sale_order_operator = 'sale_order_operator',
  sale_resale = 'sale_resale',
  super_admin = 'super_admin',
  system_manager = 'system_manager',
  thanhtra = 'thanhtra',
}

export type CreateContactDto = {
  address: string;
  address_district: number;
  address_state: number;
  address_town: number;
  birthday: Date;
  categoryId: number;
  contact_creator_id: number;
  country_type_id: number;
  crm_lead_team_id: number;
  crm_lead_user_id: number;
  erpBaseUrl: string;
  facebook: string;
  feedId: string;
  linkhoithoaipancake: string;
  name: string;
  nguoi_len_so_id: number;
  nguoidangnhap_id: number;
  nhanviencarepage_id: number;
  note: string;
  pageId: string;
  phone: string;
  phone2: string;
  quoc_tich_id: number;
  sale_crm_lead_user_id: number;
  scopedUserId: string;
  source_id: number;
  tag_ids: number[];
  tenpage_zchat: string;
};

export type FilterUserErp = {
  getSale?: boolean;
  groupName?: string;
  staffRole?: StaffRole;
};

export type IAddressCountry = {
  id: number;
  name: string;
};

export type IAddressDistrict = {
  code: string;
  id: number;
  name: string;
  state_id: {
    id: number;
    name: string;
  };
};

export type IAddressState = {
  code: string;
  id: number;
  name: string;
};

export type IAddressTown = {
  code: string;
  district_id: {
    id: number;
    name: string;
  };
  id: number;
  name: string;
  state_id: {
    id: number;
    name: string;
  };
};

export type IApiCreateCustomer = {
  api_url: string;
  id: number;
  name: string;
  product_category_id: {
    display_name: string;
    id: number;
  };
  utm_source_id: {
    display_name: string;
    id: number;
  };
};

export type ICategory = {
  id: number;
  name: string;
};

export type IContactErp = {
  contact_creator_id: {
    id: number;
    name: string;
  };
  country_type_id: {
    id: number;
    name: string;
  };
  create_uid: {
    id: number;
    name: string;
  };
  crm_lead_user_id: {
    id: number;
    name: string;
  };
  facebook: string;
  id: number;
  link_erp: string;
  name: string;
  nhanviencarepage_id?: {
    id: number;
  };
  phone: string;
  product_category_id: {
    id: number;
    name: string;
  };
  res_partner_f99id: string;
  sale_order_ids: any[];
  source_id: {
    id: number;
    name: string;
  };
  street2: string;
};

export type ICustomerSource = {
  channel_id: {
    id: number;
    name: string;
  };
  crm_group_id: {
    id: number;
    name: string;
  };
  crmf99_system_id: {
    id: number;
    name: string;
  };
  id: number;
  marketing_team_id: string;
  name: string;
  product_category_id: {
    id: number;
    name: string;
  };
  user_id: {
    id: number;
    name: string;
  };
};

export type IPriceErp = {
  currency_id: {
    id: number;
    name: string;
  };
  id: number;
  name: string;
};

export type IUserErpResponse = {
  crm_group_id: {
    id: number;
    name: string;
  };
  crm_group_ids: {
    id: number;
    name: string;
  }[];
  crm_position: StaffRole;
  crm_position_display: string;
  crmf99_system_id: {
    id: number;
    name: string;
  };
  f99_uid: string;
  id: number;
  marketing_team_id: {
    id: number;
    name: string;
  };
  name: string;
  operatable_sale_team_ids: any[];
  phone: string;
  sale_team_id: {
    id: number;
    name: string;
    sale_team_type: string;
  };
};

export type IWarehouse = {
  id: number;
  name: string;
};

export type UpdateContactDto = {
  birthday: string;
};
