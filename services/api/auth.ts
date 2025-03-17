import { http } from "@/lib/api/http";
import { endpoints } from "./endpoints";
import { User } from "@/lib/models/user";

export const auth = {

  login: async (email: string, password: string) => {
    return await http.post(endpoints.LOG_IN, { email, password }) as ApiResponse<{token: string, user: User}>
  },
  logOut: async () => {
    return await http.post(endpoints.LOG_OUT, {})
  }
}