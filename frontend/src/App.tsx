import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from './pages/RegisterPage';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirige de "/" a "/register" */}
                <Route path="/" element={<Navigate to="/register" />} />
                {/* Página de registro */}
                <Route path="/register" element={<RegisterPage />} />
            </Routes>
        </Router>
    );
}

export default App;
