import { Menu } from "@mantine/core";
import { useEditor } from "../hooks/useEditor";

/**
 * Top-level custom context menu used for right-click actions on the grid canvas.
 *
 * @remarks
 * Responsibilities:
 * - Provides context-specific actions depending on the targeted canvas element.
 * - Provides tile editing actions such as edit, duplicate, and delete.
 * - Contains placeholders for future stage-level actions.
 */
export default function EditorContextMenu(){
    const {contextMenu,tiles,propsMenu} = useEditor()

    return (
        <Menu width={200} onClose={contextMenu.close} opened={contextMenu.data.isOpen}>
            <Menu.Dropdown style={{
              "position":"absolute",
              "left":contextMenu.data.x,
              "top":contextMenu.data.y,
              "zIndex":999
            }}>
                <Menu.Label>Actions</Menu.Label>
                {
                    contextMenu.data.target?.type == "Stage" 
                    ?   <>
                            
                            <Menu.Item>Open</Menu.Item>
                            <Menu.Item>Rename</Menu.Item>
                            <Menu.Item>Duplicate</Menu.Item>
                            
                            
                        </>
                    :   <>
                            <Menu.Item onClick={()=>propsMenu.setOpen(true)}>Edit</Menu.Item>
                            <Menu.Item onClick={()=>tiles.duplicate(tiles.selectedTile?.id!)} >Duplicate</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item color="red" onClick={()=>tiles.remove(tiles.selectedTile?.id!)}>Delete</Menu.Item>
                        </>     
                        
                }
                
            </Menu.Dropdown>
        </Menu>
    )
}