'use client';

import React,
{
	useEffect,
	useState
} from 'react';
import {
	mascotGifs,
	MascotGif
} from '../lib/mascots'; // Adjust path as needed

interface MascotProps {
	type: 'welcome' | 'loading' | 'error' | 'taskdone';
	onComplete?: () => void; // Callback for when the animation/display is done
	duration?: number; // How long to show the mascot in ms
}

const Mascot: React.FC < MascotProps > = ({
	type,
	onComplete,
	duration
}) => {
	const [mascot, setMascot] = useState < MascotGif | null > (null);

	useEffect(() => {
		const relevantGifs = mascotGifs.filter((gif: MascotGif) => gif.type === type);
		if (relevantGifs.length > 0) {
			const randomIndex = Math.floor(Math.random() * relevantGifs.length);
			setMascot(relevantGifs[randomIndex]);
		}

		if (duration && onComplete) {
			const timer = setTimeout(onComplete, duration);
			return () => clearTimeout(timer);
		}
	}, [type, duration, onComplete]);

	if (!mascot) {
		return null;
	}

	return (
		<div className="fixed bottom-0 right-0 m-4 z-50">
      <img src={mascot.url} alt={`${type} mascot`} className="w-48 h-auto" />
    </div>
	);
};

export default Mascot;
