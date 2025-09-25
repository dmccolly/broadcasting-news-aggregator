import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IndexPage from './IndexPage.jsx'
import App from './App.jsx'
import RadioApp from './radio/App.jsx'

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/radio" element={<RadioApp />} />
        <Route path="/broadcasting" element={<App />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router
