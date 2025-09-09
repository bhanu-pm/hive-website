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

  const glowClass = selectedNode
    ? {
        COT: "glow-cot",
        UQT: "glow-uqt",
        LAT: "glow-lat",
      }[selectedNode.type]
    : ""

  return (
    <div className="absolute bottom-4 left-4 right-4">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center bg-white dark:bg-gray-800 rounded-3xl p-2 transition-shadow duration-300 ${glowClass}`}
        autoComplete="off"
      >
        {IconComponent && <IconComponent className="text-black dark:text-white mr-2 w-6 h-6 stroke-[3]" />}
        <input
          id="bottom-textbox"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={selectedNode ? "Enter text..." : "Select a node to edit"}
          className="flex-grow bg-transparent text-black dark:text-white outline-none"
          disabled={!selectedNode}
          autoComplete="off"
        />
      </form>
    </div>
  )
}

export default BottomTextBox
