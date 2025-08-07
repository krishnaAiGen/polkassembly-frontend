import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';
import { getSubstrateAddressPublicKey } from './utils/getSubstrateAddressPublicKey';

export const WEB3_AUTH_SIGN_MESSAGE = '<Bytes>Connect to Klara Chat</Bytes>';

export interface SignatureVerificationResult {
  isValid: boolean;
  crypto: string;
  isWrapped: boolean;
  publicKey: Uint8Array;
}

export async function verifySignature(
  message: string,
  signature: string,
  address: string
): Promise<SignatureVerificationResult> {
  try {
    // Ensure crypto is ready
    await cryptoWaitReady();
    
    // Get the public key from the address
    const publicKey = await getSubstrateAddressPublicKey(address);
    
    // Verify the signature using @polkadot/util-crypto
    const result = signatureVerify(message, signature, publicKey);
    
    return {
      isValid: result.isValid,
      crypto: result.crypto,
      isWrapped: result.isWrapped,
      publicKey: result.publicKey
    };
  } catch (error) {
    console.error('Signature verification error:', error);
    return {
      isValid: false,
      crypto: 'none',
      isWrapped: false,
      publicKey: new Uint8Array(32)
    };
  }
} 