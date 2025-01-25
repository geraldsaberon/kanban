import { Board } from "@/components/board"
import { getBoard, getBoardName } from "@/db/queries"
import { getUser } from "@/utils"
import Link from "next/link"
import { redirect } from "next/navigation"

export async function generateMetadata({ params }: { params: Promise<{ id: string }>}) {
  const boardId = (await params).id
  const boardName = await getBoardName(boardId)
  return {
    title: `${boardName || "Board not found"} | Kanban`
  }
}

export default async function BoardPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getUser()
  if (!user) redirect("/")
  const boardId = (await params).id
  const board = await getBoard(boardId)

  if (!board || board.user !== user.id) {
    return (
      <div>
        <h1 className="font-bold">Can&apos;t access board</h1>
        <p>You are not authorized to access it, or the board does not exist.</p>
        <Link href="/">Go home</Link>
      </div>
    )
  }

  return <Board board={board} />
}
