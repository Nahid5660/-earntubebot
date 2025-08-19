import { WithdrawalMethod } from './types';
import {
  FETCH_WITHDRAWAL_DATA_REQUEST,
  FETCH_WITHDRAWAL_DATA_SUCCESS,
  FETCH_WITHDRAWAL_DATA_FAILURE,
  SET_SELECTED_METHOD,
  RESET_WITHDRAWAL
} from './constants';

interface WithdrawalState {
  methods: WithdrawalMethod[];
  selectedMethod: WithdrawalMethod | null;
  loading: boolean;
  error: string | null;
}

const initialState: WithdrawalState = {
  methods: [],
  selectedMethod: null,
  loading: false,
  error: null,
};

 
export const withdrawal_methodsReducer = (state = initialState, action: any): WithdrawalState =>{
  switch (action.type) {
    case FETCH_WITHDRAWAL_DATA_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_WITHDRAWAL_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        methods: action.payload.methods,
        error: null
      };
    case FETCH_WITHDRAWAL_DATA_FAILURE:
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        methods: []
      };
    case SET_SELECTED_METHOD:
      return {
        ...state,
        selectedMethod: action.payload,
      };
    case RESET_WITHDRAWAL:
      return {
        ...state,
        selectedMethod: null,
      };
    default:
      return state;
  }
} 