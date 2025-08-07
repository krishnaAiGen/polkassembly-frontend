import { useState, useCallback, useEffect } from 'react';
import { IUserPreferences, EWallet, ISelectedAccount, EAccountType } from '@/types/wallet';
import { AuthService, IWalletPreferences } from '@/lib/authService';

export const useUserPreferences = () => {
  const [userPreferences, setUserPreferences] = useState<IUserPreferences>({});

  // Load saved preferences on mount
  useEffect(() => {
    const savedPreferences = AuthService.getWalletPreferences();
    if (savedPreferences) {
      setUserPreferences({
        wallet: savedPreferences.wallet as EWallet,
        selectedAccount: savedPreferences.selectedAccount ? {
          ...savedPreferences.selectedAccount,
          accountType: EAccountType.REGULAR
        } : undefined
      });
    }
  }, []);

  const updateUserPreferences = useCallback((preferences: Partial<IUserPreferences>) => {
    setUserPreferences(prev => {
      const newPreferences = {
        ...prev,
        ...preferences
      };
      
      // Save to localStorage
      const preferencesToSave: IWalletPreferences = {
        wallet: newPreferences.wallet,
        selectedAccount: newPreferences.selectedAccount ? {
          address: newPreferences.selectedAccount.address,
          name: newPreferences.selectedAccount.name
        } : undefined
      };
      
      AuthService.saveWalletPreferences(preferencesToSave);
      
      return newPreferences;
    });
  }, []);

  const setWallet = useCallback((wallet: EWallet) => {
    updateUserPreferences({ wallet });
  }, [updateUserPreferences]);

  const setSelectedAccount = useCallback((account: ISelectedAccount) => {
    updateUserPreferences({ 
      selectedAccount: {
        ...account,
        accountType: EAccountType.REGULAR
      }
    });
  }, [updateUserPreferences]);

  const clearPreferences = useCallback(() => {
    setUserPreferences({});
    AuthService.clearWalletPreferences();
  }, []);

  return {
    userPreferences,
    setUserPreferences: updateUserPreferences,
    setWallet,
    setSelectedAccount,
    clearPreferences
  };
}; 