import Sidebar from "./Sidebar.jsx";
import { Outlet } from "react-router";

const Layout = () => {
    return <>
    <Sidebar/>
    <Outlet />
    </>
}

export default Layout;