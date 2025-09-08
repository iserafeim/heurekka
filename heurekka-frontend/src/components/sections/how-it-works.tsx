'use client'

import { motion } from 'framer-motion'
import { UserPlus, Search, MessageCircle, ArrowRight, CheckCircle } from 'lucide-react'
import { Container } from '@/components/common/container'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StepProps {
  step: number
  icon: React.ElementType
  title: string
  description: string
  details: string[]
  ctaText: string
  ctaAction: () => void
  delay?: number
  isLast?: boolean
}

function ProcessStep({ 
  step, 
  icon: Icon, 
  title, 
  description, 
  details, 
  ctaText, 
  ctaAction,
  delay = 0,
  isLast = false
}: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className="relative"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
        {/* Step indicator */}
        <div className="flex items-center gap-4 lg:flex-col lg:gap-2 flex-shrink-0">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-blue-200 shadow">
              <span className="text-xs font-bold text-blue-600">{step}</span>
            </div>
          </div>
          
          {/* Connecting line */}
          {!isLast && (
            <div className="hidden lg:block w-px h-24 bg-gradient-to-b from-blue-300 to-purple-300 mt-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              {title}
            </h3>
            <p className="text-lg text-neutral-600 mb-4">
              {description}
            </p>
          </div>

          {/* Details list */}
          <ul className="space-y-2">
            {details.map((detail, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: delay + 0.1 + (index * 0.1) }}
                className="flex items-start gap-3 text-neutral-700"
              >
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{detail}</span>
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.3 }}
            className="pt-4"
          >
            <Button
              onClick={ctaAction}
              className="group"
              variant={step === 1 ? "primary" : "outline"}
            >
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile connecting line */}
      {!isLast && (
        <div className="lg:hidden w-px h-8 bg-gradient-to-b from-blue-300 to-purple-300 ml-8 mt-4" />
      )}
    </motion.div>
  )
}

export function HowItWorks() {
  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: "Crea Tu Perfil de Búsqueda",
      description: "Comparte tu información una sola vez y ahorra tiempo en futuras búsquedas.",
      details: [
        "Completa tus preferencias: ubicación, presupuesto, fecha de mudanza",
        "Agrega información personal para que los propietarios te conozcan",
        "Selecciona tus métodos de comunicación preferidos",
        "Todo tu perfil se guarda de forma segura y privada"
      ],
      ctaText: "Crear Perfil Gratuito",
      ctaAction: () => {
        // Navigate to profile creation
        if (typeof window !== 'undefined') {
          window.location.href = '/profile/create'
        }
      }
    },
    {
      step: 2,
      icon: Search,
      title: "Busca y Explora Propiedades",
      description: "Encuentra propiedades que coincidan perfectamente con tus criterios.",
      details: [
        "Busca por ubicación, tipo de propiedad o características específicas",
        "Filtra resultados por precio, número de habitaciones y amenidades",
        "Ve fotos, descripciones detalladas y ubicación en mapa",
        "Guarda tus propiedades favoritas para revisarlas después"
      ],
      ctaText: "Explorar Propiedades",
      ctaAction: () => {
        // Navigate to property search
        if (typeof window !== 'undefined') {
          window.location.href = '/search'
        }
      }
    },
    {
      step: 3,
      icon: MessageCircle,
      title: "Conecta por WhatsApp",
      description: "Comunícate directamente con propietarios usando la app que ya conoces.",
      details: [
        "Tu perfil se comparte automáticamente al contactar",
        "Los propietarios ven tu información antes de responder",
        "Conversaciones organizadas y fáciles de seguir",
        "Respuestas más rápidas porque propietarios ya conocen tus datos"
      ],
      ctaText: "Ver Cómo Funciona",
      ctaAction: () => {
        // Scroll to testimonials or open demo
        const testimonialsSection = document.getElementById('testimonials')
        if (testimonialsSection) {
          testimonialsSection.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  ]

  const handleGetStarted = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/profile/create'
    }
  }

  return (
    <section className="py-16 sm:py-24 bg-white" id="how-it-works">
      <Container>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            ¿Cómo funciona{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              HEUREKKA?
            </span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            En solo 3 pasos simples puedes empezar a encontrar tu hogar ideal 
            de manera más eficiente que nunca.
          </p>
        </motion.div>

        {/* Process steps */}
        <div className="space-y-12 sm:space-y-16 lg:space-y-20">
          {steps.map((step, index) => (
            <ProcessStep
              key={step.step}
              {...step}
              delay={index * 0.2}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Bottom CTA section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-20 text-center"
        >
          <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 sm:p-12 border border-blue-100">
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
              ¿Listo para empezar?
            </h3>
            <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
              Únete a cientos de usuarios que ya están ahorrando tiempo 
              y encontrando mejores propiedades con HEUREKKA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="xl"
                onClick={handleGetStarted}
                className="w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl"
              >
                Empezar Ahora - Gratis
              </Button>
              
              <div className="text-sm text-neutral-500 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Sin registro complicado • Solo toma 2 minutos
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
        >
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-2">2 min</div>
            <div className="text-sm text-neutral-600">Tiempo promedio para crear perfil</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-2">5x</div>
            <div className="text-sm text-neutral-600">Más rápido que métodos tradicionales</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-2">15 min</div>
            <div className="text-sm text-neutral-600">Tiempo promedio de respuesta</div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}