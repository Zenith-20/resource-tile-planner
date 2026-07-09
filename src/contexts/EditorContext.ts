import React, { createContext } from "react";
import type { Resource, Tile } from "../types/tile";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";

type ContextMenuTarget = {type:"Stage"} | {type:"Tile",data:Tile}
export type ContextMenuData = {isOpen:boolean,x:number,y:number,target?:ContextMenuTarget}
export type EditorContextType = {
    cellSize:number,
    tiles:{
        list:Tile[]
        selectedTile?:Tile
        add:(newTile:Tile) => void,
        remove:(id:string) => void
        select:(id:string) => void
        duplicate:(id:string) => void
        updateSelectedTile:(tile:Tile)=>void
    }
    contextMenu:{
        open:(e:KonvaEventObject<PointerEvent>) => void
        close:() => void
        data:ContextMenuData
    }
    // openContextMenu: (e:KonvaEventObject<PointerEvent>) => void
    // closeContextMenu: () => void
    // contextMenuData:ContextMenuData
    stageRef:React.RefObject<Konva.Stage|null>
    propsMenu:{
        isOpen:boolean
        setOpen:(val:boolean)=>void
    }
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



