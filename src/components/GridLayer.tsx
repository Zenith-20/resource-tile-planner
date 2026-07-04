import { useMantineTheme } from "@mantine/core";
import { Layer, Rect} from "react-konva";

type GridLayerProps = {
    spacing:number
}
export default function GridLayer({spacing}:GridLayerProps){
    const theme = useMantineTheme()
    let gridCells:{x:number,y:number}[] = [];
    let range = 2000;
    for (var gx = -range; gx <= range; gx += spacing) {
    for (var gy = -range; gy <= range; gy += spacing) {
        gridCells.push({ x: gx, y: gy });
    }
    }
    return (
        <Layer>
            {
                gridCells.map((data,index)=>(
                    <Rect key={"grid"+index} x={data.x} y={data.y} fill={`${theme.colors.gray[10]}`}  width={spacing} height={spacing} stroke={theme.colors.gray[6]} listening={false} strokeWidth={1}  />
                ))
            }
        </Layer>
    )
}

