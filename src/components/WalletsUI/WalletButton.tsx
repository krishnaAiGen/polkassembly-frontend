// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { EWallet } from '@/types/wallet';
import { WalletIcon } from '@/components/WalletsUI/WalletsIcon';
import { useUserPreferences } from '@/hooks/useUserPreferences';

function WalletButton({
	wallet,
	onClick,
	disabled,
	label,
	selectedWallet
}: {
	wallet: EWallet;
	onClick?: (wallet: EWallet) => void;
	disabled?: boolean;
	label: string;
		selectedWallet?: string;
}) {
	const walletName = wallet;
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const onWalletSelect = (selectedWallet: EWallet) => {
		setUserPreferences({
			...userPreferences,
			wallet: selectedWallet
		});
		onClick?.(selectedWallet);
	};


	return (
		<button
			title={label}
			onClick={() => onWalletSelect(walletName)}
			disabled={disabled}
			type='button'
			className={`${wallet === selectedWallet && 'border border-gray-300'} ${disabled ? 'bg-gray-200' : 'bg-primary-50'} p-2 rounded-md hover:bg-primary-100`}
		>
			<WalletIcon wallet={wallet} />
		</button>
	);
}

export default WalletButton;
