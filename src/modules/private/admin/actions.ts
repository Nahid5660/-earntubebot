import { AdminActionTypes, AdminStats, RecentActivity } from './types';

export const fetchAdminStats = () => ({
  type: AdminActionTypes.FETCH_ADMIN_STATS_REQUEST
});

export const fetchAdminStatsSuccess = (stats: AdminStats) => ({
  type: AdminActionTypes.FETCH_ADMIN_STATS_SUCCESS,
  payload: stats
});

export const fetchAdminStatsFailure = (error: string) => ({
  type: AdminActionTypes.FETCH_ADMIN_STATS_FAILURE,
  payload: error
});

export const fetchRecentActivities = () => ({
  type: AdminActionTypes.FETCH_RECENT_ACTIVITIES_REQUEST
});

export const fetchRecentActivitiesSuccess = (activities: RecentActivity[]) => ({
  type: AdminActionTypes.FETCH_RECENT_ACTIVITIES_SUCCESS,
  payload: activities
});

export const fetchRecentActivitiesFailure = (error: string) => ({
  type: AdminActionTypes.FETCH_RECENT_ACTIVITIES_FAILURE,
  payload: error
});

// Payment Methods Admin Actions
export const CREATE_PAYMENT_METHOD_REQUEST = 'CREATE_PAYMENT_METHOD_REQUEST';
export const CREATE_PAYMENT_METHOD_SUCCESS = 'CREATE_PAYMENT_METHOD_SUCCESS';
export const CREATE_PAYMENT_METHOD_FAILURE = 'CREATE_PAYMENT_METHOD_FAILURE';

export const UPDATE_PAYMENT_METHOD_REQUEST = 'UPDATE_PAYMENT_METHOD_REQUEST';
export const UPDATE_PAYMENT_METHOD_SUCCESS = 'UPDATE_PAYMENT_METHOD_SUCCESS';
export const UPDATE_PAYMENT_METHOD_FAILURE = 'UPDATE_PAYMENT_METHOD_FAILURE';

export const DELETE_PAYMENT_METHOD_REQUEST = 'DELETE_PAYMENT_METHOD_REQUEST';
export const DELETE_PAYMENT_METHOD_SUCCESS = 'DELETE_PAYMENT_METHOD_SUCCESS';
export const DELETE_PAYMENT_METHOD_FAILURE = 'DELETE_PAYMENT_METHOD_FAILURE';

export const createPaymentMethod = (methodData: any) => ({
  type: CREATE_PAYMENT_METHOD_REQUEST,
  payload: methodData
});

export const updatePaymentMethod = (id: string, methodData: any) => ({
  type: UPDATE_PAYMENT_METHOD_REQUEST,
  payload: { id, methodData }
});

export const deletePaymentMethod = (id: string) => ({
  type: DELETE_PAYMENT_METHOD_REQUEST,
  payload: id
});
