import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Flowbite } from "flowbite-react";

import './index.css'

import { Navbar } from '@components';
import { Programs, Terms } from '@pages'
import theme from './theme'

const router = createBrowserRouter([
  {
    path: "/programs",
    element: <Programs />,
  },
  {
    path: "/terms",
    element: <Terms />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Flowbite theme={{ theme: theme }}>
      <div className='flex flex-col h-screen w-screen'>
        <Navbar />
        <RouterProvider router={router} />
      </div>
    </Flowbite>
  </React.StrictMode>,
)
