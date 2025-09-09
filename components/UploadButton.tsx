"use client"

import { useRef } from "react"
import type { NodeType } from "@/types"
import { Upload } from "lucide-react"

interface UploadButtonProps {
  onUpload: (nodes: NodeType[]) => void
}

const UploadButton = ({ onUpload }: UploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result
          if (typeof content === "string") {
            const nodes = JSON.parse(content)
            onUpload(nodes)
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error)
          // Handle error, e.g., show a notification to the user
        }
      }
      reader.readAsText(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-transform hover:scale-110"
      >
        <Upload size={20} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json"
      />
    </>
  )
}

export default UploadButton
