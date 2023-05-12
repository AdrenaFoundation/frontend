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
    // Data is already loading/we are in the cooldown period
    if (this.pendingRequest) {
      this.waitingList = true;
      this.waitingListParam = params;
      return;
    }

    this.pendingRequest = true;

    // Wipe the waiting list
    this.waitingList = false;

    // call the function with latests params
    await this.func(params);

    this.lastRequestDate = Date.now();

    // After cooldown period, switch back pendingRequest flag
    setTimeout(async () => {
      this.pendingRequest = false;

      // Trigger the call to execute what's in the waitingList
      if (this.waitingList) {
        const waitingListParamCopy = this.waitingListParam as T;
        this.waitingListParam = null;
        this.waitingList = false;

        await this.executeFunc(waitingListParamCopy);
      }
    }, this.timeBetweenRequestInMs - (Date.now() - this.lastRequestDate));
  }
}
