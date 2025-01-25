import { useState } from "react";

interface EditableTextProps {
  text: string,
  submitFn: (newText: string) => void,
}

export function EditableText({ text, submitFn }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  return isEditing ? (
    <form
      onBlur={() => setIsEditing(false)}
      onSubmit={(e) => {
        e.preventDefault()
        const newText = new FormData(e.currentTarget).get("newText")!.toString()
        submitFn(newText)
        setIsEditing(false)
      }}
    >
      <input
        required
        autoFocus
        defaultValue={text}
        name="newText"
        className="bg-transparent"
      />
    </form>
  ) : (
    <button
      onClick={() => setIsEditing(true)}
      className="break-words overflow-hidden text-left"
    >{text}</button>
  )
}
