import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IndexPage from './IndexPage.jsx'
import BroadcastingNews from './BroadcastingNews.jsx'
import RadioNews from './RadioNews.jsx'

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/radio" element={<RadioNews />} />
        <Route path="/broadcasting" element={<BroadcastingNews />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router
