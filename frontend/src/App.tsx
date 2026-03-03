import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AddDepartment from "./components/AddDepartment";
import AddStudent from "./components/AddStudent";
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
          path: "/department/add",
          element: <AddDepartment />,
        },
        {
          path: "/department/edit/:departmentId",
          element: <AddDepartment />,
        },
        {
          path: "/department/:departmentId/students",
          element: <StudentofDept />,
        },
        {
          path: "/student",
          element: <Students />,
        },
        {
          path: "/student/add",
          element: <AddStudent />,
        },
        {
          path: "/student/edit/:studentId",
          element: <AddStudent />,
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
