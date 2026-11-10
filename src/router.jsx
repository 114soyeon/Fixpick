import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Fix from "./pages/Fix";
import Calendar from "./pages/Calendar";
import Report from "./pages/Report";
import Setting from "./pages/Setting";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FixDetail from "./pages/FixDetail";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "fix", element: <Fix /> },
      { path: "calendar", element: <Calendar /> },
      { path: "report", element: <Report /> },
      { path: "setting", element: <Setting /> },
{ path: "fix/:id", element: <FixDetail /> }
    ],
  },
]);

export default router;