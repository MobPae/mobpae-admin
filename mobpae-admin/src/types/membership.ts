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

// Matches GET /membership/summary
export interface MembershipSummary {
  totalMembers: number;
  active: number;
  pending: number;
  rejected: number;
  expired: number;
  membershipRevenue: string | number;
}

// Matches GET /membership/employer-summary
export interface EmployerMembershipSummary {
  employerId: string;
  companyName: string;
  totalMembers: number;
  activeMembers: number;
  membershipRevenue: string | number;
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
