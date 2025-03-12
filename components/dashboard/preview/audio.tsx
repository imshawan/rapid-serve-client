import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import WaveSurfer from "wavesurfer.js"
import {
  Play, Pause, Volume2, VolumeX, Loader,
  FastForward, Rewind, Download, Share2, Settings, Music2
} from "lucide-react"
import { cn, objectUrlToBlob } from "@/lib/utils/common"
import { File } from "@/lib/models/upload"
import { getMediaCoverArt, formatPlaybackTime } from "@/lib/utils/audio"
import { ICommonTagsResult } from "music-metadata"

interface AudioProps {
  file?: File
  data?: string
  mimeType?: string
}

export default function Audio({ file, data }: AudioProps) {
  const waveRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [volume, setVolume] = useState(0.75)
  const [speed, setSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [commons, setCommons] = useState<Partial<Omit<ICommonTagsResult, "picture">> & { picture: string } | null>(null)
  const [coverLoading, setCoverLoading] = useState(true)

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const defaultCover = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?" + new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: "300",
    q: "40",
  }).toString()

  const formattedTime = useMemo(() => formatPlaybackTime(currentTime), [currentTime])
  const formattedDuration = useMemo(() => formatPlaybackTime(duration), [duration])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.playPause()
    setIsPlaying((prev) => !prev)
  }, [])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) audioRef.current.setVolume(newVolume)
  }

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed)
    if (audioRef.current) audioRef.current.setPlaybackRate(newSpeed)
    setShowSpeedMenu(false)
  }

  const skip = (seconds: number) => {
    if (!audioRef.current) return
    const currentTime = audioRef.current.getCurrentTime()
    audioRef.current.setTime(currentTime + seconds)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = String(data)
    link.download = String(file?.fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (!waveRef.current || !data) return

    const wavesurfer = WaveSurfer.create({
      container: waveRef.current,
      waveColor: "#94a3b8",
      progressColor: "#3b82f6",
      cursorColor: "#60a5fa",
      barWidth: 2,
      barGap: 3,
      height: 96,
      normalize: true,
      barRadius: 3,
      minPxPerSec: 0,
      fillParent: true,
    })

    wavesurfer.load(data)
    audioRef.current = wavesurfer

    wavesurfer.on("ready", () => {
      setLoading(false)
      wavesurfer.setVolume(volume)
      wavesurfer.setPlaybackRate(speed)
      setDuration(wavesurfer.getDuration())
    })

    wavesurfer.on("audioprocess", () => {
      setCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on("finish", () => setIsPlaying(false))

    // Keyboard controls
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        togglePlay()
      } else if (e.code === "ArrowLeft") {
        skip(-5)
      } else if (e.code === "ArrowRight") {
        skip(5)
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    objectUrlToBlob(data).then(blob => {
      getMediaCoverArt(blob).then(common => {
        if (!common || !common.picture) {
          throw new Error("No cover art found")
        }
        setCommons(common)
        setCoverLoading(false)
      }).catch(e => {
        setCommons({ picture: defaultCover })
        setCoverLoading(false)
      })
    }).catch(() => {
      setCommons({ picture: defaultCover })
      setCoverLoading(false)
    })

    return () => {
      wavesurfer.destroy()
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [data])


  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-gray-800 flex items-center justify-between">
        <div className="flex w-full items-center space-x-3 sm:space-x-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 flex items-center justify-center">
            <img src={commons?.picture} />
          </div>
          <div className="w-[8rem] sm:w-full truncate">
            <div className="flex w-full items-center space-x-2">
              <h1 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate w-full">
                {commons?.album} {commons?.artist ? ((commons?.album ? " by " : "") + commons?.artist) : ""}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate w-full">
              {commons?.genre?.length ? commons?.genre?.join(",  ") : commons?.year}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Download"
          >
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 px-0 sm:py-12">
        {/* File Info */}
        <div className="w-full max-w-6xl text-center mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 px-4 truncate">
            {commons?.title || file?.fileName}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            {formattedTime} / {formattedDuration}
          </p>
        </div>

        {/* Waveform */}
        <div className="w-full max-w-6xl relative mb-6 sm:mb-12">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 animate-spin" />
            </div>
          ) : null}
          <div ref={waveRef} className="w-full cursor-pointer [&::-webkit-scrollbar]:hidden" />
        </div>

        {/* Controls */}
        <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-center sm:justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Skip Backward */}
            <button
              onClick={() => skip(-10)}
              className="p-2 sm:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Skip 10s backward"
            >
              <Rewind className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Play/Pause */}
            <button
              className="p-4 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-lg transition transform hover:scale-105"
              onClick={togglePlay}
            >
              {isPlaying ?
                <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> :
                <Play className="w-6 h-6 sm:w-8 sm:h-8" />
              }
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skip(10)}
              className="p-2 sm:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Skip 10s forward"
            >
              <FastForward className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Volume Control */}
            <div className="relative">
              <button
                className="p-2 sm:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              // onMouseEnter={() => setShowVolumeSlider(true)}
              // onMouseLeave={() => setShowVolumeSlider(false)}
              >
                {volume > 0 ? (
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {showVolumeSlider && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
                // onMouseEnter={() => setShowVolumeSlider(true)}
                // onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 sm:w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer 
    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black/80 dark:[&::-webkit-slider-thumb]:bg-white/80
    [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full 
    [&::-moz-range-thumb]:bg-black/80 dark:[&::-moz-range-thumb]:bg-white/80"
                  />

                </div>
              )}
            </div>

            {/* Speed Control */}
            <div className="relative">
              <button
                className="p-2 sm:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300 mr-1" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{speed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
                  {speedOptions.map((option) => (
                    <button
                      key={option}
                      className={cn(
                        "block w-full px-4 py-2 text-left rounded-md text-sm",
                        speed === option
                          ? "bg-blue-500 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      )}
                      onClick={() => changeSpeed(option)}
                    >
                      {option}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}