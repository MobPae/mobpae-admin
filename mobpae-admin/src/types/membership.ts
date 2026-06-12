export type MembershipStatus = "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED" | "CANCELLED";

export interface Membership {
  id: string;
  employeeId: string;
  planName: string;
  amount: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  paymentReference: string | null;
  paymentScreenshot: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  remarks: string | null;
  couponCode: string | null;
  discountAmount: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    email: string;
    employer: {
      id: string;
      companyName: string;
      companyCode: string;
    };
  };
}

export interface MembershipCoupon {
  id: string;
  code: string;
  discountAmount: string;
  isActive: boolean;
  validTill: string | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}
