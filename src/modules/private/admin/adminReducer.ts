import { AdminState, AdminAction, AdminActionTypes } from './types';
import {
  CREATE_PAYMENT_METHOD_REQUEST,
  CREATE_PAYMENT_METHOD_SUCCESS,
  CREATE_PAYMENT_METHOD_FAILURE,
  UPDATE_PAYMENT_METHOD_REQUEST,
  UPDATE_PAYMENT_METHOD_SUCCESS,
  UPDATE_PAYMENT_METHOD_FAILURE,
  DELETE_PAYMENT_METHOD_REQUEST,
  DELETE_PAYMENT_METHOD_SUCCESS,
  DELETE_PAYMENT_METHOD_FAILURE
} from './actions';

const initialState: AdminState = {
  stats: {
    totalUsers: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    newUsersLast24h: 0
  },
  recentActivities: [],
  paymentMethods: [],
  paymentMethodsLoading: false,
  paymentMethodsError: null,
  loading: false,
  error: null
};

export const adminReducer = (state = initialState, action: AdminAction): AdminState => {
  switch (action.type) {
    case AdminActionTypes.FETCH_ADMIN_STATS_REQUEST:
    case AdminActionTypes.FETCH_RECENT_ACTIVITIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AdminActionTypes.FETCH_ADMIN_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        stats: action.payload
      };

    case AdminActionTypes.FETCH_RECENT_ACTIVITIES_SUCCESS:
      return {
        ...state,
        loading: false,
        recentActivities: action.payload
      };

    case AdminActionTypes.FETCH_ADMIN_STATS_FAILURE:
    case AdminActionTypes.FETCH_RECENT_ACTIVITIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Payment Methods Management
    case CREATE_PAYMENT_METHOD_REQUEST:
    case UPDATE_PAYMENT_METHOD_REQUEST:
    case DELETE_PAYMENT_METHOD_REQUEST:
      return {
        ...state,
        paymentMethodsLoading: true,
        paymentMethodsError: null
      };

    case CREATE_PAYMENT_METHOD_SUCCESS:
      return {
        ...state,
        paymentMethodsLoading: false,
        paymentMethods: [...state.paymentMethods, action.payload]
      };

    case UPDATE_PAYMENT_METHOD_SUCCESS:
      return {
        ...state,
        paymentMethodsLoading: false,
        paymentMethods: state.paymentMethods.map(method => 
          method._id === action.payload._id ? action.payload : method
        )
      };

    case DELETE_PAYMENT_METHOD_SUCCESS:
      return {
        ...state,
        paymentMethodsLoading: false,
        paymentMethods: state.paymentMethods.filter(method => 
          method._id !== action.payload
        )
      };

    case CREATE_PAYMENT_METHOD_FAILURE:
    case UPDATE_PAYMENT_METHOD_FAILURE:
    case DELETE_PAYMENT_METHOD_FAILURE:
      return {
        ...state,
        paymentMethodsLoading: false,
        paymentMethodsError: action.payload
      };

    default:
      return state;
  }
};
