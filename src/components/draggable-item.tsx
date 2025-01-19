import { Item } from "@prisma/client";
import { startTransition, useState } from "react";
import { moveItem } from "@/actions";

interface DraggableItemProps {
  item: Item,
  prevOrder: number,
  nextOrder: number,
  optimisticMove: (item: Item, newOrder: number, newColumnId: string) => void
}

export function DraggableItem({ item, prevOrder, nextOrder, optimisticMove }: DraggableItemProps) {
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
          optimisticMove(itemToMove, newOrder, item.columnId)
          moveItem(itemToMove, newOrder, item.columnId)
        })
        setAcceptDrop("none")
      }}
    >
      <div
        draggable
        className="p-2 min-h-16 bg-neutral-700 rounded "
      >
        <p>{item.content}</p>
      </div>
    </li>
  )
}
