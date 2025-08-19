import { RootState } from '@/modules/store';

// Selectors for withdrawal methods
export const selectWithdrawalMethods = (state: RootState) => state.public.withdrawal_methods.methods;
export const selectSelectedMethod = (state: RootState) => state.public.withdrawal_methods.selectedMethod;
export const selectWithdrawalLoading = (state: RootState) => state.public.withdrawal_methods.loading;
export const selectWithdrawalError = (state: RootState) => state.public.withdrawal_methods.error;

// Helper selectors
export const selectActiveMethods = (state: RootState) => 
  state.public.withdrawal_methods.methods.filter(method => method.status === 'active');

export const selectMethodsByCategory = (state: RootState, category: 'Mobile Banking' | 'Crypto') => 
  state.public.withdrawal_methods.methods.filter(method => method.category === category);

export const selectMethodById = (state: RootState, id: string) => 
  state.public.withdrawal_methods.methods.find(method => method.id === id || method.id === id);

export const selectMethodsWithStatus = (state: RootState, status: 'active' | 'inactive' | 'maintenance') => 
  state.public.withdrawal_methods.methods.filter(method => method.status === status); 