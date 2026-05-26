// Authentication utility functions

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const logout = () => {
  clearAuthToken();
  // You may want to redirect to login page here
  window.location.href = '/';
};
