export interface NodeType {
  id: string
  type: "COT" | "UQT" | "LAT"
  text: string
  x: number
  y: number
  parentId?: string
  isLoading?: boolean
  isSelected?: boolean
}

export interface Position {
  x: number
  y: number
}

export interface DragOffset {
  x: number
  y: number
}
