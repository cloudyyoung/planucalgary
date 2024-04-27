import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite } from "flowbite-react";

import './index.css'

import { Home } from '@pages'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

const theme: CustomFlowbiteTheme = {
  button: {
    "color": {
      "info": "bg-primary text-white",
    },
    "pill": {
      "off": "rounded-md",
      "on": "rounded-full"
    },
  },
};


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Flowbite theme={{ theme: theme }}>
      <RouterProvider router={router} />
    </Flowbite>
  </React.StrictMode>,
)
