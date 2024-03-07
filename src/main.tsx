import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import Icons from "./components/Icons.tsx";
import {createHashRouter, RouterProvider} from "react-router-dom";
import routes from './routing/routes.tsx'
const router = createHashRouter(routes)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App>
        <RouterProvider router={router} />
    </App>
    <Icons></Icons>
  </React.StrictMode>,
)
