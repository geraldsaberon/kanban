"use client"

import { Column as ColumnType, Item } from "@prisma/client"
import { CreateItem } from "./create"
import { OptimisticActions } from "./board"
import { useRef } from "react"

interface ColumnProps {
  boardId: string,
  column: ColumnType & { items: Record<Item["id"], Item> },
  optimisticBoardAction: (action: OptimisticActions) => void
}

export function Column({ boardId, column, optimisticBoardAction }: ColumnProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const items = Object.values(column.items).sort((a, b) => a.order - b.order)
  return (
    <div
      className="flex-shrink-0 h-fit bg-neutral-800 w-[256px] rounded text-white space-y-2"
    >
      <h1 className="pl-4 pt-2">{column.name}</h1>
      <ul className="max-h-[512px] overflow-auto space-y-2" ref={listRef}>
          {items.length ?
            items.map(item => (
              <li className="px-2" key={item.id}>
                <div className="p-2 min-h-16 bg-neutral-700 rounded ">{item.content}</div>
              </li>
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
