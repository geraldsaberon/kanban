import { prisma } from "@/db";
import { User } from "next-auth"
import Link from "next/link";

interface BoardsListProps {
  user: User;
}

export async function BoardsList({ user }: BoardsListProps) {
  const boards = await prisma.board.findMany({
    where: {
      user: {
        equals: user.id
      }
    }
  })

  return (
    <div className="bg-white dark:bg-neutral-800 p-4 rounded-sm">
      {boards.length ?
        <>
          <h1 className="font-bold mb-2">Boards</h1>
          <ul className="flex gap-2 flex-wrap">
            {boards.map((board) => (
              <li className="inline" key={board.id}><Link className="bg-neutral-200 dark:bg-neutral-900 block p-4 rounded-sm" href={`/board/${board.id}`}>{board.name}</Link></li>
            ))}
          </ul>
        </>
        :
        <div>You have not created any boards yet</div>}
    </div>
  )
}
