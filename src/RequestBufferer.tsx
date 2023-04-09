/**
 * Limit requests executions.
 * timeBetweenRequestInMs between two requests.
 * If a request is already out, new requests are put into waitlist.
 * Only one request is stored in waitlist.
 */
export default class RequestBufferer<T> {
  protected pendingRequest = false;
  protected waitingList = false;
  protected waitingListParam: T | null = null;
  protected lastRequestDate: number | null = null;
  protected timeBetweenRequestInMs: number;
  protected func: (params: T) => Promise<void> | void;

  constructor(
    timeBetweenRequestInMs: number,
    func: (params: T) => Promise<void> | void,
  ) {
    this.timeBetweenRequestInMs = timeBetweenRequestInMs;
    this.func = func;
  }

  // Trigger execute
  public async executeFunc(params: T) {
    // Data is already loading
    if (this.pendingRequest) {
      this.waitingList = true;
      this.waitingListParam = params;
      return;
    }

    // We made a fetch not a while ago, delays
    if (
      this.lastRequestDate !== null &&
      Date.now() - this.lastRequestDate < this.timeBetweenRequestInMs
    ) {
      // We casted one request less than 30s ago, delay
      this.waitingList = true;
      this.waitingListParam = params;
      return;
    }

    this.pendingRequest = true;

    await this.func(params);

    this.lastRequestDate = Date.now();

    // If there is a call waiting list
    // Call itself again to get fresher data
    if (this.waitingList) {
      this.waitingList = false;

      setTimeout(() => {
        const waitingListParamCopy = this.waitingListParam as T;
        this.waitingListParam = null;

        this.func(waitingListParamCopy);
      }, this.timeBetweenRequestInMs - (Date.now() - this.lastRequestDate));
      return;
    }

    this.pendingRequest = false;
  }
}
