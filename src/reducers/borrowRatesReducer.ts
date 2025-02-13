import { BorrowRatesAction } from '@/actions/borrowRatesActions';

export type BorrowRatesState = {
  [custody: string]: number | null;
};

// freeze the initial state object to make sure it can be re-used through
// the app's lifecycle & is never mutated.
const initialState: BorrowRatesState = Object.freeze({});

export default function borrowRatesReducer(
  state = initialState,
  action: BorrowRatesAction,
) {
  switch (action.type) {
    case 'setBorrowRates':
      return { ...action.payload };
    default:
      return state;
  }
}
