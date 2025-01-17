"use client"

import React, { useOptimistic } from "react"
import { getBoard } from "@/db/queries"
import { Column } from "./column"
import { Item } from "@prisma/client"
import { produce } from "immer"

type BoardType = NonNullable<Awaited<ReturnType<typeof getBoard>>>

export function Board({ board }: { board: BoardType }) {
  const { optimisticBoard, optimisticBoardAction } = useOptimisticBoard(board)
  return (
    <div className="flex gap-2 overflow-x-auto flex-grow">
      {Object.values(optimisticBoard.columns).map(col => (
        <Column
          key={col.id}
          boardId={optimisticBoard.id}
          column={col}
          optimisticBoardAction={optimisticBoardAction}
        />
      ))}
    </div>
  )
}

export type OptimisticActions =
  { type: "ADD_ITEM", payload: Item }

function useOptimisticBoard(board: BoardType) {
  const [optimisticBoard, optimisticBoardAction] = useOptimistic<typeof board, OptimisticActions>(
    board,
    (state, action) => {
      switch (action.type) {
        case "ADD_ITEM": {
          const newItem = action.payload
          const nextState = produce(state, draft => {
            draft.columns[newItem.columnId].items[newItem.id] = newItem
          })
          return nextState
        }
        default: {
          return state
        }
      }
    }
  )
  return { optimisticBoard, optimisticBoardAction }
}
