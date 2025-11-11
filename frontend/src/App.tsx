import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import CategoryCreate from './pages/CategoryCreate'
import Help from './pages/Help'
import { NotificationProvider } from './contexts/NotificationContext'
import { CategoryProvider } from './contexts/CategoryContext'

function App() {
  return (
    <NotificationProvider>
      <CategoryProvider>
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
      </CategoryProvider>
    </NotificationProvider>
  )
}

export default App
