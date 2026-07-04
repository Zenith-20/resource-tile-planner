import { Menu } from "@mantine/core";
import { useEditor } from "../hooks/useEditor";

export default function EditorContextMenu(){
    const {contextMenuData,closeContextMenu,tiles,propsMenu} = useEditor()
    function handleClose(){
        closeContextMenu()
    }
    return (
        <Menu width={200} onClose={handleClose} opened={contextMenuData.isOpen}>
            <Menu.Dropdown style={{
              "position":"absolute",
              "left":contextMenuData.x,
              "top":contextMenuData.y,
              "zIndex":999
            }}>
                <Menu.Label>Actions</Menu.Label>
                {
                    contextMenuData.target?.type == "Stage" 
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