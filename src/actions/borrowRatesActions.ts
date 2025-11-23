import { Dispatch } from '@reduxjs/toolkit';

export type SetBorrowRatesAction = {
  type: 'setBorrowRates';
  payload: {
    [custody: string]: number | null;
  };
};

export type BorrowRatesAction = SetBorrowRatesAction;

export const setBorrowRatesAction =
  (borrowRates: { [custody: string]: number | null }) =>
  async (dispatch: Dispatch<SetBorrowRatesAction>) => {
    dispatch({
      type: 'setBorrowRates',
      payload: borrowRates,
    });
  };
