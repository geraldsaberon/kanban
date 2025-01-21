"use client"

import { startTransition, useOptimistic, useRef } from "react"
import { getBoard, ColumnType } from "@/db/queries"
import { Column } from "./column"
import { Item } from "@prisma/client"
import { produce } from "immer"
import { CreateColumn } from "./create"
import { EditableText } from "./editable-text"
import { updateBoardName } from "@/actions"
import Link from "next/link"

type BoardType = NonNullable<Awaited<ReturnType<typeof getBoard>>>

export function Board({ board }: { board: BoardType }) {
  const { optimisticBoard, optimisticBoardAction } = useOptimisticBoard(board)
  const columnsRef = useRef<HTMLDivElement>(null)
  const columns = Object.values(optimisticBoard.columns)
  return (
    <div className="h-screen p-2 flex flex-col gap-2">
      <div className="px-4 py-2 bg-neutral-800 rounded flex gap-4 items-center">
        <Link href="/" aria-label="Home">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <EditableText
          text={optimisticBoard.name}
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
      </div>
      <div className="h-full flex gap-2 overflow-x-auto" ref={columnsRef}>
        {columns.map(col => (
          <Column
            key={col.id}
            boardId={optimisticBoard.id}
            column={col}
            optimisticBoardAction={optimisticBoardAction}
          />
        ))}
        <CreateColumn
          boardId={board.id}
          scrollColumnsList={() => columnsRef.current && (columnsRef.current.scrollLeft = columnsRef.current.scrollWidth)}
          optimisticAdd={(newCol) => optimisticBoardAction({ type: "ADD_COL", payload: newCol})}
          isEditingInitially={columns.length === 0}
        />
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
  { type: "DEL_ITEM", payload: { itemId: string, columnId: string } } |
  { type: "DEL_COL", payload: { columnId: string } } |
  { type: "UPD_COL_NAME", payload: { columnId: string, newName: string } } |
  { type: "UPD_BRD_NAME", payload: { newName: string } } |
  { type: "UPD_ITEM_CONTENT", payload: { itemId: string, columnId: string, newContent: string } }

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
        case "UPD_COL_NAME": {
          const columnId = action.payload.columnId
          const newName = action.payload.newName
          const nextState = produce(state, draft => {
            draft.columns[columnId].name = newName
          })
          return nextState
        }
        case "UPD_BRD_NAME": {
          const newName = action.payload.newName
          return {...state, name: newName}
        }
        case "UPD_ITEM_CONTENT": {
          const itemId = action.payload.itemId
          const columnId = action.payload.columnId
          const newContent = action.payload.newContent
          const nextState = produce(state, draft => {
            draft.columns[columnId].items[itemId].content = newContent
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
