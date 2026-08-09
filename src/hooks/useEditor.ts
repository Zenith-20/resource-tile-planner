import { useContext } from "react"
import { EditorContext } from "../contexts/EditorContext"
import { EditorProvider } from "../contexts/EditorProvider"

/**
 * Wrapper hook that allows editor context to be used
 *
 * Throws an error if this hook is used by a component outside the {@link EditorProvider} component
 */
export function useEditor(){
    const editorContext = useContext(EditorContext)
    if (editorContext == null) throw new Error("Null context")
    return editorContext
}