import { decodeAddress } from '@polkadot/util-crypto';

export async function getSubstrateAddressPublicKey(address: string): Promise<Uint8Array> {
  try {
    // Decode the address to get the public key
    const publicKey = decodeAddress(address);
    return publicKey;
  } catch (error) {
    throw new Error(`Invalid substrate address: ${address}`);
  }
} 