// bloglist-frontend/src/services/blogs.js
import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null;

const setToken = newToken => {
  token = `Bearer ${newToken}`;
};

const getAll = async () => {
  const config = { headers: { Authorization: token } };
  const response = await axios.get(baseUrl, config);
  return response.data;
};

const create = async newObject => {
  const config = { headers: { Authorization: token } };
  const response = await axios.post(baseUrl, newObject, config);
  return response.data;
};

const update = async (id, blogObject) => {
  const config = { headers: { Authorization: token } };
  const response = await axios.put(`${baseUrl}/${id}`, blogObject, config);
  // Fetch full blog with populated user to ensure name
  const fullBlog = await axios.get(`${baseUrl}/${id}`, config);
  return fullBlog.data; // Return full blog with user details
};

const remove = async (id) => {
  const config = { headers: { Authorization: token } };
  await axios.delete(`${baseUrl}/${id}`, config);
};

export default { getAll, setToken, create, update, remove };