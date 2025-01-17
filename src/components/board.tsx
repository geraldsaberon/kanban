"use client"

import { useOptimistic } from "react"
import { CreateItem } from "./create"
import { getBoard } from "@/db/queries"
import { Item } from "@prisma/client"

type BoardType = NonNullable<Awaited<ReturnType<typeof getBoard>>>

export function Board({ board }: { board: BoardType }) {

  const { optimisticBoard } = useOptimisticBoard(board)
  return (
    <div className="flex gap-2 overflow-x-auto flex-grow">
      {Object.values(optimisticBoard.columns).map(col => (
        <div
          key={col.id}
          className="flex-shrink-0 h-fit bg-neutral-800 w-[256px] rounded text-white space-y-2"
        >
          <h1 className="pl-4 pt-2">{col.name}</h1>
          <ul className="max-h-[512px] overflow-auto space-y-2" ref={null}>
              {Object.values(col.items).length ?
                Object.values(col.items).map(item => (
                  <li className="px-2" key={item.id}>
                    <div className="p-2 min-h-16 bg-neutral-700 rounded ">{item.content}</div>
                  </li>
                ))
                :
                <p className="text-gray-400 text-center text-sm">No items yet</p>
              }
          </ul>
          <CreateItem boardId={board.id} columnId={col.id} items={Object.values(col.items)} />
        </div>
      ))}
    </div>
  )
}

type OptimisticActions =
  { type: "ADD_ITEM", payload: Item }

function useOptimisticBoard(board: BoardType) {
  const [optimisticBoard, optimisticBoardAction] = useOptimistic<typeof board, OptimisticActions>(
    board,
    (state, action) => {
      switch (action.type) {
        case "ADD_ITEM": {
          // TODO
          return state
        }
        default: {
          return state
        }
      }
    }
  )
  return { optimisticBoard, optimisticBoardAction}
}
