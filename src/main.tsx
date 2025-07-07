import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';

import './index.css'

import { App, Programs, Terms, Courses, AdminCourses, AdminRequisites } from '@pages'
import { queryClient } from './api';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/terms", element: <Terms /> },
      { path: "/programs", element: <Programs /> },
      { path: "/courses", element: <Courses /> },
      { path: '/admin/courses', element: <AdminCourses /> },
      { path: '/admin/requisites', element: <AdminRequisites /> },
    ],
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
