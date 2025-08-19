export interface AdminStats {
  totalUsers: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  newUsersLast24h: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
}

export interface PaymentMethod {
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

export interface AdminState {
  stats: AdminStats;
  recentActivities: RecentActivity[];
  paymentMethods: PaymentMethod[];
  paymentMethodsLoading: boolean;
  paymentMethodsError: string | null;
  loading: boolean;
  error: string | null;
}

export enum AdminActionTypes {
  FETCH_ADMIN_STATS_REQUEST = 'FETCH_ADMIN_STATS_REQUEST',
  FETCH_ADMIN_STATS_SUCCESS = 'FETCH_ADMIN_STATS_SUCCESS',
  FETCH_ADMIN_STATS_FAILURE = 'FETCH_ADMIN_STATS_FAILURE',
  FETCH_RECENT_ACTIVITIES_REQUEST = 'FETCH_RECENT_ACTIVITIES_REQUEST',
  FETCH_RECENT_ACTIVITIES_SUCCESS = 'FETCH_RECENT_ACTIVITIES_SUCCESS',
  FETCH_RECENT_ACTIVITIES_FAILURE = 'FETCH_RECENT_ACTIVITIES_FAILURE',
  CREATE_PAYMENT_METHOD_REQUEST = 'CREATE_PAYMENT_METHOD_REQUEST',
  CREATE_PAYMENT_METHOD_SUCCESS = 'CREATE_PAYMENT_METHOD_SUCCESS',
  CREATE_PAYMENT_METHOD_FAILURE = 'CREATE_PAYMENT_METHOD_FAILURE',
  UPDATE_PAYMENT_METHOD_REQUEST = 'UPDATE_PAYMENT_METHOD_REQUEST',
  UPDATE_PAYMENT_METHOD_SUCCESS = 'UPDATE_PAYMENT_METHOD_SUCCESS',
  UPDATE_PAYMENT_METHOD_FAILURE = 'UPDATE_PAYMENT_METHOD_FAILURE',
  DELETE_PAYMENT_METHOD_REQUEST = 'DELETE_PAYMENT_METHOD_REQUEST',
  DELETE_PAYMENT_METHOD_SUCCESS = 'DELETE_PAYMENT_METHOD_SUCCESS',
  DELETE_PAYMENT_METHOD_FAILURE = 'DELETE_PAYMENT_METHOD_FAILURE'
}

export type AdminAction =
  | { type: AdminActionTypes.FETCH_ADMIN_STATS_REQUEST }
  | { type: AdminActionTypes.FETCH_ADMIN_STATS_SUCCESS; payload: AdminStats }
  | { type: AdminActionTypes.FETCH_ADMIN_STATS_FAILURE; payload: string }
  | { type: AdminActionTypes.FETCH_RECENT_ACTIVITIES_REQUEST }
  | { type: AdminActionTypes.FETCH_RECENT_ACTIVITIES_SUCCESS; payload: RecentActivity[] }
  | { type: AdminActionTypes.FETCH_RECENT_ACTIVITIES_FAILURE; payload: string }
  | { type: AdminActionTypes.CREATE_PAYMENT_METHOD_REQUEST; payload: PaymentMethod }
  | { type: AdminActionTypes.CREATE_PAYMENT_METHOD_SUCCESS; payload: PaymentMethod }
  | { type: AdminActionTypes.CREATE_PAYMENT_METHOD_FAILURE; payload: string }
  | { type: AdminActionTypes.UPDATE_PAYMENT_METHOD_REQUEST; payload: { id: string; methodData: PaymentMethod } }
  | { type: AdminActionTypes.UPDATE_PAYMENT_METHOD_SUCCESS; payload: PaymentMethod }
  | { type: AdminActionTypes.UPDATE_PAYMENT_METHOD_FAILURE; payload: string }
  | { type: AdminActionTypes.DELETE_PAYMENT_METHOD_REQUEST; payload: string }
  | { type: AdminActionTypes.DELETE_PAYMENT_METHOD_SUCCESS; payload: string }
  | { type: AdminActionTypes.DELETE_PAYMENT_METHOD_FAILURE; payload: string };
