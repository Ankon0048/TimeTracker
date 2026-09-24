import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:projectId" element={<ProjectPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
