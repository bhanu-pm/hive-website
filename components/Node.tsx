"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useDrag } from "react-dnd"
import type { NodeType, DragOffset } from "@/types"
import { Cog, User2, Bot, Plus, X } from "lucide-react"

interface NodeProps {
  node: NodeType
  onMove: (id: string, x: number, y: number) => void
  onSelect: (node: NodeType, isMultiSelect: boolean) => void
  onAdd: (parentId: string) => void
  onDelete: (id: string) => void
  isSelected: boolean
}

const Node = ({ node, onMove, onSelect, onAdd, onDelete, isSelected }: NodeProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "node",
    item: { id: node.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 })
  const [isNodeHovered, setIsNodeHovered] = useState(false)
  const [isPBHovered, setIsPBHovered] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    // We'll handle selection in the parent component
  }

  const handleDrag = (e: React.DragEvent) => {
    onMove(node.id, e.clientX - dragOffset.x, e.clientY - dragOffset.y)
  }

  const handleClick = (e: React.MouseEvent) => {
    onSelect(node, e.shiftKey)
  }

  const gradientClass = {
    COT: "bg-gradient-to-r from-lime-400 to-green-500",
    UQT: "bg-gradient-to-r from-blue-400 to-blue-500",
    LAT: "bg-gradient-to-r from-red-400 to-pink-500",
  }[node.type]

  const IconComponent = {
    COT: Cog,
    UQT: User2,
    LAT: Bot,
  }[node.type]

  return (
    <div className="group" style={{ position: "absolute", left: node.x, top: node.y }}>
      <div
        ref={(node) => {
          drag(node)
          nodeRef.current = node
        }}
        className={`rounded-full p-2 w-[200px] ${gradientClass} cursor-move transition-all ${
          isDragging ? "opacity-50" : "opacity-100"
        } ${isNodeHovered ? "scale-110" : "scale-100"} ${
          isSelected
            ? "ring-4 ring-gray-500 dark:ring-white ring-opacity-100 shadow-lg dark:shadow-white/60 shadow-gray-500/60"
            : ""
        }`}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onDrag={handleDrag}
        onDragEnd={handleDrag}
        onMouseEnter={() => setIsNodeHovered(true)}
        onMouseLeave={() => setIsNodeHovered(false)}
      >
        <div className="flex items-center text-white font-bold">
          <div className="shrink-0 w-6 h-6">
            <IconComponent className="w-6 h-6 stroke-[3]" />
          </div>
          <div className="ml-2 truncate">
            {node.isLoading ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
              </div>
            ) : (
              <span className="truncate">{node.text || `${node.type} Node`}</span>
            )}
          </div>
        </div>
        {node.type !== "COT" && (
          <button
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node.id)
            }}
          >
            <X size={12} className="text-white" />
          </button>
        )}
      </div>
      <button
        className={`absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-1 transition-transform ${
          isPBHovered ? "scale-110" : "scale-100"
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onAdd(node.id)
        }}
        onMouseEnter={() => setIsPBHovered(true)}
        onMouseLeave={() => setIsPBHovered(false)}
      >
        <Plus size={16} className="text-white" />
      </button>
    </div>
  )
}

export default Node
