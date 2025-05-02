import axios from 'axios';

// KEINE globale baseURL setzen!
axios.defaults.baseURL = ''; 

// Token-Interceptor kannst du behalten
axios.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default axios;
