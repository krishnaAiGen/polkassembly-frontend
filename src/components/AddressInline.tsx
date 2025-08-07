'use client';

import React from 'react';
import Identicon from '@polkadot/react-identicon';
import { cn } from '@/lib/utils';

interface Props {
  address: string;
  className?: string;
  addressDisplayText?: string;
  iconSize?: number;
  showIdenticon?: boolean;
  textClassName?: string;
  truncateLength?: number;
}

function AddressInline({
  address,
  addressDisplayText,
  className,
  iconSize = 20,
  showIdenticon = true,
  textClassName,
  truncateLength = 12
}: Props) {
  // Create display text from address if not provided
  const displayText = addressDisplayText || 
    (address.length > truncateLength 
      ? `${address.slice(0, truncateLength/2)}...${address.slice(-truncateLength/2)}`
      : address
    );

  return (
    <div
      className={cn(
        "flex min-w-0 flex-row items-center gap-1.5",
        className
      )}
      title={address}
    >
      {showIdenticon && address && (
        <Identicon
          className='image identicon'
          value={address}
          size={iconSize}
          theme='polkadot'
        />
      )}
      
      <p className={cn(
        "max-w-full truncate text-xs font-bold lg:text-sm text-gray-700",
        textClassName
      )}>
        {displayText}
      </p>
    </div>
  );
}

export default AddressInline; 