"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Github, EyeOff, Eye, Lock, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form"
import { useState } from "react"
import { useUser } from "@/hooks/use-user"
import GoogleAuthButton from "@/components/google-auth-button"
import { Separator } from "@/components/ui/separator"

// Validation schema
const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
	const router = useRouter()
	const { login } = useAuth()
	const { loadUserProfile } = useUser()
	const [showPassword, setShowPassword] = useState(false)

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	const onLoginSuccess = () => {
		router.push("/dashboard")
		loadUserProfile()
	}

	const handleLogin = async (data: LoginFormData) => {
		await new Promise((resolve) => {
			login(data, (success: boolean) => {
				if (success) {
					onLoginSuccess()
					// Resolve not required as we are moving to homepage
				} else {
					resolve(null)
				}
			})
		})
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<Card className="backdrop-blur-sm bg-card/50 border-border/50">
				<CardHeader className="space-y-1">
					<div className="flex items-center justify-center mb-2">
						<div className="p-3 rounded-full bg-primary/10">
							<Lock className="h-6 w-6 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl text-center">Welcome back</CardTitle>
					<CardDescription className="text-center">
						Sign in to your RapidServe account
					</CardDescription>
				</CardHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
						<CardContent className="space-y-4">
							{/* Email Field */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="name@company.com"
												{...field}
												className="bg-background/50"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Password Field */}
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="Enter your password"
													{...field}
													className="bg-background/50"
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
												>
													{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
												</button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex items-center justify-end">
								<Link
									href="/forgot-password"
									className="text-sm text-primary hover:underline"
								>
									Forgot password?
								</Link>
							</div>

							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Signing in...
									</>
								) : (
									"Sign in"
								)}
							</Button>

							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<Separator className="w-full" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background/50 backdrop-blur-sm px-2 text-muted-foreground">
										Or continue with
									</span>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<Button variant="outline" type="button">
									<Github className="mr-2 h-4 w-4" />
									Github
								</Button>
								<GoogleAuthButton onLoginSuccess={onLoginSuccess} />
							</div>
						</CardContent>

						<CardFooter className="flex flex-col space-y-4">
							<div className="text-sm text-muted-foreground text-center">
								Don"t have an account?{" "}
								<Link href="/signup" className="text-primary hover:underline">
									Create an account
								</Link>
							</div>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	)
}