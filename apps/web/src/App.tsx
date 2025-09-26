import '@eiinu/tools/style.css'
// import '@eiinu/games/style.css' // 暂时关闭游戏功能
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
