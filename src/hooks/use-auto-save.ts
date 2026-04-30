"use client"

import { useRef, useCallback, useEffect } from "react"

export function useAutoSave(saveFn: () => Promise<void>, delayMs = 2000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveFnRef = useRef(saveFn)
  const savingRef = useRef(false)
  const pendingRef = useRef(false)

  useEffect(() => {
    saveFnRef.current = saveFn
  })

  const trigger = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      if (savingRef.current) {
        pendingRef.current = true
        return
      }
      savingRef.current = true
      try {
        await saveFnRef.current()
      } finally {
        savingRef.current = false
        if (pendingRef.current) {
          pendingRef.current = false
          await saveFnRef.current()
        }
      }
    }, delayMs)
  }, [delayMs])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return trigger
}
