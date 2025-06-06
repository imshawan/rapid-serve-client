import { http } from "@/lib/api/http";
import { endpoints } from "./endpoints";
import { User } from "@/lib/models/user";

export const auth = {

  login: async (email: string, password: string) => {
    return await http.post(endpoints.LOG_IN, { email, password }) as ApiResponse<{token: string, user: User}>
  },
  logOut: async () => {
    return await http.post(endpoints.LOG_OUT, {})
  },
  googleLogin: async (token: string) => {
    return await http.post(endpoints.LOG_IN_GOOGLE, { token }) as ApiResponse<{token: string, user: User, message: string}>
  },

  sendForgotPasswordEmail: async (email: string) => {
    return await http.post(endpoints.FORGOT_PASSWORD, { email }) as ApiResponse<{message: string}>
  },

  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    return await http.post(endpoints.RESET_PASSWORD, { token, password, confirmPassword }) as ApiResponse
  },
}