"use client"

import { CreateItem } from "./create"
import { OptimisticActions } from "./board"
import { useRef, useState, startTransition } from "react"
import { ColumnType } from "@/db/queries"
import { DraggableItem } from "./draggable-item"
import { deleteColumn, moveItem, updateColumnName } from "@/actions"
import { Item } from "@prisma/client"
import { Button } from "./button"
import { EditableText } from "./editable-text"

interface ColumnProps {
  boardId: string,
  column: ColumnType,
  optimisticBoardAction: (action: OptimisticActions) => void
}

export function Column({ boardId, column, optimisticBoardAction }: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)
  const items = Object.values(column.items).sort((a, b) => a.order - b.order)
  return (
    <div
      className={
        "bg-neutral-800 rounded flex-shrink-0 w-64 space-y-2 h-fit max-h-full flex flex-col " +
        (isDragOver ? "outline outline-2 outline-red-500 " : "")
      }
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDrop={(e) => {
        const itemToMove = JSON.parse(e.dataTransfer.getData("ITEM_TO_MOVE")) as Item
        startTransition(() => {
          const newOrder = items.at(-1) ? items.at(-1)!.order + 1 : 1
          optimisticBoardAction({
            type: "MOVE_ITEM",
            payload: { item: itemToMove, newColumnId: column.id, newOrder }
          })
          moveItem(itemToMove, newOrder, column.id)
        })
        setIsDragOver(false)
      }}
      onDragLeave={() => {
        setIsDragOver(false)
      }}
    >
      <div className="group flex justify-between px-4 pt-2">
        <EditableText
          text={column.name}
          submitFn={(newName) => {
            startTransition(() => {
              optimisticBoardAction({
                type: "UPD_COL_NAME",
                payload: { columnId: column.id, newName }
              })
              updateColumnName(column.id, newName)
            })
          }}
        />
        <Button
          type="delete"
          className="invisible group-hover:visible hover:text-red-500 hover:cursor-pointer"
          onClick={() => {
            startTransition(() => {
              optimisticBoardAction({ type: "DEL_COL", payload: { columnId: column.id }})
              deleteColumn(column.id)
            })
          }}
        />
      </div>
      <ul className="overflow-y-auto" ref={listRef}>
          {items.length ?
            items.map((item, index) => (
              <DraggableItem
                key={item.id}
                item={item}
                prevOrder={items[index-1] ? items[index-1].order : 0}
                nextOrder={items[index+1] ? items[index+1].order : item.order+1}
                optimisticBoardAction={optimisticBoardAction}
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
