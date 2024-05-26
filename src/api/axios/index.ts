import axios from "axios";

export const appAxios = axios.create({
  timeout: 5000
});
