'use client'

export function HowItWorks() {
  const steps = [
    {
      title: "Crear",
      mockup: "👤", // Placeholder para perfil/formulario
      bgColor: "from-blue-400 to-blue-500"
    },
    {
      title: "Buscar", 
      mockup: "🏠", // Placeholder para búsqueda/listado
      bgColor: "from-blue-400 to-blue-500"
    },
    {
      title: "Conectar",
      mockup: "💬", // Placeholder para chat/WhatsApp
      bgColor: "from-blue-400 to-blue-500"
    }
  ]

  return (
    <section className="section-spacing bg-neutral-50/30">
      <div className="container-wide">
        {/* Header with side-by-side layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16 lg:mb-20">
          {/* Left side - Main title */}
          <div>
            <h2 className="text-display font-bold leading-tight">
              Cómo funciona
            </h2>
          </div>
          
          {/* Right side - Description */}
          <div className="flex items-center">
            <p className="text-subtitle">
              Heurekka simplifica todo el proceso de búsqueda de vivienda para inquilinos hondureños.
            </p>
          </div>
        </div>

        {/* Three large blue cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Large blue mockup card */}
              <div className={`w-full h-80 lg:h-96 rounded-3xl bg-gradient-to-br ${step.bgColor} flex items-center justify-center mb-8 shadow-lg`}>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12">
                  <div className="text-6xl lg:text-8xl text-white/90">
                    {step.mockup}
                  </div>
                </div>
              </div>
              
              {/* Simple title */}
              <h3 className="text-title text-muted-foreground font-medium">
                {step.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}