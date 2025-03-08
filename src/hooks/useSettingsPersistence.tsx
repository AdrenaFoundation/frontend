import { useEffect } from "react";
import { useCookies } from "react-cookie";

import { setSettings } from "@/actions/settingsActions";
import { SettingsState } from "@/reducers/settingsReducer";
import { useDispatch, useSelector } from "@/store/store";
import { SOLANA_EXPLORERS_OPTIONS } from "@/constant";

// Loads Settings from cookies and saves them to cookies
export default function useSettingsPersistence() {
    const dispatch = useDispatch();
    const [cookies, setCookie] = useCookies([
        'show-popup-on-position-close',
        'show-fees-in-pnl',
        'preferred-solana-explorer',
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

        dispatch(
            setSettings(updatedSettings),
        );
    }, [!!cookies, !!dispatch]);

    // When selector change, save in cookie
    useEffect(() => {
        Object.entries(settings).forEach(([key, value]) => {
            setCookie(({
                showFeesInPnl: 'show-fees-in-pnl',
                showPopupOnPositionClose: 'show-popup-on-position-close',
                preferredSolanaExplorer: 'preferred-solana-explorer',
            } as Record<keyof SettingsState, keyof typeof cookies>)[key as keyof SettingsState], value);
        });

        // Special usecase for solana explorer
        window.adrena.settings.solanaExplorer = settings.preferredSolanaExplorer;
    }, [setCookie, settings]);
}