import { WithdrawalMethod } from './types';
import {
  FETCH_WITHDRAWAL_DATA_REQUEST,
  FETCH_WITHDRAWAL_DATA_SUCCESS,
  FETCH_WITHDRAWAL_DATA_FAILURE,
  SET_SELECTED_METHOD,
  RESET_WITHDRAWAL
} from './constants';

export interface WithdrawalAction {
  type: string;
  payload?: any;
}

// Action Creators
export const fetchWithdrawalData = (): WithdrawalAction => ({
  type: FETCH_WITHDRAWAL_DATA_REQUEST
});

export const fetchWithdrawalDataSuccess = (data: { methods: WithdrawalMethod[] }): WithdrawalAction => ({
  type: FETCH_WITHDRAWAL_DATA_SUCCESS,
  payload: data
});

export const fetchWithdrawalDataFailure = (error: string): WithdrawalAction => ({
  type: FETCH_WITHDRAWAL_DATA_FAILURE,
  payload: error
});

export const setSelectedMethod = (method: WithdrawalMethod): WithdrawalAction => ({
  type: SET_SELECTED_METHOD,
  payload: method,
});

export const resetWithdrawal = (): WithdrawalAction => ({
  type: RESET_WITHDRAWAL,
}); 