import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';

import './index.css'

import { queryClient } from './api';
import { App } from '@/pages/app/App'
import { Courses } from '@/pages/courses/Courses';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminRequisites } from './pages/admin/AdminRequisites';
import { AdminCourseSets } from './pages/admin/AdminCourseSets';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/courses", element: <Courses /> },
      { path: "/admin/courses", element: <AdminCourses /> },
      { path: "/admin/course-sets", element: <AdminCourseSets /> },
      { path: "/admin/requisites", element: <AdminRequisites /> },
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
