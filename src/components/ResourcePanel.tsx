import { Flex, Title, ActionIcon, Tooltip, Group, Text, Modal, TextInput, Button, Select, ColorInput } from "@mantine/core";
import { PlusIcon, CubeIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useEditor } from "../hooks/useEditor";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import type { Resource } from "../types/tile";


function getUnitTimePrefix(unitTime:Resource["unitTime"]){
    switch (unitTime) {
        case "second":
            return "s"
        case "minute":
            return "min"
        case "hour":
            return "hr"
        case "day":
            return "day"
    }
}
export default function ResourcePanel() {
    const { resources } = useEditor()
    const [openedCreateMenu,createMenuHandler] = useDisclosure(false)
    const [openedEditMenu,editMenuHandler] = useDisclosure(false)
    const [selectedResource,setSelectedResource] = useState<Resource>({
        id:"",
        name: "",
        unitTime:"second",
        color:"#FFD700"
    })
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
    function handleEditClick(res:Resource){
        setSelectedResource({
            id:res.id,
            name:res.name,
            unitTime:res.unitTime,
            color:res.color
        })
        editMenuHandler.open()
    }
    function handleInput(e:React.ChangeEvent<HTMLInputElement, HTMLInputElement>){
        setSelectedResource((prev)=>({...prev,name:e.target.value}))
    }
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
                        resources.list.map((res) => (
                            <ActionIcon.Group key={res.id} bdrs="md" style={{boxShadow:`0px 0px 5px ${res.color}`}}>
                                <Tooltip label={res.name} zIndex={999} position="bottom">
                                    <ActionIcon.GroupSection size="50px" p={10} pl="6px" pr={6} variant="default" autoContrast bg="dark" >
                                        <Flex align="end" gap="0px" direction="column">
                                            <Group style={{width:"100%"}} justify="space-between">
                                                <CubeIcon size={15} color={res.color} />
                                                <Text size="xs">{res.name}</Text>
                                            </Group>
                                            <Group gap="4px">
                                                <Text size="xs">{resources.getResourceOutput(res.id)}</Text>
                                                <Text size="xs" c="cyan">+ {resources.getResourceModifOutput(res.id)}</Text>
                                                <Text size="xs"> = {(Number(resources.getResourceOutput(res.id)) + Number(resources.getResourceModifOutput(res.id))).toFixed(3)} / {getUnitTimePrefix(res.unitTime)}</Text>
                                            </Group>
                                        </Flex>
                                    </ActionIcon.GroupSection>
                                </Tooltip>
                                <ActionIcon size="50px" variant="default" onClick={() => handleEditClick(res)}>
                                    <PencilSimpleIcon />
                                </ActionIcon>
                            </ActionIcon.Group>
                        ))
                    }

                </Group>

            </Flex>
        </>

    )
}