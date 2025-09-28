'use client'

import { useState, useEffect } from 'react'

export function useTextShuffle(words: string[], interval: number = 2500) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length)
        setIsAnimating(false)
      }, 150) // Short fade duration

    }, interval)

    return () => clearInterval(timer)
  }, [words.length, interval])

  return {
    currentWord: words[currentIndex],
    isAnimating
  }
}