import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './css/index.css';
import App from './App.tsx';

import { BrowserRouter } from 'react-router-dom';
import { CarritoProvider } from './pages/CarritoContext.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <CarritoProvider>
                <App />
            </CarritoProvider>
        </BrowserRouter>
    </StrictMode>
);
