import { Item } from "@prisma/client";
import { startTransition, useState } from "react";
import { deleteItem, moveItem, updateItemContent } from "@/actions";
import { Button } from "./button";
import { OptimisticActions } from "./board";

interface DraggableItemProps {
  item: Item,
  prevOrder: number,
  nextOrder: number,
  optimisticBoardAction: (action: OptimisticActions) => void
}

export function DraggableItem({ item, prevOrder, nextOrder, optimisticBoardAction }: DraggableItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [acceptDrop, setAcceptDrop] = useState<"top" | "bottom" | "none">("none")
  return (
    <li
      className={
        "py-[2px] px-2 border-y-2 border-transparent " +
        (!isEditing ? "cursor-grab " : "") +
        (isDragging ? "opacity-50 " : "") +
        (acceptDrop === "top" ? "border-t-red-500 " : acceptDrop === "bottom" ? "border-b-red-500 " : "")
      }
      onDragStart={(e) => {
        e.stopPropagation()
        e.dataTransfer.setData("drag_item", "")
        e.dataTransfer.setData("drag_data", JSON.stringify(item))
        setIsDragging(true)
      }}
      onDragEnd={() => {
        setIsDragging(false)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        const dragType = e.dataTransfer.types.includes("drag_item") ? "ITEM" : "COLUMN"
        if (dragType === "ITEM") {
          const rect = e.currentTarget.getBoundingClientRect();
          const midpoint = (rect.top + rect.bottom) / 2;
          setAcceptDrop(e.clientY <= midpoint ? "top" : "bottom");
          e.stopPropagation()
        }
      }}
      onDragLeave={() => {
        setAcceptDrop("none")
      }}
      onDrop={(e) => {
        const dragType = e.dataTransfer.types.includes("drag_item") ? "ITEM" : "COLUMN"
        if (dragType === "ITEM") {
          const itemToMove = JSON.parse(e.dataTransfer.getData("drag_data")) as Item
          const dropOrder = acceptDrop === "top" ? prevOrder : nextOrder
          const newOrder = (item.order + dropOrder) / 2
          startTransition(() => {
            optimisticBoardAction({
              type: "MOVE_ITEM",
              payload: { item: itemToMove, newColumnId: item.columnId, newOrder }}
            )
            moveItem(itemToMove, newOrder, item.columnId)
          })
          e.stopPropagation()
        }
        setAcceptDrop("none")
      }}
    >
      <div
        draggable={!isEditing}
        className="bg-white shadow-sm dark:bg-neutral-700 dark:shadow-none group p-2 min-h-16 rounded-sm flex justify-between items-start"
      >
        {isEditing ? (
          <textarea
            autoFocus
            className="resize-none overflow-hidden w-full"
            defaultValue={item.content}
            onChange={(e) => {
              e.currentTarget.style.height = "1px"
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
            }}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                setIsEditing(false)
                const newContent = e.currentTarget.value
                startTransition(() => {
                  optimisticBoardAction({
                    type: "UPD_ITEM_CONTENT",
                    payload: { itemId: item.id, columnId: item.columnId, newContent }
                  })
                  updateItemContent(item.id, newContent)
                })
              } else if (e.key === "Escape") {
                setIsEditing(false)
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.height = `1px`
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
              e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)
            }}
            name="newContent"
          />
        ) : (
          <p className="break-words overflow-hidden">{item.content}</p>
        )}
        <div
          className={
            "flex flex-col gap-2 " +
            (isDragging ? "opacity-0" : "")
          }
        >
          <Button
            type="edit"
            className={"invisible group-hover:visible hover:opacity-50 hover:cursor-pointer " + (isEditing ? "visible!" : "")}
            onClick={() => setIsEditing(true)}
          />
          <Button
            type="delete"
            className="invisible group-hover:visible hover:text-red-500 hover:cursor-pointer"
            onClick={() => {
              startTransition(() => {
                optimisticBoardAction({ type: "DEL_ITEM", payload: { itemId: item.id, columnId: item.columnId }})
                deleteItem(item.id)
              })
            }}
          />
        </div>
      </div>
    </li>
  )
}
