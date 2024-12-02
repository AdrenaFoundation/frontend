declare module '@phantom/wallet-sdk' {
  export type CreatePhantomConfig = Partial<{
    zIndex: number;
    hideLauncherBeforeOnboarded: boolean;
    colorScheme: string;
    paddingBottom: number;
    paddingRight: number;
  }>;
  export function createPhantom(config: CreatePhantomConfig = {}): void;
}
