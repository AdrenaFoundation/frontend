export const POSITION_BLOCK_STYLES = {
  base: {
    container:
      'min-w-[250px] w-full flex flex-col p-4 rounded-md border border-white/10 justify-start items-start gap-2.5',
    header:
      'w-full flex pb-3 border-b border-white/10 justify-start items-center gap-2.5',
    content: 'w-full flex flex-wrap gap-4',
  },
  text: {
    header: 'text-grayLabel text-xxs font-normal font-mono',
    white: 'text-whiteLabel text-xs font-medium font-mono',
    gray: 'text-grayLabel text-xs font-medium font-mono',
    orange: 'text-orange text-xs font-medium font-mono',
    purple: 'text-purpleColor text-xs font-medium font-mono',
    blue: 'text-blue text-xs font-medium font-mono',
    red: 'text-redbright text-xs font-medium font-mono',
  },
  column: {
    base: 'flex flex-col',
    sizes: {
      big: 'w-[5em]',
      compact: 'w-[6em]',
      medium: 'w-[5em]',
      mini: 'w-[5em]',
    },
  },
  button: {
    base: 'px-2.5 py-1.5 bg-whiteLabel/5 rounded-md text-grayLabel font-normal font-mono',
    filled:
      'w-full bg-whiteLabel/5 rounded-md text-grayLabel font-normal font-mono',
    container: 'flex gap-2 items-center',
  },
} as const;
