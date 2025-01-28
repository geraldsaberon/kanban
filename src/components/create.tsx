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
      <input required className="bg-white dark:bg-neutral-800 grow rounded-sm p-4" placeholder="Enter board name..." type="text" name="name" />
      <button disabled={isPending} className="bg-white dark:bg-neutral-800 rounded-sm p-4 disabled:opacity-50" type="submit">Create board</button>
    </form>
  )
}

interface CreateColumnProps {
  boardId: string,
  order: number,
  isEditingInitially: boolean
  optimisticAdd: (newCol: ColumnType) => void,
  scrollColumnsList: () => void,
}

export function CreateColumn({ boardId, order, isEditingInitially, scrollColumnsList, optimisticAdd }: CreateColumnProps) {
  const [isEditing, setIsEditing] = useState(isEditingInitially)
  const formRef = useRef<HTMLFormElement>(null)
  const [, formAction] = useActionState(createColumn, null)
  return isEditing ? (
    <form
      className="space-y-2 h-fit  p-2 rounded-sm"
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        e.preventDefault()
        const formdata = new FormData(e.currentTarget)
        flushTransition(() => {
          optimisticAdd({
            id: String(formdata.get("id")),
            boardId: String(formdata.get("boardId")),
            order: Number(formdata.get("order")),
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
      <input hidden type="text" name="id" defaultValue={nanoid()} />
      <input hidden type="text" name="boardId" defaultValue={boardId} />
      <input hidden type="text" name="order" defaultValue={order} />
      <input
        required
        autoFocus
        autoComplete="off"
        className="bg-white dark:bg-neutral-700 w-64 rounded-sm  p-4"
        placeholder="Enter column name"
        type="text"
        name="name"
      />
      <button
        type="submit"
        className="bg-white dark:bg-neutral-700 block w-full rounded-sm  py-2"
      >Create column</button>
    </form>
  ) : (
    <button
      className="bg-white dark:bg-neutral-800 min-w-12 size-12 text-3xl  rounded-sm "
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
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const [, formAction] = useActionState(createItem, null)
  return (
    <form
      className="flex p-2"
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
      <textarea
        required
        className="min-h-10 h-10 p-2 resize-none grow bg-transparent not-placeholder-shown:shadow dark:shadow-none not-placeholder-shown:bg-white dark:not-placeholder-shown:bg-neutral-700 rounded"
        placeholder="Enter new item"
        name="content"
        onChange={(e) => {
          e.currentTarget.style.height = "1px"
          e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            e.currentTarget.style.height = "1px"
            submitButtonRef.current?.click()
          }
        }}
      />
      <button ref={submitButtonRef} hidden type="submit">Add item</button>
    </form>
  )
}

function flushTransition(fn: () => void) {
  flushSync(() => startTransition(fn))
}
