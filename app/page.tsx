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
      const newDots = [];
      const cellSize = 35;
      const offset = 15; // Offset from the edges of the page

      // Adjust width and height to account for the offset
      const effectiveWidth = window.innerWidth - offset * 2
      const effectiveHeight = window.innerHeight - offset * 2

      const cols = Math.floor(effectiveWidth / cellSize) + 1
      const rows = Math.floor(effectiveHeight / cellSize) + 1

      const xOffset = offset + (effectiveWidth - (cols - 1) * cellSize) / 2
      const yOffset = offset + (effectiveHeight - (rows - 1) * cellSize) / 2

      for (let i = 0; i < rows * cols; i++) {
        const x = xOffset + (i % cols) * cellSize
        const y = yOffset + Math.floor(i / cols) * cellSize
        newDots.push(
          <div
            key={i}
            className="w-[3px] h-[3px] rounded-full bg-gray-600 dark:bg-gray-200 opacity-80"
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
      <div className="min-h-screen bg-gradient-to-br from-white to-sky-200 dark:from-gray-800 dark:to-sky-200 relative overflow-hidden">
        <div className="absolute inset-0">{dots}</div>
        <MindMap />
      </div>
    </DndProvider>
  )
}
