export const QueryKeyErp = {
  getAddressCountry: () => 'address-country',
  getAddressDistrict: (stateId: number) => `address-district-${stateId}`,
  getAddressState: (countryId: number) => `address-state-${countryId}`,
  getAddressTown: (districtId: number) => `address-town-${districtId}`,
  getApiCreateCustomer: (groupName: string) =>
    `api-create-customer-${groupName}`,
  getCategories: () => 'categories',
  getContactDetail: (pageId: string, scopedUserId: string) =>
    `contact-detail-${pageId}-${scopedUserId}`,
  getCustomerSource: (groupName: string) => `customer-source-${groupName}`,
  getListCare: (contactId: number) => `list-care-${contactId}`,
  getOrderErp: (contactId: number) => `order-erp-${contactId}`,
  getPriceList: () => 'price-list',
  getShipingPartner: () => `shiping-partner`,
  getUserErp: () => `user-erp`,
  getWarehouse: () => `warehouse-erp`,
};
