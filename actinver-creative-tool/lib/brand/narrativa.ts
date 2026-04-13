// Narrativa de marca Actinver — importada estáticamente para bundling en Vercel.
// NO usar fs.readFileSync: en serverless el filesystem no es confiable en runtime.

export const NARRATIVA = `
# Actinver — Guía de Narrativa y Copy

Fuente de verdad para la generación de texto en piezas de social media.
Basada en el brandbook oficial Actinver/DINN.

---

## Quién es Actinver

Casa de bolsa mexicana con más de 30 años de trayectoria. Gestiona el patrimonio de empresarios, emprendedores y profesionistas de alto perfil en México. No es un banco masivo — es un asesor de confianza de alto nivel.

---

## Público objetivo

- Empresarios y emprendedores mexicanos, 35–60 años
- Patrimonio medio-alto. Sofisticados, ocupados, exigentes
- Buscan solidez, no especulación
- Valoran la exclusividad, la discreción y la inteligencia financiera

---

## Voz de marca

| Atributo       | Sí                                         | No                                      |
|----------------|--------------------------------------------|-----------------------------------------|
| Tono           | Seguro, empoderador, aspiracional          | Alarmista, agresivo, condescendiente    |
| Estilo         | Frases cortas, impacto inmediato           | Párrafos largos, jerga técnica compleja |
| Persona        | Asesor de confianza de alto nivel          | Vendedor, banco masivo                  |
| Emoción        | Confianza, éxito, crecimiento, privilegio  | Miedo, urgencia artificial, FOMO        |
| Idioma         | Español mexicano formal                    | Anglicismos innecesarios, slang         |

---

## Reglas absolutas de copy

- **Sin signos de exclamación** (!)
- **Sin emojis**
- **Sin promesas de rendimientos garantizados** (regulación CNBV)
- **Palabras prohibidas:** gratis, increíble, revolucionario, único, sorprendente, épico, boom
- **Sin superlativos vacíos:** el mejor, el más grande, líder absoluto
- **Sin clichés financieros:** "haz tu dinero trabajar", "invierte en tu futuro" (solos, sin contexto)

---

## Estructura del copy por campo

### TÍTULO (máx 48 caracteres)
- Directo y poderoso. La primera línea que ve el usuario.
- Puede ser: frase declarativa, pregunta retórica, dato concreto, beneficio clave.
- Poppins Bold sobre fondo oscuro — diseñado para leerse en 1 segundo.
- **Ejemplos buenos:**
  - "Tu capital merece más que una cuenta de banco"
  - "Rendimientos desde el primer día"
  - "Inversión inteligente, patrimonio sólido"
  - "¿Tu dinero está trabajando para ti?"

### DESCRIPCIÓN (máx 180 caracteres)
- Amplía el título con un beneficio concreto o dato de respaldo.
- No repite el título. No es un resumen del título.
- Open Sans Regular. Tono informativo pero cálido.
- **Ejemplos buenos:**
  - "Accede a instrumentos del mercado de capitales con el respaldo de más de 30 años de experiencia en gestión patrimonial."
  - "Fondos disponibles con liquidez inmediata y rendimientos competitivos por encima de la inflación."

### CTA — Llamada a la acción (máx 30 caracteres, MÍNIMO 15 caracteres)
- SIEMPRE una frase completa: verbo imperativo + objeto/complemento. NUNCA una sola palabra o sílaba.
- Si el título termina en pregunta (ej. "¿Listo para el futuro?"), el CTA DEBE ser una respuesta-acción completa.
- Debe sentirse como una invitación, no una orden.
- **Ejemplos correctos:**
  - "Agenda tu cita hoy"
  - "Conoce tus opciones"
  - "Habla con un asesor"
  - "Empieza a invertir"
  - "Solicita información"
  - "Sí, quiero conocer más"
  - "Estoy listo, contáctenme"
  - "Quiero saber cómo"
- **Ejemplos INCORRECTOS (nunca generar):**
  - "Sí" ← demasiado corto, no es una acción
  - "Listo" ← no indica qué hacer
  - "Más info" ← vago

---

## Productos y servicios Actinver — contexto narrativo

| Producto                    | Ángulo narrativo principal                                  |
|-----------------------------|-------------------------------------------------------------|
| Fondos de inversión         | Liquidez + rendimiento + simplicidad                        |
| Gestión patrimonial         | Exclusividad, experiencia, visión de largo plazo            |
| Mesa de dinero / CETES      | Seguridad, rendimiento inmediato, sin complicaciones        |
| Acciones y bolsa            | Oportunidad, crecimiento, diversificación inteligente       |
| Seguros de vida/auto        | Protección del patrimonio, tranquilidad, continuidad        |
| Crédito / financiamiento    | Apalancamiento inteligente, expansión del negocio           |
| Retiro / AFORE alternativo  | Independencia financiera, tranquilidad a largo plazo        |
| Divisas / USD               | Cobertura, diversificación, sofisticación                   |
| Fiduciario / fideicomisos   | Legado, protección familiar, planificación sucesoria        |

---

## Ejemplos de copy completo por producto

### Fondos de inversión de corto plazo
- **Título:** "Rendimientos desde el primer día"
- **Descripción:** "Ingresa tus recursos y comienza a generar rendimientos competitivos con liquidez inmediata. Sin plazos forzosos, sin complicaciones."
- **CTA:** "Conoce los fondos"

### Gestión patrimonial
- **Título:** "Tu patrimonio, una estrategia a la medida"
- **Descripción:** "Nuestros asesores diseñan un portafolio personalizado basado en tus metas, horizonte de inversión y perfil de riesgo."
- **CTA:** "Habla con un asesor"

### Seguro de auto
- **Título:** "Protege lo que mueve tu negocio"
- **Descripción:** "Cobertura integral para tu vehículo con el respaldo financiero de Actinver. Atención dedicada, sin trámites engorrosos."
- **CTA:** "Solicita tu cotización"
`.trim();
