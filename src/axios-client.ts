import axios from "axios"

const API_URL = "https://mapi.mobilelegends.com"
export const ax = axios.create({
  baseURL: API_URL,
})
