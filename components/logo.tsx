import { useRouter } from "next/navigation";
import { BrandIcon } from "./brand-icon";

interface LogoProps {
  withIcon?: boolean
  clickRedirection?: string | null
}

export function Logo({withIcon=true, clickRedirection="/"}: LogoProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!clickRedirection) return;
    router.push(clickRedirection);
  };

  return (
    <div className="flex cursor-pointer" onClick={handleClick}>
      <BrandIcon className="mr-1" withIcon={withIcon} />
    </div>
  )
}