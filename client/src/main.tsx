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
import { AdminRequisitesJsons } from './pages/admin/AdminRequisitesJsons';
import { AdminCourseSets } from './pages/admin/AdminCourseSets';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminFaculties } from './pages/admin/AdminFaculties';
import { AdminPrograms } from './pages/admin/AdminPrograms';
import { AdminRequisiteSets } from './pages/admin/AdminRequisiteSets';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/courses", element: <Courses /> },
      { path: "/requisite-sets", element: <AdminRequisiteSets /> },
      { path: "/admin/courses", element: <AdminCourses /> },
      { path: "/admin/course-sets", element: <AdminCourseSets /> },
      { path: "/admin/requisite-sets", element: <AdminRequisiteSets /> },
      { path: "/admin/subjects", element: <AdminSubjects /> },
      { path: "/admin/departments", element: <AdminDepartments /> },
      { path: "/admin/faculties", element: <AdminFaculties /> },
      { path: "/admin/programs", element: <AdminPrograms /> },
      { path: "/admin/requisites-jsons", element: <AdminRequisitesJsons /> },
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
