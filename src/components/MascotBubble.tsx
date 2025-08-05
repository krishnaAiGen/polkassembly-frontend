'use client';

import React, { useEffect, useState } from 'react';
import { mascotGifs, MascotGif } from '../lib/mascots';

interface MascotBubbleProps {
    type: MascotGif['type'];
    text?: string;
}

const MascotBubble: React.FC<MascotBubbleProps> = ({ type, text }) => {
    const [mascot, setMascot] = useState<MascotGif | null>(null);

    useEffect(() => {
        const relevantGifs = mascotGifs.filter((gif) => gif.type === type);
        if (relevantGifs.length > 0) {
            const randomIndex = Math.floor(Math.random() * relevantGifs.length);
            setMascot(relevantGifs[randomIndex]);
        }
    }, [type]);

    if (!mascot) {
        return null;
    }

    return (
        <div className="flex justify-start mb-4 animate-fade-in">
            <div className="flex items-end gap-3">
                {/* Mascot Image */}
                <img src={mascot.url} alt={`${type} mascot`} className="w-20 h-20 object-contain" />

                {/* Text Bubble */}
                {text && (
                    <div className="px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-800 border border-primary-100 shadow-sm">
                        <p className="text-sm font-medium">{text}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MascotBubble; 