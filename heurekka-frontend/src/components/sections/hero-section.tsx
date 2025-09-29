'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { HeroHeader } from "@/components/header"
import { Sparkle } from 'lucide-react'
import { SearchBar } from '@/components/search/search-bar'
import { ShineBorder } from '@/registry/magicui/shine-border'
import { useTextShuffle } from '@/hooks/useTextShuffle'
import type { HeroSectionProps, Suggestion } from '@/types/homepage'

export function HeroSection({
  onSearch
}: HeroSectionProps) {
  const [searchValue, setSearchValue] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  // Text shuffle animation
  const { currentWord, isAnimating } = useTextShuffle(['Busca', 'Encuentra', 'Alquila'], 2500)

  // Handle search submission
  const handleSearch = (query: Parameters<typeof onSearch>[0]) => {
    onSearch(query)
  }


  // Fetch suggestions when search value changes
  useEffect(() => {
    if (searchValue.length > 1) {
      setIsLoadingSuggestions(true)
      
      const fetchSuggestions = async () => {
        try {
          const { apiClient } = await import('@/lib/trpc/simple-client')
          const suggestions = await apiClient.getSearchSuggestions(searchValue)
          setSuggestions(suggestions)
        } catch (error) {
          console.error('Failed to fetch suggestions:', error)
          setSuggestions([])
        } finally {
          setIsLoadingSuggestions(false)
        }
      }

      // Add safety timeout to prevent infinite loading
      const safetyTimeout = setTimeout(() => {
        setIsLoadingSuggestions(false)
      }, 5000)

      const timer = setTimeout(fetchSuggestions, 300)
      
      return () => {
        clearTimeout(timer)
        clearTimeout(safetyTimeout)
      }
    } else {
      setSuggestions([])
      setIsLoadingSuggestions(false)
    }
  }, [searchValue])

  return (
    <>
      <HeroHeader />
      <main>
        <section className="before:bg-background border-e-foreground relative overflow-hidden before:absolute before:inset-1 before:h-[calc(100%-8rem)] before:rounded-2xl sm:before:inset-2 md:before:rounded-[2rem] lg:before:h-[calc(100%-14rem)] bg-gradient-to-b from-gray-50 to-white">
          <div className="pt-32 pb-20 md:py-36">
            <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
              <div>
                {/* Mobile title - 2 lines */}
                <h1 className="mx-auto max-w-full px-4 text-[2.5rem] font-bold tracking-tight text-gray-900 leading-tight md:hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentWord}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="inline-block"
                    >
                      {currentWord}
                    </motion.span>
                  </AnimatePresence> 10x<br />
                  Más Rápido
                </h1>

                {/* Desktop title - 2 lines */}
                <h1 className="hidden md:block mx-auto max-w-5xl font-bold tracking-tight text-gray-900 leading-tight" style={{ fontSize: '6.5rem' }}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentWord}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="inline-block"
                    >
                      {currentWord}
                    </motion.span>
                  </AnimatePresence> 10x<br />
                  Más Rápido
                </h1>

                {/* Subtitle */}
                <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600">
                  La plataforma inteligente que conecta inquilinos y propietarios en segundos.
                </p>

                {/* Search bar integration */}
                <div className="max-w-lg mx-auto mt-12">
                  <SearchBar
                    onSearch={handleSearch}
                    value={searchValue}
                    onChange={setSearchValue}
                    suggestions={suggestions}
                    loading={isLoadingSuggestions}
                    placeholder="Buscar propiedades..."
                    className="mx-auto"
                  />
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 mx-auto max-w-5xl px-6">
                <div className="mt-12 md:mt-16">
                  <div className="relative w-full">
                    {/* Image container with shine border */}
                    <div className="relative overflow-hidden rounded-lg">
                      <ShineBorder 
                        shineColor={["#3B82F6", "#06B6D4", "#8B5CF6"]} 
                        duration={8}
                        borderWidth={2}
                        className="absolute inset-0"
                      />
                      <div className="relative bg-background border border-transparent shadow-lg shadow-black/10 ring-1 ring-black/10 rounded-lg overflow-hidden">
                        <Image
                          src="/heurekka-hero-preview.svg"
                          alt="Vista previa de la plataforma Heurekka mostrando búsqueda de propiedades"
                          width="2880"
                          height="1842"
                          priority
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
              
              {/* Fade overlay positioned outside overflow containers */}
              <div className="relative mt-[-12rem] md:mt-[-16rem] pointer-events-none z-10">
                <div className="h-48 md:h-64 bg-gradient-to-t from-gray-50 via-gray-50/80 via-gray-50/40 to-transparent" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}