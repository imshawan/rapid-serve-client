import { http } from "@/lib/api/http";
import { endpoints } from "./endpoints";

export const user = {

  register: async (name: string, email: string, password: string) => {
    return await http.post<any>(endpoints.REGISTER, { name, email, password })
  },

  updateProfile: async (data: Partial<IUser>) => {
    return await http.put<any>(endpoints.USER_PROFILE, data)
  },

  getUserProfile: async () => {
    return await http.get<any>(endpoints.USER_PROFILE)
  }
}