import { Board } from "@/components/board"
import { CreateColumn } from "@/components/create"
import { getBoard } from "@/db/queries"
import { getUser } from "@/utils"
import Link from "next/link"
import { redirect } from "next/navigation"

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

  return (
    <div className="min-h-[100vh] p-2 flex flex-col gap-2">
      <h1 className="text-xl">{board?.name}</h1>
      <CreateColumn boardId={boardId} />
      <Board board={board} />
    </div>
  )
}
