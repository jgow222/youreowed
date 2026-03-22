/**
 * YoureOwed — Simple i18n System
 * Supports 'en' (English) and 'es' (Spanish) locales.
 *
 * Usage:
 *   const { t, locale, setLocale } = useI18n();
 *   t('nav.dashboard') → "Dashboard" | "Panel de control"
 *
 * Wrap your app in <I18nProvider> (to be done in App.tsx by the integration agent).
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ─── Locale type ─────────────────────────────────────────────────────────────

export type Locale = "en" | "es";

// ─── Translation dictionary type ─────────────────────────────────────────────

type TranslationValue = string;

interface TranslationDict {
  [key: string]: TranslationValue | TranslationDict | string[];
}

// ─── English translations ─────────────────────────────────────────────────────

const en: TranslationDict = {
  // Navigation
  nav: {
    dashboard: "Dashboard",
    benefitFinder: "Benefit Finder",
    household: "Household",
    news: "News",
    assistant: "AI Assistant",
    pricing: "Pricing",
    enterprise: "For Organizations",
    partners: "Partner Program",
    signIn: "Sign in",
    signOut: "Sign out",
    account: "Account",
  },

  // Dashboard
  dashboard: {
    welcomeBack: "Welcome back",
    heroHeadline: "You might be leaving",
    heroHighlight: "thousands on the table.",
    heroSubtext:
      "The average household qualifies for $5,000–$50,000+ per year in government benefits they never claim. Let's find yours in 2 minutes.",
    heroCta: "Check what you're owed",
    programsChecked: "programs we check",
    statesCovered: "states covered",
    potentialPerYear: "potential per year",
    latestChanges: "Latest changes",
    seeAll: "See all",
    runScreening: "Run your screening",
    screeningSubtext: "Takes 2 minutes. 100% private.",
    askAI: "Ask the AI",
    askAISubtext: "\"How do I apply for SNAP?\"",
    yourHousehold: "Your household",
    householdSubtext: "members — add more for better results",
    policyUpdates: "Policy updates",
    policySubtext: "Rules change. Stay ahead.",
    newBadge: "New",
  },

  // Screener steps
  screener: {
    stepOf: "Step {current} of {total}",
    back: "Back",
    next: "Next",
    submitting: "Calculating...",
    seeResults: "See My Results",
    step1: {
      title: "Where do you live?",
      subtitle: "State programs vary significantly. We need your location to check all available programs.",
      state: "State",
      selectState: "Select your state",
      zipCode: "ZIP Code",
      zipPlaceholder: "e.g. 90210",
    },
    step2: {
      title: "About You",
      subtitle: "Tell us a bit about yourself so we can match you to the right programs.",
      age: "Your age",
      agePlaceholder: "e.g. 35",
      maritalStatus: "Marital status",
      single: "Single",
      married: "Married",
      divorced: "Divorced / Separated",
      widowed: "Widowed",
      pregnant: "I am currently pregnant",
      student: "I am currently a student",
      educationLevel: "Highest education level",
      lessThanHighSchool: "Less than high school",
      highSchool: "High school diploma / GED",
      someCollege: "Some college",
      bachelors: "Bachelor's degree",
      graduate: "Graduate degree",
    },
    step3: {
      title: "Your Household",
      subtitle: "Benefits are calculated based on the total number of people in your home.",
      householdSize: "Total people in household (including yourself)",
      childrenUnder18: "Number of children under 18",
      childrenUnder5: "Number of children under 5",
      elderlyMember: "Someone in my household is 65 or older",
    },
    step4: {
      title: "Income & Finances",
      subtitle: "Most benefits are income-based. We never store this information.",
      monthlyIncome: "Gross monthly household income",
      incomePlaceholder: "e.g. 2500",
      incomeFromWork: "Monthly income from employment",
      employmentIncomePlaceholder: "e.g. 2000",
      otherIncome: "I have other income sources (Social Security, pension, etc.)",
      totalAssets: "Total assets (savings, investments)",
      assetsPlaceholder: "e.g. 10000",
      filedTaxes: "I filed federal taxes last year",
    },
    step5: {
      title: "Employment",
      subtitle: "Employment status affects eligibility for many programs.",
      employmentStatus: "Current employment status",
      employed: "Employed full-time",
      partTime: "Employed part-time",
      selfEmployed: "Self-employed",
      unemployed: "Unemployed",
      retired: "Retired",
      unableToWork: "Unable to work",
      recentlyLostJob: "I recently lost my job (within 6 months)",
    },
    step6: {
      title: "Health & Disability",
      subtitle: "Health information helps us find Medicaid, CHIP, and disability programs.",
      hasHealthInsurance: "I currently have health insurance",
      insuranceType: "Insurance type",
      employer: "Employer-sponsored",
      medicaid: "Medicaid",
      medicare: "Medicare",
      marketplace: "Marketplace / ACA plan",
      privateOther: "Private / Other",
      hasDisability: "I have a disability recognized by the government",
      hasChronicCondition: "I have a chronic health condition",
      hasVeteranStatus: "I am a veteran or active duty military",
    },
    step7: {
      title: "Housing & Other",
      subtitle: "Housing status affects many programs including housing assistance and utilities.",
      housingStatus: "Current housing situation",
      own: "I own my home",
      rent: "I rent",
      subsidized: "I live in subsidized / public housing",
      homeless: "I am experiencing homelessness",
      withFamily: "I live with family / friends",
      hasHighUtilityBills: "I have high utility or energy bills",
      receivingBenefits: "I currently receive government benefits",
    },
    review: {
      title: "Review Your Information",
      subtitle: "Please review your answers before we calculate your results.",
      editStep: "Edit",
      location: "Location",
      aboutYou: "About You",
      household: "Household",
      income: "Income & Finances",
      employment: "Employment",
      health: "Health & Disability",
      housing: "Housing & Other",
    },
  },

  // Results page
  results: {
    title: "Your Results",
    subtitle: "Based on your answers, here are the programs you may qualify for.",
    likelyEligible: "Likely Eligible",
    possiblyEligible: "Possibly Eligible",
    unlikelyEligible: "Unlikely Eligible",
    estimatedValue: "Estimated annual value",
    estimatedValueShort: "Est. value",
    applyNow: "Apply Now",
    learnMore: "Learn More",
    shareResults: "Share Results",
    downloadPDF: "Download PDF",
    runNewScreening: "Run New Screening",
    totalEstimated: "Total Estimated Benefits",
    programsFound: "programs found",
    noResults: "No matching programs found.",
    noResultsSubtext: "Try adjusting your answers or contact us for help.",
    paywall: {
      title: "Unlock All Results",
      subtitle: "You're seeing a preview. Subscribe to see all {count} programs and estimated dollar amounts.",
      cta: "See All Results",
      features: [
        "Full screening (415+ programs)",
        "Estimated dollar amounts",
        "Application guides",
        "AI assistant",
      ],
    },
  },

  // Pricing page
  pricing: {
    title: "Simple, Transparent Pricing",
    subtitle: "Screen for 415+ federal and state programs. Find benefits you're missing.",
    monthly: "Monthly",
    annual: "Annual",
    twoMonthsFree: "2 months free",
    currentPlan: "Current Plan",
    getBasic: "Get Basic",
    getPro: "Get Pro",
    getFamily: "Get Family",
    mostPopular: "Most Popular",
    perMonth: "/mo",
    perYear: "/yr",
    setupFee: "one-time setup",
    saveVsMonthly: "Save vs monthly",
    forOrganizations: "For Organizations",
    contactSales: "Contact Sales",
    startingAt: "Starting at",
  },

  // Common UI
  common: {
    signIn: "Sign In",
    signOut: "Sign Out",
    subscribe: "Subscribe",
    cancel: "Cancel",
    save: "Save",
    next: "Next",
    back: "Back",
    submit: "Submit",
    loading: "Loading...",
    error: "An error occurred. Please try again.",
    required: "This field is required.",
    invalidEmail: "Please enter a valid email address.",
    invalidPhone: "Please enter a valid phone number.",
    success: "Success!",
    close: "Close",
    openMenu: "Open menu",
    theme: "Theme",
    language: "Language",
    english: "English",
    spanish: "Spanish",
    yes: "Yes",
    no: "No",
    learnMore: "Learn More",
    getStarted: "Get Started",
    contactUs: "Contact Us",
    freeTrial: "Free Trial",
    perMonth: "per month",
    annually: "annually",
    or: "or",
    and: "and",
  },

  // Error messages
  errors: {
    generic: "Something went wrong. Please try again.",
    network: "Network error. Check your connection and try again.",
    notFound: "Page not found.",
    unauthorized: "You must be signed in to access this page.",
    paymentFailed: "Payment failed. Please check your card details.",
    formValidation: "Please fix the errors above before continuing.",
    requiredField: "This field is required.",
    invalidEmail: "Please enter a valid email address.",
    invalidZip: "Please enter a valid 5-digit ZIP code.",
    invalidAge: "Please enter a valid age (1–120).",
    invalidIncome: "Please enter a valid income amount.",
  },

  // Paywall
  paywall: {
    title: "Upgrade to See All Results",
    subtitle: "You've used your free screening. Subscribe to unlock all {count}+ programs and estimated dollar amounts.",
    feature1: "Full screening (415+ programs)",
    feature2: "Estimated dollar amounts for each benefit",
    feature3: "State-specific programs",
    feature4: "AI assistant to help you apply",
    cta: "Unlock Full Results",
    dismiss: "Maybe later",
    alreadySubscribed: "Already subscribed? Sign in",
  },

  // Footer
  footer: {
    rights: "© {year} YoureOwed. All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact",
    disclaimer:
      "YoureOwed is a screening tool for directional guidance only. Results do not constitute a guarantee of eligibility or benefits.",
    createdWith: "Created with Perplexity Computer",
  },

  // Partner program page
  partners: {
    heroBadge: "Partner Program",
    heroTitle: "Help Your Clients Get Every Dollar They're Owed",
    heroSubtitle:
      "YoureOwed for Organizations gives your team powerful tools to screen clients for 415+ government benefit programs.",
    heroCta: "Get Started",
    heroSecondary: "Schedule a Demo",
    pricing: {
      title: "Plans & Pricing",
      subtitle: "Choose the plan that fits your organization's size and needs.",
      community: "Community",
      professional: "Professional",
      enterprise: "Enterprise",
      mostPopular: "Most Popular",
      perMonth: "/mo",
      getCommunity: "Get Started",
      getProfessional: "Get Professional",
      getEnterprise: "Contact Sales",
    },
    features: {
      title: "Everything Your Team Needs",
      subtitle: "Purpose-built tools for social workers, case managers, and benefits counselors.",
      bulkScreening: "Bulk Screening",
      bulkScreeningDesc: "Screen multiple clients at once with our batch import tool.",
      clientManagement: "Client Management",
      clientManagementDesc: "Track applications and follow-ups across your entire caseload.",
      customReports: "Custom Reports",
      customReportsDesc: "Generate branded PDF reports for clients to take to their appointments.",
      teamDashboard: "Team Dashboard",
      teamDashboardDesc: "See your team's screening activity, stats, and case load in one view.",
      dataExport: "Data Export",
      dataExportDesc: "Export all client screenings as CSV or PDF for reporting and compliance.",
      apiAccess: "API Access",
      apiAccessDesc: "Integrate with your existing case management system via REST API.",
    },
    useCases: {
      title: "Who Uses YoureOwed for Organizations",
      subtitle: "Trusted by teams across the social services sector.",
      socialWorkers: "Social Workers",
      socialWorkersDesc:
        "Screen clients during intake to maximize benefits access. Our tool checks 415+ programs in under 2 minutes.",
      nonprofits: "Nonprofits",
      nonprofitsDesc:
        "Connect your community to every dollar they're owed. Track outcomes and demonstrate impact to funders.",
      communityHealth: "Community Health Centers",
      communityHealthDesc:
        "Screen patients for Medicaid, CHIP, and financial assistance programs at the point of care.",
      legalAid: "Legal Aid Organizations",
      legalAidDesc:
        "Help clients access benefits they're entitled to as part of comprehensive legal services.",
    },
    testimonials: {
      title: "What Organizations Are Saying",
      subtitle: "Join hundreds of organizations helping their clients access more benefits.",
    },
    contact: {
      title: "Get Started Today",
      subtitle: "Fill out the form below and our team will be in touch within one business day.",
      orgName: "Organization Name",
      orgNamePlaceholder: "e.g. Community Action Agency",
      contactName: "Contact Name",
      contactNamePlaceholder: "Your full name",
      email: "Work Email",
      emailPlaceholder: "you@organization.org",
      phone: "Phone Number",
      phonePlaceholder: "(555) 000-0000",
      orgType: "Organization Type",
      orgTypePlaceholder: "Select your organization type",
      message: "Message",
      messagePlaceholder: "Tell us about your organization and how we can help...",
      submit: "Send Message",
      success: "Message sent! We'll be in touch within one business day.",
      successTitle: "Message Sent!",
    },
  },
};

// ─── Spanish translations ─────────────────────────────────────────────────────

const es: TranslationDict = {
  // Navegación
  nav: {
    dashboard: "Panel de control",
    benefitFinder: "Buscador de beneficios",
    household: "Mi familia",
    news: "Noticias",
    assistant: "Asistente IA",
    pricing: "Precios",
    enterprise: "Para organizaciones",
    partners: "Programa de socios",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    account: "Mi cuenta",
  },

  // Panel de control
  dashboard: {
    welcomeBack: "Bienvenido de nuevo",
    heroHeadline: "Podrías estar perdiendo",
    heroHighlight: "miles de dólares.",
    heroSubtext:
      "El hogar promedio califica para $5,000–$50,000+ al año en beneficios gubernamentales que nunca reclama. Encontremos los tuyos en 2 minutos.",
    heroCta: "Ver lo que te deben",
    programsChecked: "programas que revisamos",
    statesCovered: "estados cubiertos",
    potentialPerYear: "potencial por año",
    latestChanges: "Últimos cambios",
    seeAll: "Ver todo",
    runScreening: "Iniciar evaluación",
    screeningSubtext: "Toma 2 minutos. 100% privado.",
    askAI: "Pregunta a la IA",
    askAISubtext: "\"¿Cómo solicito SNAP?\"",
    yourHousehold: "Tu familia",
    householdSubtext: "miembros — agrega más para mejores resultados",
    policyUpdates: "Actualizaciones de política",
    policySubtext: "Las reglas cambian. Mantente al día.",
    newBadge: "Nuevo",
  },

  // Pasos del cuestionario
  screener: {
    stepOf: "Paso {current} de {total}",
    back: "Atrás",
    next: "Siguiente",
    submitting: "Calculando...",
    seeResults: "Ver mis resultados",
    step1: {
      title: "¿Dónde vives?",
      subtitle: "Los programas estatales varían significativamente. Necesitamos tu ubicación para revisar todos los programas disponibles.",
      state: "Estado",
      selectState: "Selecciona tu estado",
      zipCode: "Código postal",
      zipPlaceholder: "p. ej. 90210",
    },
    step2: {
      title: "Sobre ti",
      subtitle: "Cuéntanos un poco sobre ti para emparejarte con los programas adecuados.",
      age: "Tu edad",
      agePlaceholder: "p. ej. 35",
      maritalStatus: "Estado civil",
      single: "Soltero/a",
      married: "Casado/a",
      divorced: "Divorciado/a / Separado/a",
      widowed: "Viudo/a",
      pregnant: "Actualmente estoy embarazada",
      student: "Actualmente soy estudiante",
      educationLevel: "Nivel educativo más alto",
      lessThanHighSchool: "Menos que bachillerato",
      highSchool: "Diploma de bachillerato / GED",
      someCollege: "Algo de universidad",
      bachelors: "Licenciatura",
      graduate: "Posgrado",
    },
    step3: {
      title: "Tu familia",
      subtitle: "Los beneficios se calculan según el total de personas en tu hogar.",
      householdSize: "Total de personas en el hogar (incluyéndote a ti)",
      childrenUnder18: "Número de hijos menores de 18 años",
      childrenUnder5: "Número de hijos menores de 5 años",
      elderlyMember: "Alguien en mi hogar tiene 65 años o más",
    },
    step4: {
      title: "Ingresos y finanzas",
      subtitle: "La mayoría de los beneficios se basan en ingresos. Nunca guardamos esta información.",
      monthlyIncome: "Ingreso mensual bruto del hogar",
      incomePlaceholder: "p. ej. 2500",
      incomeFromWork: "Ingreso mensual del empleo",
      employmentIncomePlaceholder: "p. ej. 2000",
      otherIncome: "Tengo otras fuentes de ingreso (Seguro Social, pensión, etc.)",
      totalAssets: "Total de activos (ahorros, inversiones)",
      assetsPlaceholder: "p. ej. 10000",
      filedTaxes: "Presenté impuestos federales el año pasado",
    },
    step5: {
      title: "Empleo",
      subtitle: "El estado laboral afecta la elegibilidad para muchos programas.",
      employmentStatus: "Estado laboral actual",
      employed: "Empleado a tiempo completo",
      partTime: "Empleado a tiempo parcial",
      selfEmployed: "Trabajador independiente",
      unemployed: "Desempleado/a",
      retired: "Jubilado/a",
      unableToWork: "No puedo trabajar",
      recentlyLostJob: "Recientemente perdí mi trabajo (en los últimos 6 meses)",
    },
    step6: {
      title: "Salud y discapacidad",
      subtitle: "La información de salud nos ayuda a encontrar Medicaid, CHIP y programas de discapacidad.",
      hasHealthInsurance: "Actualmente tengo seguro médico",
      insuranceType: "Tipo de seguro",
      employer: "Seguro del empleador",
      medicaid: "Medicaid",
      medicare: "Medicare",
      marketplace: "Plan del Mercado / ACA",
      privateOther: "Privado / Otro",
      hasDisability: "Tengo una discapacidad reconocida por el gobierno",
      hasChronicCondition: "Tengo una condición de salud crónica",
      hasVeteranStatus: "Soy veterano/a o militar en servicio activo",
    },
    step7: {
      title: "Vivienda y otros",
      subtitle: "El estado de vivienda afecta muchos programas, incluida la asistencia de vivienda y servicios públicos.",
      housingStatus: "Situación de vivienda actual",
      own: "Soy propietario/a de mi hogar",
      rent: "Rento",
      subsidized: "Vivo en vivienda subsidiada / pública",
      homeless: "Estoy experimentando falta de vivienda",
      withFamily: "Vivo con familiares / amigos",
      hasHighUtilityBills: "Tengo facturas altas de servicios públicos o energía",
      receivingBenefits: "Actualmente recibo beneficios gubernamentales",
    },
    review: {
      title: "Revisa tu información",
      subtitle: "Por favor revisa tus respuestas antes de calcular tus resultados.",
      editStep: "Editar",
      location: "Ubicación",
      aboutYou: "Sobre ti",
      household: "Familia",
      income: "Ingresos y finanzas",
      employment: "Empleo",
      health: "Salud y discapacidad",
      housing: "Vivienda y otros",
    },
  },

  // Resultados
  results: {
    title: "Tus resultados",
    subtitle: "Según tus respuestas, estos son los programas para los que podrías calificar.",
    likelyEligible: "Probablemente elegible",
    possiblyEligible: "Posiblemente elegible",
    unlikelyEligible: "Poco probable",
    estimatedValue: "Valor anual estimado",
    estimatedValueShort: "Val. est.",
    applyNow: "Solicitar ahora",
    learnMore: "Saber más",
    shareResults: "Compartir resultados",
    downloadPDF: "Descargar PDF",
    runNewScreening: "Nueva evaluación",
    totalEstimated: "Total de beneficios estimados",
    programsFound: "programas encontrados",
    noResults: "No se encontraron programas que coincidan.",
    noResultsSubtext: "Intenta ajustar tus respuestas o contáctanos para obtener ayuda.",
    paywall: {
      title: "Desbloquea todos los resultados",
      subtitle: "Estás viendo una vista previa. Suscríbete para ver los {count} programas y los montos estimados en dólares.",
      cta: "Ver todos los resultados",
      features: [
        "Evaluación completa (415+ programas)",
        "Montos estimados en dólares",
        "Guías de solicitud",
        "Asistente de IA",
      ],
    },
  },

  // Precios
  pricing: {
    title: "Precios simples y transparentes",
    subtitle: "Evalúa más de 415 programas federales y estatales. Encuentra los beneficios que te faltan.",
    monthly: "Mensual",
    annual: "Anual",
    twoMonthsFree: "2 meses gratis",
    currentPlan: "Plan actual",
    getBasic: "Obtener Basic",
    getPro: "Obtener Pro",
    getFamily: "Obtener Family",
    mostPopular: "Más popular",
    perMonth: "/mes",
    perYear: "/año",
    setupFee: "configuración única",
    saveVsMonthly: "Ahorro vs mensual",
    forOrganizations: "Para organizaciones",
    contactSales: "Contactar ventas",
    startingAt: "Desde",
  },

  // Elementos comunes de la interfaz
  common: {
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    subscribe: "Suscribirse",
    cancel: "Cancelar",
    save: "Guardar",
    next: "Siguiente",
    back: "Atrás",
    submit: "Enviar",
    loading: "Cargando...",
    error: "Ocurrió un error. Por favor, inténtalo de nuevo.",
    required: "Este campo es obligatorio.",
    invalidEmail: "Por favor, ingresa un correo electrónico válido.",
    invalidPhone: "Por favor, ingresa un número de teléfono válido.",
    success: "¡Éxito!",
    close: "Cerrar",
    openMenu: "Abrir menú",
    theme: "Tema",
    language: "Idioma",
    english: "Inglés",
    spanish: "Español",
    yes: "Sí",
    no: "No",
    learnMore: "Saber más",
    getStarted: "Comenzar",
    contactUs: "Contáctanos",
    freeTrial: "Prueba gratuita",
    perMonth: "por mes",
    annually: "anualmente",
    or: "o",
    and: "y",
  },

  // Mensajes de error
  errors: {
    generic: "Algo salió mal. Por favor, inténtalo de nuevo.",
    network: "Error de red. Verifica tu conexión e inténtalo de nuevo.",
    notFound: "Página no encontrada.",
    unauthorized: "Debes iniciar sesión para acceder a esta página.",
    paymentFailed: "El pago falló. Por favor, verifica los datos de tu tarjeta.",
    formValidation: "Por favor, corrige los errores antes de continuar.",
    requiredField: "Este campo es obligatorio.",
    invalidEmail: "Por favor, ingresa un correo electrónico válido.",
    invalidZip: "Por favor, ingresa un código postal válido de 5 dígitos.",
    invalidAge: "Por favor, ingresa una edad válida (1–120).",
    invalidIncome: "Por favor, ingresa un monto de ingresos válido.",
  },

  // Muro de pago
  paywall: {
    title: "Actualiza para ver todos los resultados",
    subtitle: "Usaste tu evaluación gratuita. Suscríbete para desbloquear más de {count} programas y los montos estimados en dólares.",
    feature1: "Evaluación completa (415+ programas)",
    feature2: "Montos estimados en dólares para cada beneficio",
    feature3: "Programas específicos por estado",
    feature4: "Asistente de IA para ayudarte a solicitar",
    cta: "Desbloquear resultados completos",
    dismiss: "Quizás después",
    alreadySubscribed: "¿Ya estás suscrito? Inicia sesión",
  },

  // Pie de página
  footer: {
    rights: "© {year} YoureOwed. Todos los derechos reservados.",
    privacy: "Política de privacidad",
    terms: "Términos de servicio",
    contact: "Contacto",
    disclaimer:
      "YoureOwed es una herramienta de evaluación solo para orientación. Los resultados no constituyen una garantía de elegibilidad o beneficios.",
    createdWith: "Creado con Perplexity Computer",
  },

  // Página del programa de socios
  partners: {
    heroBadge: "Programa de socios",
    heroTitle: "Ayuda a tus clientes a obtener cada dólar que les deben",
    heroSubtitle:
      "YoureOwed para organizaciones le brinda a tu equipo herramientas poderosas para evaluar clientes en más de 415 programas de beneficios gubernamentales.",
    heroCta: "Comenzar",
    heroSecondary: "Programar una demostración",
    pricing: {
      title: "Planes y precios",
      subtitle: "Elige el plan que se adapte al tamaño y las necesidades de tu organización.",
      community: "Comunidad",
      professional: "Profesional",
      enterprise: "Empresarial",
      mostPopular: "Más popular",
      perMonth: "/mes",
      getCommunity: "Comenzar",
      getProfessional: "Obtener Profesional",
      getEnterprise: "Contactar ventas",
    },
    features: {
      title: "Todo lo que tu equipo necesita",
      subtitle: "Herramientas diseñadas para trabajadores sociales, gestores de casos y asesores de beneficios.",
      bulkScreening: "Evaluación masiva",
      bulkScreeningDesc: "Evalúa a varios clientes a la vez con nuestra herramienta de importación por lotes.",
      clientManagement: "Gestión de clientes",
      clientManagementDesc: "Realiza seguimiento de solicitudes y trámites en toda tu cartera de casos.",
      customReports: "Informes personalizados",
      customReportsDesc: "Genera informes PDF con tu marca para que los clientes lleven a sus citas.",
      teamDashboard: "Panel de equipo",
      teamDashboardDesc: "Visualiza la actividad de evaluación de tu equipo, estadísticas y carga de casos en una sola vista.",
      dataExport: "Exportación de datos",
      dataExportDesc: "Exporta todas las evaluaciones de clientes en formato CSV o PDF para informes y cumplimiento.",
      apiAccess: "Acceso a API",
      apiAccessDesc: "Integra con tu sistema existente de gestión de casos mediante API REST.",
    },
    useCases: {
      title: "Quién usa YoureOwed para organizaciones",
      subtitle: "De confianza para equipos de todo el sector de servicios sociales.",
      socialWorkers: "Trabajadores sociales",
      socialWorkersDesc:
        "Evalúa a los clientes durante la admisión para maximizar el acceso a beneficios. Nuestra herramienta revisa 415+ programas en menos de 2 minutos.",
      nonprofits: "Organizaciones sin fines de lucro",
      nonprofitsDesc:
        "Conecta a tu comunidad con cada dólar que les deben. Realiza seguimiento de resultados y demuestra impacto a los patrocinadores.",
      communityHealth: "Centros de salud comunitaria",
      communityHealthDesc:
        "Evalúa a los pacientes para Medicaid, CHIP y programas de asistencia financiera en el punto de atención.",
      legalAid: "Organizaciones de asistencia legal",
      legalAidDesc:
        "Ayuda a los clientes a acceder a los beneficios a los que tienen derecho como parte de servicios legales integrales.",
    },
    testimonials: {
      title: "Lo que dicen las organizaciones",
      subtitle: "Únete a cientos de organizaciones que ayudan a sus clientes a acceder a más beneficios.",
    },
    contact: {
      title: "Comienza hoy",
      subtitle: "Completa el formulario a continuación y nuestro equipo se pondrá en contacto en un día hábil.",
      orgName: "Nombre de la organización",
      orgNamePlaceholder: "p. ej. Agencia de acción comunitaria",
      contactName: "Nombre del contacto",
      contactNamePlaceholder: "Tu nombre completo",
      email: "Correo electrónico laboral",
      emailPlaceholder: "tu@organizacion.org",
      phone: "Número de teléfono",
      phonePlaceholder: "(555) 000-0000",
      orgType: "Tipo de organización",
      orgTypePlaceholder: "Selecciona el tipo de organización",
      message: "Mensaje",
      messagePlaceholder: "Cuéntanos sobre tu organización y cómo podemos ayudarte...",
      submit: "Enviar mensaje",
      success: "¡Mensaje enviado! Nos pondremos en contacto en un día hábil.",
      successTitle: "¡Mensaje enviado!",
    },
  },
};

// ─── Locale storage key ───────────────────────────────────────────────────────

const LOCALE_STORAGE_KEY = "youreowed_locale";

// ─── Flattening utility ───────────────────────────────────────────────────────

function flattenDict(
  dict: TranslationDict,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(dict)) {
    const value = dict[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (Array.isArray(value)) {
      // Arrays become indexed keys: key.0, key.1, etc.
      value.forEach((item, i) => {
        result[`${fullKey}.${i}`] = item;
      });
    } else if (typeof value === "object" && value !== null) {
      Object.assign(result, flattenDict(value as TranslationDict, fullKey));
    }
  }
  return result;
}

// Pre-flatten both locales at module load time for fast lookup
const flatEn = flattenDict(en);
const flatEs = flattenDict(es);

const translations: Record<Locale, Record<string, string>> = {
  en: flatEn,
  es: flatEs,
};

// ─── Interpolation helper ────────────────────────────────────────────────────

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  );
}

// ─── Translation function ─────────────────────────────────────────────────────

/**
 * Translate a dot-notation key to the current locale's string.
 * Falls back to English if the key is missing in the target locale.
 * Falls back to the key itself if not found in either locale.
 *
 * @param locale - The current locale ('en' | 'es')
 * @param key    - Dot-notation key, e.g. 'nav.dashboard'
 * @param vars   - Optional interpolation variables, e.g. { count: 10 }
 */
export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dict = translations[locale];
  const enDict = translations["en"];
  const raw = dict[key] ?? enDict[key] ?? key;
  return interpolate(raw, vars);
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate a key using the current locale */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({
  children,
  defaultLocale = "en",
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored === "en" || stored === "es") return stored;
    } catch {
      // localStorage may be unavailable in SSR or sandboxed environments
    }
    return defaultLocale;
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
    // Update the HTML lang attribute for accessibility
    try {
      document.documentElement.lang = newLocale;
    } catch {
      // ignore in SSR
    }
  }, []);

  const translate = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      return t(locale, key, vars);
    },
    [locale]
  );

  return React.createElement(
    I18nContext.Provider,
    { value: { locale, setLocale, t: translate } },
    children
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Full i18n hook — returns { t, locale, setLocale }.
 * Use this in components that need to translate strings.
 */
export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

/**
 * Convenience hook that returns just the translate function.
 * Equivalent to useI18n().t
 */
export function useTranslation(): (
  key: string,
  vars?: Record<string, string | number>
) => string {
  return useContext(I18nContext).t;
}

/**
 * Convenience hook to get and set the current locale.
 * Returns [locale, setLocale].
 */
export function useLocale(): [Locale, (locale: Locale) => void] {
  const { locale, setLocale } = useContext(I18nContext);
  return [locale, setLocale];
}
