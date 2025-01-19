import { Item } from "@prisma/client";
import { startTransition, useState } from "react";
import { deleteItem, moveItem } from "@/actions";
import { DeleteButton } from "./delete-button";
import { OptimisticActions } from "./board";

interface DraggableItemProps {
  item: Item,
  prevOrder: number,
  nextOrder: number,
  optimisticBoardAction: (action: OptimisticActions) => void
}

export function DraggableItem({ item, prevOrder, nextOrder, optimisticBoardAction }: DraggableItemProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [acceptDrop, setAcceptDrop] = useState<"top" | "bottom" | "none">("none")
  return (
    <li
      className={
        "cursor-grab py-[2px] px-2 border-y-2 border-transparent " +
        (isDragging ? "opacity-50 " : " ") +
        (acceptDrop === "top" ? "border-t-red-500 " : acceptDrop === "bottom" ? "border-b-red-500 " : " ")
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
        draggable
        className="group p-2 min-h-16 bg-neutral-700 rounded flex justify-between items-baseline"
      >
        <p>{item.content}</p>
        <DeleteButton
          className="invisible group-hover:visible hover:text-red-500 hover:cursor-pointer"
          onClick={() => {
            startTransition(() => {
              optimisticBoardAction({ type: "DEL_ITEM", payload: { itemId: item.id, columnId: item.columnId }})
              deleteItem(item.id)
            })
          }}
        />
      </div>
    </li>
  )
}
