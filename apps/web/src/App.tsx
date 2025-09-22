import { JsonFormatter, SseParser } from '@eiinu/tools'
import '@eiinu/tools/style.css'
import './App.css'
import Workspace from './components/Workspace'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <Workspace jsonFormatter={<JsonFormatter />} sseParser={<SseParser />} />
    </ThemeProvider>
  )
}

export default App
