import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { loadInitialResume } from './lib/bootstrap';

// Рисуем уже с готовыми данными — иначе на миг мелькнёт демо-резюме.
loadInitialResume().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
