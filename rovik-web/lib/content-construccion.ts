// Textos de la página de campaña para construcción (/constructoras/).
// Coherentes con los anuncios de marketing/google-ads: si cambias la promesa aquí, cámbiala allí.

export const C_HERO = {
  eyebrow: "Construcción · Subcontratas · Obra",
  title: ["Cada parte", "sin firmar", "es dinero que no cobras."],
  lead:
    "Para constructoras y subcontratas que trabajan por horas o por administración. Digitalizamos partes y albaranes en obra, medimos en euros las horas que no se facturan y quitamos papeleo a presupuestos y pliegos con IA.",
  facts: ["Albarán firmado en el móvil", "Funciona sin cobertura", "Cierre de mes listo para facturar"],
};

export const C_CALC = {
  code: "01",
  label: "Calculadora de fugas",
  title: "¿Cuántas horas trabajas sin cobrar?",
  lead: "Ajusta los valores con los datos de tu empresa. Es una estimación: en el diagnóstico lo medimos con tus partes reales.",
};

export const C_SOLUTIONS = {
  code: "02",
  label: "Qué resolvemos",
  title: "Tres fugas típicas en obra. Tres soluciones concretas.",
  items: [
    {
      pain: "Partes en papel que llegan tarde, incompletos o no llegan",
      name: "Albarán digital firmado en obra",
      text: "El encargado rellena el parte en el móvil: obra, cuadrilla, horas y firma del cliente. Numerado, con copia para el cliente y sin depender de la cobertura.",
    },
    {
      pain: "Horas pagadas en nómina que nadie factura",
      name: "Control de fugas en euros",
      text: "Cruzamos horas pagadas con horas firmadas y te mostramos qué jornadas no tienen albarán y cuánto dinero suponen, antes del cierre de mes.",
    },
    {
      pain: "Presupuestos y pliegos que se comen las tardes",
      name: "ROVIK.IA para presupuestos, planos y pliegos",
      text: "La IA revisa el documento, detecta partidas omitidas y cláusulas de riesgo y compara dos ofertas, con el informe listo para Word.",
    },
  ],
};

export const C_PROOF = {
  code: "03",
  label: "Ya funcionando",
  title: "No es una presentación. Son herramientas construidas.",
  lead: "Te las enseñamos funcionando en la sesión de diagnóstico, con datos de ejemplo o con los tuyos.",
  ids: ["albaran", "rovik-ia"],
};

export const C_STEPS = {
  code: "04",
  label: "Cómo empezamos",
  title: "De la llamada a la obra medida.",
  items: [
    {
      title: "Diagnóstico de 30 minutos",
      text: "Revisamos cómo se hacen hoy los partes, los presupuestos y el cierre de mes, y estimamos la fuga con tus números.",
    },
    {
      title: "Piloto en una obra",
      text: "Ponemos el albarán digital en una obra real con uno de tus encargados y medimos la diferencia.",
    },
    {
      title: "Despliegue y seguimiento",
      text: "Si los números salen, lo extendemos al resto de obras y revisamos las fugas contigo cada semana.",
    },
  ],
};

export const C_FAQ = {
  code: "05",
  label: "Preguntas de obra",
  title: "Dudas de obra.",
  items: [
    {
      q: "¿Funciona si en la obra no hay cobertura?",
      a: "Sí. La aplicación está pensada para funcionar sin conexión en obra: el parte se rellena y se firma aunque no haya cobertura.",
    },
    {
      q: "¿Mis encargados tienen que instalar algo?",
      a: "No hace falta tienda de aplicaciones: se abre en el navegador del móvil y se añade a la pantalla de inicio como una app más.",
    },
    {
      q: "¿Sirve si facturo por certificaciones y no por horas?",
      a: "El control de horas aplica sobre todo a trabajos por administración y a subcontratas de mano de obra. Si certificas por mediciones, el foco está en presupuestos, pliegos y control de costes: lo vemos en el diagnóstico.",
    },
    {
      q: "¿Qué pasa con los datos de mis trabajadores?",
      a: "Se tratan conforme al RGPD, en herramientas a nombre de tu empresa y con acceso solo para quien lo necesita.",
    },
    {
      q: "¿Cuánto cuesta?",
      a: "Depende del número de obras y de lo que haya que integrar. Tras el diagnóstico recibes una propuesta cerrada por escrito, con precio y la métrica con la que mediremos el resultado.",
    },
  ],
};

export const C_CONTACT = {
  code: "06",
  label: "Diagnóstico",
  title: "Mide tus fugas con tus partes reales.",
  lead: "Cuéntanos cuántas obras y operarios tienes y cómo hacéis hoy los partes. Te proponemos el diagnóstico.",
  placeholder: "Ej.: 3 obras, 25 operarios, partes en papel que llegan a la oficina los viernes.",
};

export const C_META = {
  title: "Control de horas y albaranes digitales para obra",
  description:
    "Digitaliza partes y albaranes en obra, mide en euros las horas que no se facturan y revisa presupuestos y pliegos con IA. Calcula tus fugas en un minuto.",
};
