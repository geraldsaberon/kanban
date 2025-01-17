"use client"

import { startTransition, useActionState, useRef } from "react";
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
  order: number,
  optimisticAdd: (newItem: Item) => void,
}

export function CreateItem({ boardId, columnId, order, optimisticAdd }: CreateItemProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [, formAction] = useActionState(createItem, null)
  return (
    <form
      className="flex p-4 mt-4"
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault()
        const formdata = new FormData(e.currentTarget)
        startTransition(() => {
          optimisticAdd({
            id: String(formdata.get("id")),
            boardId: String(formdata.get("boardId")),
            columnId: String(formdata.get("columnId")),
            order: Number(formdata.get("order")),
            content: String(formdata.get("content")),
          })
          formAction(formdata)
        })
        formRef.current?.reset()
      }}
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
