'use client';

import React from 'react';
import { Listbox } from '@headlessui/react';
import AddressInline from './AddressInline';
import { cn } from '@/lib/utils';

interface Account {
  address: string;
  name?: string;
}

interface CustomAddressDropdownProps {
  accounts: Account[];
  selectedAddress: string;
  onAddressSelect: (address: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomAddressDropdown({
  accounts,
  selectedAddress,
  onAddressSelect,
  placeholder = "Choose Account",
  className
}: CustomAddressDropdownProps) {

  const selectedAccount = accounts.find(acc => acc.address === selectedAddress);

  return (
    <Listbox value={selectedAddress} onChange={onAddressSelect}>
      <div className={cn("relative", className)}>
        <Listbox.Button className="relative w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left">
          {selectedAccount ? (
            <AddressInline 
              address={selectedAccount.address}
              iconSize={20}
              textClassName="text-gray-800 font-medium"
            />
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg 
              className="w-4 h-4 text-gray-400 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </Listbox.Button>
        
        <Listbox.Options className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none">
          {accounts.map((account) => (
            <Listbox.Option
              key={account.address}
              value={account.address}
              className={({ active }) =>
                cn(
                  'relative cursor-pointer select-none py-2 px-3',
                  active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                )
              }
            >
              {({ selected }) => (
                <div className="flex items-center justify-between">
                  <AddressInline 
                    address={account.address}
                    iconSize={18}
                    textClassName={cn(
                      "text-sm",
                      selected ? "font-semibold" : "font-medium"
                    )}
                  />
                  {selected && (
                    <svg 
                      className="w-4 h-4 text-primary-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
} 