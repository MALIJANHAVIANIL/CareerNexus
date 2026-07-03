import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token and user exist in local storage on load
    const cnToken = localStorage.getItem("cn_token");
    const cnUser = localStorage.getItem("cn_user");
    if (cnToken && cnUser) {
      setToken(cnToken);
      try {
        setUser(JSON.parse(cnUser));
      } catch (e) {
        localStorage.removeItem("cn_token");
        localStorage.removeItem("cn_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login(credentials);
      if (result.success) {
        setUser(result.user);
        setToken(result.token);
      }
      return result.user;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerStudent = async (studentData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.registerStudent(studentData);
      return result.user;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerAlumni = async (alumniData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.registerAlumni(alumniData);
      return result.user;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerHR = async (hrData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.registerHR(hrData);
      return result.user;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    registerStudent,
    registerAlumni,
    registerHR,
    logout,
    updateProfileState,
    isAuthenticated: !!token,
    role: user?.role || null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export default AuthContext;
