import { InjectedWindow, InjectedAccount } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { getSubstrateAddress } from '@/lib/utils/getSubstrateAddress';
import { WEB3_AUTH_SIGN_MESSAGE } from './signatureVerification';
import { EWallet } from '@/types/wallet';

export class WalletService {
  private injectedWindow: Window & InjectedWindow;

  constructor() {
    this.injectedWindow = window as Window & InjectedWindow;
  }

  async getAccounts(walletName: string): Promise<InjectedAccount[]> {
    try {
      const wallet = this.injectedWindow.injectedWeb3[walletName];
      
      if (!wallet || !wallet.enable) {
        console.error(`Wallet ${walletName} not found or does not support enable`);
        return [];
      }

      const injected = await wallet.enable('Klara Chat');
      const accounts = await injected.accounts.get();
      
      return accounts;
    } catch (error) {
      console.error(`Error getting accounts from ${walletName}:`, error);
      return [];
    }
  }

  async signMessage(address: string, walletName: string): Promise<string | null> {
    try {
      const wallet = this.injectedWindow.injectedWeb3[walletName];
      
      if (!wallet || !wallet.enable) {
        console.error(`Wallet ${walletName} not found or does not support enable`);
        return null;
      }

      const injected = await wallet.enable('Klara Chat');
      const signRaw = injected.signer?.signRaw;
      
      if (!signRaw) {
        console.error('Signer not available');
        return null;
      }

      // Convert address to substrate format if needed
      let substrateAddress = address;
      if (!address.startsWith('0x')) {
        const converted = getSubstrateAddress(address);
        if (!converted) {
          console.error('Invalid address format');
          return null;
        }
        substrateAddress = converted;
      }

      // Sign the message using the correct format
      const { signature } = await signRaw({
        address: substrateAddress,
        data: stringToHex(WEB3_AUTH_SIGN_MESSAGE),
        type: 'bytes'
      });

      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  }

  getAvailableWallets(): string[] {
    // Ensure injectedWeb3 is available
    if (!this.injectedWindow.injectedWeb3) {
      console.log('No injectedWeb3 found in window');
      return [];
    }

    const allWallets = Object.keys(this.injectedWindow.injectedWeb3);
    
    // Only return wallets that are supported in our EWallet enum
    const supportedWallets = [EWallet.POLKADOT, EWallet.SUBWALLET, EWallet.TALISMAN];
    
    const filteredWallets = allWallets.filter(wallet => supportedWallets.includes(wallet as EWallet));
    
    console.log('Available wallets in browser:', allWallets);
    console.log('Supported wallets:', supportedWallets);
    console.log('Filtered wallets:', filteredWallets);
    
    return filteredWallets;
  }
} 