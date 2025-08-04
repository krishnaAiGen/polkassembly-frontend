'use client'

import { auth } from './firebase'
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth'

// Authentication state management
let authPromise: Promise<User | null> | null = null
let currentUser: User | null = null

/**
 * Ensure user is authenticated before any Firestore operations
 */
export async function ensureAuthenticated(): Promise<User | null> {
  // If already authenticated, return immediately
  if (currentUser) {
    return currentUser
  }

  // If authentication is in progress, wait for it
  if (authPromise) {
    return authPromise
  }

  // Start authentication process
  authPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        currentUser = user
        console.log('User authenticated:', user.uid)
        unsubscribe()
        resolve(user)
      } else {
        // No user, sign in anonymously
        console.log('No user found, signing in anonymously...')
        try {
          const userCredential = await signInAnonymously(auth)
          currentUser = userCredential.user
          console.log('Anonymous authentication successful:', userCredential.user.uid)
          unsubscribe()
          resolve(userCredential.user)
        } catch (error) {
          console.error('Anonymous authentication failed:', error)
          unsubscribe()
          resolve(null)
        }
      }
    })
  })

  return authPromise
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  return currentUser
}

/**
 * Initialize authentication on app start
 */
export function initializeAuth(): Promise<User | null> {
  return ensureAuthenticated()
}
