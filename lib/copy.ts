import { formatRange, relativeTime } from "./range";
import { placeLabel } from "./routes";
import type { DisplayRange, Locale, PlaceId } from "./routes";

// Verbatim copy from the design handoff — do not paraphrase or shorten.
type Dict = {
  intro: string;
  tagline: string;
  origin: string;
  destination: string;
  reportOne: string;
  reportMany: string;
  reportPrice: string;
  share: string;
  howMuchPaid: string;
  send: string;
  thanks: string;
  chooseDestination: string;
  estimated: string;
  updated: string;
  zeroState: string;
  zeroStateCta: string;
  howItWorks: string;
  methodTitle: string;
  whyTitle: string;
  whyBody: string;
  reportsTitle: string;
  reportsBody: string;
  thinTitle: string;
  thinBody: string;
  noneTitle: string;
  noneBody: string;
  calcTitle: string;
  calcBody: string;
  recencyTitle: string;
  recencyBody: string;
  trustTitle: string;
  trustBody: string;
  officialTitle: string;
  officialBody: string;
  dataTitle: string;
  dataBody: string;
  licenseTitle: string;
  licenseBody: string;
  missingTitle: string;
  missingBody: string;
  youPaid: string;
  mostPay: string;
  reportAnother: string;
  submitError: string;
  officialTariffLabel: string;
  sameZoneMessage: string;
  nightSurchargeBadge: string;
  officialTariffPill: string;
  municipalityLine: string;
  decreeCitation: string;
  officialTariffCaption: string;
  officialOnlyNote: string;
  backHome: string;
  notEnoughDataYet: string;
  reportIncentive: string;
  notSureWhich: string;
};

export const WORDMARK = "cuánto cuesta cartagena";

export const COPY: Record<Locale, Dict> = {
  es: {
    intro: "Lo que cuestan las carreras en Cartagena, reportado por quienes las pagaron.",
    tagline: "Taxis primero. Más precios pronto.",
    origin: "Origen",
    destination: "Destino",
    reportOne: "reporte",
    reportMany: "reportes",
    reportPrice: "+ Reportar precio",
    share: "Compartir",
    howMuchPaid: "¿Cuánto pagaste?",
    send: "Enviar",
    thanks: "Gracias. Una tarifa más queda registrada.",
    chooseDestination: "Elige un destino para ver la tarifa",
    estimated: "Estimado",
    updated: "actualizado",
    zeroState: "Nadie ha reportado esta ruta todavía.",
    zeroStateCta: "Sé el primero en reportarla.",
    howItWorks: "Cómo funciona",
    methodTitle: "De dónde salen los precios",
    whyTitle: "Por qué hacemos esto",
    whyBody:
      "Nos gusta construir cosas con datos y tecnología. Cartagena está llena de precios que nadie publica y que todo el mundo termina averiguando por su cuenta, casi siempre pagando de más la primera vez. Empezamos por los taxis porque es lo que más rápido se puede comprobar, pero la idea es la misma para todo lo demás.",
    reportsTitle: "Los reportes",
    reportsBody: "Todo viene de gente que tomó un taxi y nos dijo cuánto pagó. Residentes y visitantes. No pedimos nada más que el monto.",
    thinTitle: "Cuando hay pocos datos",
    thinBody:
      "En las rutas con menos de cinco reportes mostramos un estimado, basado en lo que nos dijeron varios taxistas y en las tarifas que pudimos verificar. Lo marcamos como estimado. Cuando llegan suficientes reportes reales, el estimado desaparece.",
    noneTitle: "Cuando no hay ninguno",
    noneBody: "Si nadie ha reportado una ruta, no inventamos un número. Te lo decimos y te pedimos el tuyo.",
    calcTitle: "Cómo calculamos el rango",
    calcBody:
      "Con cinco reportes o más, mostramos el rango donde cae la mayoría de lo que pagó la gente en los últimos seis meses. Descartamos montos absurdamente altos o bajos, que casi siempre son errores al escribir.",
    recencyTitle: "Qué tan reciente es",
    recencyBody:
      "Al lado de cada precio decimos cuántos reportes lo respaldan y cuándo llegó el último. Un precio de hace cuatro meses puede estar desactualizado, y preferimos que lo sepas.",
    trustTitle: "No tenemos convenios con nadie",
    trustBody: "No trabajamos con ningún taxista ni empresa, y no ganamos nada con lo que pagues.",
    officialTitle: "Cuando hay una tarifa oficial",
    officialBody:
      "Algunas rutas tienen una tarifa fijada por decreto municipal (Decreto 0051 de 2026), no por reportes de viajeros. La marcamos como tarifa oficial y citamos el decreto. Es un dato del gobierno, no un promedio nuestro — y lo que se paga en la calle puede diferir según el tráfico, la hora y la negociación con el conductor. Getsemaní comparte zona tarifaria con el Centro, así que cobra la tarifa mínima sin importar el destino exacto dentro de esa zona. El decreto también fija un recargo nocturno de $1.100 entre las 7 p.m. y las 5 a.m., que mostramos solo si estás viendo la página en ese horario.",
    dataTitle: "Tus datos",
    dataBody: "No pedimos correo, ni nombre, ni cuenta. Solo el monto que pagaste.",
    licenseTitle: "Usa estos datos",
    licenseBody:
      "Son de uso libre bajo licencia CC BY 4.0. Puedes citarlos, publicarlos o construir sobre ellos, siempre que menciones la fuente: Cuánto Cuesta Cartagena.",
    missingTitle: "¿Falta una ruta?",
    missingBody: "Dinos cuál y la agregamos.",
    youPaid: "Pagaste",
    mostPay: "La mayoría paga",
    reportAnother: "Reportar otra carrera",
    submitError: "No pudimos enviar tu reporte. Intenta de nuevo.",
    officialTariffLabel: "tarifa oficial",
    sameZoneMessage: "Getsemaní está dentro de la misma zona tarifaria que el Centro (Decreto 0051 de 2026) — se cobra la tarifa mínima.",
    nightSurchargeBadge: "+ $1.100 recargo nocturno activo (7pm–5am)",
    officialTariffPill: "Tarifa oficial vigente",
    municipalityLine: "Alcaldía de Cartagena de Indias",
    decreeCitation: "Decreto 0051 de 2026 · 20 de febrero de 2026",
    officialTariffCaption: "Tarifa oficial",
    officialOnlyNote:
      "Esta es la tarifa fijada por decreto. Aún no hay reportes de viajeros — lo que se paga en la calle puede variar según el tráfico, la hora y la negociación con el conductor.",
    backHome: "Inicio",
    notEnoughDataYet: "Aún no hay suficientes reportes para saber cuánto paga la mayoría.",
    reportIncentive: "Cada reporte hace el precio más confiable para el próximo viajero.",
    notSureWhich: "¿No sabes cuál es?",
  },
  en: {
    intro: "What taxi rides actually cost in Cartagena, reported by the people who paid them.",
    tagline: "Taxis first. More prices coming soon.",
    origin: "From",
    destination: "To",
    reportOne: "report",
    reportMany: "reports",
    reportPrice: "+ Report a price",
    share: "Share",
    howMuchPaid: "How much did you pay?",
    send: "Send",
    thanks: "Thanks. That's one more fare on record.",
    chooseDestination: "Choose a destination to see the fare",
    estimated: "Estimated",
    updated: "updated",
    zeroState: "Nobody has reported this route yet.",
    zeroStateCta: "Be the first to report it.",
    howItWorks: "How it works",
    methodTitle: "Where the prices come from",
    whyTitle: "Why we're doing this",
    whyBody:
      "We like building things with data and technology. Cartagena is full of prices nobody publishes and everybody ends up working out on their own, usually by overpaying the first time. We started with taxis because it's the fastest thing to verify, but the idea is the same for everything else.",
    reportsTitle: "The reports",
    reportsBody: "Everything comes from people who took a taxi and told us what they paid. Residents and visitors. We ask for nothing but the amount.",
    thinTitle: "When there's little data",
    thinBody:
      "On routes with fewer than five reports we show an estimate, based on what several drivers told us and the fares we could verify. We label it as an estimate. Once enough real reports come in, the estimate goes away.",
    noneTitle: "When there's none",
    noneBody: "If nobody has reported a route, we don't make up a number. We say so and ask for yours.",
    calcTitle: "How we calculate the range",
    calcBody:
      "With five or more reports, we show the range where most of what people paid falls, over the last six months. We drop absurdly high or low amounts, which are almost always typos.",
    recencyTitle: "How recent it is",
    recencyBody:
      "Next to each price we say how many reports back it and when the last one came in. A price from four months ago may be out of date, and we'd rather you knew.",
    trustTitle: "We're not partnered with anyone",
    trustBody: "We don't work with any driver or company, and we make nothing off what you pay.",
    officialTitle: "When there's an official tariff",
    officialBody:
      "Some routes have a fare set by municipal decree (Decree 0051 of 2026), not by rider reports. We label it as an official tariff and cite the decree. It's a government figure, not our average — and what people actually pay on the street can differ with traffic, time of day, and negotiation with the driver. Getsemaní shares a fare zone with Downtown, so the minimum fare applies regardless of the exact destination within that zone. The decree also sets a $1,100 night surcharge between 7pm and 5am, which we only show if you're viewing the page during those hours.",
    dataTitle: "Your data",
    dataBody: "We don't ask for email, name, or an account. Just the amount you paid.",
    licenseTitle: "Use this data",
    licenseBody:
      "It's free to use under a CC BY 4.0 license. Cite it, publish it, or build on it, as long as you credit Cuánto Cuesta Cartagena.",
    missingTitle: "Missing a route?",
    missingBody: "Tell us which one and we'll add it.",
    youPaid: "You paid",
    mostPay: "Most people pay",
    reportAnother: "Report another ride",
    submitError: "We couldn't submit your report. Please try again.",
    officialTariffLabel: "official tariff",
    sameZoneMessage: "Getsemaní is within the same fare zone as Downtown (Decree 0051 of 2026) — the minimum fare applies.",
    nightSurchargeBadge: "+ $1,100 night surcharge active (7pm–5am)",
    officialTariffPill: "Current official tariff",
    municipalityLine: "City of Cartagena de Indias",
    decreeCitation: "Decree 0051 of 2026 · February 20, 2026",
    officialTariffCaption: "Official tariff",
    officialOnlyNote:
      "This is the government-set fare. No rider reports yet — what people actually pay on the street can vary with traffic, time of day, and negotiation with the driver.",
    backHome: "Home",
    notEnoughDataYet: "Not enough reports yet to know what most people pay.",
    reportIncentive: "Every report makes the fare more reliable for the next traveler.",
    notSureWhich: "Not sure which one?",
  },
  fr: {
    intro: "Ce que coûtent vraiment les courses de taxi à Carthagène, rapporté par ceux qui les ont payées.",
    tagline: "Taxis d'abord. D'autres prix arrivent bientôt.",
    origin: "Départ",
    destination: "Arrivée",
    reportOne: "signalement",
    reportMany: "signalements",
    reportPrice: "+ Signaler un prix",
    share: "Partager",
    howMuchPaid: "Combien avez-vous payé ?",
    send: "Envoyer",
    thanks: "Merci. Un tarif de plus est enregistré.",
    chooseDestination: "Choisissez une destination pour voir le tarif",
    estimated: "Estimé",
    updated: "mis à jour",
    zeroState: "Personne n'a encore signalé cet itinéraire.",
    zeroStateCta: "Soyez le premier à la signaler.",
    howItWorks: "Comment ça marche",
    methodTitle: "D'où viennent les prix",
    whyTitle: "Pourquoi on fait ça",
    whyBody:
      "Nous aimons créer des choses avec les données et la technologie. Cartagène est pleine de prix que personne ne publie et que tout le monde finit par découvrir seul, en payant trop cher la première fois. On a commencé par les taxis parce que c'est ce qui se vérifie le plus vite, mais l'idée est la même pour le reste.",
    reportsTitle: "Les signalements",
    reportsBody: "Tout vient de gens qui ont pris un taxi et nous ont dit combien ils ont payé. Résidents et visiteurs. On ne demande rien d'autre que le montant.",
    thinTitle: "Quand il y a peu de données",
    thinBody:
      "Sur les trajets avec moins de cinq signalements, on affiche une estimation, basée sur ce que plusieurs chauffeurs nous ont dit et sur les tarifs qu'on a pu vérifier. On l'indique comme estimation. Dès qu'il y a assez de signalements réels, l'estimation disparaît.",
    noneTitle: "Quand il n'y en a aucun",
    noneBody: "Si personne n'a signalé un trajet, on n'invente pas de chiffre. On le dit et on vous demande le vôtre.",
    calcTitle: "Comment nous calculons la fourchette",
    calcBody:
      "À partir de cinq signalements, nous affichons la fourchette où se situe la majorité des montants payés au cours des six derniers mois. Nous écartons les montants absurdement élevés ou bas, presque toujours des erreurs de saisie.",
    recencyTitle: "À quel point c'est récent",
    recencyBody:
      "À côté de chaque prix, on indique combien de signalements le soutiennent et quand le dernier est arrivé. Un prix d'il y a quatre mois peut être dépassé, et on préfère que vous le sachiez.",
    trustTitle: "On n'a d'accord avec personne",
    trustBody: "On ne travaille avec aucun chauffeur ni aucune entreprise, et on ne gagne rien sur ce que vous payez.",
    officialTitle: "Quand il y a un tarif officiel",
    officialBody:
      "Certains trajets ont un tarif fixé par décret municipal (Décret 0051 de 2026), et non par des signalements de voyageurs. On l'indique comme tarif officiel et on cite le décret. C'est un chiffre du gouvernement, pas notre moyenne — et ce qui est réellement payé dans la rue peut varier selon le trafic, l'heure et la négociation avec le chauffeur. Getsemaní partage sa zone tarifaire avec le Centre, donc le tarif minimum s'applique quelle que soit la destination exacte dans cette zone. Le décret fixe aussi un supplément de nuit de 1 100 $ entre 19h et 5h, qu'on affiche seulement si vous consultez la page à ce moment-là.",
    dataTitle: "Vos données",
    dataBody: "Pas d'email, pas de nom, pas de compte. Juste le montant payé.",
    licenseTitle: "Utilisez ces données",
    licenseBody:
      "Elles sont libres d'utilisation sous licence CC BY 4.0. Citez-les, publiez-les ou construisez dessus, à condition de créditer Cuánto Cuesta Cartagena.",
    missingTitle: "Un trajet manque ?",
    missingBody: "Dites-nous lequel et on l'ajoute.",
    youPaid: "Vous avez payé",
    mostPay: "La majorité paie",
    reportAnother: "Signaler un autre trajet",
    submitError: "Nous n'avons pas pu envoyer votre signalement. Réessayez.",
    officialTariffLabel: "tarif officiel",
    sameZoneMessage: "Getsemaní se trouve dans la même zone tarifaire que le Centre (Décret 0051 de 2026) — le tarif minimum s'applique.",
    nightSurchargeBadge: "+ 1 100 $ supplément de nuit actif (19h–5h)",
    officialTariffPill: "Tarif officiel en vigueur",
    municipalityLine: "Mairie de Carthagène des Indes",
    decreeCitation: "Décret 0051 de 2026 · 20 février 2026",
    officialTariffCaption: "Tarif officiel",
    officialOnlyNote:
      "C'est le tarif fixé par décret. Pas encore de signalements de voyageurs — ce qui est réellement payé peut varier selon le trafic, l'heure et la négociation avec le chauffeur.",
    backHome: "Accueil",
    notEnoughDataYet: "Pas encore assez de signalements pour savoir ce que paie la majorité.",
    reportIncentive: "Chaque signalement rend le tarif plus fiable pour le prochain voyageur.",
    notSureWhich: "Vous ne savez pas ?",
  },
};

export function reportWord(count: number, locale: Locale): string {
  return count === 1 ? COPY[locale].reportOne : COPY[locale].reportMany;
}

// "{estimated} · {n} {report word}" below 5 total reports,
// "{n} {reports} · {updated} {relative time}" at 5+ — same format whether
// fresh or stale, per spec (staleness has no separate visual treatment).
export function confidenceCaption(display: DisplayRange, locale: Locale): string {
  const t = COPY[locale];
  if (display.kind === "zero") return t.zeroState;
  if (display.certainty === "estimated") {
    return `${t.estimated} · ${display.totalReportCount} ${reportWord(display.totalReportCount, locale)}`;
  }
  return `${display.totalReportCount} ${t.reportMany} · ${t.updated} ${relativeTime(display.updatedAt!, locale)}`;
}

// The shorter date line shown next to the animated count on the
// confirmation card (distinct wording from confidenceCaption, same
// estimated/confirmed split).
export function confirmedDateLabel(display: DisplayRange, locale: Locale): string {
  const t = COPY[locale];
  if (display.kind === "zero" || display.certainty === "estimated") return t.estimated.toLowerCase();
  return `${t.updated} ${relativeTime(display.updatedAt!, locale)}`;
}

const ROUTE_TITLE: Record<Locale, (o: string, d: string) => string> = {
  es: (o, d) => `${o} → ${d}: cuánto cuesta el taxi en Cartagena`,
  en: (o, d) => `${o} to ${d}: how much does a taxi cost in Cartagena`,
  fr: (o, d) => `${o} à ${d} : combien coûte le taxi à Carthagène`,
};

const CENTRO_CENTRO_TITLE: Record<Locale, string> = {
  es: "Carreras cortas dentro de Centro: cuánto cuesta el taxi en Cartagena",
  en: "Short rides within Downtown: how much does a taxi cost in Cartagena",
  fr: "Courts trajets dans le Centre : combien coûte le taxi à Carthagène",
};

export function routeTitle(origin: PlaceId, destination: PlaceId, locale: Locale): string {
  if (origin === "centro" && destination === "centro") return CENTRO_CENTRO_TITLE[locale];
  return ROUTE_TITLE[locale](placeLabel(origin, locale), placeLabel(destination, locale));
}

const ROUTE_DESCRIPTION_VALUE: Record<Locale, (o: string, d: string, range: string, n: number, word: string) => string> = {
  es: (o, d, range, n, word) => `Un taxi de ${o} a ${d} en Cartagena cuesta ${range} COP, según ${n} ${word}.`,
  en: (o, d, range, n, word) => `A taxi from ${o} to ${d} in Cartagena costs ${range} COP, based on ${n} ${word}.`,
  fr: (o, d, range, n, word) => `Un taxi de ${o} à ${d} à Carthagène coûte ${range} COP, selon ${n} ${word}.`,
};

const ROUTE_DESCRIPTION_ZERO: Record<Locale, (o: string, d: string) => string> = {
  es: (o, d) => `Nadie ha reportado todavía cuánto cuesta un taxi de ${o} a ${d} en Cartagena. Sé el primero en reportar tu tarifa.`,
  en: (o, d) => `Nobody has reported what a taxi from ${o} to ${d} costs in Cartagena yet. Be the first to report your fare.`,
  fr: (o, d) => `Personne n'a encore signalé le prix d'un taxi de ${o} à ${d} à Carthagène. Soyez le premier à signaler votre tarif.`,
};

const CENTRO_CENTRO_DESCRIPTION_VALUE: Record<Locale, (range: string, n: number, word: string) => string> = {
  es: (range, n, word) => `Una carrera corta dentro de Centro (Cartagena) cuesta ${range} COP, según ${n} ${word}.`,
  en: (range, n, word) => `A short ride within Downtown (Cartagena) costs ${range} COP, based on ${n} ${word}.`,
  fr: (range, n, word) => `Un court trajet dans le Centre (Carthagène) coûte ${range} COP, selon ${n} ${word}.`,
};

const CENTRO_CENTRO_DESCRIPTION_ZERO: Record<Locale, string> = {
  es: "Nadie ha reportado todavía cuánto cuesta una carrera corta dentro de Centro, Cartagena. Sé el primero en reportar tu tarifa.",
  en: "Nobody has reported what a short ride within Downtown, Cartagena costs yet. Be the first to report your fare.",
  fr: "Personne n'a encore signalé le prix d'un court trajet dans le Centre, Carthagène. Soyez le premier à signaler votre tarif.",
};

const METHOD_DESCRIPTION: Record<Locale, string> = {
  es: "Cómo calculamos los rangos de tarifa, de dónde vienen los datos y qué pasa cuando hay pocos o ningún reporte.",
  en: "How we calculate fare ranges, where the data comes from, and what happens when there are few or no reports.",
  fr: "Comment nous calculons les fourchettes de tarifs, d'où viennent les données et ce qui se passe quand il y a peu ou pas de signalements.",
};

export function methodologyTitle(locale: Locale): string {
  return `${COPY[locale].methodTitle} | cuánto cuesta cartagena`;
}

export function methodologyDescription(locale: Locale): string {
  return METHOD_DESCRIPTION[locale];
}

export function routeDescription(origin: PlaceId, destination: PlaceId, display: DisplayRange, locale: Locale): string {
  const isCentroCentro = origin === "centro" && destination === "centro";
  if (display.kind === "zero") {
    if (isCentroCentro) return CENTRO_CENTRO_DESCRIPTION_ZERO[locale];
    return ROUTE_DESCRIPTION_ZERO[locale](placeLabel(origin, locale), placeLabel(destination, locale));
  }
  const range = formatRange(display.min, display.max);
  const word = reportWord(display.totalReportCount, locale);
  if (isCentroCentro) return CENTRO_CENTRO_DESCRIPTION_VALUE[locale](range, display.totalReportCount, word);
  return ROUTE_DESCRIPTION_VALUE[locale](placeLabel(origin, locale), placeLabel(destination, locale), range, display.totalReportCount, word);
}
