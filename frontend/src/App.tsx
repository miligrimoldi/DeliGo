import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from './pages/RegisterPage';
import EntidadesTabs from './components/EntitiesTabs';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirige de "/" a "/register" */}
                <Route path="/" element={<Navigate to="/register" />} />
                {/* Página de registro */}
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/" element={<Navigate to="/entidades" />} />
                {/* Página de entidades */}
                <Route path="/entidades" element={<EntidadesTabs />} />
                {/* Página de registro */}
                <Route path="/register" element={<RegisterPage />} />

            </Routes>
        </Router>
    );
}

export default App;
