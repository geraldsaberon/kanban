"use client"

import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react"
import { useState } from "react"
import { Button } from "./button"
import { deleteBoard } from "@/actions"

export function DeleteBoardButton({ boardId }: { boardId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        type="delete"
        onClick={() => setIsOpen(true)}
        className="hover:text-red-500"
      />
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50 transition duration-150 ease-out data-[closed]:opacity-0"
        transition
      >
        <DialogBackdrop className="fixed inset-0 bg-black/75" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 bg-neutral-800 p-8 rounded">
            <DialogTitle className="font-bold text-2xl">Delete board</DialogTitle>
            <Description>This will permanently delete the board and all of its contents</Description>
            <div className="flex gap-4">
              <button className="text-white/50" onClick={() => setIsOpen(false)}>Cancel</button>
              <button
                className="text-red-500 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white rounded p-2"
                onClick={() => {
                  deleteBoard(boardId)
                  setIsOpen(false)
                }}
              >Delete</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
