import * as React from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import {twMerge} from 'tailwind-merge'

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({className, children, position = 'popper', ...props}, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      className={twMerge(
        'relative z-50 min-w-[8rem] overflow-hidden rounded bg-white shadow-md',
        className
      )}
      position={position}
      {...props}
    >
      <RadixSelect.Viewport
        className={twMerge(
          'p-0',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </RadixSelect.Viewport>
    </RadixSelect.Content>
  </RadixSelect.Portal>
))
