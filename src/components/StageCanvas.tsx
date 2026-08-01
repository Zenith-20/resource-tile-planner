import { Stage } from "react-konva";
import GridLayer from "./GridLayer";
import type { KonvaEventObject } from "konva/lib/Node";
import TileLayer from "./TileLayer";
import { useEditor } from "../hooks/useEditor";


type StageCanvasProps = {
    width:number,
    height:number,
}

/**
 * Primary interactive Konva Stage component
 * 
 * Uses {@link GridLayer} and {@link TileLayer} custom components
 * 
 * @remarks
 * Responsibilities: 
 * - Manages canvas dragging and zoom in/out inputs
 * - Handles context menu right click interactions
*/
export default function StageCanvas({width,height}:StageCanvasProps){
    const {stageRef,contextMenu,cellSize}= useEditor()
    const scrollScaleBy = 1.05 

    /**
     * Handles zoom in/out inputs and applies mouse centered scaling on canvas
     * 
     * Provides an additional feature of reverting scroll direction with scale in/out by simultaneously having `Ctrl` key pressed while scrolling
     * @param e - Wheel event object with extra properties provided by Konva wrapper
     */
    function handleWheel(e:KonvaEventObject<WheelEvent>){
        if (!stageRef.current) return
        e.evt.preventDefault()
        const stage = stageRef.current
        const oldScale = stage.scaleX()
        const pointer = stage.getPointerPosition()!
        const mousePointTo = {
            x:(pointer.x - stage.x()) / oldScale,
            y:(pointer.y - stage.y()) / oldScale
        }
        let dir = e.evt.deltaY > 0 ? -1 : 1
        if(e.evt.ctrlKey) {dir = -dir}
        let newScale = dir > 0 ? oldScale * scrollScaleBy : oldScale / scrollScaleBy
        newScale = Math.max(0.1,Math.min(5,newScale)) // Clamps scaling to min 0.1 and max 5
        stage.scale({x:newScale,y:newScale})
        stage.position({
            x:pointer.x - mousePointTo.x * newScale,
            y:pointer.y - mousePointTo.y * newScale
        })
    }

    return (
        <Stage offset={{x:-4000,y:-700}} scale={{x:0.2,y:0.2}} onMouseDown={contextMenu.close} onContextMenu={contextMenu.open} onWheel={handleWheel} ref={stageRef} width={width} height={height} draggable>
            <GridLayer spacing={cellSize} />
            <TileLayer stageRef={stageRef} />
        </Stage>
    )
}

