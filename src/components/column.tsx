"use client"

import { CreateItem } from "./create"
import { OptimisticActions } from "./board"
import { useRef } from "react"
import { ColumnType } from "@/db/queries"
import { DraggableItem } from "./draggable-item"

interface ColumnProps {
  boardId: string,
  column: ColumnType,
  optimisticBoardAction: (action: OptimisticActions) => void
}

export function Column({ boardId, column, optimisticBoardAction }: ColumnProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const items = Object.values(column.items).sort((a, b) => a.order - b.order)
  return (
    <div className="bg-neutral-800 rounded flex-shrink-0 w-64 space-y-2 h-fit max-h-full flex flex-col">
      <h1 className="pl-4 pt-2">{column.name}</h1>
      <ul className="overflow-y-auto" ref={listRef}>
          {items.length ?
            items.map((item, index) => (
              <DraggableItem
                key={item.id}
                item={item}
                prevOrder={items[index-1] ? items[index-1].order : 0}
                nextOrder={items[index+1] ? items[index+1].order : item.order+1}
                optimisticMove={(item, newOrder, newColumnId) => optimisticBoardAction({ type: "MOVE_ITEM", payload: { item, newOrder, newColumnId}})}
              />
            ))
            :
            <p className="text-gray-400 text-center text-sm">No items yet</p>
          }
      </ul>
      <CreateItem
        boardId={boardId}
        columnId={column.id}
        order={items[items.length-1] ? items[items.length-1].order + 1 : 1 }
        optimisticAdd={(newItem) => optimisticBoardAction({ type: "ADD_ITEM", payload: newItem })}
        scrollItemList={() => listRef.current && (listRef.current.scrollTop = listRef.current.scrollHeight)}
      />
    </div>
  )
}
