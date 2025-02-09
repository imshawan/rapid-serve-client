import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface CountUpAnimationProps {
  end: number;
  duration?: number;
}

export function CountUpAnimation({ end, duration = 2000 }: CountUpAnimationProps) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [end, duration, inView]);

  return <span ref={ref}>{count}</span>;
}