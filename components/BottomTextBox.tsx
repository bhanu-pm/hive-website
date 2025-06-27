"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { NodeType } from "@/types"
import { Cog, User2, Bot } from "lucide-react"

interface BottomTextBoxProps {
  selectedNode: NodeType | null
  onSubmit: (text: string) => void
}

const BottomTextBox = ({ selectedNode, onSubmit }: BottomTextBoxProps) => {
  const [text, setText] = useState("")

  useEffect(() => {
    if (selectedNode) {
      setText(selectedNode.text)
    }
  }, [selectedNode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSubmit(text)
      setText("")
    } else {
      // Shake animation and red border warning
      const input = document.getElementById("bottom-textbox")
      input?.classList.add("shake", "border-red-500")
      setTimeout(() => {
        input?.classList.remove("shake", "border-red-500")
      }, 500)
    }
  }

  const IconComponent = selectedNode
    ? {
        COT: Cog,
        UQT: User2,
        LAT: Bot,
      }[selectedNode.type]
    : null

  return (
    <form onSubmit={handleSubmit} className="absolute bottom-4 left-4 right-4" autoComplete="off">
      <div className="flex items-center bg-gray-800 rounded-lg p-2">
        {IconComponent && <IconComponent className="text-white mr-2 w-6 h-6 stroke-[3]" />}
        <input
          id="bottom-textbox"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={selectedNode ? "Enter text..." : "Select a node to edit"}
          className="flex-grow bg-transparent text-white outline-none"
          disabled={!selectedNode}
          autoComplete="off"
        />
      </div>
    </form>
  )
}

export default BottomTextBox
