import axios from 'axios'

//server address
const api = axios.create({
  baseURL: 'http://localhost:3006/api'
})

//get the error message sent by the server
export const errorMessage = (error) =>
  error?.response?.data?.message || 'Something went wrong. Please try again.'

export default api
