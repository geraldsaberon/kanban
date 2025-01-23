"use client"

import { updateBoardColor } from "@/actions"
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { startTransition } from "react"

export const colors = [
  "bg-background",
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
] as const

interface ColorPickerProps {
  boardId: string,
  optimisticColorUpdate: (color: typeof colors[number]) => void
}

export function ColorPicker({ boardId, optimisticColorUpdate }: ColorPickerProps) {
  return (
    <Popover className="relative">
      <PopoverButton as="span" className="cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
        </svg>
      </PopoverButton>
      <PopoverPanel
        anchor="bottom end"
        className="[--anchor-gap:8px] bg-neutral-100 shadow dark:bg-neutral-600 dark:shadow-none grid grid-cols-6 gap-2  p-2 rounded transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        transition
      >
        {colors.map(color => (
            <button
              key={color}
              className={"shadow dark:shadow-none inline-block size-8 rounded hover:outline-2 outline-white cursor-pointer " + color}
              aria-label="Change color"
              onClick={() => {
                startTransition(() => {
                  optimisticColorUpdate(color)
                  updateBoardColor(boardId, color)
                })
              }}
            ></button>
        ))}
      </PopoverPanel>
    </Popover>
  )
}
