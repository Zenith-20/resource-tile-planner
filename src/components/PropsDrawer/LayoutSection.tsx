import { Accordion, Slider,Text,Flex,ActionIcon } from "@mantine/core"
import { LockSimpleIcon, LockSimpleOpenIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { useEditor } from "../../hooks/useEditor"


export default function LayoutSection(){
    const [isLockedRatio, setIsLockedRatio] = useState(false)
    const [ratioData, setRatioData] = useState({
        width: 1,
        height: 1
    })
    const {tiles} = useEditor()

    function handleLockRatioClick() {
        const width = tiles.selectedTile?.width!
        const height = tiles.selectedTile?.height!
        const divisor = GetGCD(width, height)
        setRatioData({ width: width / divisor, height: height / divisor })
        setIsLockedRatio(!isLockedRatio)
    }
    
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
        if (type == "width") {
            tiles.updateSelectedTile({ ...tiles.selectedTile!, width: value })
        } else {
            tiles.updateSelectedTile({ ...tiles.selectedTile!, height: value })
        }
    }
    
    return(
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
    )
}

// Utils

function GetGCD(a: number, b: number): number {
    return b === 0 ? a : GetGCD(b, a % b);
}