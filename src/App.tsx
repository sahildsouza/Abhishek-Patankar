import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Registration from './Registration'
import Admin from './Admin'
import NotFound from './NotFound'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
