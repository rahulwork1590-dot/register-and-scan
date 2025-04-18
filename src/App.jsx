import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Register from './pages/Register'
import Validate from './pages/Validate'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/validate" element={<Validate />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
