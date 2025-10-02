/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const decodedToken = jwtDecode(JSON.parse(storedUser).token);
        if (decodedToken.exp * 1000 < Date.now()) {
          authService.logout();
          setUser(null);
        } else {
          setUser(decodedToken.user);
        }
      }
    } catch (error) {
      console.error("Failed to process user from local storage", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (userData) => {
    const response = await authService.login(userData);
    const decodedToken = jwtDecode(response.token);
    setUser(decodedToken.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}