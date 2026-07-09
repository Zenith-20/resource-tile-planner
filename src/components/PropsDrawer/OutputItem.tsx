import { Paper, Stack, Title, Divider, NumberInput,Text } from "@mantine/core";
import type { Output, Resource } from "../../types/tile.ts";

type OutputItemProps = {
    resource:Resource
    output:Output
    onChange:(id:string,updateObj:Partial<Omit<Output,"id">>) => void
}
export default function OutputItem({resource,output,onChange}:OutputItemProps){
    return(
        <Paper style={{boxShadow:`0px 0px 5px ${resource.color}`}} mt="sm" p="sm" withBorder >
            <Stack align="center">
                <Title order={5}>{resource.name}</Title>
                <Divider w="100%" />
                <NumberInput allowNegative={false} onChange={(v)=>onChange(output.id,{amount:v as number})} label="Amount produced" value={output.amount} />
                <NumberInput 
                    clampBehavior="strict" startValue={1} allowNegative={false} min={1} onChange={(v)=>onChange(output.id,{refreshSeconds:Number.isInteger(v)? v as number:1})} label="Refresh time (seconds)" value={output.refreshSeconds} />
                <Divider w="100%" />
                <Text>Net output : {(output.amount/output.refreshSeconds).toFixed(3)} + {(output.modifAmount/output.refreshSeconds).toFixed(3)} / s</Text>
            </Stack>
        </Paper>
    )
}