'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false, trickleSpeed: 100 })

export default function RouteProgress() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const originalPush = router.push

    router.push = ((...args: Parameters<typeof router.push>) => {
      NProgress.start()

      startTransition(() => {
        originalPush(...args)
      })

      return
    }) as typeof router.push

    return () => {
      router.push = originalPush
    }
  }, [router, startTransition])

  useEffect(() => {
    if (!isPending) {
      NProgress.done()
    }
  }, [isPending])

  return null
}
