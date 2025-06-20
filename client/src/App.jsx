import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css'
import LoginPage from './components/Login'
import RegisterPage from './components/Register'
import Dashboard from './components/dashboard'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element=<LoginPage/> />
        <Route path="/register" element=<RegisterPage/> />
        <Route path="/dashboard" element=<Dashboard/> />
      </Routes>
    </Router>
    
  )
}

export default App
