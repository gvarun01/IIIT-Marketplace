import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { useState, useEffect } from "react";

interface TokenPayload {
  exp: number;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const accessToken = Cookies.get("accessToken");
        console.log("Access token:", accessToken);
        console.log("Cookie names:", Object.keys(Cookies.get()));
        console.log("All cookies:", document.cookie);

        if (!accessToken) {
          const refreshToken = Cookies.get("refreshToken");
          if (!refreshToken) {
            setIsAuthenticated(false);
            setIsValidating(false);
            return;
          }

          // Try to refresh token
          const response = await axios.get("/api/users/refresh-token");
          Cookies.set("accessToken", response.data.data.accessToken, {
            expires: 7,
            path: "/",
            secure: true,
            sameSite: "strict",
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
