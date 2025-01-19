"use client"

import { useOptimistic, useRef } from "react"
import { getBoard, ColumnType } from "@/db/queries"
import { Column } from "./column"
import { Item } from "@prisma/client"
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
  { type: "ADD_COL", payload: ColumnType } |
  {
    type: "MOVE_ITEM",
    payload: { item: Item, newOrder: number, newColumnId: string }
  } |
  { type: "DEL_ITEM", payload: { itemId: string, columnId: string }} |
  { type: "DEL_COL", payload: { columnId: string }}

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
        case "MOVE_ITEM": {
          const item = { ...action.payload.item, order: action.payload.newOrder }
          const nextState = produce(state, draft => {
            delete draft.columns[item.columnId].items[item.id]
            item.columnId = action.payload.newColumnId
            draft.columns[item.columnId].items[item.id] = item
          })
          return nextState
        }
        case "DEL_ITEM": {
          const itemId = action.payload.itemId
          const columnId = action.payload.columnId
          const nextState = produce(state, draft => {
            delete draft.columns[columnId].items[itemId]
          })
          return nextState
        }
        case "DEL_COL": {
          const columnId = action.payload.columnId
          const nextState = produce(state, draft => {
            delete draft.columns[columnId]
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
