import { Dispatch } from "@reduxjs/toolkit";

import { SettingsState } from "@/reducers/settingsReducer";

export type SetSettingsAction = {
  type: "setSettings";
  payload: {
    [property in keyof SettingsState]?: SettingsState[property];
  };
};

export type SettingsActions = SetSettingsAction;

export const setSettings =
  (settings: { [property in keyof SettingsState]?: SettingsState[property] }) =>
  async (dispatch: Dispatch<SetSettingsAction>) => {
    dispatch({
      type: "setSettings",
      payload: settings,
    });
  };
