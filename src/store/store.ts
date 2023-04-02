import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  TypedUseSelectorHook,
  useDispatch as defaultUseDispatch,
  useSelector as defaultUseSelector,
} from 'react-redux';

import tokenPricesReducer from '@/reducers/tokenPricesReducer';

import walletBalancesReducer from '../reducers/walletBalancesReducer';
import walletReducer from '../reducers/walletReducer';

const rootReducer = combineReducers({
  walletState: walletReducer,
  tokenPrices: tokenPricesReducer,
  walletTokenBalances: walletBalancesReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;

export type Dispatch = typeof store.dispatch;

export const useSelector: TypedUseSelectorHook<RootState> = defaultUseSelector;
export const useDispatch: () => Dispatch = defaultUseDispatch;

export default store;
