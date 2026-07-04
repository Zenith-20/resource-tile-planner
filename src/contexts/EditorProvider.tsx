import { useRef, useState, type ReactNode } from "react";
import { EditorContext, type ContextMenuData } from "./EditorContext";
import type { Resource, Tile } from "../types/tile";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";

type EditorProviderProps = {
    children:ReactNode
}
export function EditorProvider({children}:EditorProviderProps){
    const [tiles,setTiles] = useState<Tile[]>([])
    const [selectedTile,setSelectedTile] = useState<Tile>()
    const stageRef = useRef<Konva.Stage>(null)
    const [isPropsMenuOpen,setPropsMenuOpen] = useState(false)
    const [menu,setMenu] = useState<ContextMenuData>({
        isOpen:false,x:0,y:0
    })
    const [resources,setResources] = useState<Resource[]>([])
    function handleContextMenu(e:KonvaEventObject<PointerEvent>){
        e.evt.preventDefault()
        stageRef.current?.preventDefault()
        const pos = stageRef.current?.getPointerPosition()!
        const isStage = e.target.getType() == "Stage"
        setMenu((prevState) =>({
            isOpen:(prevState.isOpen && (prevState.x == pos.x && prevState.y == pos.y))?false:true,
            x:pos?.x,
            y:pos?.y,
            target:isStage? {type:"Stage"} : {type:"Tile",data:{
                id: e.target.getAttrs().id!,
                width: e.target.getAttrs().width!,
                height: e.target.getAttrs().height!,
                x: e.target.getAttrs().x!,
                y: e.target.getAttrs().y!,
                fill:e.target.getAttrs().fill,
                outputs:e.target.getAttrs().outputs
            }}
        }))
        console.log(e.target)
    }
    function closeContextMenu(){
        setMenu((prev)=>({...prev,isOpen:false}))
    }
    function addTile(tile:Tile){
        const newTile:Tile = {
            type: tile.type ? tile.type : "1x1",
            id: tile.id,
            width: tile.width,
            height: tile.height,
            x: tile.x,
            y: tile.y,
            // effectRadius: tile.effectRadius ? tile.effectRadius : 0,
            fill: tile.fill ? tile.fill : "green",
            outputs: []
        }
        setTiles((currState)=>[...currState,newTile])
        console.log(tiles)
    }

    function removeTile(id:string){
        let newTiles = tiles.filter((tile)=>tile.id !== id)
        // Update output modifiers
        newTiles = newTiles.map((tile)=>{
            return {
                ...tile,
                outputs:tile.outputs.map(output=>{
                    return {
                        ...output,
                        modifAmount:getBonusAmount(output.id,tile,newTiles,stageRef)
                    }
                })!
            }
        })
        setPropsMenuOpen(false)
        setTiles(newTiles)
    }

    function selectTile(id:string){
        if(id === ""){
            setSelectedTile(undefined)
            return
        }
        setSelectedTile(tiles.find(tile => tile.id === id))
    }
    function updateSelectedTile(updateObj:Partial<Tile>){
        if(!selectedTile) throw new Error("No tile selected error")
        let updatedTile:Tile = {
            id: "",
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            fill: "#4ecc45",
            outputs: []
        }
        let newTiles = tiles.map((tile)=>{
            if (tile.id === selectedTile.id){
                updatedTile = {...tile,...updateObj}
                return updatedTile
            }
            return tile
        })
        // Update output modifiers
        newTiles = newTiles.map((tile)=>{
            return {
                ...tile,
                outputs:tile.outputs.map(output=>{
                    return {
                        ...output,
                        modifAmount:getBonusAmount(output.id,tile,newTiles,stageRef)
                    }
                })!
            }
        })
        setTiles(newTiles)
        setSelectedTile(updatedTile)
    }

    function duplicateTile(id:string){
        const tile = tiles.find((tile) => tile.id == id)! // Never undefined , duplicate only available on clicking tile
        const newTile:Tile = {
            id: crypto.randomUUID(),
            width: tile.width,
            height: tile.height,
            x: tile.x + 100,
            y: tile.y + 100,
            fill: tile.fill,
            effect:tile.effect,
            // effectRadius: tile.effectRadius ? tile.effectRadius : 0,
            type: tile.type!,
            outputs: tile.outputs
        }
        setTiles((prev)=>[...prev,newTile])
    }

    function addResource(res:Resource){
        setResources((prev)=>[...prev,res])
    }
    
    function deleteResource(id:string){
        const newResources = resources.filter((res)=>res.id !== id)
        const foundTiles = getResourceDependents(id)

        let newTiles = tiles
        foundTiles.forEach((tile)=>{
            let newOutputs = tile.outputs.filter((output)=>output.id != id)
            newTiles.splice(
                newTiles.findIndex((currTile)=>currTile.id == tile.id),1,{
                ...tile,
                outputs:newOutputs,
            })
        })     
        newTiles = newTiles.map((tile)=>{
            let newEffect = tile.effect?.targetResource.id == id? undefined :tile.effect!
            return {
                ...tile,
                effect:newEffect    
            }
        })
        setSelectedTile(newTiles.find((tile)=> tile.id ==selectedTile?.id))
        setTiles(newTiles)
        setResources(newResources)
    }
    function getResourceDependents(resourceID:string):Tile[]{
        const tilesMatched = tiles.filter((tile)=>(
            tile.outputs.some((output)=>(output.id == resourceID))
        ))
        return tilesMatched
    }
    function updateResource(updateObj:Resource){
        let updatedRes:Resource = {
            id: "",
            name: "",
            unitTime: "second",
            color:"#FFD700"
        }
        const newResources = resources.map((res)=>{
            if (res.id === updateObj.id){
                updatedRes = {...res,...updateObj}
                return updatedRes
            }
            return res
        })
        let newTiles = tiles
        newTiles.map((tile)=>{
            if(tile.effect){
                if(tile.effect.targetResource.id != updateObj.id) return
                tile.effect.targetResource = updateObj
            }
        })
        setResources(newResources)
        setTiles(newTiles)
    }
    function getResourceOutput(id:string){
        const res = resources.find((res)=>res.id == id)!
        const depTiles = getResourceDependents(id)
        const secondsPerUnitTime = getUnitTimeSeconds(res.unitTime)
        let totalRateInSeconds = 0
        depTiles.forEach((tile)=>{
            const output = tile.outputs.find((o)=>o.id == id)!
            let outputRateInSeconds = output.amount / output.refreshSeconds
            totalRateInSeconds += outputRateInSeconds
        })
        return (totalRateInSeconds* secondsPerUnitTime).toFixed(3)
    }
    function getResourceModifOutput(id:string){
        const res = resources.find((res)=>res.id == id)!
        const depTiles = getResourceDependents(id)
        const secondsPerUnitTime = getUnitTimeSeconds(res.unitTime)
        let totalRateInSeconds = 0
        depTiles.forEach((tile)=>{
            const output = tile.outputs.find((o)=>o.id == id)
            if(output){
                let outputRateInSeconds = output.modifAmount / output.refreshSeconds
                totalRateInSeconds += outputRateInSeconds
            }
        })
        console.log("total modif",totalRateInSeconds)
        return (totalRateInSeconds* secondsPerUnitTime).toFixed(3)
    }
    function getUnitTimeSeconds(unitTime:Resource["unitTime"]){
        switch (unitTime) {
            case "second":
                return 1
            case "minute":
                return 60
            case "hour":
                return 60*60
            case "day":
                return 60*60*24
        }
    }
    
    return (
        <EditorContext value={{
            propsMenu:{isOpen:isPropsMenuOpen,setOpen:setPropsMenuOpen},
            cellSize:100,
            tiles:{list:tiles,duplicate:duplicateTile,add:addTile,remove:removeTile,select:selectTile,selectedTile,updateSelectedTile},
            stageRef,
            contextMenuData:menu,openContextMenu:handleContextMenu,closeContextMenu,
            resources:{
                list: resources, add: addResource, delete: deleteResource, update: updateResource,
                getResourceOutput,getResourceModifOutput
            }
            }}>
            {children}
        </EditorContext>
    )
}

// Run for all tiles
function getBonusAmount(resID:string,tile:Tile,tiles:Tile[],stageRef:React.RefObject<Konva.Stage|null>){
    const IntersectingTiles = getIntersections(tile,tiles,stageRef)
    const output = tile.outputs.find((o)=>o.id==resID)!
    let baseAmount = output.amount
    let total = 0
    if(IntersectingTiles && IntersectingTiles.length !== 0){
        IntersectingTiles.forEach((tile)=>{
            if(tile.effect?.targetResource.id == resID){
                total = total + (baseAmount*(tile.effect.percentModif/100))
            }
        })
        console.log(IntersectingTiles,total)
        return total
    }
    return 0
}
function getIntersections(target:Tile,tiles:Tile[],stageRef:React.RefObject<Konva.Stage|null>){
    if(stageRef.current == null) return
    const targetTileRect = stageRef.current.findOne(`#${target.id}`)!
    const targetBoundBox = shrinkBoundBox(1,targetTileRect.getClientRect())
    const intersectingTiles:Tile[] = []
    tiles.forEach((tile)=>{
        if(stageRef.current == null) return
        const tileRect = stageRef.current.findOne(`#${tile.id}AOE`)!
        const tileRectBoundBox = shrinkBoundBox(1,tileRect.getClientRect())
        const intersects = Konva.Util.haveIntersection(targetBoundBox,tileRectBoundBox)
        if(intersects && tile.id != target.id){
            intersectingTiles.push(tile)
        }
    })
    console.log("itnersefcts",intersectingTiles)
    return intersectingTiles
}
function shrinkBoundBox(shrinkPx:number,data:{x:number,y:number,width:number,height:number}){
    return {
        x:data.x + shrinkPx,
        y:data.y + shrinkPx,
        width:data.width - shrinkPx*2,
        height:data.height - shrinkPx*2
    }
}