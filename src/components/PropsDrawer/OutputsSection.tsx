import { Accordion, MultiSelect } from "@mantine/core"
import OutputItem from "../PropsDrawer/OutputItem"
import { useEditor } from "../../hooks/useEditor"
import type { Output } from "../../types/tile"
import PropsDrawer from "./PropsDrawer"
import type { Tile } from "../../types/tile"
import type { EditorContextType } from "../../contexts/EditorContext"

/**
 * Dedicated accordion item for configuring selected tile's outputs
 * 
 * Uses {@link OutputItem} custom component
 * 
 * Used internally by {@link PropsDrawer} component
 * 
 * @example 
 * ```jsx
 *  <Accordion> // Mantine's accordion component
 *      <OutputsSection/>
 *  </Accordion>
 * ```
 * @remarks
 * Responsibilities: 
 * - Manages the selected tile's `outputs` property - {@link Tile}
 * 
 * Requirements before use :
 * - A tile must be selected and stored in `tiles.selectedTile` - {@link EditorContextType.tiles}
*/
export default function OutputsSection(){
    const {tiles, resources} = useEditor()

    function getOutputIds() {
        const Ids = tiles.selectedTile?.outputs.map((o) => {
            const res = resources.list.find((res) => res.id == o.id)!
            return res.id
        })
        return Ids
    }
    
    /**
     * Handles MultiSelect value change and updates the selected tile's outputs accordingly
     * 
     * @param outputResourceIds - IDs of outputs selected
     */
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
    }

    /**
     * Updates properties of an output in `Tile.outputs`, excluding `id`
     * 
     * @param id - ID of output being edited
     * @param updateObj - Partial update containing one or more of:
     * - `amount`
     * - `modifAmount`
     * - `refreshSeconds`
     *
     * The update object type is derived from {@link Output}, excluding `id`.
     */
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

    return (
        <Accordion.Item value="outputs">
            <Accordion.Control>Outputs</Accordion.Control>
            <Accordion.Panel>
                <MultiSelect
                    comboboxProps={{ position: "left" }}
                    label="Resources"
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
                            <OutputItem key={output.id} resource={res} output={output} onChange={handleOutputDataChange} />
                        )
                    })
                }
            </Accordion.Panel>
        </Accordion.Item>
    )
}