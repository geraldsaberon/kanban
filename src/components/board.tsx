"use client"

import { useOptimistic, useRef } from "react"
import { getBoard } from "@/db/queries"
import { Column } from "./column"
import { Column as ColumnType, Item } from "@prisma/client"
import { produce } from "immer"
import { CreateColumn } from "./create"

type BoardType = NonNullable<Awaited<ReturnType<typeof getBoard>>>

export function Board({ board }: { board: BoardType }) {
  const { optimisticBoard, optimisticBoardAction } = useOptimisticBoard(board)
  const columnsRef = useRef<HTMLDivElement>(null)
  return (
    <div className="h-screen p-2 flex flex-col gap-2">
      <h1 className="text-xl">{board.name}</h1>
      <CreateColumn
        boardId={board.id}
        scrollColumnsList={() => columnsRef.current && (columnsRef.current.scrollLeft = columnsRef.current.scrollWidth)}
        optimisticAdd={(newCol) => optimisticBoardAction({ type: "ADD_COL", payload: newCol})}
      />
      <div className="h-full flex gap-2 overflow-x-auto" ref={columnsRef}>
        {Object.values(optimisticBoard.columns).map(col => (
          <Column
            key={col.id}
            boardId={optimisticBoard.id}
            column={col}
            optimisticBoardAction={optimisticBoardAction}
          />
        ))}
      </div>
    </div>
  )
}

export type OptimisticActions =
  { type: "ADD_ITEM", payload: Item } |
  { type: "ADD_COL", payload: ColumnType & { items: Record<Item["id"], Item> } }

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
        case "ADD_COL": {
          const newCol = action.payload
          const nextState = produce(state, draft => {
            draft.columns[newCol.id] = newCol
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
