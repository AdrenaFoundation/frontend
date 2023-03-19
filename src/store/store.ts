import tokenPricesReducer from "@/reducers/tokenPricesReducer";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useSelector as defaultUseSelector,
  useDispatch as defaultUseDispatch,
} from "react-redux";
import walletReducer from "../reducers/walletReducer";

const rootReducer = combineReducers({
  wallet: walletReducer,
  tokenPrices: tokenPricesReducer,
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
