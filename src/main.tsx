import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Flowbite } from "flowbite-react";

import './index.css'

import { Home } from '@pages'
import theme from './theme'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Flowbite theme={{ theme: theme }}>
      <RouterProvider router={router} />
    </Flowbite>
  </React.StrictMode>,
)
