import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkLoggedIn, getUser } from "../redux/apis/userApis";
import { LinearProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { SET_USER, selectAuthenticated } from "../redux/reducers/userReducer";

interface AuthContextProps {
  children: React.ReactNode;
}

const AuthContext = createContext<boolean>(false);

const AuthProvider = ({ children }: AuthContextProps) => {
  const [loading, setLoading]     = useState(true);
  const navigate                  = useNavigate();
  const dispatch                  = useAppDispatch();
  const authenticated             = useAppSelector(selectAuthenticated);

  useEffect(() => {
    const verify = async () => {
      // Check if the HttpOnly session cookie is still valid
      const res = await checkLoggedIn();

      if (res.status === 200 && res.data) {
        // Hydrate basic info from the /checkLogin payload
        const { id, email, firstName, lastName } = (res.data as { user: { id: string; email: string; firstName: string; lastName: string } }).user;
        dispatch(SET_USER({ id, email, firstName, lastName }));

        // Fetch full profile (imgUrl, providers, etc.)
        const profileRes = await getUser();
        if (profileRes.status === 200 && profileRes.data) {
          const u = (profileRes.data as { user: { firstName: string; lastName: string; email: string; imgUrl: string; providers: string[] } }).user;
          dispatch(SET_USER({ firstName: u.firstName, lastName: u.lastName, email: u.email, imgUrl: u.imgUrl, providers: u.providers }));
        }
      } else {
        navigate("/login", { replace: true });
      }

      setLoading(false);
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <LinearProgress
        sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, height: 2 }}
      />
    );
  }

  return (
    <AuthContext.Provider value={authenticated}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
