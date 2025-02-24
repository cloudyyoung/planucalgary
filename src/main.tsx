import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Flowbite } from "flowbite-react";
import { QueryClientProvider } from '@tanstack/react-query';

import './index.css'

import { App, Programs, Terms } from '@pages'
import theme from './theme'
import Courses from './pages/admin/courses';
import { queryClient } from './api';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/terms", element: <Terms /> },
      { path: "/programs", element: <Programs /> },
      { path: '/admin/courses', element: <Courses /> }
    ],
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Flowbite theme={{ theme: theme }}>
      <div className='flex flex-col h-screen w-screen'>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </div>
    </Flowbite>
  </React.StrictMode>,
)
