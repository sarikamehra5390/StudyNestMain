import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Pomodoro from './pages/Pomodoro';
import Rewards from './pages/Rewards';
import Teaching from './pages/Teaching';
import EyeTrackingApp from './pages/EyeTrackingApp'
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/eco-scan" element={<EyeTrackingApp />} />
          <Route path="/teaching" element={<Teaching />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
