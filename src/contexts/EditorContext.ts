import React, { createContext } from "react";
import type { Resource, Tile} from "../types/tile";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { EditorProvider } from "./EditorProvider";
import EditorContextMenu from "../components/EditorContextMenu";

/**
 * Defines which editor element triggered the context menu.
 */
type ContextMenuTarget = {type:"Stage"} | {type:"Tile",data:Tile}

/**
 * Stores the current context menu visibility, position, and target.
 */
export type ContextMenuData = {isOpen:boolean,x:number,y:number,target?:ContextMenuTarget}

/**
 * Defines the shape of the `value` property provided by {@link EditorProvider}.
 */
export type EditorContextType = {
    cellSize:number,
    /**
     * Object containing all canvas tiles, selected tile state, and methods for tile management.
     */
    tiles:{
        list:Tile[]
        selectedTile?:Tile
        add:(newTile:Tile) => void,
        remove:(id:string) => void
        select:(id:string) => void
        duplicate:(id:string) => void
        updateSelectedTile:(tile:Tile)=>void
    }
    /**
     * Object containing methods to open/close {@link EditorContextMenu} and store its current state.
    */
    contextMenu:{
        open:(e:KonvaEventObject<PointerEvent>) => void
        close:() => void
        data:ContextMenuData
    }

    stageRef:React.RefObject<Konva.Stage|null>
    /**
    * State and controls for the visibility of the tile properties drawer.
    */
    propsMenu:{
        isOpen:boolean
        setOpen:(val:boolean)=>void
    }
    /**
     * Object containing global resources, resource management methods,
     * and calculations used for tile output values.
    */
    resources:{
        list:Resource[]
        add:(resource:Resource) => void
        update:(resource:Resource) => void
        delete:(id:string) => void
        getResourceOutput:(id:string) => string
        getResourceModifOutput:(id:string) => string
    }
}
export const EditorContext= createContext<EditorContextType | null>(null)



