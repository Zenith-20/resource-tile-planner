import { Drawer, Accordion, Flex, ActionIcon, Stack, Text,Select, NumberInput, Slider, ColorInput, MultiSelect, Fieldset, Paper, Title, Divider } from "@mantine/core";
import { SquareIcon, LockSimpleIcon, LockSimpleOpenIcon } from "@phosphor-icons/react";
import { useEditor } from "../hooks/useEditor";
import { useState } from "react";
import type { Output, Resource, Tile } from "../types/tile";
import Konva from "konva";

type PropsDrawerProps = {
    isOpen: boolean,
    close: () => void
}
function GetGCD(a: number, b: number): number {
    return b === 0 ? a : GetGCD(b, a % b);
}
export default function PropsDrawer() {
    const { propsMenu, tiles, resources,stageRef } = useEditor()
    const [isLockedRatio, setIsLockedRatio] = useState(false)
    const [ratioData, setRatioData] = useState({
        width: 1,
        height: 1
    })
    function setDimensions(value: number, type: "width" | "height") {
        if (isLockedRatio) {
            const ratio = ratioData.width / ratioData.height
            tiles.updateSelectedTile(
                type == 'width'
                    ? { ...tiles.selectedTile!, width: value, height: Math.round(value / ratio) }
                    : { ...tiles.selectedTile!, width: Math.round(value * ratio), height: value }

            )
            return
        }
        console.log("is not locked")
        if (type == "width") {
            tiles.updateSelectedTile({ ...tiles.selectedTile!, width: value })
        } else {
            tiles.updateSelectedTile({ ...tiles.selectedTile!, height: value })
        }
    }
    function setFillColor(value: string) {
        tiles.updateSelectedTile({ ...tiles.selectedTile!, fill: value })
    }
    function handleLockRatioClick() {
        const width = tiles.selectedTile?.width!
        const height = tiles.selectedTile?.height!
        const divisor = GetGCD(width, height)
        setRatioData({ width: width / divisor, height: height / divisor })
        setIsLockedRatio(!isLockedRatio)
    }
    function getOutputIds() {
        const Ids = tiles.selectedTile?.outputs.map((o) => {
            const res = resources.list.find((res) => res.id == o.id)!
            return res.id
        })
        return Ids
    }
    function handleOutputsChange(outputResourceIds: string[]) {
        let currOutputs = tiles.selectedTile?.outputs!
        let oldResourceIds = currOutputs.map((output) => (output.id))
        let newResourceIds = outputResourceIds.filter((id) => (oldResourceIds.includes(id) == false))
        // Remove any deleted outputs
        let newOutputs = currOutputs.filter((output) => (outputResourceIds.includes(output.id)))
        newResourceIds.forEach((id) => {
            let newOutput: Output = {
                id: id,
                amount: 0,
                refreshSeconds: 1,
                modifAmount:0
            }
            newOutputs.push(newOutput)
        })
        tiles.updateSelectedTile({ ...tiles.selectedTile!, outputs: newOutputs })
        console.log(newOutputs)
    }

    function handleOutputDataChange(id:string,updateObj:Partial<Omit<Output,"id">>){
        const currOutputs = tiles.selectedTile?.outputs!
        const newOutputs = currOutputs.map((output)=>{
            if (output.id == id){
                return {
                    ...output,
                    ...updateObj
                }
            }
            return output
        })
        tiles.updateSelectedTile({...tiles.selectedTile!,outputs:newOutputs})
    }

    function handleAoeResourceChange(resID:string){
        if (resID == ""){
            tiles.updateSelectedTile({...tiles.selectedTile!,effect:undefined})
            return
        }
        const res = resources.list.find((res)=>res.id == resID)!
        tiles.updateSelectedTile({...tiles.selectedTile!,effect:{radius:0,targetResource:res,percentModif:0}})
    }
    function handleEffectDataChange(updateObj:Partial<Omit<Tile["effect"],"targetResource">>){
        tiles.updateSelectedTile({...tiles.selectedTile!,effect:{...tiles.selectedTile?.effect!,...updateObj}})
    }
    return (
        <Drawer closeButtonProps={{ pos: "absolute" }} position="right" size="xs" withOverlay={false} styles={{ content: { borderLeft: "1px solid", position: "relative", top: 100, height: "calc(100% - 100px)" } }} opened={propsMenu.isOpen} onClose={() => propsMenu.setOpen(false)}>
            <Accordion order={3} variant='contained' defaultValue="layout">
                <Accordion.Item value='layout'>
                    <Accordion.Control >Layout</Accordion.Control>
                    <Accordion.Panel>
                        <Flex align="center" gap="sm" pb="sm">
                            <ActionIcon size="lg" onClick={handleLockRatioClick}>
                                {
                                    isLockedRatio
                                        ? <LockSimpleIcon size={20} />
                                        : <LockSimpleOpenIcon size={20} />
                                }
                            </ActionIcon>
                            <Text size="sm">{isLockedRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}</Text>
                        </Flex>

                        <Text>Width</Text>
                        <Slider onChange={(value) => setDimensions(value, "width")} domain={[1, 100]} value={tiles.selectedTile?.width} min={isLockedRatio ? ratioData.width : 1} max={100} />
                        <Text>Height</Text>
                        <Slider disabled={isLockedRatio} onChange={(value) => setDimensions(value, "height")} domain={[1, 100]} value={tiles.selectedTile?.height} min={isLockedRatio ? ratioData.height : 1} max={100} />
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="style">
                    <Accordion.Control>Style</Accordion.Control>
                    <Accordion.Panel>
                        <ColorInput swatches={["#4ecc45", "#669db3", "#d2d9b9"]} label="Fill color" onChange={setFillColor} value={tiles.selectedTile?.fill} />
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="area-of-effect">
                    <Accordion.Control>Area of effect</Accordion.Control>
                    <Accordion.Panel>
                        <Select
                            comboboxProps={{ position: "left" }}
                            label="Affected resource"
                            description="Specifies the resource on which AOE modifier applies"
                            value={tiles.selectedTile?.effect?tiles.selectedTile?.effect?.targetResource!.id:""} // Note : Pass in same ids as in data prop , Mantine auto looks up and shows only corresponding name label
                            onChange={(_v,option)=>handleAoeResourceChange(option.value)}
                            data={[{value:"",label:"None"},...resources.list.map((res) => ({ value: res.id, label: res.name }))]}
                            nothingFoundMessage="No resources exist , add one from Resources section first"
                        />
                        {
                            tiles.selectedTile?.effect &&
                            (
                                <>
                                    <Text>Radius</Text>
                                    <Slider onChange={(v) => handleEffectDataChange({radius:v})} value={tiles.selectedTile?.effect?.radius} min={0} max={100} />
                                    <NumberInput clampBehavior="strict" startValue={0} suffix="%" onChange={(v)=>handleEffectDataChange({percentModif:v})} label="Modifier %" value={tiles.selectedTile?.effect.percentModif} />
                                </>
                            )
                        }
                        </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="resources">
                    <Accordion.Control>Resources</Accordion.Control>
                    <Accordion.Panel>
                        <MultiSelect
                            comboboxProps={{ position: "left" }}
                            label="Outputs"
                            description="Resources that this unit provides"
                            value={getOutputIds()} // Note : Pass in same ids as in data prop , Mantine auto looks up and shows only corresponding name label
                            onChange={handleOutputsChange}
                            data={resources.list.map((res) => ({ value: res.id, label: res.name }))}
                            nothingFoundMessage="No resources exist , add one from Resources section first"
                        />
                        {
                            tiles.selectedTile?.outputs.map((output) => {
                                const res = resources.list.find((res) => res.id == output.id)!
                                return (
                                    <Paper style={{boxShadow:`0px 0px 5px ${res.color}`}} mt="sm" p="sm" withBorder key={output.id}>
                                        <Stack align="center">
                                            <Title order={5}>{res.name}</Title>
                                            <Divider w="100%" />
                                            <NumberInput allowNegative={false} onChange={(v)=>handleOutputDataChange(output.id,{amount:v as number})} label="Amount produced" value={output.amount} />
                                            <NumberInput clampBehavior="strict" startValue={1} allowNegative={false} min={1} onChange={(v)=>handleOutputDataChange(output.id,{refreshSeconds:Number.isInteger(v)? v as number:1})} label="Refresh time (seconds)" value={output.refreshSeconds} />
                                            <Divider w="100%" />
                                            <Text>Net output : {(output.amount/output.refreshSeconds).toFixed(3)} + {(output.modifAmount/output.refreshSeconds).toFixed(3)} / s</Text>
                                        </Stack>
                                    </Paper>
                                )
                            })
                        }
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Drawer>
    )
}

