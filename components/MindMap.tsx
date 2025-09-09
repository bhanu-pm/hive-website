"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { GoogleGenerativeAI, type Content } from "@google/generative-ai"
import Node from "./Node"
import BottomTextBox from "./BottomTextBox"
import type { NodeType } from "@/types"
import ExportButton from "./ExportButton"
import { ModeToggle } from "./ModeToggle"

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
        text: "Enter Topic name",
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

  const getChatHistory = (leafNode: NodeType): Content[] => {
    const history: Content[] = []
    let currentNode: NodeType | undefined = leafNode

    while (currentNode && currentNode.type !== "COT") {
      if (currentNode.type === "UQT") {
        history.unshift({ role: "user", parts: [{ text: currentNode.text }] })
      } else if (currentNode.type === "LAT") {
        if (currentNode.text && !currentNode.isLoading && currentNode.text !== "Error generating response.") {
          history.unshift({ role: "model", parts: [{ text:currentNode.text }] })
        }
      }

      if (currentNode.parentId) {
        currentNode = nodes.find((n: NodeType) => n.id === currentNode?.parentId)
      } else {
        currentNode = undefined
      }
    }
    return history
  }

  const createLATNode = async (parentNode: NodeType, position: { x: number; y: number }) => {
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

    try {
      const ai = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string)
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" })
      const history = getChatHistory(parentNode)
      const result = await model.generateContent({
        contents: history,
        systemInstruction: "You are helping me study. Answer everything in as few words as possible. Don't be verbose.",
      })
      const latResponse = await result.response
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
          node.id === latNode.id ? { ...node, text: latResponse.text(), isLoading: false } : node,
        )
        return [...updatedNodes, uqtNode]
      })
    } catch (error) {
      console.error("Error generating content:", error)
      // Optionally, handle the error state in the UI
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === latNode.id ? { ...node, text: "Error generating response.", isLoading: false } : node,
        ),
      )
    }
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

      const parentNode = updatedNodes.find((n) => n.id === selectedNode.id)

      if (parentNode) {
        if (parentNode.type === "COT" || parentNode.type === "UQT") {
          const { x, y } = calculateNewNodePosition(parentNode)
          if (parentNode.type === "COT") {
            const uqtNode: NodeType = {
              id: Date.now().toString(),
              type: "UQT",
              text: "Enter text...",
              x,
              y,
              parentId: parentNode.id,
            }
            setNodes([...nodesToKeep, uqtNode])
          } else if (parentNode.type === "UQT") {
            setNodes(nodesToKeep)
            createLATNode(parentNode, { x, y })
          }
        } else {
          setNodes(nodesToKeep)
        }
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
      <div className="absolute top-4 left-4">
        <h1 className="text-4xl font-mono text-black dark:text-white">MIND HIVE</h1>
      </div>
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <ExportButton nodes={nodes} />
        <ModeToggle />
      </div>
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
      strokeWidth="3"
      className="glow stroke-black dark:stroke-white"
    />
  )
}

export default MindMap
