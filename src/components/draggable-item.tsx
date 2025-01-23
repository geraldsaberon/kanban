import { Item } from "@prisma/client";
import { startTransition, useRef, useState } from "react";
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
  const submitEditButtonRef = useRef<HTMLButtonElement>(null)
  return (
    <li
      className={
        "py-[2px] px-2 border-y-2 border-transparent " +
        (!isEditing ? "cursor-grab " : "") +
        (isDragging ? "opacity-50 " : "") +
        (acceptDrop === "top" ? "border-t-red-500 " : acceptDrop === "bottom" ? "border-b-red-500 " : "")
      }
      onDragStart={(e) => {
        e.dataTransfer.setData("ITEM_TO_MOVE", JSON.stringify(item))
        setIsDragging(true)
      }}
      onDragEnd={() => {
        setIsDragging(false)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = (rect.top + rect.bottom) / 2;
        setAcceptDrop(e.clientY <= midpoint ? "top" : "bottom");
      }}
      onDragLeave={() => {
        setAcceptDrop("none")
      }}
      onDrop={(e) => {
        e.stopPropagation()
        const itemToMove = JSON.parse(e.dataTransfer.getData("ITEM_TO_MOVE")) as Item
        const dropOrder = acceptDrop === "top" ? prevOrder : nextOrder
        const newOrder = (item.order + dropOrder) / 2
        startTransition(() => {
          optimisticBoardAction({
            type: "MOVE_ITEM",
            payload: { item: itemToMove, newColumnId: item.columnId, newOrder }}
          )
          moveItem(itemToMove, newOrder, item.columnId)
        })
        setAcceptDrop("none")
      }}
    >
      <div
        draggable={!isEditing}
        className="bg-white shadow-sm dark:bg-neutral-700 dark:shadow-none group p-2 min-h-16 rounded-sm flex justify-between items-start"
      >
        {isEditing ? (
          <form onSubmit={(e) => {
            e.preventDefault()
            const newContent = new FormData(e.currentTarget).get("newContent")!.toString()
            startTransition(() => {
              optimisticBoardAction({
                type: "UPD_ITEM_CONTENT",
                payload: { itemId: item.id, columnId: item.columnId, newContent }
              })
              updateItemContent(item.id, newContent)
            })
          }}>
            <textarea
              autoFocus
              className="resize-none overflow-hidden bg-transparent "
              defaultValue={item.content}
              onChange={(e) => {
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
              }}
              onBlur={() => {
                setIsEditing(false)
                submitEditButtonRef.current?.click()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  setIsEditing(false)
                  submitEditButtonRef.current?.click()
                } else if (e.key === "Escape") {
                  setIsEditing(false)
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
              }}
              name="newContent"
            />
            <button ref={submitEditButtonRef} hidden type="submit">Save</button>
          </form>
        ) : (
          <p>{item.content}</p>
        )}
        <div
          className={
            "flex flex-col gap-2 " +
            (isDragging ? "hidden" : "")
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
