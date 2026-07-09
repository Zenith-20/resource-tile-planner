import { Accordion, MultiSelect } from "@mantine/core"
import OutputItem from "../PropsDrawer/OutputItem"
import { useEditor } from "../../hooks/useEditor"
import type { Output } from "../../types/tile"

export default function OutputsSection(){
    const {tiles, resources} = useEditor()

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