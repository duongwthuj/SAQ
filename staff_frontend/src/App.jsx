import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Laptops from './pages/Laptops'
import LaptopForm from './pages/LaptopForm'
import Clothes from './pages/Clothes'
import ClothesForm from './pages/ClothesForm'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'

function Wrap({ children }) {
  return <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Wrap><Dashboard /></Wrap>} />
      <Route path="/laptops" element={<Wrap><Laptops /></Wrap>} />
      <Route path="/laptops/new" element={<Wrap><LaptopForm /></Wrap>} />
      <Route path="/laptops/:id/edit" element={<Wrap><LaptopForm /></Wrap>} />
      <Route path="/clothes" element={<Wrap><Clothes /></Wrap>} />
      <Route path="/clothes/new" element={<Wrap><ClothesForm /></Wrap>} />
      <Route path="/clothes/:id/edit" element={<Wrap><ClothesForm /></Wrap>} />
      <Route path="/orders" element={<Wrap><Orders /></Wrap>} />
      <Route path="/orders/:id" element={<Wrap><OrderDetail /></Wrap>} />
    </Routes>
  )
}
