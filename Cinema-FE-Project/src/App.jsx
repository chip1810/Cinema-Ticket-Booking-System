import { Routes, Route } from 'react-router-dom';
import Header from './components/landingPage/Header';
import Home from './pages/Home';
import Footer from './components/landingPage/Footer';
import MovieDetail from './pages/MovieDetail';
import { AuthProvider } from './context/AuthContext';
import BookingFlow from './pages/BookingFlow';

export default function App() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AuthProvider>

        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies/:uuid" element={<MovieDetail />} />
            <Route path="/booking/:uuid" element={<BookingFlow />} />
          </Routes>
        </main>

        <Footer />

      </AuthProvider>
    </div>
  );
}