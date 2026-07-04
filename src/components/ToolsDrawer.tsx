import { Drawer, Accordion, ActionIcon, Flex,Text, Stack } from "@mantine/core"
import { SquareIcon } from "@phosphor-icons/react"
import { useEditor } from "../hooks/useEditor"
import type { Tile } from "../types/tile"

type ToolsDrawerProps = {
    isOpen:boolean,
    close:()=>void
}
export default function ToolsDrawer({isOpen,close}:ToolsDrawerProps){
    const {tiles,stageRef,cellSize} = useEditor()
    
    function handleAdd(tileType:Tile["type"]){
        const pos = {
            x: (Math.round((stageRef.current?.width()! /2) / cellSize) * cellSize)+5,
            y: (Math.round((stageRef.current?.height()!/2) / cellSize) * cellSize)+5
        }
        let newTile:Tile = {
            id: crypto.randomUUID(),
            width: 1,
            height: 1,
            x: pos.x,
            y: pos.y,
            fill: "#d2d9b9",
            outputs: []
        }
        switch (tileType){
            case "1x1":
                tiles.add({
                    ...newTile,
                    x: pos.x,
                    y: pos.y,
                    
                })
                break
            case "2x2":
                tiles.add({
                    ...newTile,
                    width: 2,
                    height: 2,
                    x: pos.x,
                    y: pos.y,
                    type:"2x2"
                })
                break
            case "3x3":
                tiles.add({
                    ...newTile,
                    width: 3,
                    height: 3,
                    x: pos.x,
                    y: pos.y,
                    type:"3x3"
                })
                break
        }
    }
    return (
        <Drawer size="xs" withOverlay={false} styles={{content:{borderRight:"1px solid",position:"relative",top:100,height:"calc(100% - 100px)"}}} opened={isOpen} onClose={close}>
            <Accordion order={3} variant='contained' defaultValue="general">
                <Accordion.Item value='general'>
                <Accordion.Control >General</Accordion.Control>
                <Accordion.Panel>
                    <Flex gap="sm">
                        <ActionIcon size="input-xl" onClick={()=>handleAdd("1x1")}>
                            <Stack align="center" gap="2px">
                                <SquareIcon size={20}/>
                                <Text size="xs">1x1 Tile</Text>
                            </Stack>
                        </ActionIcon>
                        <ActionIcon size="input-xl" onClick={()=>handleAdd("2x2")}>
                            <Stack align="center" gap="2px">
                                <SquareIcon size={30}/>
                                <Text size="xs">2x2 Tile</Text>
                            </Stack>
                        </ActionIcon>
                        <ActionIcon size="input-xl" onClick={()=>handleAdd("3x3")}>
                            <Stack align="center" gap="2px">
                                <SquareIcon size={40}/>
                                <Text size="xs">3x3 Tile</Text>
                            </Stack>
                        </ActionIcon>
                    </Flex>
                </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Drawer>
    )
}