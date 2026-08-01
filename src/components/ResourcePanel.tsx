import { Flex, Title, ActionIcon, Group, Modal, TextInput, Button, Select, ColorInput } from "@mantine/core";
import { PlusIcon } from "@phosphor-icons/react";
import { useEditor } from "../hooks/useEditor";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import type { Resource } from "../types/tile";
import ResourceItem from "./ResourceItem";


/**
 * Panel with modals for configuring global resources
 * 
 * Uses {@link ResourceItem} custom component
 * 
 * @remarks
 * Responsibilities: 
 * - Manages the selected resource's properties through create/edit modals - {@link Resource}
 * - Manages state of create/edit modals for a selected resource
*/
export default function ResourcePanel() {
    const { resources } = useEditor()
    const [openedCreateMenu,createMenuHandler] = useDisclosure(false)
    const [openedEditMenu,editMenuHandler] = useDisclosure(false)
    
    // Resource currently being created or edited.
    // Both modals bind their form fields to this object.
    const [selectedResource,setSelectedResource] = useState<Resource>({
        id:"",
        name: "",
        unitTime:"second",
        color:"#FFD700"
    })

    /**
     * Creates a new resource in resources list with resource data taken from data entered in create modal
     * 
     * Resets currently selected resource and closes create modal
     * 
     * Performs data validation e.g preventing creation of unnamed resources
     */
    function createResource(){
        if(selectedResource.name == "") return
        const newResource:Resource = {
            id:crypto.randomUUID(),
            name: selectedResource.name,
            unitTime:selectedResource.unitTime,
            color:selectedResource.color
        }
        setSelectedResource(newResource)
        resources.add(newResource)
        createMenuHandler.close()
        setSelectedResource({
            id:"",
            name: "",
            unitTime:"second",
            color:"#FFD700"
        })
        
    }

    /**
     * Opens edit modal and loads selected resource into input fields
     * @param res - {@link Resource} to load into edit modal
     */
    function handleEditClick(res:Resource){
        setSelectedResource({
            id:res.id,
            name:res.name,
            unitTime:res.unitTime,
            color:res.color
        })
        editMenuHandler.open()
    }

    /**
     * Manages selected resource's name input
     * @param e - React change event for the name text input
     */
    function handleInput(e:React.ChangeEvent<HTMLInputElement, HTMLInputElement>){
        setSelectedResource((prev)=>({...prev,name:e.target.value}))
    }

    /**
     * Deletes a selected resource
     * 
     * Assumes a resource is selected beforehand (delete button is only available in edit context)
     * 
     * Closes edit menu and clears current selected resource
     */
    function deleteResource(){
        editMenuHandler.close()
        resources.delete(selectedResource.id)
        setSelectedResource({
            id:"",
            name: "",
            unitTime:"second",
            color:"#FFD700"
        })
    }

    /**
     * Syncs edits to selected resource to same id resource in resource list
     * 
     * Closes edit menu and clears current selected resource
     */
    function editResource(){
        if(selectedResource.name == "") return
        editMenuHandler.close()
        resources.update(selectedResource)
        setSelectedResource({
            id:"",
            name: "",
            unitTime:"second",
            color:"#FFD700"
        })
    }

    return (
        <>
            <Modal zIndex={300} centered title="Edit resource" opened={openedEditMenu} onClose={editMenuHandler.close}>
                <TextInput onChange={handleInput} value={selectedResource.name} label="Name" placeholder="Enter resource name"  withAsterisk/>
                <Select label="Time unit" data={["second","minute","hour","day"]} value={selectedResource.unitTime} onChange={(v)=>setSelectedResource((prev)=>({...prev,unitTime:v!}))} />
                <ColorInput label="Color" placeholder="Pick a resource color" value={selectedResource.color} onChange={(v)=>setSelectedResource((prev)=>({...prev,color:v!}))}/>
                <Group grow>
                    <Button mt="md" onClick={deleteResource} variant="filled" bg="red">Delete</Button>
                    <Button mt="md" onClick={editResource}>Save changes</Button>              
                </Group>
            </Modal>

            <Modal centered title="Create resource" opened={openedCreateMenu} onClose={createMenuHandler.close} zIndex={300}>
                <TextInput onChange={handleInput} value={selectedResource.name} label="Name" placeholder="Enter resource name"  withAsterisk/>
                <Select label="Time unit" data={["second","minute","hour","day"]} value={selectedResource.unitTime} onChange={(v)=>setSelectedResource((prev)=>({...prev,unitTime:v!}))} />
                <ColorInput label="Color" placeholder="Pick a resource color" value={selectedResource.color} onChange={(v)=>setSelectedResource((prev)=>({...prev,color:v!}))}/>
                
                <Button mt="md" fullWidth onClick={createResource}>Create</Button>
            </Modal>

            <Flex direction="column" pt="6px" gap="8px" align="start" justify="center">
                <Group>
                    <Title order={5}>Resources</Title>
                    <ActionIcon onClick={createMenuHandler.open}>
                        <PlusIcon />
                    </ActionIcon>
                </Group>

                <Group>
                    {
                        resources.list.map((res)=>(
                            <ResourceItem key={res.id} {...res} onClickEdit={handleEditClick} />
                        ))
                    }
                </Group>

            </Flex>
        </>

    )
}