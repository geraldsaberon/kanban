"use client"

import { useActionState } from "react";
import { createBoard, createColumn, createItem } from "@/actions";
import { nanoid } from "nanoid";
import { Item } from "@prisma/client";

export function CreateBoard() {
  const [, formAction, isPending] = useActionState(createBoard, null)
  return (
    <form className="flex gap-2" action={formAction}>
      <input required className="flex-grow rounded bg-neutral-800 p-4" placeholder="Enter board name..." type="text" name="name" />
      <button disabled={isPending} className="rounded bg-neutral-800 p-4 disabled:opacity-50" type="submit">Create board</button>
    </form>
  )
}

export function CreateColumn({ boardId }: { boardId: string }) {
  const [, formAction] = useActionState(createColumn, null)
  return (
    <form className="flex gap-2" action={formAction}>
      <input required className="w-[256px] rounded bg-neutral-800 p-4" placeholder="Enter column name" type="text" name="name" />
      <input hidden type="text" name="boardId" defaultValue={boardId} />
      <button type="submit">Create column</button>
    </form>
  )
}

interface CreateItemProps { 
  boardId: string,
  columnId: string,
  items: Item[],
}

export function CreateItem({ boardId, columnId, items }: CreateItemProps) {
  items = items.toSorted((a, b) => a.order - b.order)
  const order = items[items.length-1] ? items[items.length-1].order+1 : 1
  const [, formAction] = useActionState(createItem, null)
  return (
    <form
      className="flex p-4 mt-4"
      action={formAction}
    >
      <input hidden type="text" name="id" defaultValue={nanoid()} />
      <input hidden type="text" name="boardId" defaultValue={boardId} />
      <input hidden type="text" name="columnId" defaultValue={columnId} />
      <input hidden type="number" name="order" defaultValue={order} />
      <input required className="flex-grow bg-transparent" placeholder="Enter new item" type="text" name="content" />
      <button hidden type="submit">Add item</button>
    </form>
  )
}
