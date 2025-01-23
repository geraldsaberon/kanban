"use server"

import { nanoid } from "nanoid";
import { prisma } from "./db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Item } from "@prisma/client";
import { auth } from "./auth";

async function authenticateUser() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("You must be signed in to perform this action")
  }
  return session.user
}

export async function createBoard(_: unknown, formdata: FormData) {
  const user = await authenticateUser()
  const name = formdata.get("name")
  if (!name)
    return { message: "Board name required." }
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
  await authenticateUser()
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
  revalidatePath(`/board/${boardId}`)
}

export async function createItem(_: unknown, formdata: FormData) {
  await authenticateUser()
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

export async function moveItem(item: Item, newOrder: number, newColumnId: string) {
  await authenticateUser()
  await prisma.item.update({
    where: {
      id: item.id
    },
    data: {
      ...item,
      order: newOrder,
      columnId: newColumnId
    }
  })
  revalidatePath(`board/${item.boardId}`)
}

export async function deleteItem(itemId: string) {
  await authenticateUser()
  await prisma.item.delete({
    where: {
      id: itemId
    }
  })
  revalidatePath("/board/")
}

export async function deleteColumn(columnId: string) {
  await authenticateUser()
  await prisma.item.deleteMany({
    where: { columnId }
  })
  await prisma.column.delete({
    where: { id: columnId }
  })
  revalidatePath("/board/")
}

export async function deleteBoard(boardId: string) {
  await authenticateUser()
  await prisma.item.deleteMany({ where: { boardId } })
  await prisma.column.deleteMany({ where: { boardId } })
  await prisma.board.delete({ where: { id: boardId } })
  revalidatePath("/")
  redirect("/")
}

export async function updateColumnName(columnId: string, newName: string) {
  await authenticateUser()
  await prisma.column.update({
    where: {
      id: columnId
    },
    data: {
      name: newName
    }
  })
  revalidatePath("/board/")
}

export async function updateBoardName(boardId: string, newName: string) {
  await authenticateUser()
  await prisma.board.update({
    where: {
      id: boardId
    },
    data: {
      name: newName
    }
  })
  revalidatePath("/board/")
}

export async function updateItemContent(itemId: string, newContent: string) {
  await authenticateUser()
  await prisma.item.update({
    where: {
      id: itemId
    },
    data: {
      content: newContent
    }
  })
  revalidatePath("/board/")
}

export async function updateBoardColor(boardId: string, color: string) {
  await authenticateUser()
  await prisma.board.update({
    where: { id: boardId },
    data: { color }
  })
  revalidatePath(`/board/${boardId}`)
}
