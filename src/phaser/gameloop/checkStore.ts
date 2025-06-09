import store from '@/store/store';
// let currState: any;

export function checkStore() {
  // const prevState = currState;
  // currState = store.getState();
  // const price = getStoreState().tokenPrices['SOL'];
  // this.text = this.text.setText(`SOL: ${price}\n`);
}

export function getStoreState() {
  return store.getState();
}
