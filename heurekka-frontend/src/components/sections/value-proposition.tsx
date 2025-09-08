'use client'

import { motion } from 'framer-motion'
import { 
  FileText, 
  Home, 
  Sparkles, 
  Users, 
  MessageSquare, 
  Shield,
  Clock,
  DollarSign,
  MapPin
} from 'lucide-react'
import { Container } from '@/components/common/container'
import { cn } from '@/lib/utils'

interface ValueCardProps {
  icon: React.ElementType
  title: string
  description: string
  benefits: string[]
  iconColor: string
  bgColor: string
  delay?: number
}

function ValueCard({ 
  icon: Icon, 
  title, 
  description, 
  benefits, 
  iconColor, 
  bgColor,
  delay = 0 
}: ValueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative p-6 rounded-2xl border border-neutral-200 bg-white",
        "hover:shadow-lg transition-shadow duration-300",
        "group"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        bgColor,
        "group-hover:scale-110 transition-transform duration-300"
      )}>
        <Icon className={cn("w-6 h-6", iconColor)} />
      </div>
      
      {/* Content */}
      <h3 className="text-xl font-bold text-neutral-900 mb-3">
        {title}
      </h3>
      
      <p className="text-neutral-600 mb-4 leading-relaxed">
        {description}
      </p>
      
      {/* Benefits list */}
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      
      {/* Decorative element */}
      <div className="absolute top-4 right-4 w-8 h-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-full h-full text-neutral-400" />
      </div>
    </motion.div>
  )
}

export function ValueProposition() {
  const values = [
    {
      icon: FileText,
      title: "Para Inquilinos",
      description: "Un perfil, múltiples consultas. Ahorra tiempo y encuentra mejores opciones.",
      benefits: [
        "Crea tu perfil una vez y reutilízalo",
        "Contacta múltiples propietarios al instante", 
        "Filtra propiedades que se ajusten a tu presupuesto",
        "Historial de conversaciones organizado"
      ],
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      delay: 0
    },
    {
      icon: Home,
      title: "Para Propietarios", 
      description: "Recibe inquilinos calificados con toda la información que necesitas.",
      benefits: [
        "Perfiles completos de inquilinos potenciales",
        "Ve presupuestos antes de responder",
        "Reduce tiempo en filtrar consultas no serias", 
        "Comunicación directa por WhatsApp"
      ],
      iconColor: "text-green-600",
      bgColor: "bg-green-100", 
      delay: 0.1
    },
    {
      icon: Sparkles,
      title: "Por qué HEUREKKA",
      description: "Plataforma 100% gratuita diseñada para el mercado hondureño.",
      benefits: [
        "Sin comisiones ni tarifas ocultas",
        "Integración completa con WhatsApp", 
        "Verificación de propiedades y usuarios",
        "Soporte en español las 24 horas"
      ],
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      delay: 0.2
    }
  ]

  const features = [
    {
      icon: MessageSquare,
      title: "WhatsApp Integrado", 
      description: "Comunícate directamente por la app que ya usas"
    },
    {
      icon: Shield,
      title: "Verificación Segura",
      description: "Propiedades y usuarios verificados para tu tranquilidad"
    },
    {
      icon: Clock,
      title: "Respuestas Rápidas", 
      description: "Tiempo promedio de respuesta de 15 minutos"
    },
    {
      icon: DollarSign,
      title: "100% Gratuito",
      description: "Sin comisiones, sin tarifas ocultas, completamente gratis"
    },
    {
      icon: MapPin,
      title: "Enfoque Local",
      description: "Especializado en el mercado inmobiliario hondureño"
    },
    {
      icon: Users,
      title: "Comunidad Activa",
      description: "Miles de usuarios activos buscando y ofreciendo propiedades"
    }
  ]

  return (
    <section className="py-16 sm:py-24 bg-neutral-50">
      <Container>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            ¿Por qué elegir{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              HEUREKKA?
            </span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Revolucionamos la búsqueda de vivienda en Honduras con tecnología 
            que ahorra tiempo tanto a inquilinos como propietarios.
          </p>
        </motion.div>

        {/* Main value propositions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {values.map((value, index) => (
            <ValueCard 
              key={index}
              {...value}
            />
          ))}
        </div>

        {/* Additional features grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
              Características que marcan la diferencia
            </h3>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Diseñamos cada funcionalidad pensando en las necesidades reales 
              del mercado inmobiliario hondureño.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-neutral-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
        >
          <h3 className="text-2xl font-bold text-neutral-900 mb-4">
            ¿Listo para cambiar tu experiencia inmobiliaria?
          </h3>
          <p className="text-neutral-600 mb-6 max-w-lg mx-auto">
            Únete a miles de usuarios que ya encontraron una mejor forma 
            de buscar y ofrecer propiedades.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200"
            >
              Empezar Ahora - Es Gratis
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors duration-200"
            >
              Ver Propiedades
            </motion.button>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}