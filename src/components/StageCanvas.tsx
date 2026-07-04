import { Stage } from "react-konva";
import GridLayer from "./GridLayer";
import type { KonvaEventObject } from "konva/lib/Node";
import TileLayer from "./TileLayer";
import { useEditor } from "../hooks/useEditor";


type StageCanvasProps = {
    width:number,
    height:number,
}

export default function StageCanvas({width,height}:StageCanvasProps){
    const {stageRef,openContextMenu,closeContextMenu,cellSize}= useEditor()
    const scrollScaleBy = 1.05

    
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
        newScale = Math.max(0.1,Math.min(5,newScale))
        stage.scale({x:newScale,y:newScale})
        stage.position({
            x:pointer.x - mousePointTo.x * newScale,
            y:pointer.y - mousePointTo.y * newScale
        })
    }

    return (
        <Stage offset={{x:-4000,y:-700}} scale={{x:0.2,y:0.2}} onMouseDown={closeContextMenu} onContextMenu={openContextMenu} onWheel={handleWheel} ref={stageRef} width={width} height={height} draggable>
            <GridLayer spacing={cellSize} />
            <TileLayer stageRef={stageRef} />
        </Stage>
    )
}

