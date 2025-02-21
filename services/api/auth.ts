import { http } from "@/lib/api/http";
import { endpoints } from "./endpoints";

export const auth = {

  login: async (email: string, password: string) => {
    return await http.post(endpoints.LOG_IN, { email, password })
  },
  logOut: async () => {
    return await http.post(endpoints.LOG_OUT, {})
  }
}