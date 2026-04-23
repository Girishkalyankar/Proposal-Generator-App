"use client"

import { useRef, useCallback, useEffect } from "react"

export function useAutoSave(saveFn: () => Promise<void>, delayMs = 2000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveFnRef = useRef(saveFn)
  saveFnRef.current = saveFn

  const trigger = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      saveFnRef.current()
    }, delayMs)
  }, [delayMs])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return trigger
}
