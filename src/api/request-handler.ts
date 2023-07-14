import axios, { AxiosResponse, Method } from "axios";
import Constants from "expo-constants";

export function request<T = any, D = any>(
  url: string,
  method: Method,
  data?: D
) {
  console.debug("request", { url, method, data });
  return axios.request<T, AxiosResponse<T>, D>({
    url,
    method,
    headers: {
      Authorization: `Bearer ${Constants.expoConfig?.extra?.apiKey}`,
      apikey: `${Constants.expoConfig?.extra?.apiKey}`,
      "Content-Type": "application/json",
    },
    data,
  });
}
