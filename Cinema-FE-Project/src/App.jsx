import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/landingPage/Header';
import Home from './pages/Home';
import Footer from './components/landingPage/Footer';
import MovieDetail from './pages/MovieDetail';

// Manager Imports
import ManagerLayout from './components/layout/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard/ManagerDashboard';
import MovieManagementPage from './pages/manager/MovieManagementPage/MovieManagementPage';
import ShowtimeManagementPage from './pages/manager/ShowtimeManagementPage/ShowtimeManagementPage';
import HallManagementPage from './pages/manager/HallManagementPage/HallManagementPage';
import ConcessionManagementPage from './pages/manager/ConcessionManagementPage/ConcessionManagementPage';
import PricingManagementPage from './pages/manager/PricingManagementPage/PricingManagementPage';
import NewsManagementPage from './pages/manager/NewsManagementPage/NewsManagementPage';
import GenreManagementPage from './pages/manager/GenreManagementPage/GenreManagementPage';
import BannerManagementPage from './pages/manager/BannerManagementPage/BannerManagementPage';
import ReviewModerationPage from './pages/manager/ReviewModerationPage/ReviewModerationPage';

export default function App() {
  return (
    <Routes>
      {/* Landing Page Routes */}
      <Route path="/" element={
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          <Header />
          <Home />
          <Footer />
        </div>
      } />

      <Route path="/movies/:uuid" element={
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          <Header />
          <MovieDetail />
          <Footer />
        </div>
      } />

      {/* Manager Routes */}
      <Route path="/manager" element={<ManagerLayout />}>
        <Route index element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="movies" element={<MovieManagementPage />} />
        <Route path="showtimes" element={<ShowtimeManagementPage />} />
        <Route path="halls" element={<HallManagementPage />} />
        <Route path="concessions" element={<ConcessionManagementPage />} />
        <Route path="pricing" element={<PricingManagementPage />} />
        <Route path="news" element={<NewsManagementPage />} />
        <Route path="genres" element={<GenreManagementPage />} />
        <Route path="banners" element={<BannerManagementPage />} />
        <Route path="reviews" element={<ReviewModerationPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}