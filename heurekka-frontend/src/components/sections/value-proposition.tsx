'use client'

export function ValueProposition() {
  const features = [
    {
      title: "Un perfil para todo",
      description: "Crea tu perfil una sola vez. Los propietarios reciben toda tu información automáticamente cuando los contactas.",
      mockup: "📝", // Placeholder - se puede reemplazar con imagen real
      bgColor: "from-blue-100 to-blue-50"
    },
    {
      title: "Conexión directa por WhatsApp",
      description: "Sin intermediarios ni plataformas complicadas. Habla directamente con propietarios por WhatsApp.",
      mockup: "💬", // Placeholder - se puede reemplazar con imagen real  
      bgColor: "from-green-100 to-green-50"
    },
    {
      title: "Completamente gratuito",
      description: "Nunca pagarás comisiones. Ni tarifas ocultas. Ni suscripciones. Heurekka es y será siempre gratis.",
      mockup: "🆓", // Placeholder - se puede reemplazar con imagen real
      bgColor: "from-purple-100 to-purple-50"
    }
  ]

  return (
    <section className="section-spacing bg-white">
      <div className="container-wide">
        {/* Header with tagline structure like Cluely */}
        <div className="text-center mb-16">
          <div className="text-primary text-lg font-medium mb-4">
            Simplificamos la búsqueda
          </div>
          <h2 className="text-display max-w-4xl mx-auto">
            Ahorra tiempo. Encuentra mejores opciones. Sin complicaciones.
          </h2>
        </div>

        {/* Three feature cards with mockups */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              {/* Mockup card */}
              <div className={`w-full h-64 lg:h-80 rounded-2xl bg-gradient-to-br ${feature.bgColor} flex items-center justify-center mb-6 border border-gray-100 shadow-sm`}>
                <div className="text-8xl lg:text-9xl opacity-50">
                  {feature.mockup}
                </div>
              </div>
              
              {/* Title and description */}
              <h3 className="text-title mb-4 text-left lg:text-center">
                <strong>{feature.title.split(' ')[0]} {feature.title.split(' ')[1]}</strong> {feature.title.split(' ').slice(2).join(' ')}
              </h3>
              
              <p className="text-body text-muted-foreground text-left lg:text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}