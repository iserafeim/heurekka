'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HeroHeader } from "@/components/header"
import { Sparkle } from 'lucide-react'
import { SearchBar } from '@/components/search/search-bar'
import type { HeroSectionProps, Suggestion } from '@/types/homepage'

export function HeroSection({ 
  onSearch
}: HeroSectionProps) {
  const [searchValue, setSearchValue] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

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
          <div className="py-20 md:py-36">
            <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
              <div>
                <Link
                  href="#"
                  className="hover:bg-muted/50 mx-auto flex w-fit items-center justify-center gap-2 rounded-lg py-1 pl-1.5 pr-4 transition-colors duration-200">
                  <div
                    aria-hidden
                    className="bg-primary relative flex size-5 items-center justify-center rounded shadow-sm">
                    <Sparkle className="size-3 fill-primary-foreground stroke-primary-foreground" />
                  </div>
                  <span className="font-medium text-foreground">Presentamos Búsqueda Inteligente</span>
                </Link>
                <h1 className="mx-auto mt-8 max-w-4xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900">Encuentra tu Nuevo Hogar</h1>
                <p className="text-gray-600 mx-auto my-6 max-w-2xl text-balance text-lg leading-relaxed">Descubre miles de propiedades en alquiler en Honduras con nuestra plataforma inteligente.</p>


                {/* Search bar integration */}
                <div className="max-w-2xl mx-auto">
                  <SearchBar
                    onSearch={handleSearch}
                    value={searchValue}
                    onChange={setSearchValue}
                    suggestions={suggestions}
                    loading={isLoadingSuggestions}
                    placeholder="Buscar por ubicación o nombre de propiedad"
                    className="mx-auto"
                  />
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 mx-auto max-w-5xl px-6">
                <div className="mt-12 md:mt-16">
                  <div className="bg-background rounded-lg relative mx-auto overflow-hidden border border-transparent shadow-lg shadow-black/10 ring-1 ring-black/10">
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
        </section>
      </main>
    </>
  )
}