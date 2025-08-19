export interface WithdrawalMethod {
  _id?: string;
  id: string;
  name: string;
  image: string;
  status: 'active' | 'inactive' | 'maintenance';
  message?: string;
  fee: string;
  estimatedTime: string;
  category: 'Mobile Banking' | 'Crypto';
  minAmount: number;
  maxAmount: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
} 