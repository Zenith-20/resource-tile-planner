import { useContext } from "react"
import { EditorContext } from "../contexts/EditorContext"

export function useEditor(){
    const editorContext = useContext(EditorContext)
    if (editorContext == null) throw new Error("Null context")
    return editorContext
}