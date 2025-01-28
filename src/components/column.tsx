"use client"

import { CreateItem } from "./create"
import { OptimisticActions } from "./board"
import { useRef, useState, startTransition } from "react"
import { ColumnType } from "@/db/queries"
import { DraggableItem } from "./draggable-item"
import { deleteColumn, moveColumn, moveItem, updateColumnName } from "@/actions"
import { Item } from "@prisma/client"
import { Button } from "./button"
import { EditableText } from "./editable-text"

interface ColumnProps {
  boardId: string,
  column: ColumnType,
  prevOrder: number,
  nextOrder: number,
  optimisticBoardAction: (action: OptimisticActions) => void
}

export function Column({ boardId, column, prevOrder, nextOrder, optimisticBoardAction }: ColumnProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isCardDragOver, setIsCardDragOver] = useState(false)
  const [acceptDrop, setAcceptDrop] = useState<"left" | "right" | "none">("none")
  const listRef = useRef<HTMLUListElement>(null)
  const items = Object.values(column.items).sort((a, b) => a.order - b.order)
  return (
    <div
      className={
        "border-x-2 border-transparent px-[2px] first:pl-0 last-of-type:pr-0 last-of-type:mr-[6px] " +
        (acceptDrop === "left" ? "border-l-red-500 " : acceptDrop === "right" ? "border-r-red-500 " : "")
      }
      onDragStart={(e) => {
        e.dataTransfer.setData("DRAG_TYPE", "COLUMN")
        e.dataTransfer.setData("DRAG_DATA", JSON.stringify(column))
        setIsDragging(true)
      }}
      onDragEnd={() => {
        setIsDragging(false)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        const dragType = e.dataTransfer.getData("DRAG_TYPE")
        if (dragType === "ITEM") {
          setIsCardDragOver(true)
        } else if (dragType === "COLUMN") {
          const rect = e.currentTarget.getBoundingClientRect();
          const midpoint = (rect.left + rect.right) / 2;
          setAcceptDrop(e.clientX <= midpoint ? "left" : "right");
        }
      }}
      onDrop={(e) => {
        const dragType = e.dataTransfer.getData("DRAG_TYPE")
        if (dragType === "ITEM") {
          const itemToMove = JSON.parse(e.dataTransfer.getData("DRAG_DATA")) as Item
          startTransition(() => {
            const newOrder = items.at(-1) ? items.at(-1)!.order + 1 : 1
            optimisticBoardAction({
              type: "MOVE_ITEM",
              payload: { item: itemToMove, newColumnId: column.id, newOrder }
            })
            moveItem(itemToMove, newOrder, column.id)
          })
        } else if (dragType === "COLUMN") {
          const columnToMove = JSON.parse(e.dataTransfer.getData("DRAG_DATA")) as ColumnType
          const dropOrder = acceptDrop === "left" ? prevOrder : nextOrder
          const newOrder = (column.order + dropOrder) / 2
          startTransition(() => {
            optimisticBoardAction({ type: "MOVE_COL", payload: { columnId: columnToMove.id, newOrder } })
            moveColumn(columnToMove.id, newOrder)
          })
        }
        setIsCardDragOver(false)
        setAcceptDrop("none")
      }}
      onDragLeave={() => {
        setIsCardDragOver(false)
        setAcceptDrop("none")
      }}
    >
      <div
        draggable
        className={
          "bg-neutral-100 dark:bg-neutral-800 rounded-sm shrink-0 w-64 space-y-2 h-fit max-h-full flex flex-col " +
          (isCardDragOver ? "outline-2 outline-red-500 -outline-offset-2 " : "") +
          (isDragging ? "opacity-25" : "")
        }
      >
        <div className="group relative flex justify-between px-4 pt-2">
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
            className="invisible relative top-1 shrink-0 group-hover:visible hover:text-red-500 hover:cursor-pointer"
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
    </div>
  )
}
