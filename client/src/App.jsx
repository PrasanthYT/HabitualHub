import { BrowserRouter } from "react-router-dom";
import AllRoutes from "./AllRoutes";
import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = sessionStorage.getItem("_token");
      if (token) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          sessionStorage.removeItem("_token");
          toast.info("Session expired. Please login again.");
          window.location.href = "/auth/signin";
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    // Initial check
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, []);
  return (
    <BrowserRouter>
      <ToastContainer />
      <AllRoutes />
    </BrowserRouter>
  );
}
