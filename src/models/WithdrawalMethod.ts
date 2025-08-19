import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawalMethod extends Document {
  id: string;
  name: string;
  image: string;
  status: 'active' | 'inactive' | 'maintenance';
  message?: string;
  supportedCoins: string[];
  fee: string;
  estimatedTime: string;
  category: 'Mobile Banking' | 'Crypto';
  minAmount: number;
  maxAmount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalMethodSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
  message: {
    type: String,
    default: '',
  },
  supportedCoins: [{
    type: String,
    required: true,
  }],
  fee: {
    type: String,
    required: true,
    default: '0.1%',
  },
  estimatedTime: {
    type: String,
    required: true,
    default: '30-60 minutes',
  },
  category: {
    type: String,
    enum: ['Mobile Banking', 'Crypto'],
    required: true,
  },
  minAmount: {
    type: Number,
    required: true,
    default: 50,
  },
  maxAmount: {
    type: Number,
    required: true,
    default: 100000,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  }
}, {
  timestamps: true,
});

export const WithdrawalMethod = mongoose.models.WithdrawalMethod || mongoose.model<IWithdrawalMethod>('WithdrawalMethod', withdrawalMethodSchema);

export default WithdrawalMethod; 