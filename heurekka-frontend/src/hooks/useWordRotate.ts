'use client'

import { useState, useEffect } from 'react'

export function useWordRotate(words: string[], interval: number = 2500) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRotating, setIsRotating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsRotating(true)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length)

        setTimeout(() => {
          setIsRotating(false)
        }, 300) // Duration for the rotation in
      }, 300) // Duration for the rotation out

    }, interval)

    return () => clearInterval(timer)
  }, [words.length, interval])

  return {
    currentWord: words[currentIndex],
    isRotating
  }
}