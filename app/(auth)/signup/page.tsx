
import { features } from '@/common/meta'
import { SignupForm } from '@/components/auth/signup-form'
import { BrandIcon } from "@/components/brand-icon"

export default function SignupPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Branding */}
          <div className="space-y-8 p-8">
            <div className="flex items-center space-x-3">
              <BrandIcon iconClassname="h-12 w-12 text-primary" textClassname="text-4xl ml-0 font-bold" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold">
                Join the future of content delivery
              </h2>
              <p className="text-muted-foreground text-lg">
                Create your account and start delivering content at lightning speed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map(feature => (
                <div key={feature.title} className="flex items-center space-x-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card/60 transition-all duration-300 cursor-pointer">
                  <feature.icon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Signup Form */}
          <SignupForm />
        </div>
      </div>
    </div>
  )
}