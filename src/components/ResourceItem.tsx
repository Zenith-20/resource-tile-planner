import { ActionIcon, Tooltip, Flex,Text,Group } from "@mantine/core";
import { CubeIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import type { Resource } from "../types/tile";
import { useEditor } from "../hooks/useEditor";

type ResourceItemProps = {
    onClickEdit:(res:Resource) => void
} & Resource
export default function ResourceItem({onClickEdit,...resource}:ResourceItemProps){
    const {resources} = useEditor()
    return(
        <ActionIcon.Group bdrs="md" style={{boxShadow:`0px 0px 5px ${resource.color}`}}>
            <Tooltip label={resource.name} zIndex={999} position="bottom">
                <ActionIcon.GroupSection size="50px" p={10} pl="6px" pr={6} variant="default" autoContrast bg="dark" >
                    <Flex align="end" gap="0px" direction="column">
                        <Group style={{width:"100%"}} justify="space-between">
                            <CubeIcon size={15} color={resource.color} />
                            <Text size="xs">{resource.name}</Text>
                        </Group>
                        <Group gap="4px">
                            <Text size="xs">{resources.getResourceOutput(resource.id)}</Text>
                            <Text size="xs" c="cyan">+ {resources.getResourceModifOutput(resource.id)}</Text>
                            <Text size="xs"> = {(Number(resources.getResourceOutput(resource.id)) + Number(resources.getResourceModifOutput(resource.id))).toFixed(3)} / {getUnitTimePrefix(resource.unitTime)}</Text>
                        </Group>
                    </Flex>
                </ActionIcon.GroupSection>
            </Tooltip>
            <ActionIcon size="50px" variant="default" onClick={() => onClickEdit(resource)}>
                <PencilSimpleIcon />
            </ActionIcon>
        </ActionIcon.Group>
    )
}

// Utils

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