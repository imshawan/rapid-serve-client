import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { auth } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface GoogleAuthButtonProps {
  onLoginSuccess: () => void;
}

export default function GoogleAuthButton({ onLoginSuccess }: GoogleAuthButtonProps) {
  const { onLoginSuccess: onCompleteLogin } = useAuth()
  const handleLogin = async (response: any) => {
    const googleToken = response.credential;

    try {
      const res = await auth.googleLogin(googleToken)
      if (!res.success || !res.data) {
        throw new Error(res.error?.message || "An error occurred while logging in with Google")
      }
      if (res.data instanceof Error) {
        throw res.data
      }

      toast({
        title: "Success",
        description: res.data?.message || "Welcome back!",
      })
      onCompleteLogin(res.data.user as any, res.data.token)
      onLoginSuccess && onLoginSuccess()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      })
    }
  }

  const onError = () => {
    toast({
      title: "Error",
      description: "An error occurred while logging in with Google",
      variant: "destructive"
    })
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <GoogleLogin
        onSuccess={handleLogin}
        onError={onError}
        text="signin"
        logo_alignment="center"
        useOneTap
        width={192}
      />
    </GoogleOAuthProvider>
  );
}
