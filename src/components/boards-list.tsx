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
    <div className="p-4 bg-neutral-800 rounded-sm">
      {boards.length ?
        <>
          <h1 className="font-bold mb-2">Boards</h1>
          <ul className="flex gap-2 flex-wrap">
            {boards.map((board) => (
              <li className="inline" key={board.id}><Link className="block p-4 rounded-sm bg-neutral-900" href={`/board/${board.id}`}>{board.name}</Link></li>
            ))}
          </ul>
        </>
        :
        <div>You have not created any boards yet</div>}
    </div>
  )
}
