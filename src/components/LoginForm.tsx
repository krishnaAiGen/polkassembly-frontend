'use client';

import React, { useState, useEffect } from 'react';
import { WalletService } from '@/lib/walletService';
import { AuthService } from '@/lib/authService';
import WalletButton from './WalletsUI/WalletButton';
import { EWallet } from '@/types/wallet';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import CustomAddressDropdown from './CustomAddressDropdown';

interface WalletLoginFormProps {
  onLoginSuccess: (user: any) => void;
  onLoginError: (error: string) => void;
}

export default function LoginForm({ onLoginSuccess, onLoginError }: WalletLoginFormProps) {
  const { userPreferences, setSelectedAccount } = useUserPreferences();
  const [selectedWallet, setSelectedWallet] = useState<string>(userPreferences.wallet || '');
  const [selectedAddress, setSelectedAddress] = useState<string>(userPreferences.selectedAccount?.address || '');
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletService, setWalletService] = useState<WalletService | null>(null);
  
  // Username login state
  const [loginMethod, setLoginMethod] = useState<'wallet' | 'username'>('wallet');
  const [username, setUsername] = useState<string>('');
  useEffect(() => {
    const initWalletService = () => {
      const service = new WalletService();
      setWalletService(service);
      setAvailableWallets(service.getAvailableWallets());
    };

    if (typeof window !== 'undefined') {
      initWalletService();
    }
  }, []);

  // Auto-select preferred account when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && userPreferences.selectedAccount?.address && selectedWallet === userPreferences.wallet) {
      const preferredAccount = accounts.find(acc => acc.address === userPreferences.selectedAccount?.address);
      if (preferredAccount && selectedAddress !== preferredAccount.address) {
        setSelectedAddress(preferredAccount.address);
      }
    }
  }, [accounts, userPreferences.selectedAccount, selectedWallet, selectedAddress]);

  const handleWalletSelect = async (walletName: string) => {
    if (!walletService) return;

    setSelectedWallet(walletName);
    setAccounts([]);

    try {
      const walletAccounts = await walletService.getAccounts(walletName);
      setAccounts(walletAccounts);
      
      // Auto-select default account based on preferences
      if (userPreferences.selectedAccount?.address && walletName === userPreferences.wallet) {
        const preferredAccount = walletAccounts.find(acc => acc.address === userPreferences.selectedAccount?.address);
        if (preferredAccount) {
          setSelectedAddress(preferredAccount.address);
        } else if (walletAccounts.length > 0) {
          // If preferred account not found, select first available
          setSelectedAddress(walletAccounts[0].address);
        }
      } else if (walletAccounts.length > 0) {
        // If no preferences or different wallet, select first account
        setSelectedAddress(walletAccounts[0].address);
      }
    } catch (error) {
      console.error('Error getting accounts:', error);
      onLoginError('Failed to get accounts from wallet');
    }
  };

  const handleAddressSelect = (address: string) => {
    setSelectedAddress(address);
    
    // Save selected account to preferences
    const selectedAccount = accounts.find(acc => acc.address === address);
    if (selectedAccount) {
      setSelectedAccount({
        address: selectedAccount.address,
        name: selectedAccount.name || selectedAccount.address,
        accountType: 'REGULAR' as any
      });
    }
  };

  const handleLogin = async () => {
    if (loginMethod === 'username') {
      if (!username.trim()) {
        onLoginError('Please enter a username');
        return;
      }

      setIsLoading(true);

      try {
        // For username login, we just use the username as the user identifier
        const normalizedUsername = username.trim().toLowerCase();
        
        // Initialize user in database
        const initResponse = await fetch('/api/init-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: normalizedUsername,
          }),
        });

        if (!initResponse.ok) {
          const errorData = await initResponse.json();
          throw new Error(errorData.error || 'Failed to initialize user');
        }

        // Save auth data locally
        AuthService.saveAuthData({
          address: normalizedUsername,
          wallet: 'username',
          signature: '',
          timestamp: Date.now(),
        });

        onLoginSuccess({ address: normalizedUsername, wallet: 'username' });
      } catch (error) {
        console.error('Username login error:', error);
        onLoginError(error instanceof Error ? error.message : 'Login failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!walletService || !selectedWallet || !selectedAddress) {
      onLoginError('Please select a wallet and address');
      return;
    }

    setIsLoading(true);

    try {
      // Sign the message using the correct format
      const signature = await walletService.signMessage(selectedAddress, selectedWallet);
      
      if (!signature) {
        onLoginError('Failed to sign message');
        return;
      }

      // Send authentication request
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: selectedAddress,
          signature,
          wallet: selectedWallet,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save auth data locally
      AuthService.saveAuthData({
        address: selectedAddress,
        wallet: selectedWallet,
        signature,
        timestamp: Date.now(),
      });

      onLoginSuccess(data.user);
    } catch (error) {
      console.error('Login error:', error);
      onLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-primary-200">
          {/* Logo area */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
              Klara
            </h1>
            <p className="text-gray-600 mt-2">The Ultimate AI Hub for Polkaseembly</p>
          </div>

          {/* Login Method Toggle */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLoginMethod('wallet')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  loginMethod === 'wallet'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Wallet
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('username')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  loginMethod === 'username'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Username
              </button>
            </div>
          </div>

          {loginMethod === 'wallet' ? (
            <div className="mb-4 flex flex-col gap-2 items-center">
              <label className="block text-sm font-medium text-gray-700">
                Select Wallet
              </label>
              <div className="flex items-center gap-2">
                {availableWallets.map((wallet: string) => (
                  <WalletButton
                    key={wallet}
                    disabled={isLoading}
                    wallet={wallet as unknown as EWallet}
                    onClick={handleWalletSelect}
                    label={wallet}
                    selectedWallet={selectedWallet}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          )}

        {loginMethod === 'wallet' && accounts.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Account
            </label>
            <CustomAddressDropdown
              accounts={accounts}
              selectedAddress={selectedAddress}
              onAddressSelect={handleAddressSelect}
              placeholder="Choose Account"
            />
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={(loginMethod === 'wallet' && !selectedAddress) || (loginMethod === 'username' && !username.trim()) || isLoading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? 'Connecting...' : loginMethod === 'wallet' ? 'Connect Wallet' : 'Login with Username'}
        </button>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-300 rounded-full opacity-30"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-300 rounded-full opacity-30"></div>
      </div>
    </div>
  );
} 