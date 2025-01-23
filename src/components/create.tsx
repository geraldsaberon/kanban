"use client"

import { startTransition, useActionState, useRef, useState } from "react";
import { createBoard, createColumn, createItem } from "@/actions";
import { nanoid } from "nanoid";
import { Item } from "@prisma/client";
import { flushSync } from "react-dom";
import { ColumnType } from "@/db/queries";

export function CreateBoard() {
  const [, formAction, isPending] = useActionState(createBoard, null)
  return (
    <form className="flex gap-2" action={formAction}>
      <input required className="grow rounded-sm bg-neutral-800 p-4" placeholder="Enter board name..." type="text" name="name" />
      <button disabled={isPending} className="rounded-sm bg-neutral-800 p-4 disabled:opacity-50" type="submit">Create board</button>
    </form>
  )
}

interface CreateColumnProps {
  boardId: string,
  isEditingInitially: boolean
  optimisticAdd: (newCol: ColumnType) => void,
  scrollColumnsList: () => void,
}

export function CreateColumn({ boardId, isEditingInitially, scrollColumnsList, optimisticAdd }: CreateColumnProps) {
  const [isEditing, setIsEditing] = useState(isEditingInitially)
  const formRef = useRef<HTMLFormElement>(null)
  const [, formAction] = useActionState(createColumn, null)
  return isEditing ? (
    <form
      className="space-y-2 h-fit bg-neutral-800 p-2 rounded-sm"
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        e.preventDefault()
        const formdata = new FormData(e.currentTarget)
        flushTransition(() => {
          optimisticAdd({
            id: String(formdata.get("id")),
            boardId: String(formdata.get("boardId")),
            name: String(formdata.get("name")),
            items: {}
          })
          formAction(formdata)
        })
        formRef.current?.reset()
        scrollColumnsList()
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsEditing(false)
        }
      }}
    >
      <input hidden type="text" name="boardId" defaultValue={boardId} />
      <input
        required
        autoFocus
        autoComplete="off"
        className="w-64 rounded-sm bg-neutral-700 p-4"
        placeholder="Enter column name"
        type="text"
        name="name"
      />
      <button
        type="submit"
        className="block w-full rounded-sm bg-neutral-700 py-2"
      >Create column</button>
    </form>
  ) : (
    <button
      className="min-w-12 size-12 text-3xl bg-neutral-800 rounded-sm "
      onClick={() => {
        flushSync(() => {
          setIsEditing(true)
        })
        scrollColumnsList()
      }}
    >+</button>
  )
}

interface CreateItemProps {
  boardId: string,
  columnId: string,
  order: number,
  optimisticAdd: (newItem: Item) => void,
  scrollItemList: () => void
}

export function CreateItem({ boardId, columnId, order, optimisticAdd, scrollItemList }: CreateItemProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [, formAction] = useActionState(createItem, null)
  return (
    <form
      className="flex p-4"
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault()
        const formdata = new FormData(e.currentTarget)
        flushTransition(() => {
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
        scrollItemList()
      }}
    >
      <input hidden type="text" name="id" defaultValue={nanoid()} />
      <input hidden type="text" name="boardId" defaultValue={boardId} />
      <input hidden type="text" name="columnId" defaultValue={columnId} />
      <input hidden type="number" name="order" defaultValue={order} />
      <input required className="grow bg-transparent" placeholder="Enter new item" type="text" name="content" />
      <button hidden type="submit">Add item</button>
    </form>
  )
}


function flushTransition(fn: () => void) {
  flushSync(() => startTransition(fn))
}
