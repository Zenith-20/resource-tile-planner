import { Drawer, Accordion, ColorInput } from "@mantine/core";
import { useEditor } from "../../hooks/useEditor";
import LayoutSection from "./LayoutSection";
import AreaOfEffectSection from "./AreaOfEffectSection";
import OutputsSection from "./OutputsSection";
import type { Tile } from "../../types/tile";
import type { EditorContextType } from "../../contexts/EditorContext";

/**
 * Dedicated drawer for configuring selected tile's data
 * 
 * Uses {@link LayoutSection}, {@link AreaOfEffectSection} and {@link OutputsSection} custom components
 * 
 * @remarks
 * Responsibilities: 
 * - Manages the selected tile's properties (`width`,`height`,`fill`,`effect`,`outputs`) - {@link Tile}
 * 
 * Requirements before use :
 * - A tile must be selected and stored in `tiles.selectedTile` - {@link EditorContextType.tiles}
*/
export default function PropsDrawer() {
    const { propsMenu, tiles} = useEditor()
    
    /**
     * Updates the fill color of tile
     * 
     * Assumes a tile is already selected and stored in `tiles.selectedTile` 
     * @param value - Color value to set
     */
    function setFillColor(value: string) {
        tiles.updateSelectedTile({ ...tiles.selectedTile!, fill: value })
    }
    
    
    return (
        <Drawer closeButtonProps={{ pos: "absolute" }} position="right" size="xs" withOverlay={false} styles={{ content: { borderLeft: "1px solid", position: "relative", top: 100, height: "calc(100% - 100px)" } }} opened={propsMenu.isOpen} onClose={() => propsMenu.setOpen(false)}>
            <Accordion order={3} variant='contained' defaultValue="layout">
                <LayoutSection/>
                <Accordion.Item value="style">
                    <Accordion.Control>Style</Accordion.Control>
                    <Accordion.Panel>
                        <ColorInput swatches={["#4ecc45", "#669db3", "#d2d9b9"]} label="Fill color" onChange={setFillColor} value={tiles.selectedTile?.fill} />
                    </Accordion.Panel>
                </Accordion.Item>
                <AreaOfEffectSection/>
                <OutputsSection/>
            </Accordion>
        </Drawer>
    )
}

