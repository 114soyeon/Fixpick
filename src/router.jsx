import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Fix from "./pages/Fix";
import Calendar from "./pages/Calendar";
import Report from "./pages/Report";
import Setting from "./pages/Setting";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "fix", element: <Fix /> },
      { path: "calendar", element: <Calendar /> },
      { path: "report", element: <Report /> },
      { path: "setting", element: <Setting /> },
    ],
  },
]);

export default router;