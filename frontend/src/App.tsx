import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import CategoryCreate from './pages/CategoryCreate'
import Help from './pages/Help'
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/new" element={<CategoryCreate />} />
            <Route path="/categories/:id" element={<Categories />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </Layout>
      </Router>
    </NotificationProvider>
  )
}

export default App
