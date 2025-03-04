// bloglist-frontend/src/services/blogs.js
import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = async () => {
  const config = { headers: { Authorization: token } }
  const response = await axios.get(baseUrl, config)
  return response.data
}

const create = async newObject => {
  const config = { headers: { Authorization: token } }
  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = async (id, updatedBlog) => {
  const config = { headers: { Authorization: token } }
  const response = await axios.put(`${baseUrl}/${id}`, updatedBlog, config)
  // Fetch full blog with populated user to ensure name
  return response.data
}

const remove = async (id) => {
  const config = { headers: { Authorization: token } }
  await axios.delete(`${baseUrl}/${id}`, config)

  const updatedBlogs = await axios.get(baseUrl, config)
  return updatedBlogs.data
}

export default { getAll, setToken, create, update, remove }