import { useRouter } from "next/navigation";

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
      {withIcon ? <div className="mr-1">
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
          width="512.000000pt" height="260.000000pt" viewBox="0 0 512.000000 260.000000" className="h-8 w-8 fill-black dark:fill-white"
          preserveAspectRatio="xMidYMid meet">

          <g transform="translate(0.000000,260.000000) scale(0.100000,-0.100000)"
            className="bg-dark" stroke="none">
            <path d="M2742 2572 c7 -10 287 -299 621 -642 334 -343 606 -626 605 -630 -2
-4 -282 -292 -623 -639 -341 -348 -621 -637 -623 -642 -2 -5 204 -9 530 -9
l533 0 211 213 c116 116 401 407 633 646 l422 434 -123 126 c-68 69 -350 359
-627 644 l-504 517 -534 0 c-517 0 -534 -1 -521 -18z"/>
            <path d="M797 2319 c-80 -42 -97 -154 -35 -225 40 -46 87 -56 229 -52 130 3
151 12 197 79 32 46 27 126 -9 165 -41 45 -77 54 -216 54 -109 -1 -134 -4
-166 -21z"/>
            <path d="M1564 2320 c-104 -52 -110 -180 -10 -254 27 -21 38 -21 491 -21 453
0 464 0 491 21 44 32 66 68 71 115 6 58 -20 107 -72 136 -40 23 -42 23 -485
23 -426 0 -447 -1 -486 -20z"/>
            <path d="M174 1709 c-72 -21 -117 -106 -95 -178 15 -51 71 -101 114 -101 18 0
356 0 752 0 812 1 759 -5 803 80 38 74 11 154 -63 190 -40 19 -63 20 -761 19
-395 0 -733 -5 -750 -10z"/>
            <path d="M2125 1706 c-51 -23 -77 -60 -83 -117 -6 -64 16 -110 67 -142 l36
-22 465 3 c438 4 467 5 496 23 91 56 82 194 -16 246 -43 23 -44 23 -489 23
-349 -1 -453 -4 -476 -14z"/>
            <path d="M1264 1061 c-17 -10 -40 -31 -52 -46 -30 -37 -30 -115 -1 -162 38
-61 47 -62 360 -63 311 -1 304 -3 353 64 30 39 29 120 -1 162 -43 61 -62 64
-360 64 -245 0 -271 -2 -299 -19z"/>
            <path d="M2302 1060 c-92 -56 -98 -189 -11 -251 31 -22 35 -22 381 -22 391 1
374 -2 426 74 45 65 14 167 -62 203 -29 14 -80 16 -368 16 -315 0 -335 -1
-366 -20z"/>
            <path d="M1704 400 c-32 -13 -72 -67 -80 -106 -9 -48 19 -118 59 -146 32 -23
35 -23 369 -23 324 0 338 1 364 21 49 36 68 70 68 123 0 56 -20 93 -67 121
-30 19 -52 20 -362 19 -181 0 -339 -4 -351 -9z"/>
          </g>
        </svg>
      </div> : ""}
      <div className="text-xl font-bold m-auto">Rapid<span className="text-blue-600">Serve</span></div>
    </div>
  )
}