import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from './firebase'
import { EWallet } from '@/types/wallet'

export interface IUser {
  id: string;
  address: string;
  wallet: EWallet;
  username?: string;
  email?: string;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  profileImage?: string;
  bio?: string;
}

export interface IUserSession {
  userId: string;
  address: string;
  wallet: EWallet;
  loginAt: Date;
  expiresAt: Date;
  signature: string;
}

export class UserService {
  /**
   * Create or update user from wallet authentication
   */
  static async createOrUpdateUser({
    address,
    wallet,
    signature
  }: {
    address: string;
    wallet: EWallet;
    signature: string;
  }): Promise<IUser> {
    try {
      // Check if user exists by address
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('address', '==', address));
      const querySnapshot = await getDocs(q);
      
      let user: IUser;
      
      if (!querySnapshot.empty) {
        // User exists - update last login
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        await updateDoc(userDoc.ref, {
          lastLoginAt: Timestamp.now(),
          wallet: wallet,
          isActive: true
        });
        
        user = {
          id: userDoc.id,
          address: userData.address,
          wallet: wallet,
          username: userData.username,
          email: userData.email,
          createdAt: userData.createdAt.toDate(),
          lastLoginAt: new Date(),
          isActive: true,
          profileImage: userData.profileImage,
          bio: userData.bio
        };
      } else {
        // Create new user
        const userRef = doc(usersRef);
        const now = Timestamp.now();
        
        const newUser: Omit<IUser, 'id'> = {
          address,
          wallet,
          createdAt: now.toDate(),
          lastLoginAt: now.toDate(),
          isActive: true
        };
        
        await setDoc(userRef, {
          ...newUser,
          createdAt: now,
          lastLoginAt: now
        });
        
        user = {
          id: userRef.id,
          ...newUser
        };
      }
      
      // Create session record
      await this.createSession({
        userId: user.id,
        address,
        wallet,
        signature
      });
      
      console.log(`User ${user.id} authenticated successfully`);
      return user;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }
  
  /**
   * Get user by address
   */
  static async getUserByAddress(address: string): Promise<IUser | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('address', '==', address));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      return {
        id: userDoc.id,
        address: userData.address,
        wallet: userData.wallet,
        username: userData.username,
        email: userData.email,
        createdAt: userData.createdAt.toDate(),
        lastLoginAt: userData.lastLoginAt.toDate(),
        isActive: userData.isActive,
        profileImage: userData.profileImage,
        bio: userData.bio
      };
    } catch (error) {
      console.error('Error getting user by address:', error);
      return null;
    }
  }
  
  /**
   * Create a session record
   */
  private static async createSession({
    userId,
    address,
    wallet,
    signature
  }: {
    userId: string;
    address: string;
    wallet: EWallet;
    signature: string;
  }): Promise<void> {
    try {
      const sessionsRef = collection(db, 'sessions');
      const sessionRef = doc(sessionsRef);
      const now = Timestamp.now();
      const expiresAt = new Date(now.toDate().getTime() + 24 * 60 * 60 * 1000); // 24 hours
      
      await setDoc(sessionRef, {
        userId,
        address,
        wallet,
        loginAt: now,
        expiresAt: Timestamp.fromDate(expiresAt),
        signature
      });
      
      console.log(`Session created for user ${userId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }
  
  /**
   * Validate user session
   */
  static async validateSession(address: string): Promise<IUser | null> {
    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef, 
        where('address', '==', address),
        where('expiresAt', '>', Timestamp.now())
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      // Get the most recent session
      const latestSession = querySnapshot.docs.reduce((latest, current) => {
        const latestData = latest.data();
        const currentData = current.data();
        return latestData.loginAt.toMillis() > currentData.loginAt.toMillis() ? latest : current;
      });
      
      const sessionData = latestSession.data();
      return await this.getUserByAddress(sessionData.address);
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  }
  
  /**
   * Update user profile
   */
  static async updateUserProfile(
    address: string, 
    updates: Partial<Pick<IUser, 'username' | 'email' | 'profileImage' | 'bio'>>
  ): Promise<void> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('address', '==', address));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
      
      const userDoc = querySnapshot.docs[0];
      await updateDoc(userDoc.ref, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      console.log(`User profile updated for ${address}`);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Logout user (invalidate session)
   */
  static async logoutUser(address: string): Promise<void> {
    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(sessionsRef, where('address', '==', address));
      const querySnapshot = await getDocs(q);
      
      // Delete all sessions for this user
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`User ${address} logged out`);
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }
} 