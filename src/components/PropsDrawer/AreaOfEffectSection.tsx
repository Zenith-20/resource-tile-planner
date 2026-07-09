import { Accordion, NumberInput, Select, Slider,Text } from "@mantine/core";
import { useEditor } from "../../hooks/useEditor";
import type { Tile } from "../../types/tile";



export default function AreaOfEffectSection(){
    const {tiles,resources} = useEditor()

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
    )
}