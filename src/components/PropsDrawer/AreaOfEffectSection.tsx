import { Accordion, NumberInput, Select, Slider,Text } from "@mantine/core";
import { useEditor } from "../../hooks/useEditor";
import type { Tile,Resource } from "../../types/tile";
import type { EditorContextType } from "../../contexts/EditorContext";
import PropsDrawer from "./PropsDrawer";


/**
 * Dedicated section (accordion item component) for configuring Area Of Effect 
 * 
 * Used internally in {@link PropsDrawer} component
 * 
 * @example 
 * ```jsx
 *  <Accordion> // Mantine's accordion component
 *      <AreaOfEffectSection/>
 *  </Accordion>
 * ```
 * @remarks
 * Handles : 
 * - Reading and writing the `effect` property - {@link Tile.effect}
 * 
 * Requirements before use :
 * - An existing tile must be selected and stored in `tiles.selectedTile` - {@link EditorContextType.tiles}
*/
export default function AreaOfEffectSection(){
    const {tiles,resources} = useEditor()

    /**
     * Updates `Tile.effect.targetResource` - {@link Tile}
     * @param resID - ID of resource to assign
     * @remarks
     * `targetResource` is of type {@link Resource}
     * 
     * Requirements before use :
     * - A non-empty `resID` must point to an existing {@link Resource} 
     * 
     * Effects :
     * - If empty `resID` , `Tile.effect` is set to undefined
     * - If non-empty `resID` , `Tile.effect` is set to initial lowest valid values (`radius:0`,`percentModif:0`) and `targetResource` is linked
     */
    function handleAoeResourceChange(resID:string): void{
        if (resID == ""){
            tiles.updateSelectedTile({...tiles.selectedTile!,effect:undefined})
            return
        }
        const res = resources.list.find((res)=>res.id == resID)!
        tiles.updateSelectedTile({...tiles.selectedTile!,effect:{radius:0,targetResource:res,percentModif:0}})
    }
    
    /**
     * Updates  properties of `Tile.effect`, excluding `targetResource`.
     *
     * @param updateObj - Partial update containing one or more of:
     * - `radius`
     * - `percentModif`
     *
     * The update object type is derived from {@link Tile.effect}, excluding `targetResource`.
     */
    function handleEffectDataChange(updateObj:Partial<Omit<Tile["effect"],"targetResource">>): void{
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