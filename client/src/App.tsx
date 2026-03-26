
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Link,
  Outlet,
  useLocation,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import 'react18-json-view/src/style.css'

import './index.css'

import { queryClient } from './trpc'

import { Courses } from '@/pages/courses/Courses'
import { AdminCourses } from './pages/admin/AdminCourses'
import { AdminCourseSets } from './pages/admin/AdminCourseSets'
import { AdminSubjects } from './pages/admin/AdminSubjects'
import { AdminDepartments } from './pages/admin/AdminDepartments'
import { AdminFaculties } from './pages/admin/AdminFaculties'
import { AdminPrograms } from './pages/admin/AdminPrograms'
import { AdminRequisiteSets } from './pages/admin/AdminRequisiteSets'
import { AdminRequisiteRules } from './pages/admin/AdminRequisiteRules'
import { AdminFieldsOfStudy } from './pages/admin/AdminFieldsOfStudy'
import AdminCatalogQueue from './pages/admin/AdminCatalogQueue'


const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "courses", element: <Courses /> },
      { path: "admin/courses", element: <AdminCourses /> },
      { path: "admin/course-sets", element: <AdminCourseSets /> },
      { path: "admin/requisite-sets", element: <AdminRequisiteSets /> },
      { path: "admin/requisite-rules", element: <AdminRequisiteRules /> },
      { path: "admin/fields-of-study", element: <AdminFieldsOfStudy /> },
      { path: "admin/subjects", element: <AdminSubjects /> },
      { path: "admin/departments", element: <AdminDepartments /> },
      { path: "admin/faculties", element: <AdminFaculties /> },
      { path: "admin/programs", element: <AdminPrograms /> },
      { path: "admin/queues/catalog", element: <AdminCatalogQueue /> },
    ],
  }
])

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <Outlet />
    </SidebarProvider>
  )
}


export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

const menuItems = [
  {
    title: "Courses",
    url: "courses",
  },
]

const adminMenuItems = [
  {
    title: "Courses",
    url: "admin/courses",
  },
  {
    title: "Course Sets",
    url: "admin/course-sets",
  },
  {
    title: "Requisite Sets",
    url: "admin/requisite-sets",
  },
  {
    title: "Requisite Rules",
    url: "admin/requisite-rules",
  },
  {
    title: "Fields of Study",
    url: "admin/fields-of-study",
  },
  {
    title: "Subjects",
    url: "admin/subjects",
  },
  {
    title: "Departments",
    url: "admin/departments",
  },
  {
    title: "Faculties",
    url: "admin/faculties",
  },
  {
    title: "Programs",
    url: "admin/programs",
  },
  {
    title: "Catalog Queue",
    url: "admin/queues/catalog",
  },
]

export const AppSidebar = () => {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plan Ucalgary</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.url, 1)} className='data-[active=true]:bg-primary/10 data-[active=true]:text-primary'>
                    <Link to={item.url}>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.url, 1)} className='data-[active=true]:bg-primary/10 data-[active=true]:text-primary'>
                    <Link to={item.url}>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}