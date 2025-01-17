import { Column, Item } from "@prisma/client"
import { prisma } from "."

export async function getBoard(boardId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
    },
    include: {
      columns: {
        include: {
          items: true
        }
      },
      items: true
    }
  })
  if (board) {
    return {
      id: board.id,
      name: board.name,
      user: board.user,
      columns: board.columns.reduce((colAcc, col) => {
        colAcc[col.id] = {
          ...col,
          items: col.items.reduce((itemAcc, item) => {
            itemAcc[item.id] = item
            return itemAcc
          }, {} as Record<Item["id"], Item>)
        }
        return colAcc
      }, {} as Record<Column["id"], Column & { items: Record<Item["id"], Item>}>)
    }
  }
  return null
}
