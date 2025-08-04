export const mascotGifs = [
  {
    type: 'error',
    url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/error/Error_1.gif',
  },
  {
    type: 'error',
    url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/error/Error_2.gif',
  },
  {
    type: 'loading',
    url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/loading/Loading_1.gif',
  },
  {
    type: 'loading',
    url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/loading/Loading_2.gif',
  },
  {
    type: 'taskdone',
    url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/taskdone/task_1.gif',
  },
  {
    type: 'taskdone',
    url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/taskdone/task_2.gif',
  },
  {
    type: 'welcome',
    url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/welcome/Welcome_1.gif',
  },
  {
    type: 'welcome',
    url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/welcome/Welcome_2.gif',
  },
];

export type MascotType = 'welcome' | 'loading' | 'taskdone' | 'error';

export const getMascotGif = (type: MascotType): string => {
  const gifsOfType = mascotGifs.filter(gif => gif.type === type);
  if (gifsOfType.length === 0) return '';
  
  // Randomly select between _1 and _2 variants
  const randomIndex = Math.floor(Math.random() * gifsOfType.length);
  return gifsOfType[randomIndex].url;
};
