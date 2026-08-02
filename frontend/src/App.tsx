import "./App.css";
import { Routes, Route } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import Layout from "./layout/layout";
import Home from "./components/home/Home";
import Dashboard from "./components/dashboard/Dashboard";
import { AuthProvider } from "./auth/AuthContext";
import ProjectPage from "./components/dashboard/ProjectPage";
import ServicePage from "./components/dashboard/ServicePage";
import Settings from "./components/settings/SettingPage";
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsOfService from "./components/legal/TermsOfService";
import LoginPage from "./components/auth/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthProvider>
              <Layout>
                <Dashboard />
              </Layout>
            </AuthProvider>
          }
        />
        <Route
          path="/project/:id"
          element={
            <AuthProvider>
              <Layout>
                <ProjectPage />
              </Layout>
            </AuthProvider>
          }
        />
        <Route
          path="/service/:id"
          element={
            <AuthProvider>
              <Layout>
                <ServicePage />
              </Layout>
            </AuthProvider>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthProvider>
              <Layout>
                <Settings />
              </Layout>
            </AuthProvider>
          }
        />
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/privacy"
          element={
            <Layout>
              <PrivacyPolicy />
            </Layout>
          }
        />
        <Route
          path="/terms"
          element={
            <Layout>
              <TermsOfService />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
