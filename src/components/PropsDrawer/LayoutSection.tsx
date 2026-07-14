import { Accordion, Slider,Text,Flex,ActionIcon } from "@mantine/core"
import { LockSimpleIcon, LockSimpleOpenIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { useEditor } from "../../hooks/useEditor"
import PropsDrawer from "./PropsDrawer"
import type { Tile } from "../../types/tile"
import type { EditorContextType } from "../../contexts/EditorContext"

/**
 * Dedicated accordion item for configuring selected tile's layout 
 * 
 * Used internally by {@link PropsDrawer} component
 * 
 * @example 
 * ```jsx
 *  <Accordion> // Mantine's accordion component
 *      <LayoutSection/>
 *  </Accordion>
 * ```
 * @remarks
 * Responsibilities: 
 * - Manages the selected tile's `width` and `height` properties - {@link Tile}
 * 
 * Requirements before use :
 * - A tile must be selected and stored in `tiles.selectedTile` - {@link EditorContextType.tiles}
*/
export default function LayoutSection(){
    const [isLockedRatio, setIsLockedRatio] = useState(false)
    const [ratioData, setRatioData] = useState({
        width: 1,
        height: 1
    })
    const {tiles} = useEditor()

    /**
     * Toggles aspect ratio locking for the selected tile.
     *
     * Stores the current width-to-height ratio so future resize
     * operations preserve the tile's aspect ratio.
     */
    function handleLockRatioClick() {
        const width = tiles.selectedTile?.width!
        const height = tiles.selectedTile?.height!
        const divisor = GetGCD(width, height)
        setRatioData({ width: width / divisor, height: height / divisor })
        setIsLockedRatio(!isLockedRatio)
    }
    
    /**
     * Sets the `width` or `height` of the selected tile 
     * @param value - The `width` or `height` amount 
     * @param type - Identifies which dimension the value belongs to
     *
     * @remarks
     * If `isLockedRatio` is true , width can only be resized , height adjusted automatically
     * If `isLockedRatio` is false , width and height can be freely edited
     */
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

/**
 * Computes the greatest common divisor (GCD) of two numbers.
 *
 * Used to reduce the tile's width and height to their simplest aspect ratio.
 */
function GetGCD(a: number, b: number): number {
    return b === 0 ? a : GetGCD(b, a % b);
}