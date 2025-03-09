import { useEffect } from "react";
import { useCookies } from "react-cookie";

import { setSettings } from "@/actions/settingsActions";
import { SOLANA_EXPLORERS_OPTIONS } from "@/constant";
import { SettingsState } from "@/reducers/settingsReducer";
import { useDispatch, useSelector } from "@/store/store";
import { PercentilePriorityFeeList } from "@/utils";

// Loads Settings from cookies and saves them to cookies
export default function useSettingsPersistence() {
    const dispatch = useDispatch();
    const [cookies, setCookie] = useCookies([
        'show-popup-on-position-close',
        'show-fees-in-pnl',
        'preferred-solana-explorer',
        'max-priority-fee',
        'priority-fee',
    ]);

    const settings = useSelector((state) => state.settings);

    // Load cookies values when launching the hook
    useEffect(() => {
        const updatedSettings: Partial<SettingsState> = {};

        {
            const v = cookies['show-fees-in-pnl'];
            if (v === false || v === true)
                updatedSettings.showFeesInPnl = v;
        }

        {
            const v = cookies['show-popup-on-position-close'];
            if (v === false || v === true)
                updatedSettings.showPopupOnPositionClose = v;
        }

        {
            const v = cookies['preferred-solana-explorer'];
            if (Object.keys(SOLANA_EXPLORERS_OPTIONS).includes(v))
                updatedSettings.preferredSolanaExplorer = v;
        }

        {
            const v = cookies['priority-fee'];
            if (Object.keys(PercentilePriorityFeeList).includes(v))
                updatedSettings.priorityFeeOption = v;
        }

        {
            const v = cookies['max-priority-fee'];
            if (typeof v !== 'undefined' && !isNaN(v))
                updatedSettings.maxPriorityFee = v;
        }

        dispatch(
            setSettings(updatedSettings),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [!!cookies, !!dispatch]);

    // When selector change, save in cookie
    useEffect(() => {
        Object.entries(settings).forEach(([key, value]) => {
            setCookie(({
                showFeesInPnl: 'show-fees-in-pnl',
                showPopupOnPositionClose: 'show-popup-on-position-close',
                preferredSolanaExplorer: 'preferred-solana-explorer',
                // This represent the maximum extra amount of SOL per IX for priority fees, priority fees will be capped at this value
                maxPriorityFee: 'max-priority-fee',
                priorityFeeOption: 'priority-fee',
            } as Record<keyof SettingsState, keyof typeof cookies>)[key as keyof SettingsState], value);
        });

        // Special cases
        window.adrena.settings.solanaExplorer = settings.preferredSolanaExplorer;
        window.adrena.client.setPriorityFeeOption(settings.priorityFeeOption);
        window.adrena.client.setMaxPriorityFee(settings.maxPriorityFee);
    }, [setCookie, settings]);
}