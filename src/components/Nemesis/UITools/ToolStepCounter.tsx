import { ToolInvocation } from 'ai';
import React from 'react'

function ToolStepCounter({ children, sep }: { toolInvocation?: ToolInvocation, children: React.ReactNode, i?: number, sep: boolean }) {
  return (
    <>
      <div className="flex flex-row gap-2 items-center p-3">
        {/* <div
          className={twMerge(
            'flex items-center justify-center rounded-full p-2 bg-white/10 border border-white/20 w-4 h-4 mr-2 transition duration-300',
            'result' in toolInvocation && 'bg-green',
          )}
        >
          <p
            className={twMerge(
              'font-mono text-xxs opacity-50 transition-opacity duration-300',
              'result' in toolInvocation && 'opacity-100',
            )}
          >
            {i + 1}
          </p>
        </div> */}

        {children}

      </div>

      {sep && <div className="w-full h-[1px] bg-bcolor" />}
    </>
  )
}

export default ToolStepCounter
