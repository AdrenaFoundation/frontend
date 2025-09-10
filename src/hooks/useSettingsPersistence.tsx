import { useEffect } from 'react';
import { useCookies } from 'react-cookie';

import { setSettings } from '@/actions/settingsActions';
import { SOLANA_EXPLORERS_OPTIONS } from '@/constant';
import { SettingsState } from '@/reducers/settingsReducer';
import { useDispatch, useSelector } from '@/store/store';
import { PercentilePriorityFeeList } from '@/utils';

import useFetchUserSettings from './useFetchUserSettings';

// Loads Settings from cookies and saves them to cookies
export default function useSettingsPersistence() {
  const { preferences, updatePreferences } = useFetchUserSettings();
  const dispatch = useDispatch();
  const [cookies, setCookie] = useCookies([
    'disable-chat',
    'show-popup-on-position-close',
    'show-fees-in-pnl',
    'preferred-solana-explorer',
    'max-priority-fee',
    'priority-fee',
    'disable-friend-req',
    // Persistence for trading actions
    'open-position-collateral-symbol',
    'close-position-collateral-symbol',
    'deposit-collateral-symbol',
    'withdraw-collateral-symbol',
    'enable-adrena-notifications',
    'use-sqrt-scale-for-volume-and-fee-chart',
    'last-selected-trading-token',
  ]);

  const settings = useSelector((state) => state.settings);

  // Load cookies values when launching the hook
  useEffect(() => {
    const updatedSettings: Partial<SettingsState> = {};

    {
      const v = preferences?.disableChat ?? cookies['disable-chat'];
      if (v === false || v === true) updatedSettings.disableChat = v;
    }

    {
      const v = preferences?.showFeesInPnl ?? cookies['show-fees-in-pnl'];
      if (v === false || v === true) updatedSettings.showFeesInPnl = v;
    }

    {
      const v =
        preferences?.showPopupOnPositionClose ??
        cookies['show-popup-on-position-close'];
      if (v === false || v === true)
        updatedSettings.showPopupOnPositionClose = v;
    }

    {
      const v =
        preferences?.preferredSolanaExplorer ??
        cookies['preferred-solana-explorer'];
      if (Object.keys(SOLANA_EXPLORERS_OPTIONS).includes(v))
        updatedSettings.preferredSolanaExplorer = v;
    }

    {
      const v = preferences?.priorityFeeOption ?? cookies['priority-fee'];
      if (Object.keys(PercentilePriorityFeeList).includes(v))
        updatedSettings.priorityFeeOption = v;
    }

    {
      const v = preferences?.maxPriorityFee ?? cookies['max-priority-fee'];
      if (typeof v !== 'undefined' && !isNaN(v))
        updatedSettings.maxPriorityFee = v;
    }

    {
      const v =
        preferences?.openPositionCollateralSymbol ??
        cookies['open-position-collateral-symbol'];
      updatedSettings.openPositionCollateralSymbol = v;
    }

    {
      const v =
        preferences?.closePositionCollateralSymbol ??
        cookies['close-position-collateral-symbol'];
      updatedSettings.closePositionCollateralSymbol = v;
    }

    {
      const v =
        preferences?.depositCollateralSymbol ??
        cookies['deposit-collateral-symbol'];
      updatedSettings.depositCollateralSymbol = v;
    }

    {
      const v =
        preferences?.withdrawCollateralSymbol ??
        cookies['withdraw-collateral-symbol'];
      updatedSettings.withdrawCollateralSymbol = v;
    }

    {
      const v = preferences?.disableFriendReq ?? cookies['disable-friend-req'];
      if (v === false || v === true) updatedSettings.disableFriendReq = v;
    }

    {
      // we don't want to override enableDialectNotifications with cookies
      const v = preferences?.enableDialectNotifications
        ? preferences.enableDialectNotifications
        : false;
      if (v === false || v === true)
        updatedSettings.enableDialectNotifications = v;
    }

    {
      const v =
        preferences?.enableAdrenaNotifications ??
        cookies['enable-adrena-notifications'];
      if (v === false || v === true)
        updatedSettings.enableAdrenaNotifications = v;
    }

    {
      const v =
        preferences?.useSqrtScaleForVolumeAndFeeChart ??
        cookies['use-sqrt-scale-for-volume-and-fee-chart'];
      if (v === false || v === true)
        updatedSettings.useSqrtScaleForVolumeAndFeeChart = v;
    }

    {
      const v =
        preferences?.lastSelectedTradingToken ??
        cookies['last-selected-trading-token'];
      updatedSettings.lastSelectedTradingToken = v;
    }

    dispatch(setSettings(updatedSettings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!cookies, !!dispatch, preferences]);

  // When selector change, save in cookie
  useEffect(() => {
    Object.entries(settings).forEach(([key, value]) => {
      setCookie(
        (
          {
            disableChat: 'disable-chat',
            showFeesInPnl: 'show-fees-in-pnl',
            showPopupOnPositionClose: 'show-popup-on-position-close',
            preferredSolanaExplorer: 'preferred-solana-explorer',
            // This represent the maximum extra amount of SOL per IX for priority fees, priority fees will be capped at this value
            maxPriorityFee: 'max-priority-fee',
            priorityFeeOption: 'priority-fee',
            disableFriendReq: 'disable-friend-req',
            openPositionCollateralSymbol: 'open-position-collateral-symbol',
            closePositionCollateralSymbol: 'close-position-collateral-symbol',
            depositCollateralSymbol: 'deposit-collateral-symbol',
            withdrawCollateralSymbol: 'withdraw-collateral-symbol',
            enableAdrenaNotifications: 'enable-adrena-notifications',
            useSqrtScaleForVolumeAndFeeChart:
              'use-sqrt-scale-for-volume-and-fee-chart',
            lastSelectedTradingToken: 'last-selected-trading-token',
          } as Record<keyof SettingsState, keyof typeof cookies>
        )[key as keyof SettingsState],
        value,
      );
    });

    // Special cases
    window.adrena.settings.solanaExplorer = settings.preferredSolanaExplorer;
    window.adrena.client.setPriorityFeeOption(settings.priorityFeeOption);
    window.adrena.client.setMaxPriorityFee(settings.maxPriorityFee);
  }, [setCookie, settings]);

  useEffect(() => {
    updatePreferences(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);
}
