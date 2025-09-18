import twConfig from '../../../tailwind.config.js';

export const twColor = (color: keyof typeof twConfig.theme.colors) => twConfig.theme.colors[color];
