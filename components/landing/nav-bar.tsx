import { navBarLinks } from "@/common/meta";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Logo } from "../logo";

export function NavigationBar() {
  const router = useRouter();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex items-center space-x-6">
            {navBarLinks.map((link, i) => <a key={i * 1.2} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href={link.href}>{link.label}</a>)}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              size="lg"
              variant={"ghost"}
              className=" transition-all duration-300 hover:scale-105 hidden md:flex"
              onClick={() => router.push("/login")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}