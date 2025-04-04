import { PublicKey } from "@solana/web3.js";
import Image from 'next/image';
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

import Button from "@/components/common/Button/Button";
import InputString from "@/components/common/inputString/InputString";
import MultiStepNotification from "@/components/common/MultiStepNotification/MultiStepNotification";
import StyledContainer from "@/components/common/StyledContainer/StyledContainer";
import OnchainAccountInfo from "@/components/pages/monitoring/OnchainAccountInfo";
import { ADRENA_TEAM_WALLET } from "@/constant";
import { useAllAddressLookupTables } from "@/hooks/useAllAddressLookupTables";

import refreshIcon from '../../../public/images/refresh.png';

export default function AddressLookupTable({ }: {
    view: string;
}) {
    const { allAddressLookupTables, triggerAllAddressLookupTablesReload } = useAllAddressLookupTables({
        wallet: ADRENA_TEAM_WALLET,
    });

    const [additionalAccounts, setAdditionalAccounts] = useState<{
        accounts: Record<string, string[]>;
        count: number;
    }>({
        accounts: {},
        count: 0,
    });

    const addressLookupTableDOM = useMemo(() => {
        if (allAddressLookupTables === null) {
            return <div className="text-sm border p-4">Loading...</div>;
        }

        if (!allAddressLookupTables.length) {
            return <div className="text-sm border p-4">No Lookup Table found</div>;
        }

        return allAddressLookupTables.map(({ pubkey, account }) => {
            return <div key={pubkey.toBase58()} className="text-sm border p-4 w-full flex flex-col items-center gap-2">
                <div className="flex w-full">
                    <div className="w-[6em] text-xs">Pubkey</div>

                    <OnchainAccountInfo address={pubkey} />
                </div>

                {account.addresses.length ? account.addresses.map((address, i) => <div key={address.toBase58()} className="flex w-full">
                    <div className="w-[6em] text-xs">Address {i + 1}</div>
                    <OnchainAccountInfo address={address} />
                </div>) : null}

                {additionalAccounts.accounts[pubkey.toBase58()]?.map((address, i) => {
                    return <InputString
                        key={`${pubkey.toBase58()}-account-${i}`}
                        onChange={(value: string | null) => setAdditionalAccounts((acc) => {
                            acc.accounts[pubkey.toBase58()][i] = value ?? '';
                            return { ...acc };
                        })}
                        placeholder={`Address ${account.addresses.length + i + 1}`}
                        value={address}
                        className={twMerge("pt-[0.5em] pb-[0.5em] pl-4 pr-4 border border-gray-700 bg-transparent rounded-lg w-[90%] text-txtfade placeholder:text-txtfade")}
                        inputFontSize="0.8em"
                    />;
                })}

                <Button
                    title="Add one account"
                    variant="lightbg"
                    className="mt-4 w-full"
                    onClick={() => {
                        setAdditionalAccounts((acc) => {
                            acc.accounts[pubkey.toBase58()] = [...(acc.accounts[pubkey.toBase58()] || []), ''];
                            acc.count++;
                            return { ...acc };
                        });
                    }}
                />

                <Button
                    title="Update Lookup Table"
                    variant="primary"
                    className="mt-4 w-full"
                    onClick={async () => {
                        const notification =
                            MultiStepNotification.newForRegularTransaction(`Create new ALT`).fire();

                        try {
                            await window.adrena.client.extendLookupTable({
                                lookupTableAddress: pubkey,
                                notification,
                                addresses: additionalAccounts.accounts[pubkey.toBase58()]?.map((address) => new PublicKey(address)) || [],
                            });
                        } catch (e) {
                            console.log('Error updating lookup table', e);
                        }

                        triggerAllAddressLookupTablesReload();
                        setAdditionalAccounts({
                            accounts: {},
                            count: 0,
                        });
                    }}
                />
            </div>;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [additionalAccounts, allAddressLookupTables]);

    return <StyledContainer className="p-4 w-full relative items-center flex" bodyClassName='gap-1 flex items-center w-full'>
        <div
            onClick={() => triggerAllAddressLookupTablesReload()}
            className={twMerge(
                'top-2 right-2 absolute w-6 h-6 p-1 rounded-full cursor-pointer opacity-50 hover:opacity-100 transition duration-300',
            )}
        >
            <Image src={refreshIcon} alt="Refresh" className="w-4" />
        </div>

        <div className="font-archivo tracking-widest">Existing Lookup Table</div>

        <div className="flex flex-col mt-4 items-center justify-center">
            {addressLookupTableDOM}
        </div>

        <div className="w-full h-[1px] bg-bcolor mt-4 mb-4" />

        <Button
            title="Create new Address Lookup Table"
            variant="primary"
            className="mt-6 mb-6"
            onClick={async () => {
                const notification =
                    MultiStepNotification.newForRegularTransaction(`Create new ALT`).fire();

                await window.adrena.client.createLookupTable({
                    notification,
                });

                triggerAllAddressLookupTablesReload();
            }}
        />

    </StyledContainer>
}
