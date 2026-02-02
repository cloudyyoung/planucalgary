import { Link, Outlet, useLocation } from 'react-router-dom'

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


export const App = () => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <Outlet />
      </SidebarProvider>
    </>
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
    title: "Requisites Jsons",
    url: "admin/requisites-jsons",
  },
  {
    title: "Catalog Queue",
    url: "admin/queues/catalog",
  },
]

export const AppSidebar = () => {
  const location = useLocation();

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
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.url, 1)} className='data-[active=true]:bg-green-600/10 data-[active=true]:text-green-800'>
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
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.url, 1)} className='data-[active=true]:bg-green-600/10 data-[active=true]:text-green-800'>
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