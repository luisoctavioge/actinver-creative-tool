// Configuración de marca Actinver — centraliza todos los valores
// que antes estaban dispersos en múltiples archivos.

import { BrandConfig } from "./brand-config";

export const ACTINVER_BRAND: BrandConfig = {
  id: "actinver",
  name: "Actinver",

  colors: {
    primary: "#0A0E12",       // Azul Grandeza / Rich Black
    secondary: "#1A2433",     // Azul Acompañamiento / Gunmetal
    accent: "#E6C78A",        // Sunset / Gold
    surface: "#F5F2EB",       // Arena / Sand
    onPrimary: "#FFFFFF",     // Blanco
    complementary: "#314566", // Azul Actinver
  },

  fonts: {
    primary: "var(--font-poppins)",
    secondary: "var(--font-open-sans)",
    accent: "var(--font-bad-script)",
  },

  logo: {
    light: "/actinver-logo.svg",
    dark: "/actinver-logo.svg", // Solo hay versión clara por ahora
  },

  badge: {
    prefix: "El privilegio de ser",
    highlight: "Fundador",
  },

  // Markdown cargado en runtime por content-generator.ts vía fs.readFileSync
  narrativa: "lib/brand/narrativa.md",
  visual: "lib/brand/visual.md",

  sceneMap: [
    {
      keywords: ["auto", "coche", "carro", "vehículo", "vehiculo", "automóvil", "automovil"],
      scenes: [
        "Extreme close-up of a luxury car steering wheel wrapped in dark perforated leather, single dramatic overhead light illuminating the stitching detail, deep navy and black shadows, bokeh dashboard instruments in background, macro automotive detail photography, photorealistic, 8K",
        "Low angle shot of a sleek dark sedan's polished alloy wheel on wet black asphalt, rain-soaked surface reflecting amber street lights as abstract bokeh, deep navy tones, dramatic rim lighting on the wheel's spokes, no people, photorealistic, 8K",
        "Extreme close-up of a car door handle in brushed dark chrome against matte black bodywork, single side light creating a razor-thin highlight, absolute minimal composition, deep black background, macro photography, photorealistic, 8K",
        "Overhead aerial-style shot of a dark luxury car parked on a geometric marble plaza pattern, deep shadows, perfectly symmetrical composition, bird's eye view, cinematic color grade, no people, photorealistic, 8K",
        "Interior shot of an empty luxury car at night: dashboard glow in deep amber and blue, instruments visible, leather seats in dim light, no occupants, through-the-windshield perspective showing nothing but dark road ahead, cinematic, photorealistic, 8K",
      ],
    },
    {
      keywords: ["fondo", "inversión", "inversion", "rendimiento", "liquidez", "cetes", "mesa de dinero"],
      scenes: [
        "Macro photograph of a single gold coin standing upright on polished dark obsidian stone surface, single overhead spotlight casting a perfect circular shadow beneath it, deep black background, crisp metal texture detail, minimal and powerful, photorealistic, 8K",
        "Abstract: an hourglass filled with fine gold sand on a dark marble surface, the falling grains catching a shaft of directional light, deep shadows surrounding it, metaphor for time and value, macro photography, photorealistic, 8K",
        "Close-up of a bundle of crisp banknotes tied with a thin black ribbon, resting on aged dark oak, single directional warm light from the side revealing paper texture and engraving detail, minimal composition, photorealistic, 8K",
        "Flat lay directly overhead: a single large polished gold sphere resting on dark velvet fabric, creating a deep shadow below, dramatically lit from one side, abstract representation of financial growth, photorealistic, 8K",
        "Macro shot of scattered gold dust particles suspended mid-air above a dark reflective surface, caught in a narrow beam of directional light against absolute black background, abstract and luxurious, photorealistic, 8K",
      ],
    },
    {
      keywords: ["bolsa", "acciones", "mercado", "bursátil", "bursatil", "trading"],
      scenes: [
        "Abstract fiber optic light strands in deep navy blue and electric gold, forming organic flowing curves against absolute black, macro photography, tack-sharp focus on central strands with natural bokeh falloff, metaphor for data streams, photorealistic, 8K",
        "Extreme close-up of a vintage stock ticker tape ribbon with numbers, resting on dark felt, dramatic single overhead spotlight, strong side shadows, paper texture revealed in high detail, nostalgic yet cinematic, photorealistic, 8K",
        "Abstract photography of light trails in deep blue and gold on absolute black, long exposure style, representing market movement and energy, completely non-figurative, beautiful and dynamic, photorealistic, 8K",
        "Macro close-up of a printed financial chart on premium matte paper, a precision drafting pen resting across it, single overhead directional light, the chart lines casting tiny shadows, editorial photography, photorealistic, 8K",
        "Glass sphere resting on a dark reflective surface, inside which an abstract refracted cityscape appears distorted and inverted, surrounding darkness, one beam of light entering from above, metaphor for market complexity, photorealistic, 8K",
      ],
    },
    {
      keywords: ["seguro de vida", "vida", "familia", "protección familiar", "proteccion familiar"],
      scenes: [
        "Overhead flat-lay of an antique bronze compass, a folded envelope sealed with dark wax, and a dried white gardenia arranged on aged dark oak, warm raking light from one side creating long dramatic shadows, editorial still-life photography, photorealistic, 8K",
        "A single lit candle in a crystal holder on a dark marble table, the flame perfectly sharp, warm light creating a radial glow that fades into deep navy darkness, surrounding objects softly out of focus, cinematic and intimate, photorealistic, 8K",
        "Close-up macro of two adult hands gently cupped together around a single small green plant seedling, backlit by warm golden hour light creating a rim glow, dark background, metaphor for protection and nurturing, photorealistic, 8K",
        "Wide shot of an empty modernist living room at dusk, large floor-to-ceiling windows showing a gradient sky, warm interior lights beginning to glow, beautiful architectural space, absolute stillness, no people, cinematic, photorealistic, 8K",
        "Flat-lay of a leather-bound journal, a fountain pen, and a dried maple leaf arranged on dark stone surface, single directional side light revealing texture, autumn tones against dark background, metaphor for legacy, photorealistic, 8K",
      ],
    },
    {
      keywords: ["retiro", "pensión", "pension", "independencia", "jubilación", "jubilacion"],
      scenes: [
        "Wide dramatic seascape: empty wooden pier stretching into calm dark ocean at blue hour, single warm lamp post light at the end of the pier, long exposure water effect, no people, sense of earned solitude and freedom, photorealistic, 8K",
        "Overhead flat-lay of an antique pocket watch open on aged parchment, the clockwork mechanism fully visible in sharp macro detail, single overhead spotlight, surrounding darkness, metaphor for time and freedom, photorealistic, 8K",
        "Architectural photography of an empty infinity pool at golden hour, pool edge merging with distant mountain silhouette, warm reflection of sky on water surface, no people, deep shadows on surrounding stone deck, photorealistic, 8K",
        "Close-up of a single mountain peak above the clouds at dawn, first light painting the summit gold against deep navy sky, vast below-cloud landscape, wide angle, dramatic and aspirational, no people, photorealistic, 8K",
        "Interior of a luxury study: a leather armchair facing a fireplace with a gentle flame, one book resting on the armrest, warm golden firelight, no people, architectural quiet, deep shadows in corners, cinematic, photorealistic, 8K",
      ],
    },
    {
      keywords: ["crédito", "credito", "financiamiento", "préstamo", "prestamo", "empresa"],
      scenes: [
        "Architectural blueprint drawing rolled out on a dark marble table, a brass mechanical compass and a silver ruler resting precisely on top, single directional light from the left creating sharp geometric shadows, overhead perspective, photorealistic, 8K",
        "Low angle looking up at a modern glass skyscraper facade against deep navy blue sky, geometric grid of dark glass panels, no people, perfect symmetry and geometry, architectural photography, photorealistic, 8K",
        "Close-up of a heavy iron key with intricate bow pattern resting on dark aged wood, dramatic side light revealing metal texture and wood grain, deep shadows, minimal composition, metaphor for access and opportunity, photorealistic, 8K",
        "Macro photography of construction scaffolding abstract patterns, metal pipes in geometric arrangement against deep blue sky, strong graphic lines and shadows, no people, architectural detail, photorealistic, 8K",
        "Flat lay of architectural scale model elements: small geometric white blocks arranged on dark slate, single overhead spotlight, hard geometric shadows, clean minimal composition, metaphor for building and growth, photorealistic, 8K",
      ],
    },
    {
      keywords: ["dólar", "dolar", "divisa", "forex", "usd", "cobertura"],
      scenes: [
        "Macro close-up of multiple currency banknotes fanned out on deep black textured surface, single hard spotlight from above revealing intricate printed detail and paper texture, abstract and graphic composition, photorealistic, 8K",
        "Abstract shot of world map printed on matte paper, a single gold pen resting diagonally across it, single directional side light, deep blue shadows, no people, minimal and global, photorealistic, 8K",
        "Close-up macro of currency exchange rate numbers on a dark digital board, abstract, blurred background, one number in sharp focus, deep navy tones, cinematic, photorealistic, 8K",
        "Overhead flat-lay of coins from different countries arranged in a radial pattern on dark slate, single overhead spotlight creating circular shadows, abstract and graphic, photorealistic, 8K",
        "Abstract light painting: a single beam of golden light cutting diagonally through absolute darkness, representing a financial corridor or pathway, minimal and dramatic, photorealistic, 8K",
      ],
    },
    {
      keywords: ["fiduciario", "fideicomiso", "legado", "herencia", "sucesión", "sucesion"],
      scenes: [
        "Close-up of an antique brass wax seal stamp resting beside a pool of deep crimson wax on aged cream parchment, warm single candle-inspired light source, macro photography revealing every texture and imperfection, dark wooden surface beneath, photorealistic, 8K",
        "Macro close-up of an open antique law book, pages worn with age, single beam of directional light illuminating text, deep surrounding shadows, bokeh background, metaphor for legacy and legal certainty, photorealistic, 8K",
        "Wide shot of an empty classical library room with dark wood shelves full of leather-bound books, amber reading lamp light, architectural grandeur, no people, deep shadows in corners, sense of accumulated wisdom, photorealistic, 8K",
        "Close-up of an antique fountain pen mid-stroke on premium cream paper, signature being written (no legible text), warm directional light, macro detail of ink glistening on paper, deep shadows, photorealistic, 8K",
        "Flat lay overhead of an antique bronze scale (balance scale) on dark aged wood, perfectly balanced, single overhead spotlight, hard shadows on wooden surface, metaphor for justice and balance of legacy, photorealistic, 8K",
      ],
    },
    {
      keywords: ["inmueble", "bienes raíces", "bienes raices", "propiedad", "casa", "edificio"],
      scenes: [
        "Low angle architectural photography of a modernist concrete and glass building facade at blue hour, geometric grid of illuminated windows against deep navy sky, no people, perfect symmetry, ambient city glow reflected in glass, photorealistic, 8K",
        "Interior architectural shot: a dramatic spiral staircase in dark marble, viewed from below looking up, the circular form creating a perfect geometric shape against soft ceiling light, no people, photorealistic, 8K",
        "Exterior shot of a luxury villa entrance at night: dark stone wall, a single architectural spotlight illuminating a minimal door handle in brushed gold, bokeh garden lights in background, no people, photorealistic, 8K",
        "Wide interior of a luxury empty apartment with panoramic windows, deep blue night city visible through glass, warm floor lamp light in corner, polished concrete floors reflecting light, no people, photorealistic, 8K",
        "Macro close-up of architectural concrete texture with a small embedded glass block catching interior light, abstract and tactile, single directional light, deep shadows, representing premium construction, photorealistic, 8K",
      ],
    },
    {
      keywords: ["nómina", "nomina", "cuenta", "payroll"],
      scenes: [
        "Overhead flat-lay of a premium leather-bound notebook, a polished pen, and a single white embossed card arranged on dark slate, minimal negative space, directional warm side-light casting precise shadows, editorial object photography, photorealistic, 8K",
        "Close-up macro of a premium credit card surface, embossed numbers catching directional light, metallic sheen on dark background, extreme detail of card texture, minimal and powerful, photorealistic, 8K",
        "Abstract: a stack of crisp white cards or papers seen from the side edge, perfectly aligned, single directional light from above casting parallel shadows, deep black background, graphic and minimal, photorealistic, 8K",
        "Macro photography of a mechanical watch clasp in brushed steel, resting on dark leather strap on black surface, single light from above creating precise reflections, representing precision and reliability, photorealistic, 8K",
        "Flat lay of a digital tablet with a dark screen (no visible content) beside a sleek pen on dark marble, architectural minimal composition, single overhead spotlight, deep shadows, representing digital financial management, photorealistic, 8K",
      ],
    },
    {
      keywords: ["patrimonio", "gestión", "gestion", "portafolio", "asesor"],
      scenes: [
        "High-angle shot of a chess board with only a single gold king piece standing in the center, all other pieces absent, dramatic single overhead spotlight, deep shadows on dark mahogany board, metaphor for strategic leadership, photorealistic, 8K",
        "Macro close-up of a vintage compass with gold needle pointing precisely north, resting on aged leather map, strong raking side light revealing both textures in extreme detail, deep surrounding shadows, photorealistic, 8K",
        "Abstract: multiple polished dark spheres of different sizes arranged on a reflective dark surface, reflecting each other, single overhead light creating complex shadow patterns, representing a diversified portfolio, photorealistic, 8K",
        "Wide shot of an empty modernist boardroom: long dark table, leather chairs, floor-to-ceiling windows with night city view, ambient low light, no people, sense of authority and calm, cinematic, photorealistic, 8K",
        "Close-up of a premium leather portfolio/folder slightly open, corner of important-looking documents visible inside, resting on dark marble, side directional light, deep shadows, representing wealth management, photorealistic, 8K",
      ],
    },
  ],

  productPresets: [
    {
      label: "Retiro",
      product: "Plan de retiro Actinver",
      message: "",
    },
    {
      label: "Seguro Auto",
      product: "Seguro de Auto Actinver",
      message: "",
    },
  ],
};
