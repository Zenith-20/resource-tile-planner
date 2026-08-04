import { lighten } from "@mantine/core";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Vector2d } from "konva/lib/types";
import { useState} from "react";
import { Group, Rect } from "react-konva";
import { useEditor } from "../hooks/useEditor";
import type { Tile, TileColorPresets } from "../types/tile";

type TileProps = {
    id:string
    width:number,
    height:number,
    x:number,
    y:number,
    fill?:TileColorPresets | string&{},
    dragFunc: ((pos:Vector2d) => Vector2d) | undefined
    effect:NonNullable<Tile["effect"]>
    gridSize:number,
}

/**
 * Smallest draggable building component of editor grid canvas
 * 
 * @remarks
 * Responsibilities: 
 * - Renders a square tile on grid with given properties (properties being a mix of UI required props and {@link Tile} type) 
 * - Additionally renders a square AOE (Area of Effect) overlay centered on the tile based on {@link Tile.effect} properties
 * - Sets selected tile when user clicks this tile , to allow further editing
*/
export default function Tile({id,width,height,x,y,fill="#4578FC",dragFunc,effect,gridSize}:TileProps){
    // Tracks the live drag position locally until the drag operation completes.
    const [mainPos,setMainPos] = useState({x,y})

    const {tiles,stageRef} = useEditor()

    /**
     * Updates the current dragged position locally for later synchronization with global editor's tiles list
     * 
     * @param e - Drag event object with extra properties provided by Konva wrapper
     */
    function updateMainPos(e:KonvaEventObject<DragEvent>){
        setMainPos({x:e.target.x(),y:e.target.y()})
    }
    
    /**
      * Returns an event handler function for tile mouse and drag interactions.
      *
      * Updates the editor cursor for the requested interaction and, when dragging
      * ends, synchronizes the locally tracked position with the global editor state.
     * @param type - String option determining the handler's behavior.
     */
    function getCursorFunc(type:"mouseEnter"|"dragStart"|"dragEnd"|"mouseOut"){
        return (_e:KonvaEventObject<MouseEvent>)=>{
            const stage = stageRef.current
            if (stage == null) return
            switch (type) {
                case "dragEnd" :
                    tiles.updateSelectedTile({...tiles.selectedTile!,x:mainPos.x,y:mainPos.y})
                    stage.container().style.cursor = "grab"
                    break
                case "mouseEnter":
                    stage.container().style.cursor = "grab"
                    break;
                case "dragStart":
                    stage.container().style.cursor = "grabbing"
                    tiles.select(id)
                    break;
                case "mouseOut":
                    stage.container().style.cursor = "default"
            
                    break;
                default:
                    break;
            }
            
        }
    }

    return (
        <Group>
            <Rect id={id+"AOE"} listening={false} name="AOE Bounding Box" dragBoundFunc={dragFunc} x={mainPos.x-5-(effect.radius*gridSize)} y={mainPos.y-5-(effect.radius*gridSize)} fill={effect.targetResource.color} opacity={0.3} width={(width+(2*effect.radius))*gridSize} height={(height+(2*effect.radius))*gridSize} /> 
            <Rect
                // onContextMenu={(e)=>e.evt.preventDefault()}
                onDragEnd={getCursorFunc('dragEnd')}
                onDragStart={getCursorFunc("dragStart")}
                onMouseLeave={getCursorFunc("mouseOut")}
                onMouseEnter={getCursorFunc("mouseEnter")} 
                onClick={()=>{
                    tiles.select(id)
                }}
                draggable onDragMove={updateMainPos} 
                strokeWidth={10}
                stroke={lighten(fill,0.5)}
                dragBoundFunc={dragFunc} x={x} y={y} fill={fill} id={id}
                width={(width*gridSize)-10} height={(height*gridSize)-10} />        
                
        </Group>
    )
}

