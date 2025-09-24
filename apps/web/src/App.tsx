import '@eiinu/tools/style.css'
import '@eiinu/games/style.css'
import './App.css'
import Workspace from './components/Workspace'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <Workspace />
    </ThemeProvider>
  )
}

export default App
