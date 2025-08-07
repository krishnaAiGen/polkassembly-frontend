import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';

export function getSubstrateAddress(address: string): string | null {
  try {
    // Decode the address to get the public key
    const publicKey = decodeAddress(address);
    // Re-encode with default prefix (42 for Substrate)
    return encodeAddress(publicKey, 42);
  } catch (error) {
    return null;
  }
} 