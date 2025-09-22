import { JsonFormatter, SseParser, KeyboardListener } from '@eiinu/tools'
import '@eiinu/tools/style.css'
import './App.css'
import Workspace from './components/Workspace'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <Workspace 
        jsonFormatter={<JsonFormatter />} 
        sseParser={<SseParser />}
        keyboardListener={<KeyboardListener />}
      />
    </ThemeProvider>
  )
}

export default App
