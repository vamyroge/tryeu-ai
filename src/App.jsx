import { useApp } from './context/AppContext.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Overview from './pages/Overview.jsx'
import Models from './pages/Models.jsx'
import Playground from './pages/Playground.jsx'
import Usage from './pages/Usage.jsx'
import ApiKeys from './pages/ApiKeys.jsx'
import './App.css'

function App() {
  const { page } = useApp()

  const renderPage = () => {
    switch (page) {
      case 'models':
        return <Models />
      case 'playground':
        return <Playground />
      case 'usage':
        return <Usage />
      case 'keys':
        return <ApiKeys />
      case 'settings':
        // Settings page not implemented yet, fallback to Overview for now
        return <Overview />
      default:
        return <Overview />
    }
  }

  return (
    <AppLayout>
      {renderPage()}
    </AppLayout>
  )
}

export default App
