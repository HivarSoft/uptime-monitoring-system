import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkLoggedIn, getUser } from "../redux/apis/userApis";
import { LinearProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { SET_USER_PROFILE, selectUser } from "../redux/reducers/userReducer";

interface AuthContextProps {
  children: React.ReactNode;
}

const AuthContext = createContext<boolean>(false);

const AuthProvider = ({ children }: AuthContextProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        navigate("/", { replace: true });
        return;
      }

      const res = await checkLoggedIn();
      if (res.status === 200) {
        setIsAuthenticated(true);
        if (!user.firstName) {
          const profileRes = await getUser();
          if (profileRes.status === 200 && profileRes.data) {
            dispatch(SET_USER_PROFILE(profileRes.data.user));
          }
        }
      } else {
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      }
      setLoading(false);
    };

    verify();
  }, []);

  if (loading) {
    // Slim progress bar at the top of the page — navbar stays visible, no full-screen block
    return (
      <LinearProgress
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: 2,
        }}
      />
    );
  }

  return (
    <AuthContext.Provider value={isAuthenticated}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
