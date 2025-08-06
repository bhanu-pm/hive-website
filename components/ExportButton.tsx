import type { NodeType } from "@/types"
import { Download } from "lucide-react"

interface ExportButtonProps {
  nodes: NodeType[]
}

const ExportButton = ({ nodes }: ExportButtonProps) => {
  const handleExport = () => {
    const dataStr = JSON.stringify(nodes, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "mindmap.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <button
      onClick={handleExport}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-transform hover:scale-110"
    >
      <Download size={20} />
    </button>
  )
}

export default ExportButton
