import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Departments from "./components/Departments";
import Home from "./components/Home";
import StudentofDept from "./components/StudentofDept";
import Students from "./components/Students";

function AppRoutes() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      children: [
        {
          path: "/department",
          element: <Departments />,
        },
        {
          path: "/department/:departmentId/students",
          element: <StudentofDept />,
        },
        {
          path: "/student",
          element: <Students />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

function App() {
  return <AppRoutes />;
}

export default App;
