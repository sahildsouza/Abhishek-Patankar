import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Registration from './Registration'
import Admin from './Admin'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App
