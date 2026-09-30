// Textos de la home. Todo lo que es promesa comercial está aquí para revisarlo en un solo sitio.

export const HERO = {
  eyebrow: "Consultoría · Marketing · IA",
  title: ["Ponle", "armadura", "a tu empresa."],
  lead:
    "Rovik une consultoría estratégica, marketing de captación y automatización con IA en un solo equipo. Encontramos dónde pierde tu empresa clientes, tiempo y margen, y montamos el sistema que la hace escalar sin depender de ti.",
  primary: { label: "Escanear mi empresa", href: "#rovik-ia" },
  secondary: { label: "Ver el protocolo", href: "#protocolo" },
  micro: ["7 preguntas", "Sin registro", "Informe al instante"],
  callouts: [
    { code: "01", label: "Núcleo", detail: "Estrategia" },
    { code: "02", label: "Propulsión", detail: "Captación" },
    { code: "03", label: "Copiloto", detail: "IA y automatización" },
    { code: "04", label: "Blindaje", detail: "Operaciones y datos" },
  ],
  audience:
    "Para empresas que ya venden y han tocado techo: servicios profesionales, construcción e industria, salud y estética, automoción y comercio.",
};

export const LEAKS = {
  code: "01",
  label: "Escaneo de daños",
  title: "Lo que frena a una empresa casi nunca es la falta de ganas.",
  lead: "Es un sistema con fugas. Estas son las cuatro que más encontramos cuando una empresa intenta crecer.",
  items: [
    {
      code: "Fuga 01",
      title: "Todo pasa por ti",
      text: "Ventas, presupuestos y decisiones dependen del fundador. El techo de la empresa es tu agenda.",
    },
    {
      code: "Fuga 02",
      title: "Captación a rachas",
      text: "Meses buenos y meses vacíos. Sin un canal predecible no puedes contratar ni invertir con tranquilidad.",
    },
    {
      code: "Fuga 03",
      title: "Operación manual",
      text: "Partes en papel, WhatsApp y hojas de cálculo. Horas que no se facturan y errores que se pagan.",
    },
    {
      code: "Fuga 04",
      title: "Decisiones a ciegas",
      text: "Sin números semanales, cada decisión es una intuición. Y la intuición no escala.",
    },
  ],
  close: "Cada fuga cuesta dinero todos los meses. El primer paso es medirlas.",
};

export const PROTOCOL = {
  code: "02",
  label: "Protocolo de ensamblaje",
  title: "Validar. Vender. Repetir. Automatizar. Escalar.",
  lead: "En ese orden. Casi todos empiezan por la tecnología; nosotros empezamos por lo que mete dinero en caja. Nunca automatizamos lo que todavía no vende.",
  phases: [
    {
      code: "01",
      verb: "Validar",
      name: "Diagnóstico",
      text: "Analizamos oferta, precios, márgenes, embudo y operación. Localizamos las fugas y las ordenamos por su impacto en caja.",
      deliverable: "Mapa de fugas y plan priorizado a 90 días",
      metric: "Coste de cada fuga en €/mes",
    },
    {
      code: "02",
      verb: "Vender",
      name: "Oferta y captación",
      text: "Afinamos la oferta hasta que se entienda en diez segundos y abrimos el canal con más retorno: web de conversión, campañas o prospección directa.",
      deliverable: "Embudo funcionando con los primeros contactos",
      metric: "Coste por oportunidad",
    },
    {
      code: "03",
      verb: "Repetir",
      name: "Sistema comercial",
      text: "Convertimos lo que funciona en proceso: guiones, seguimiento, CRM y una rutina semanal de números. Que venda el equipo, no solo tú.",
      deliverable: "Proceso comercial documentado y en marcha",
      metric: "Tasa de cierre",
    },
    {
      code: "04",
      verb: "Automatizar",
      name: "IA y automatización",
      text: "Solo entonces automatizamos: seguimientos, presupuestos, partes de trabajo, atención y documentos con IA.",
      deliverable: "Automatizaciones activas y medidas",
      metric: "Horas liberadas por semana",
    },
    {
      code: "05",
      verb: "Escalar",
      name: "Cuadro de mando",
      text: "Con el sistema estable, sumamos canales, equipo o mercados con un panel que avisa antes de que algo se rompa.",
      deliverable: "Plan de escalado y panel de control",
      metric: "Crecimiento con margen",
    },
  ],
};

export type ModuleId = "nucleo" | "propulsion" | "copiloto" | "blindaje";

export const MODULES = {
  code: "03",
  label: "Módulos",
  title: "Cuatro módulos. Un solo sistema.",
  lead: "Contratas lo que tu empresa necesita ahora. Todo encaja con lo que venga después.",
  items: [
    {
      id: "nucleo" as ModuleId,
      code: "M-01",
      name: "Núcleo",
      service: "Estrategia y consultoría de crecimiento",
      text: "Diagnóstico de negocio, oferta y precios, plan de crecimiento y acompañamiento a dirección. La pieza que decide hacia dónde va todo lo demás.",
      deliverables: [
        "Auditoría de negocio, márgenes y embudo",
        "Rediseño de oferta y precios",
        "Plan a 90 días con métricas por fase",
        "Sesiones de seguimiento con dirección",
      ],
      image: "modulo-nucleo",
      alt: "Núcleo luminoso del reactor Rovik: un hexágono de metal rodeado de un anillo de luz",
    },
    {
      id: "propulsion" as ModuleId,
      code: "M-02",
      name: "Propulsión",
      service: "Marketing y captación",
      text: "Webs que convierten, SEO, campañas en Google y Meta y contenido que atrae al cliente correcto. Empuje medible, no ruido.",
      deliverables: [
        "Web o landing orientada a conversión",
        "SEO técnico y local",
        "Campañas en Google Ads y Meta Ads",
        "Contenido y vídeo con producción automatizada",
      ],
      image: "modulo-propulsion",
      alt: "Anillo dorado mecanizado del reactor Rovik con su corona de dientes",
    },
    {
      id: "copiloto" as ModuleId,
      code: "M-03",
      name: "Copiloto",
      service: "Automatización e IA",
      text: "Asistentes, flujos y análisis de documentos con IA para que tu equipo dedique su tiempo a lo que factura.",
      deliverables: [
        "CRM y seguimiento automático de oportunidades",
        "Flujos entre tus herramientas (n8n y similares)",
        "Asistentes de IA para atención y ventas",
        "Análisis de documentos: presupuestos, pliegos, planos",
      ],
      image: "modulo-copiloto",
      alt: "Anillos holográficos cian orbitando alrededor del núcleo, la capa de inteligencia del sistema",
    },
    {
      id: "blindaje" as ModuleId,
      code: "M-04",
      name: "Blindaje",
      service: "Operaciones y datos",
      text: "Digitalizamos los procesos que hoy se pierden en papel y montamos los números que importan, para crecer sin perder el control.",
      deliverables: [
        "Partes, albaranes y control de horas en digital",
        "Cuadro de mando semanal",
        "Procesos documentados para el equipo",
        "Control de fugas de facturación",
      ],
      image: "modulo-blindaje",
      alt: "Placas de blindaje rojas y lacadas encajadas en anillo alrededor del núcleo",
    },
  ],
};

export type CaseKind = "Producto propio" | "Proyecto propio" | "Prototipo funcional" | "Plataforma a medida" | "Propuesta de rediseño";

export const CASES = {
  code: "05",
  label: "Archivo de misiones",
  title: "Lo que ya hemos construido.",
  lead: "Productos propios y prototipos funcionales por sector. Sin cifras infladas: en la sesión de diagnóstico te los enseñamos funcionando.",
  items: [
    {
      id: "rovik-ia",
      sector: "Construcción",
      kind: "Producto propio" as CaseKind,
      title: "ROVIK.IA: inteligencia documental para constructoras",
      text: "Analiza planos, presupuestos y pliegos; detecta partidas omitidas y cláusulas de riesgo, compara dos ofertas y exporta el informe a Word.",
      tags: ["IA", "Documentos", "Licitaciones"],
      image: "caso-rovik-ia",
      alt: "Pantalla de ROVIK.IA con los tres tipos de análisis: planos, presupuestos y pliegos",
    },
    {
      id: "albaran",
      sector: "Construcción",
      kind: "Prototipo funcional" as CaseKind,
      title: "Albarán digital y control de horas",
      text: "Partes firmados en obra desde el móvil, horas pagadas sin albarán convertidas en euros y cierre de mes listo para facturar.",
      tags: ["Operaciones", "Móvil", "Sin conexión"],
      image: "caso-albaran",
      alt: "Aplicación móvil de albaranes de obra con el control de horas sin firmar en euros",
    },
    {
      id: "medio",
      sector: "Contenidos",
      kind: "Proyecto propio" as CaseKind,
      title: "Medio de contenidos con producción automatizada",
      text: "Cadena que genera guías de compra con sus imágenes, un vídeo vertical con voz y su publicación en redes, con aviso diario del resultado.",
      tags: ["SEO", "Vídeo", "Automatización"],
      image: "caso-medio",
      alt: "Portada de un medio de guías de compra con productos destacados y buscador",
    },
    {
      id: "automocion",
      sector: "Automoción",
      kind: "Plataforma a medida" as CaseKind,
      title: "Captación de solicitudes y CRM con copiloto comercial",
      text: "Formulario por pasos, panel privado de oportunidades y un copiloto que prepara el seguimiento de cada solicitud.",
      tags: ["Captación", "CRM", "n8n"],
      image: "caso-automocion",
      alt: "Web oscura de captación para búsqueda de vehículos premium con formulario de solicitud",
    },
    {
      id: "estetica",
      sector: "Salud y estética",
      kind: "Propuesta de rediseño" as CaseKind,
      title: "Web de centro de estética orientada a la reserva",
      text: "Rediseño multidioma con reserva por tratamiento y el camino más corto entre la primera visita y la cita.",
      tags: ["Conversión", "Reservas", "Multidioma"],
      image: "caso-estetica",
      alt: "Portada de una web de centro de estética con acceso directo a reservar tratamiento",
    },
  ],
};

export const PROTOCOLS = {
  code: "06",
  label: "Protocolos",
  title: "Reglas que no nos saltamos.",
  items: [
    {
      title: "Primero caja, después tecnología",
      text: "No automatizamos lo que todavía no vende. La tecnología llega cuando hay algo que merece repetirse.",
    },
    {
      title: "Una métrica por fase",
      text: "Cada fase tiene un número y una fecha de revisión. Si no se puede medir, no entra en el plan.",
    },
    {
      title: "Todo queda a tu nombre",
      text: "Cuentas, dominios, datos y automatizaciones son de tu empresa desde el primer día.",
    },
    {
      title: "Si no encaja, te lo decimos",
      text: "En el diagnóstico sabrás si podemos ayudarte. Si no es así, te lo diremos con la misma claridad.",
    },
  ],
};

export const FAQ = {
  code: "07",
  label: "Preguntas frecuentes",
  title: "Antes de despegar.",
  items: [
    {
      q: "¿Para qué tipo de empresa es Rovik?",
      a: "Para empresas que ya venden y han tocado techo: tienen clientes y facturan, pero crecer significa más horas del fundador. Si todavía estás validando la idea, el diagnóstico te dirá qué validar primero.",
    },
    {
      q: "¿En qué se diferencia de una agencia de marketing?",
      a: "Una agencia te trae tráfico. Nosotros miramos el sistema entero: oferta, captación, cierre, operación y datos. A veces el problema no es el marketing, y entonces no te vendemos marketing.",
    },
    {
      q: "¿Necesito saber de tecnología o de IA?",
      a: "No. Montamos herramientas que tu equipo entiende y usa, y os enseñamos a usarlas. La IA va donde ahorra tiempo o dinero, nunca como decoración.",
    },
    {
      q: "¿Cuánto cuesta?",
      a: "Depende de los módulos y del punto de partida. Tras el diagnóstico recibes una propuesta por escrito con alcance, precio, plazos y la métrica con la que mediremos el resultado.",
    },
    {
      q: "¿Cuándo veré resultados?",
      a: "Empezamos por las fugas que más dinero cuestan, así que las primeras decisiones van directas a caja. Cada fase tiene su métrica y su fecha de revisión, para que sepas en todo momento si está funcionando.",
    },
    {
      q: "¿Qué hacéis con mis datos?",
      a: "El escáner de ROVIK.IA funciona en tu navegador y no envía ni guarda nada. En los proyectos, los datos viven en herramientas a nombre de tu empresa.",
    },
  ],
};

export const CONTACT = {
  code: "08",
  label: "Despegue",
  title: "¿Listo para despegar?",
  lead: "Cuéntanos dónde está tu empresa y adónde quieres llevarla. Te respondemos con los siguientes pasos.",
  steps: [
    { title: "Leemos tu caso", text: "Revisamos lo que nos cuentas y, si lo tienes, tu informe de ROVIK.IA." },
    { title: "Sesión de diagnóstico", text: "30 minutos por videollamada para ver las fugas con tus números." },
    { title: "Propuesta por escrito", text: "Alcance, precio, plazos y métricas. Tú decides si seguimos." },
  ],
};
