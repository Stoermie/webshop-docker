import axios from 'axios';
axios.defaults.baseURL = 'http://192.168.178.122:8001';
axios.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default axios;
