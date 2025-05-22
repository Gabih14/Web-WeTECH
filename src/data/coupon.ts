import { Coupon } from '../types';

export const coupons: Coupon[] = [
  {
    code: 'WELCOME10',
    discount: 10,
    type: 'percentage'
  },
  {
    code: 'SAVE20',
    discount: 20,
    type: 'fixed'
  }
];