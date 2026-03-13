import { Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/landingPage/Header';
import Home from './pages/Home';
import Footer from './components/landingPage/Footer';
import MovieDetail from './pages/MovieDetail';
import ConcessionPage from './pages/customer/concessionPage/concessionPage';
import { AuthProvider } from './context/AuthContext';

// Layout mặc định có Header + Footer
const MainLayout = () => (
  <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* Các trang dùng Header + Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movies/:uuid" element={<MovieDetail />} />
        </Route>

        {/* ConcessionPage — tự có TopNavBar riêng */}
        <Route path="/concession" element={<ConcessionPage />} />

      </Routes>
    </AuthProvider>
  );
}