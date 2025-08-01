import { Dispatch } from '@reduxjs/toolkit';

import { StatusState } from '@/reducers/statusReducer';

export type SetConnectionStatusAction = {
  type: 'setConnectionStatus';
  payload: {
    service: keyof StatusState;
    status: boolean;
  };
};

export type SetMultipleConnectionStatusAction = {
  type: 'setMultipleConnectionStatus';
  payload: {
    [service in keyof StatusState]?: StatusState[service];
  };
};

export type StatusActions =
  | SetConnectionStatusAction
  | SetMultipleConnectionStatusAction;

export const setConnectionStatus =
  (service: keyof StatusState, status: boolean) =>
  async (dispatch: Dispatch<SetConnectionStatusAction>) => {
    dispatch({
      type: 'setConnectionStatus',
      payload: { service, status },
    });
  };

export const setMultipleConnectionStatus =
  (statuses: { [service in keyof StatusState]?: StatusState[service] }) =>
  async (dispatch: Dispatch<SetMultipleConnectionStatusAction>) => {
    dispatch({
      type: 'setMultipleConnectionStatus',
      payload: statuses,
    });
  };

export const setTokenPricesWebSocketStatus = (status: boolean) =>
  setConnectionStatus('tokenPricesWebSocket', status);

export const setNotificationsWebSocketStatus = (status: boolean) =>
  setConnectionStatus('notificationsWebSocket', status);

export const setChatWebSocketStatus = (status: boolean) =>
  setConnectionStatus('chatWebSocket', status);

export const setDataApiClientStatus = (status: boolean) =>
  setConnectionStatus('dataApiClient', status);
