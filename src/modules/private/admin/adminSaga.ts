import { call, put, takeLatest, Effect } from 'redux-saga/effects';
import { AdminActionTypes, AdminStats, RecentActivity, PaymentMethod } from './types';
import {
  fetchAdminStatsSuccess,
  fetchAdminStatsFailure,
  fetchRecentActivitiesSuccess,
  fetchRecentActivitiesFailure,
  CREATE_PAYMENT_METHOD_SUCCESS,
  CREATE_PAYMENT_METHOD_FAILURE,
  UPDATE_PAYMENT_METHOD_SUCCESS,
  UPDATE_PAYMENT_METHOD_FAILURE,
  DELETE_PAYMENT_METHOD_SUCCESS,
  DELETE_PAYMENT_METHOD_FAILURE
} from './actions';
import { API_CALL, TypeApiPromise } from '@/lib/client';

// API response types
interface StatsResponse {
  totalUsers: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  newUsersLast24h: number;
}

// Replace these with actual API calls
const fetchStatsFromAPI = async (): Promise<StatsResponse> => {
  const { response } : any = await API_CALL({ url : '/admin/dashboard/stats'})
  return response.stats;

};

const fetchActivitiesFromAPI = async (): Promise<RecentActivity[]> => {
  const response = await fetch('/api/admin/dashboard/activities');
  if (!response.ok) throw new Error('Failed to fetch recent activities');
  const data = await response.json();
  return data.response.activities   
};

// Payment Methods API calls
const createPaymentMethodAPI = async (methodData: PaymentMethod): Promise<PaymentMethod> => {
  const response = await fetch('/api/withdrawal-methods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(methodData)
  });
  if (!response.ok) throw new Error('Failed to create payment method');
  return response.json();
};

const updatePaymentMethodAPI = async (id: string, methodData: PaymentMethod): Promise<PaymentMethod> => {
  const response = await fetch(`/api/withdrawal-methods/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(methodData)
  });
  if (!response.ok) throw new Error('Failed to update payment method');
  return response.json();
};

const deletePaymentMethodAPI = async (id: string): Promise<void> => {
  const response = await fetch(`/api/withdrawal-methods/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete payment method');
};

function* fetchAdminStatsSaga(): Generator<Effect, void, unknown> {
  try {
    const response = (yield call(fetchStatsFromAPI)) as StatsResponse;
    
    const stats: AdminStats = {
      totalUsers: response.totalUsers,
      totalWithdrawals: response.totalWithdrawals,
      pendingWithdrawals: response.pendingWithdrawals,
      newUsersLast24h: response.newUsersLast24h
    };
    yield put(fetchAdminStatsSuccess(stats));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(fetchAdminStatsFailure(error.message));
      console.error(error.message);
    } else {
      yield put(fetchAdminStatsFailure('An unknown error occurred'));
    }
  }
}

function* fetchRecentActivitiesSaga(): Generator<Effect, void, unknown> {
  try {
    const activities = (yield call(fetchActivitiesFromAPI)) as any //as RecentActivity[];
    console.log(activities.response.activities    );
    yield put(fetchRecentActivitiesSuccess(activities));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(fetchRecentActivitiesFailure(error.message));
    } else {
      yield put(fetchRecentActivitiesFailure('An unknown error occurred'));
    }
  }
}

// Payment Methods Sagas
function* createPaymentMethodSaga(action: any): Generator<Effect, void, unknown> {
  try {
    const method = (yield call(createPaymentMethodAPI, action.payload)) as PaymentMethod;
    yield put({ type: CREATE_PAYMENT_METHOD_SUCCESS, payload: method });
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put({ type: CREATE_PAYMENT_METHOD_FAILURE, payload: error.message });
    } else {
      yield put({ type: CREATE_PAYMENT_METHOD_FAILURE, payload: 'An unknown error occurred' });
    }
  }
}

function* updatePaymentMethodSaga(action: any): Generator<Effect, void, unknown> {
  try {
    const { id, methodData } = action.payload;
    const method = (yield call(updatePaymentMethodAPI, id, methodData)) as PaymentMethod;
    yield put({ type: UPDATE_PAYMENT_METHOD_SUCCESS, payload: method });
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put({ type: UPDATE_PAYMENT_METHOD_FAILURE, payload: error.message });
    } else {
      yield put({ type: UPDATE_PAYMENT_METHOD_FAILURE, payload: 'An unknown error occurred' });
    }
  }
}

function* deletePaymentMethodSaga(action: any): Generator<Effect, void, unknown> {
  try {
    yield call(deletePaymentMethodAPI, action.payload);
    yield put({ type: DELETE_PAYMENT_METHOD_SUCCESS, payload: action.payload });
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put({ type: DELETE_PAYMENT_METHOD_FAILURE, payload: error.message });
    } else {
      yield put({ type: DELETE_PAYMENT_METHOD_FAILURE, payload: 'An unknown error occurred' });
    }
  }
}

export function* adminSaga(): Generator<Effect, void, unknown> {
  yield takeLatest(AdminActionTypes.FETCH_ADMIN_STATS_REQUEST, fetchAdminStatsSaga);
  yield takeLatest(AdminActionTypes.FETCH_RECENT_ACTIVITIES_REQUEST, fetchRecentActivitiesSaga);
  yield takeLatest(AdminActionTypes.CREATE_PAYMENT_METHOD_REQUEST, createPaymentMethodSaga);
  yield takeLatest(AdminActionTypes.UPDATE_PAYMENT_METHOD_REQUEST, updatePaymentMethodSaga);
  yield takeLatest(AdminActionTypes.DELETE_PAYMENT_METHOD_REQUEST, deletePaymentMethodSaga);
}
