"use client"

import Link from "next/link"
import { EditableText } from "./editable-text"
import { BoardType, OptimisticActions } from "./board"
import { startTransition } from "react"
import { updateBoardName } from "@/actions"
import { DeleteBoardButton } from "./delete-board"
import { ColorPicker } from "./color-picker"

interface BoardHeaderProps {
  board: BoardType,
  optimisticBoardAction: (action: OptimisticActions) => void
}

export function BoardHeader({ board, optimisticBoardAction }: BoardHeaderProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 px-4 py-2 rounded-sm flex gap-4 items-center">
      <Link href="/" aria-label="Home">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </Link>
      <EditableText
        text={board.name}
        submitFn={(newName) => {
          startTransition(() => {
            optimisticBoardAction({
              type: "UPD_BRD_NAME",
              payload: { newName }
            })
            updateBoardName(board.id, newName)
          })
        }}
      />
      <div className="ml-auto flex items-center gap-4">
        <ColorPicker
          boardId={board.id}
          optimisticColorUpdate={(color) => optimisticBoardAction({ type: "UPD_BRD_COLOR", payload: { color }})}
        />
        <DeleteBoardButton boardId={board.id} />
      </div>
    </div>
  )
}
