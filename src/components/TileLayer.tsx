import { Layer } from "react-konva";
import { useEditor } from "../hooks/useEditor";
import Tile from "./Tile";
import type Konva from "konva";
import { lighten } from "@mantine/core";

type Point = { x: number; y: number };
type GridSnapOptions = {
    gridSize:number
    offsetX?:number
    offsetY?:number
    lockAxis?:"x"|"y"|null
}
function createGridSnap({
  gridSize,
  offsetX = 0,
  offsetY = 0,
  lockAxis = null,
  stageRef,
}: GridSnapOptions & { stageRef: React.RefObject<Konva.Stage|null> }) {
  return (pos: Point): Point => {
    const stage = stageRef.current;
    if (!stage) return pos;

    const scale = stage.scaleX(); // assume uniform scaling
    const stageX = stage.x();
    const stageY = stage.y();

    // Convert to grid space (undo stage transform)
    const unscaledX = (pos.x - stageX) / scale;
    const unscaledY = (pos.y - stageY) / scale;

    // Snap in grid space
    const snappedX =
      lockAxis === "y"
        ? unscaledX
        : Math.round((unscaledX - offsetX) / gridSize) * gridSize + offsetX;
    const snappedY =
      lockAxis === "x"
        ? unscaledY
        : Math.round((unscaledY - offsetY) / gridSize) * gridSize + offsetY;

    // Convert back to stage space
    return {
      x: (snappedX * scale + stageX),
      y: (snappedY * scale + stageY),
    };
  };
}
type TileLayer = {
    stageRef: React.RefObject<Konva.Stage|null>,
}
export default function TileLayer({stageRef}:TileLayer){
    const {tiles,cellSize} = useEditor()

    const dragFunc = createGridSnap({gridSize:cellSize,stageRef,offsetX:5,offsetY:5})
    return (
        <Layer>
            {
                tiles.list.map(tile =>(
                    <Tile 
                        key={tile.id}
                        id={tile.id}
                        effect={tile.effect?tile.effect:{radius:0,percentModif:0,targetResource:{id:"",color:"#FFD700",unitTime:'second',name:""}}}
                        dragFunc={dragFunc} 
                        x={tile.x} y={tile.y} 
                        width={tile.width} height={tile.height} 
                        gridSize={cellSize}
                        fill={tiles.selectedTile?.id === tile.id? lighten(tile.fill,0.1):tile.fill} 
                        />
                ))
            }
        </Layer>
    )
}