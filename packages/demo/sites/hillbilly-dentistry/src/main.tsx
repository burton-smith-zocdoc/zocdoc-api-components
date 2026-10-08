import '@zocdoc/api-primitive-components/theme/all.css';
import './theme.css';
import './site.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { configureSite } from './config.ts';
import { Layout } from './Layout.tsx';
import { Home } from './pages/Home.tsx';
import { MeetTheDoc } from './pages/MeetTheDoc.tsx';
import { Book } from './pages/Book.tsx';

const mode = configureSite();

const router = createBrowserRouter([
  {
    element: <Layout mode={mode} />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/meet-the-doc', element: <MeetTheDoc /> },
      { path: '/book', element: <Book /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
