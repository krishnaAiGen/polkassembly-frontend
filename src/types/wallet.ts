import { InjectedAccount } from '@polkadot/extension-inject/types';

export enum EWallet {
  POLKADOT = 'polkadot-js',
  SUBWALLET = 'subwallet-js',
  TALISMAN = 'talisman',
  OTHER = ''
}

export enum EAccountType {
  MULTISIG = 'multisig',
  PROXY = 'proxy',
  REGULAR = 'regular'
}

export interface ISelectedAccount extends InjectedAccount {
  wallet?: EWallet;
  accountType: EAccountType;
}

export interface IUserPreferences {
  wallet?: EWallet;
  selectedAccount?: ISelectedAccount;
}

export interface IWalletService {
  getInjectedWallets(): Record<string, any>;
  getAddressesFromWallet(wallet: EWallet): Promise<InjectedAccount[]>;
  signMessage(params: { data: string; address: string; selectedWallet: EWallet }): Promise<string | null>;
}

export interface IWalletLoginResult {
  address: string;
  wallet: EWallet;
  signature: string;
} 