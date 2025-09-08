'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SearchBar } from '@/components/search/search-bar'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/common/container'
import { Check, Star, Users, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HeroSectionProps, Suggestion } from '@/types/homepage'

// Quick search pills for popular searches
function QuickSearchPills({ 
  searches, 
  onPillClick 
}: { 
  searches: string[]
  onPillClick: (search: string) => void 
}) {
  if (searches.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 justify-center">
      <span className="text-sm text-neutral-600 mr-2 hidden sm:inline">
        Búsquedas populares:
      </span>
      {searches.slice(0, 4).map((search) => (
        <Button
          key={search}
          variant="ghost"
          size="sm"
          onClick={() => onPillClick(search)}
          className="h-8 px-3 text-xs bg-white/80 hover:bg-white border border-neutral-200 rounded-full"
        >
          {search}
        </Button>
      ))}
    </div>
  )
}

// Trust indicators component
function TrustIndicators() {
  const indicators = [
    { icon: Check, text: 'Sin comisiones ocultas', color: 'text-green-600' },
    { icon: Users, text: '1,000+ usuarios activos', color: 'text-blue-600' },
    { icon: Home, text: '500+ propiedades', color: 'text-purple-600' },
    { icon: Star, text: 'Verificación garantizada', color: 'text-yellow-600' }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
    >
      {indicators.map((indicator, index) => (
        <div 
          key={index}
          className="flex items-center gap-2 text-sm text-neutral-700 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full"
        >
          <indicator.icon className={cn("w-4 h-4", indicator.color)} />
          <span className="hidden sm:inline">{indicator.text}</span>
          {/* Mobile: show only icons with abbreviated text */}
          <span className="sm:hidden text-xs">
            {indicator.text.split(' ')[0]}
          </span>
        </div>
      ))}
    </motion.div>
  )
}

export function HeroSection({ 
  onSearch, 
  popularSearches = [
    'Apartamento Tegucigalpa',
    'Casa Colonia Palmira', 
    'Con estacionamiento',
    '2 habitaciones'
  ],
  userLocation 
}: HeroSectionProps) {
  const [searchValue, setSearchValue] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  // Handle search submission
  const handleSearch = (query: typeof onSearch extends (arg: infer T) => any ? T : never) => {
    onSearch(query)
  }

  // Handle quick search pill clicks
  const handlePillClick = (searchTerm: string) => {
    setSearchValue(searchTerm)
    handleSearch({
      text: searchTerm,
      location: userLocation,
      timestamp: Date.now()
    })
  }

  // Handle create profile CTA
  const handleCreateProfile = () => {
    // This would navigate to the profile creation page
    if (typeof window !== 'undefined') {
      window.location.href = '/profile/create'
    }
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

      const timer = setTimeout(fetchSuggestions, 300)
      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
    }
  }, [searchValue])

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-50 blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-green-100 rounded-full opacity-30 blur-2xl animate-pulse delay-500" />
      
      <Container className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center space-y-8 max-w-4xl mx-auto"
        >
          {/* Main headline */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
              Encuentra tu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                hogar perfecto
              </span>
              {' '}en Honduras
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Crea un perfil una vez. Contacta múltiples propietarios. 
              Ahorra horas de conversaciones repetitivas.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <SearchBar
              onSearch={handleSearch}
              value={searchValue}
              onChange={setSearchValue}
              suggestions={suggestions}
              loading={isLoadingSuggestions}
              placeholder="Buscar por ubicación, tipo de propiedad o características..."
              className="mx-auto"
            />
            
            {/* Quick search pills */}
            <QuickSearchPills 
              searches={popularSearches}
              onPillClick={handlePillClick}
            />
          </motion.div>

          {/* CTA buttons */}
          <motion.div 
            variants={fadeInUp} 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="xl"
              onClick={handleCreateProfile}
              className="w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl"
            >
              Crear Perfil Gratuito
            </Button>
            
            <Button
              variant="outline"
              size="xl"
              onClick={() => handlePillClick('Ver todas las propiedades')}
              className="w-full sm:w-auto min-w-[200px] bg-white/80 backdrop-blur-sm hover:bg-white/90"
            >
              Explorar Propiedades
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <TrustIndicators />

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-neutral-200/50"
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>
              <div className="text-sm sm:text-base text-neutral-600">Propiedades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">15min</div>
              <div className="text-sm sm:text-base text-neutral-600">Respuesta Promedio</div>
            </div>
            <div className="text-center col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary">95%</div>
              <div className="text-sm sm:text-base text-neutral-600">Satisfacción</div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}