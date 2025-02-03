import { useState, useEffect } from "react"

export default function useScreenSize() {
  const [screenSize, setScreenSize] = useState("xs")

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth

      if (width < 640) setScreenSize("xs")
      else if (width < 768) setScreenSize("sm")
      else if (width < 1024) setScreenSize("md")
      else if (width < 1280) setScreenSize("lg")
      else if (width < 1536) setScreenSize("xl")
      else setScreenSize("2xl")
    }

    updateScreenSize() // Run on mount
    window.addEventListener("resize", updateScreenSize)

    return () => window.removeEventListener("resize", updateScreenSize)
  }, [])

  // Helper function to check if the screen matches a specific size
  const isScreen = (size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl") => screenSize === size

  return { screenSize, isScreen }
}
