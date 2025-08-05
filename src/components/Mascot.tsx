'use client';

import React from 'react';
import { mascotGifs, MascotGif } from '../lib/mascots';

interface MascotProps {
  type: 'welcome' | 'loading' | 'error' | 'taskdone';
  onStop?: () => void; // Callback for the stop button on the loading mascot
}

const getRandomGifUrl = (type: MascotProps['type']): string | null => {
  const relevantGifs = mascotGifs.filter((gif: MascotGif) => gif.type === type);
  if (relevantGifs.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * relevantGifs.length);
  return relevantGifs[randomIndex].url;
};

const Mascot: React.FC<MascotProps> = ({ type, onStop }) => {
  const mascotUrl = getRandomGifUrl(type);

  if (!mascotUrl) {
    return null;
  }

  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="flex items-end space-x-2">
        <div className="p-1">
          <img 
            src={mascotUrl} 
            alt={`${type} mascot`} 
            className="w-28 h-auto"
          />
        </div>
        
        {type === 'loading' && onStop && (
           <button
             onClick={onStop}
             className="mb-2 w-8 h-8 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0 shadow-md"
             title="Stop generation"
           >
             <div className="w-3 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}></div>
           </button>
        )}
      </div>
    </div>
  );
};

export default Mascot;
