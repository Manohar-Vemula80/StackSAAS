import { Routes, Route } from 'react-router-dom'
import './App.css'
import axios from 'axios'
// import Otp from './auth/otp'
// import Register from './auth/register'
import Dashboard from './pages/Dashboard'
import LoadingScreen from './pages/Analysis'
import ResultPage from './pages/ResultPage'
import StockChart from './pages/charts'
import PaymentPage from './pages/Paymentpage'
import SuccessPage from './pages/succespage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/profilepage'
import SettingsPage from './pages/settingpage'
import { useState, useEffect } from 'react'
import Signup from './auth/register'
import Login from './auth/login'



function App() {
  const [user, setUser] = useState(null);

	const getUser = async () => {
		try {
			const url = `${import.meta.env.VITE_API_URL}/auth/login/success`;
			const { data } = await axios.get(url, { withCredentials: true });
			setUser(data.user._json);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		getUser();
	}, []);
  return (
    <Routes>
      
      <Route path='/' element={<Dashboard />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/analysis" element={<LoadingScreen/>} />
      <Route path="/Result" element={<ResultPage />} />
      <Route path="/charts" element={<StockChart />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/success" element={<SuccessPage/>} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/setting" element={<SettingsPage />} />

    </Routes>
  )
}

export default App
