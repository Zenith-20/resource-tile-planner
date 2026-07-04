import { useEffect, useRef, useState } from 'react'
import './App.css'
import { AppShell, Button, MantineProvider, Title, Flex, Divider, Group } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import StageCanvas from './components/StageCanvas'
import { ToolboxIcon } from '@phosphor-icons/react';
import { EditorProvider } from './contexts/EditorProvider'
import ToolsDrawer from './components/ToolsDrawer'
import EditorContextMenu from './components/EditorContextMenu'
import PropsDrawer from './components/PropsDrawer'
import ResourcePanel from './components/ResourcePanel'


function App() {
  const parentRef = useRef(null)
  const [isOpen, { open, close }] = useDisclosure(true)

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    if (parentRef.current == null) return
    const observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect
        setCanvasSize({ width, height })
      })
    })
    observer.observe(parentRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <MantineProvider defaultColorScheme='dark' >
      <AppShell header={{ height: 100 }}>
        <EditorProvider>
          <AppShell.Header zIndex={200}>
            <Group align='start'>
              <Flex direction="column" gap="5px" p="sm" >
                <Title order={4}>Grid editor</Title>
                <Flex>
                  <Button onClick={isOpen ? close : open} leftSection={<ToolboxIcon size={20} />}> Tools</Button>
                </Flex>
              </Flex>
              <Divider orientation="vertical" mt="xs" size="md" />
              <ResourcePanel />
            </Group>

          </AppShell.Header>

          <AppShell.Main ref={parentRef}>


            <StageCanvas width={canvasSize.width} height={canvasSize.height} />
            <EditorContextMenu />
            <ToolsDrawer isOpen={isOpen} close={close} />
            <PropsDrawer />


          </AppShell.Main>
        </EditorProvider>
      </AppShell>

    </MantineProvider>
  )
}

export default App
