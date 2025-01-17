"use server"

import { nanoid } from "nanoid";
import { prisma } from "./db";
import { getUser } from "./utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBoard(_: unknown, formdata: FormData) {
  const user = await getUser()
  if (!user) {
    throw new Error("Can't create board without a user")
  }
  const name = formdata.get("name")
  if (!name) {
    return {
      message: "Board name required."
    }
  }
  const newBoard = await prisma.board.create({
    data: {
      id: nanoid(),
      name: name as string,
      user: user.id!
    }
  })
  revalidatePath("/")
  redirect(`/board/${newBoard.id}`)
}

export async function createColumn(_: unknown, formdata: FormData) {
  const name = formdata.get("name")
  const boardId = formdata.get("boardId")

  if (!name || !boardId) {
    return {
      message: "Column name and board id are required"
    }
  }

  await prisma.column.create({
    data: {
      id: nanoid(),
      name: name.toString(),
      boardId: boardId.toString()
    }
  })
  revalidatePath(`/boards/${boardId}`)
}

export async function createItem(_: unknown, formdata: FormData) {
  const id = String(formdata.get("id"))
  const boardId = String(formdata.get("boardId"))
  const columnId = String(formdata.get("columnId"))
  const order = Number(formdata.get("order"))
  const content = String(formdata.get("content"))

  await prisma.item.create({
    data: {
      content,
      id,
      order,
      columnId,
      boardId
    }
  })
  revalidatePath(`board/${boardId}`)
}

