import { IWalletLoginResult } from '@/types/wallet';
import { UserService } from './userService';
import jwt from 'jsonwebtoken';

const AUTH_KEY = 'klara_auth';
const WALLET_PREFERENCES_KEY = 'klara_wallet_preferences';

export interface IAuthData {
  address: string;
  wallet: string;
  signature: string;
  timestamp: number;
}

export interface IWalletPreferences {
  wallet?: string;
  selectedAccount?: {
    address: string;
    name?: string;
  };
}

export interface IUser {
  id: string;
  address: string;
  wallet: string;
  createdAt: Date;
}

export class AuthService {
  static saveAuthData(authData: IAuthData): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }

  static getAuthData(): IAuthData | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const authData = localStorage.getItem(AUTH_KEY);
      if (!authData) return null;
      
      const parsed = JSON.parse(authData);
      
      // Check if the auth data is still valid (24 hours)
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - parsed.timestamp > twentyFourHours) {
        this.clearAuthData();
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to get auth data:', error);
      return null;
    }
  }

  static clearAuthData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  static saveWalletPreferences(preferences: IWalletPreferences): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(WALLET_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save wallet preferences:', error);
    }
  }

  static getWalletPreferences(): IWalletPreferences | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const preferences = localStorage.getItem(WALLET_PREFERENCES_KEY);
      if (!preferences) return null;
      
      return JSON.parse(preferences);
    } catch (error) {
      console.error('Failed to get wallet preferences:', error);
      return null;
    }
  }

  static clearWalletPreferences(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(WALLET_PREFERENCES_KEY);
    } catch (error) {
      console.error('Failed to clear wallet preferences:', error);
    }
  }

  static isAuthenticated(): boolean {
    return this.getAuthData() !== null;
  }

  static logout(): void {
    this.clearAuthData();
    this.clearWalletPreferences();
  }

  // New methods for user management
  static async createOrGetUser(address: string, wallet: string): Promise<IUser> {
    return await UserService.createOrUpdateUser({
      address,
      wallet: wallet as any, // Type assertion for now
      signature: '' // We don't need to store the signature
    });
  }

  static async generateToken(user: IUser): Promise<string> {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const payload = {
      userId: user.id,
      address: user.address,
      wallet: user.wallet,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    return jwt.sign(payload, secret);
  }

  static async validateSession(address: string): Promise<IUser | null> {
    return await UserService.validateSession(address);
  }

  static async logoutUser(address: string): Promise<void> {
    return await UserService.logoutUser(address);
  }
}

// Export a singleton instance for easier usage
export const authService = new AuthService(); 