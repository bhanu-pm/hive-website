"use client"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import MindMap from "@/components/MindMap"
import { useEffect, useState } from "react"
import type { JSX } from "react"

export default function Home() {
  const [dots, setDots] = useState<JSX.Element[]>([])

  useEffect(() => {
    const generateDots = () => {
      const newDots = []
      const cellSize = 35
      const cols = Math.ceil(window.innerWidth / cellSize)
      const rows = Math.ceil(window.innerHeight / cellSize)

      for (let i = 0; i < rows * cols; i++) {
        const x = (i % cols) * cellSize
        const y = Math.floor(i / cols) * cellSize
        newDots.push(
          <div
            key={i}
            className="w-[3px] h-[3px] rounded-full bg-white opacity-20"
            style={{
              position: "absolute",
              left: `${x}px`,
              top: `${y}px`,
            }}
          />,
        )
      }
      setDots(newDots)
    }

    generateDots()
    window.addEventListener("resize", generateDots)

    return () => {
      window.removeEventListener("resize", generateDots)
    }
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0">{dots}</div>
        <MindMap />
      </div>
    </DndProvider>
  )
}
