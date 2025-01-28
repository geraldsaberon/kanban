import { useState } from "react";

interface EditableTextProps {
  text: string,
  submitFn: (newText: string) => void,
}

export function EditableText({ text, submitFn }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  return isEditing ? (
    <textarea
      required
      autoFocus
      defaultValue={text}
      name="newText"
      className="resize-none overflow-hidden w-full"
      onBlur={() => setIsEditing(false)}
      onChange={(e) => {
        e.currentTarget.style.height = "1px"
        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
      }}
      onFocus={(e) => {
        e.currentTarget.style.height = "1px"
        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
        e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          const newText = e.currentTarget.value.trim()
          submitFn(newText)
          setIsEditing(false)
        } else if (e.key === "Escape") {
          setIsEditing(false)
        }
      }}
    />
  ) : (
    <h2
      onClick={() => setIsEditing(true)}
      className="break-words overflow-hidden text-left w-full"
    >{text}</h2>
  )
}
