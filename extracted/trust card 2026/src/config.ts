import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, bsc, polygon } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Trust Crypto Card',
  projectId: '19d11914f7fc221908598f293ef9303c',
  chains: [mainnet, bsc, polygon],
  ssr: false,
});
