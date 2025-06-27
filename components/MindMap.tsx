"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Node from "./Node"
import BottomTextBox from "./BottomTextBox"
import type { NodeType } from "@/types"
import ExportButton from "./ExportButton"

const MindMap: React.FC = () => {
  const [nodes, setNodes] = useState<NodeType[]>([])
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const savedNodes = localStorage.getItem("mindmap-nodes")
    if (savedNodes) {
      setNodes(JSON.parse(savedNodes))
    } else {
      const initialNode: NodeType = {
        id: "1",
        type: "COT",
        text: "You are a philosopher.",
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 25,
      }
      setNodes([initialNode])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("mindmap-nodes", JSON.stringify(nodes))
  }, [nodes])

  const handleNodeMove = (id: string, x: number, y: number) => {
    setIsDragging(true)
    if (selectedNodes.size > 1 && selectedNodes.has(id)) {
      const movingNode = nodes.find((n) => n.id === id)
      if (!movingNode) return

      const deltaX = x - movingNode.x
      const deltaY = y - movingNode.y

      setNodes(
        nodes.map((node) => {
          if (selectedNodes.has(node.id)) {
            return { ...node, x: node.x + deltaX, y: node.y + deltaY }
          }
          return node
        }),
      )
    } else {
      setNodes(nodes.map((node) => (node.id === id ? { ...node, x, y } : node)))
    }
  }

  const handleNodeSelect = (node: NodeType, isMultiSelect: boolean) => {
    if (isDragging) {
      setIsDragging(false)
      return
    }

    if (isMultiSelect) {
      setSelectedNodes((prev) => {
        const newSelected = new Set(prev)
        if (newSelected.has(node.id)) {
          newSelected.delete(node.id)
        } else {
          newSelected.add(node.id)
        }
        return newSelected
      })
    } else {
      setSelectedNodes(new Set([node.id]))
    }
    setSelectedNode(node)
  }

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("relative")) {
      setSelectedNodes(new Set())
      setSelectedNode(null)
    }
  }, [])

  const calculateNewNodePosition = (parentNode: NodeType): { x: number; y: number } => {
    const parentParentNode = nodes.find((n) => n.id === parentNode.parentId)

    if (!parentParentNode) {
      return { x: parentNode.x, y: parentNode.y + 100 }
    }

    const angle = Math.atan2(parentNode.y - parentParentNode.y, parentNode.x - parentParentNode.x)
    const distance = 150
    const newX = parentNode.x + Math.cos(angle) * distance
    const newY = parentNode.y + Math.sin(angle) * distance

    return { x: newX, y: newY }
  }

  const createLATNode = (parentNode: NodeType, position: { x: number; y: number }) => {
    const latNode: NodeType = {
      id: Date.now().toString(),
      type: "LAT",
      text: "",
      x: position.x,
      y: position.y,
      parentId: parentNode.id,
      isLoading: true,
    }

    setNodes((prevNodes) => [...prevNodes, latNode])

    setTimeout(() => {
      const latResponse = "Simulated LLM response."
      const { x: uqtX, y: uqtY } = calculateNewNodePosition(latNode)

      const uqtNode: NodeType = {
        id: (Date.now() + 1).toString(),
        type: "UQT",
        text: "Enter text...",
        x: uqtX,
        y: uqtY,
        parentId: latNode.id,
      }

      setNodes((prevNodes) => {
        const updatedNodes = prevNodes.map((node) =>
          node.id === latNode.id ? { ...node, text: latResponse, isLoading: false } : node,
        )
        return [...updatedNodes, uqtNode]
      })
    }, 1000)
  }

  const handleTextSubmit = (text: string) => {
    if (selectedNode) {
      const updatedNodes = nodes.map((node) => (node.id === selectedNode.id ? { ...node, text } : node))

      const nodesToKeep = updatedNodes.filter((node) => {
        if (node.id === selectedNode.id) return true
        let currentNode = node
        while (currentNode.parentId) {
          if (currentNode.parentId === selectedNode.id) return false
          currentNode = updatedNodes.find((n) => n.id === currentNode.parentId)!
          if (!currentNode) return true
        }
        return true
      })

      if (selectedNode.type === "COT" || selectedNode.type === "UQT") {
        const { x, y } = calculateNewNodePosition(selectedNode)

        if (selectedNode.type === "COT") {
          const uqtNode: NodeType = {
            id: Date.now().toString(),
            type: "UQT",
            text: "Enter text...",
            x,
            y,
            parentId: selectedNode.id,
          }
          setNodes([...nodesToKeep, uqtNode])
        } else if (selectedNode.type === "UQT") {
          setNodes(nodesToKeep)
          createLATNode(selectedNode, { x, y })
        }
      } else {
        setNodes(nodesToKeep)
      }

      setSelectedNode(null)
    }
  }

  const handleAddNode = (parentId: string) => {
    const parentNode = nodes.find((node) => node.id === parentId)
    if (!parentNode) return

    const { x, y } = calculateNewNodePosition(parentNode)

    if (parentNode.type === "UQT") {
      createLATNode(parentNode, { x, y })
    } else {
      const newNode: NodeType = {
        id: Date.now().toString(),
        type: "UQT",
        text: "Enter text...",
        x,
        y,
        parentId,
      }
      setNodes([...nodes, newNode])
    }
  }

  const handleDeleteNode = (id: string) => {
    const nodesToDelete = [id]
    const findChildren = (parentId: string) => {
      nodes.forEach((node) => {
        if (node.parentId === parentId) {
          nodesToDelete.push(node.id)
          findChildren(node.id)
        }
      })
    }
    findChildren(id)
    setNodes(nodes.filter((node) => !nodesToDelete.includes(node.id)))
  }

  return (
    <div className="relative w-full h-screen" onClick={handleBackgroundClick} onMouseUp={() => setIsDragging(false)}>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {nodes.map((node) => {
          if (!node.parentId) return null
          const parentNode = nodes.find((n) => n.id === node.parentId)
          if (!parentNode) return null

          return <Connection key={`${node.parentId}-${node.id}`} from={parentNode} to={node} />
        })}
      </svg>
      {nodes.map((node) => (
        <Node
          key={node.id}
          node={node}
          onMove={handleNodeMove}
          onSelect={handleNodeSelect}
          onAdd={handleAddNode}
          onDelete={handleDeleteNode}
          isSelected={selectedNodes.has(node.id)}
        />
      ))}
      <BottomTextBox selectedNode={selectedNode} onSubmit={handleTextSubmit} />
      <ExportButton nodes={nodes} />
    </div>
  )
}

const Connection: React.FC<{ from: NodeType; to: NodeType }> = ({ from, to }) => {
  if (!from || !to) return null

  return (
    <line
      x1={from.x + 100}
      y1={from.y + 25}
      x2={to.x + 100}
      y2={to.y + 25}
      stroke="white"
      strokeWidth="3"
      className="glow"
    />
  )
}

export default MindMap
