import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import AIImageGenerator from './pages/AIImageGenerator';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/generate" element={<Generator />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/ai-image" element={<AIImageGenerator />} />
      </Routes>
    </Layout>
  );
}

export default App;