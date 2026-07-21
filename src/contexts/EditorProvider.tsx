import { useRef, useState, type ReactNode } from "react";
import { EditorContext, type ContextMenuData } from "./EditorContext";
import type { Resource, Tile } from "../types/tile";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";

type EditorProviderProps = {
    children:ReactNode
}

/**
 * A context wrapper that handles all changes to 
 * editor's state and provides necessary states back to components
 * 
 * Responsibilities:
 * - Tile CRUD
 * - Resource CRUD
 * - Selected tile state
 * - Context menu state
 * - Output/effect calculations
 */
export function EditorProvider({children}:EditorProviderProps){
    const [tiles,setTiles] = useState<Tile[]>([])
    const [selectedTile,setSelectedTile] = useState<Tile>()
    const stageRef = useRef<Konva.Stage>(null)
    const [isPropsMenuOpen,setPropsMenuOpen] = useState(false)
    const [menu,setMenu] = useState<ContextMenuData>({
        isOpen:false,x:0,y:0
    })
    const [resources,setResources] = useState<Resource[]>([])

    /**
     * Prevents defualt context menu behaviour and toggles context menu 
     * with an appropriate target (Stage,Tile) based on mouse click position
     * 
     * Affects context menu state
     * @param e - Pointer event object with extra properties provided by Konva
     */
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
        
    }

    /**
     * Closes the editor context menu without checking any initial state
     * 
     * Affects context menu state
     */
    function closeContextMenu(){
        setMenu((prev)=>({...prev,isOpen:false}))
    }

    /**
     * Creates and adds a new tile to editor. 
     * Affects the list of tiles state
     * @param tile - The tile object to add to list of existing tiles
     */
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
        
    }

    /**
     * Removes tile of given `id` 
     * 
     * Updates remaining tiles' 
     * outputs (in case the tile being removed was affecting other tiles's outputs)
     * 
     * Closes properties menu to avoid any editing ,becuase given tile ,that will always be a selected tile, is deleted
     * 
     * Affects properties menu open/close state and tiles list state
     * @param id - ID of tile to delete
     */
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

    /**
     * Selects a tile that may be further edited
     * 
     * Affects selected tile state
     * @param id - ID of tile to select
     */
    function selectTile(id:string){
        if(id === ""){
            setSelectedTile(undefined)
            return
        }
        setSelectedTile(tiles.find(tile => tile.id === id))
    }
    /**
     * Updates properties of the selected tile
     * 
     * Updates remaining tiles' 
     * outputs (in case the tile being updated was affecting other tiles's outputs)
     * 
     * Affects tiles list state and selected tile state
     * @param updateObj - Partial update object containing any or all of properties of a {@link Tile}
     */
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
                return {...tile,...updateObj}
            }
            return tile
        })

        // Update output modifiers
        newTiles = newTiles.map((tile)=>{
            const newTile = {
                ...tile,
                outputs:tile.outputs.map(output=>{
                    return {
                        ...output,
                        modifAmount:getBonusAmount(output.id,tile,newTiles,stageRef)
                    }
                })!
            }
            if (tile.id === selectedTile.id){
                updatedTile = newTile
                return updatedTile
            }
            return newTile
        })
        setTiles(newTiles)
        setSelectedTile(updatedTile)
    }

    /**
     * Creates a new tile with a new id and other properties set as same properties as of tile of given id
     * 
     * Offsets the position of new tile being created to show a new tile has been created close to original tile
     * 
     * Affects tiles list state
     * @param id - ID of tile to duplicate
     */
    function duplicateTile(id:string){
        const tile = tiles.find((tile) => tile.id == id)! // Never undefined , duplicate option only available on clicking tile
        const newTile:Tile = {
            id: crypto.randomUUID(),
            width: tile.width,
            height: tile.height,
            x: tile.x + 100,
            y: tile.y + 100,
            fill: tile.fill,
            effect:tile.effect,
            type: tile.type!,
            outputs: tile.outputs
        }
        setTiles((prev)=>[...prev,newTile])
    }

    /**
     * Creates a new globally available resource
     * 
     * Affects resources list state
     * @param res - Object of type {@link Resource} to create
     */
    function addResource(res:Resource){
        setResources((prev)=>[...prev,res])
    }
    
    /**
     * Deletes a resource of given `id` and updates tiles by removing any tile's outputs or effects that reference the deleted resource
     * 
     * Updates selected tile to sync with the new list of tiles
     * 
     * Affects tiles list state ,selected tile state and resources list state
     * @param id - ID of resource to delete
     */
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

    /**
     * Utility function used internally to get tiles that depend on a given resource
     * @param resourceID - ID of resource for which depending tiles are searched
     */
    function getResourceDependents(resourceID:string):Tile[]{
        const tilesMatched = tiles.filter((tile)=>(
            tile.outputs.some((output)=>(output.id == resourceID))
        ))
        return tilesMatched
    }

    /**
     * Updates given resource and syncs each tiles' effect to the updated resource
     * 
     * Affects resources list state and tiles list state
     * @param updateObj - The updated resource object
     */
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
    /**
     * Aggregates output rates from all tiles for given resource
     * @param id - ID of resource for which outputs are searched
     * @returns String representation of total output amount for given resource
     */
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

    /**
     * Aggregates bonus output rates ,that is `modifAmount`, (due to a tile being affected by an AOE) from all tiles for given resource
     * @param id - ID of resource for which outputs are searched
     * @returns String representation of total output amount for given resource
     */
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
        
        return (totalRateInSeconds* secondsPerUnitTime).toFixed(3)
    }

    /**
     * Utility function used internally to convert the string options of {@link Resource.unitTime} to number of seconds
     * @param unitTime - String option derived from {@link Resource.unitTime}
     * @returns Number of seconds for given unit time
     */
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
            contextMenu:{
                data:menu,
                open:handleContextMenu,
                close:closeContextMenu
            },
            resources:{
                list: resources, add: addResource, delete: deleteResource, update: updateResource,
                getResourceOutput,getResourceModifOutput
            }
            }}>
            {children}
        </EditorContext>
    )
}

// Utils

/**
 * Checks intersections of `tile` with `tiles` AOE (excluding self tile).If intersects , the 
 * modifier from effect of other tile is applied on output of target `tile` to get its `modifAmount`
 * @param resID - Resource ID for which `modifAmount` is aggregated
 * @param tile - Tile for which `modifAmount` is aggregated
 * @param tiles - All tiles in editor , to check for intersections
 * @param stageRef - React ref object to access stage methods
 * @returns Total `modifAmount` for given `tile` 
 */
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
        
        return total
    }
    return 0
}

/**
 * Gets all tiles whose AOE overlaps with given `tile`
 * @param target - Tile with which intersections of other tiles' AOE is checked
 * @param tiles - All tiles in editor
 * @param stageRef - React ref object to access stage methods
 */
function getIntersections(target:Tile,tiles:Tile[],stageRef:React.RefObject<Konva.Stage|null>){
    if(stageRef.current == null) return
    // const targetTileRect = stageRef.current.findOne(`#${target.id}`)!
    let targetBoundBox = {
        x:target.x,
        y:target.y,
        width:target.width*100,
        height:target.height*100
    }
    targetBoundBox = shrinkBoundBox(10,targetBoundBox)
    const intersectingTiles:Tile[] = []
    tiles.forEach((tile)=>{
        if(stageRef.current == null) return
        // const tileRect = stageRef.current.findOne(`#${tile.id}AOE`)!
        let tileRectBoundBox = {
            x:tile.x-5-(tile.effect?.radius!*100),
            y:tile.y-5-(tile.effect?.radius!*100),
            width:(tile.width+(2*tile.effect?.radius!))*100,
            height:(tile.height+(2*tile.effect?.radius!))*100
        }
        tileRectBoundBox = shrinkBoundBox(10,tileRectBoundBox)
        const intersectsAOE = Konva.Util.haveIntersection(targetBoundBox,tileRectBoundBox)
        if(intersectsAOE && tile.id != target.id){
            intersectingTiles.push(tile)
        }
    })
    
    return intersectingTiles
}

/**
 * Shrinks all four sides of a bounding box by a fixed amount.
 *
 * Used to make AOE intersection checks slightly more forgiving by
 * reducing false positives when two tiles only touch at their edges.
 *
 * @param shrinkPx - Pixels to shrink each side.
 * @param data - Bounding box to shrink.
 * @returns A new shrunken bounding box.
 */
function shrinkBoundBox(shrinkPx:number,data:{x:number,y:number,width:number,height:number}){
    return {
        x:data.x + shrinkPx,
        y:data.y + shrinkPx,
        width:data.width - shrinkPx*2,
        height:data.height - shrinkPx*2
    }
}