export interface AccountStatus {
  planName: string;
  renewalDate: string;
  supportContact: string;
  statusLabel: string;
}

export interface Profile {
  id: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  username: string;
  accountStatus: AccountStatus;
  selectedPlanId: string;
  lastUpdated?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  shortDescription: string;
  benefits: string[];
}

export interface ProfileUpdateInput {
  fullName?: string;
  email?: string;
  username?: string;
  phone?: string;
  location?: string;
  accountStatus?: Partial<AccountStatus>;
  selectedPlanId?: string;
  lastUpdated?: string;
}
