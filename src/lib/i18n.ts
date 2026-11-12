/**
 * Los tres idiomas de la interfaz y sus textos.
 *
 * El ingles es el idioma por defecto y la clave de todo: si falta una traduccion, se
 * cae al ingles en vez de ensenar la clave cruda. Una pantalla a medias traducida se
 * entiende; una llena de `me.youOwe` no.
 *
 * El chino esta porque buena parte de las tiendas de barrio de Panama las llevan
 * familias chino-panamenas, que es el mismo motivo del guino visual de la landing.
 *
 * `satisfies` obliga a que los tres idiomas tengan EXACTAMENTE las mismas claves: si
 * agregas una al ingles y te olvidas del chino, TypeScript lo para antes de compilar.
 * Es la unica forma de que esto no se pudra con el tiempo.
 */

export const LANGS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "zh", label: "中文" },
] as const

export type Lang = (typeof LANGS)[number]["value"]

export const DEFAULT_LANG: Lang = "en"

/**
 * El locale de cada idioma, para fechas y numeros.
 *
 * No basta con traducir los textos: `toLocaleDateString` con "en-US" escribe "Nov 5"
 * aunque el resto de la pantalla este en espanol. Se usa es-PA y no es-ES porque el
 * formato de fecha panameno es el que el usuario espera.
 */
export const LOCALE: Record<Lang, string> = {
  en: "en-US",
  es: "es-PA",
  zh: "zh-CN",
}

const EN = {
  // Navegacion del cliente
  overview: "Overview",
  creditors: "Creditors",
  credit: "Credit",
  payments: "Payments",
  linkShop: "Link a shop",
  linkShort: "Link",
  settings: "Settings",
  myAccounts: "My accounts",

  // Resumen
  hello: "Hello",
  youOweAcross: "You owe, across all your shops",
  allPaidUp: "You are all paid up.",
  noDueDates: "No due dates on record for what you owe.",
  nextPayment: "Next payment",
  lateSince: "Late since",
  byStatus: "What you owe, by status",
  paidThisWeek: "What you paid this week",
  noPaymentsWeek: "No payments in the last 7 days.",
  whoYouOwe: "Who you owe",
  oweNothing: "You owe nothing right now.",
  late: "Late",
  viewAll: "View all",

  // Acreedores
  creditorsIntro: "Every shop that sells to you on credit, and what you owe each one.",
  searchShops: "Search your shops",
  noScoreYet: "No score yet",
  storeScore: "Store score",
  notLinkedYet: "You are not linked to any shop yet.",
  noShopMatches: "No shop of yours matches that.",

  // Credito
  creditIntro:
    "Each shop keeps its own standing for you. Paying an installment on time raises it; a late one lowers it.",
  standingStarts: "Your standing starts the first time a shop sells to you on credit.",
  bandNew: "New customer",
  bandWatch: "Needs attention",
  bandFair: "Fair standing",
  bandGood: "Good standing",
  nameFair: "Fair",
  nameGood: "Good",
  pointsToNext: "{n} points to {band}",
  topStanding: "Top standing. Keep it.",
  factorPunctuality: "Paying on time",
  factorPunctualityHint: "Weighs most. Every installment paid by its due date.",
  factorDebt: "How much you owe",
  factorDebtHint: "Your balance against the limit the shop gives you.",
  factorTenure: "How long you have bought",
  factorTenureHint: "Months since your first credit sale there.",
  factorFrequency: "How often you buy",
  factorFrequencyHint: "Credit sales in the last twelve months.",
  notSet: "Not set",
  outOf: "{points} of {max}",

  // Pagos
  paymentsIntro: "How you can pay what you owe, and the cards you have saved.",
  methods: "Methods",
  cashAtCounter: "Cash at the counter",
  alwaysAvailable: "Always available",
  yappy: "Yappy",
  card: "Card",
  waitingOnShop: "Waiting on the shop",
  on: "On",
  off: "Off",
  savedCards: "Saved cards",
  cardHolder: "Card holder",
  expires: "Expires",
  noCardYet: "No card yet",
  cardNote:
    "Card payments open once your shop connects its own merchant account. Your card details go straight to the payment provider, never to FIA'O.",

  // Vincular tienda
  linkIntro: "Enter the invite code they give you at the counter.",

  // Ajustes
  yourDetails: "Your details",
  name: "Name",
  province: "Province",
  provinceNote: "Your province decides which shops can sell to you on credit. Ask us to change it if you move.",
  language: "Language",
  appearance: "Appearance",
  logOut: "Log out",

  // Armazon y dashboard del negocio (/app)
  navDashboard: "Dashboard",
  navCustomers: "Customers",
  navInventory: "Inventory",
  navSales: "Sales",
  navReports: "Reports",
  navSettings: "Settings",
  groupMenu: "Menu",
  groupInsights: "Insights",
  groupAccount: "Account",
  owner: "Owner",
  quickAccess: "Quick access",
  searchCustomers: "Search customers",
  searchProducts: "Search products",
  searchSales: "Search sales",
  dashDesc: "What your customers owe you, as of today.",
  kpiOutstanding: "Outstanding credit",
  kpiWithBalanceOne: "{n} customer with a balance",
  kpiWithBalanceMany: "{n} customers with a balance",
  kpiOverdue: "Overdue",
  kpiPastDue: "Past the due date",
  kpiDueWeek: "Due this week",
  kpiNext7: "Next 7 days",
  kpiCollectedWeek: "Collected this week",
  kpiVsPrior: "vs the 7 days before",
  cardCollected: "Collected",
  cardPortfolio: "Portfolio by status",
  cardTopDebtors: "Top debtors",
  nobodyOwes: "Nobody owes you anything right now.",
  gettingStarted: "Getting started",
  noSalesTitle: "No credit sales yet",
  noSalesBody: "Add your customers and products first, then register your first credit sale.",
  addCustomer: "Add a customer",
} as const

/** La forma que los tres idiomas tienen que cumplir. */
export type Key = keyof typeof EN

export const DICT = {
  en: EN,

  es: {
    overview: "Resumen",
    creditors: "Acreedores",
    credit: "Crédito",
    payments: "Pagos",
    linkShop: "Vincular tienda",
    linkShort: "Vincular",
    settings: "Ajustes",
    myAccounts: "Mis cuentas",

    hello: "Hola",
    youOweAcross: "Debes, entre todas tus tiendas",
    allPaidUp: "Estás al día.",
    noDueDates: "No hay fechas de pago registradas para lo que debes.",
    nextPayment: "Próximo pago",
    lateSince: "Atrasado desde",
    byStatus: "Lo que debes, por estado",
    paidThisWeek: "Lo que pagaste esta semana",
    noPaymentsWeek: "Sin pagos en los últimos 7 días.",
    whoYouOwe: "A quién le debes",
    oweNothing: "Ahora mismo no debes nada.",
    late: "Atrasado",
    viewAll: "Ver todo",

    creditorsIntro: "Cada tienda que te vende fiado, y cuánto le debes a cada una.",
    searchShops: "Busca tus tiendas",
    noScoreYet: "Sin puntaje aún",
    storeScore: "Puntaje",
    notLinkedYet: "Todavía no estás vinculado a ninguna tienda.",
    noShopMatches: "Ninguna de tus tiendas coincide con eso.",

    creditIntro: "Cada tienda lleva su propio puntaje tuyo. Pagar una cuota a tiempo lo sube; una atrasada lo baja.",
    standingStarts: "Tu puntaje empieza la primera vez que una tienda te venda fiado.",
    bandNew: "Cliente nuevo",
    bandWatch: "Necesita atención",
    bandFair: "Puntaje regular",
    bandGood: "Buen puntaje",
    nameFair: "Regular",
    nameGood: "Bueno",
    pointsToNext: "{n} puntos para {band}",
    topStanding: "El mejor puntaje. Mantenlo.",
    factorPunctuality: "Pagar a tiempo",
    factorPunctualityHint: "Es lo que más pesa. Cada cuota pagada en su fecha.",
    factorDebt: "Cuánto debes",
    factorDebtHint: "Tu saldo contra el límite que te da la tienda.",
    factorTenure: "Hace cuánto compras",
    factorTenureHint: "Meses desde tu primera compra fiada allí.",
    factorFrequency: "Cada cuánto compras",
    factorFrequencyHint: "Compras fiadas en los últimos doce meses.",
    notSet: "Sin fijar",
    outOf: "{points} de {max}",

    paymentsIntro: "Cómo puedes pagar lo que debes, y las tarjetas que tienes guardadas.",
    methods: "Métodos",
    cashAtCounter: "Efectivo en el mostrador",
    alwaysAvailable: "Siempre disponible",
    yappy: "Yappy",
    card: "Tarjeta",
    waitingOnShop: "Falta que la tienda lo active",
    on: "Activo",
    off: "Inactivo",
    savedCards: "Tarjetas guardadas",
    cardHolder: "Titular",
    expires: "Vence",
    noCardYet: "Sin tarjeta",
    cardNote:
      "Los pagos con tarjeta se abren cuando tu tienda conecte su propia cuenta de comercio. Los datos de tu tarjeta van directo a la pasarela, nunca a FIA'O.",

    linkIntro: "Escribe el código de invitación que te dan en el mostrador.",

    yourDetails: "Tus datos",
    name: "Nombre",
    province: "Provincia",
    provinceNote: "Tu provincia decide qué tiendas te pueden vender fiado. Pídenos cambiarla si te mudas.",
    language: "Idioma",
    appearance: "Apariencia",
    logOut: "Cerrar sesión",

    navDashboard: "Panel",
    navCustomers: "Clientes",
    navInventory: "Inventario",
    navSales: "Ventas",
    navReports: "Reportes",
    navSettings: "Ajustes",
    groupMenu: "Menú",
    groupInsights: "Análisis",
    groupAccount: "Cuenta",
    owner: "Dueño",
    quickAccess: "Acceso rápido",
    searchCustomers: "Buscar clientes",
    searchProducts: "Buscar productos",
    searchSales: "Buscar ventas",
    dashDesc: "Lo que te deben tus clientes, al día de hoy.",
    kpiOutstanding: "Crédito por cobrar",
    kpiWithBalanceOne: "{n} cliente con saldo",
    kpiWithBalanceMany: "{n} clientes con saldo",
    kpiOverdue: "Vencido",
    kpiPastDue: "Pasó la fecha de pago",
    kpiDueWeek: "Vence esta semana",
    kpiNext7: "Próximos 7 días",
    kpiCollectedWeek: "Cobrado esta semana",
    kpiVsPrior: "frente a los 7 días anteriores",
    cardCollected: "Cobrado",
    cardPortfolio: "Cartera por estado",
    cardTopDebtors: "Mayores deudores",
    nobodyOwes: "Nadie te debe nada en este momento.",
    gettingStarted: "Primeros pasos",
    noSalesTitle: "Aún no hay ventas a crédito",
    noSalesBody: "Agrega primero tus clientes y productos, y luego registra tu primera venta a crédito.",
    addCustomer: "Agregar un cliente",
  },

  zh: {
    overview: "总览",
    creditors: "债主",
    credit: "信用",
    payments: "付款",
    linkShop: "绑定商店",
    linkShort: "绑定",
    settings: "设置",
    myAccounts: "我的账户",

    hello: "你好",
    youOweAcross: "你在所有商店欠的总额",
    allPaidUp: "你已全部付清。",
    noDueDates: "你所欠的款项没有登记到期日。",
    nextPayment: "下次付款",
    lateSince: "逾期自",
    byStatus: "欠款状态",
    paidThisWeek: "本周已付",
    noPaymentsWeek: "最近 7 天没有付款。",
    whoYouOwe: "你欠谁的",
    oweNothing: "你目前没有欠款。",
    late: "逾期",
    viewAll: "查看全部",

    creditorsIntro: "每一家赊账给你的商店，以及你欠各家的金额。",
    searchShops: "搜索你的商店",
    noScoreYet: "暂无评分",
    storeScore: "评分",
    notLinkedYet: "你还没有绑定任何商店。",
    noShopMatches: "没有找到匹配的商店。",

    creditIntro: "每家商店各自记录你的评分。按时还款会提高评分，逾期会降低。",
    standingStarts: "商店第一次赊账给你时，评分就开始了。",
    bandNew: "新客户",
    bandWatch: "需要注意",
    bandFair: "评分一般",
    bandGood: "评分良好",
    nameFair: "一般",
    nameGood: "良好",
    pointsToNext: "再得 {n} 分即可达到{band}",
    topStanding: "最高评分，请继续保持。",
    factorPunctuality: "按时还款",
    factorPunctualityHint: "权重最高。每一期都在到期日前付清。",
    factorDebt: "欠款金额",
    factorDebtHint: "你的欠款与商店给你的额度之比。",
    factorTenure: "赊账时长",
    factorTenureHint: "自你在该店第一次赊账以来的月数。",
    factorFrequency: "赊账频率",
    factorFrequencyHint: "过去十二个月的赊账次数。",
    notSet: "未设定",
    outOf: "{points} / {max}",

    paymentsIntro: "你可以怎样还款，以及你已保存的银行卡。",
    methods: "付款方式",
    cashAtCounter: "到店付现金",
    alwaysAvailable: "随时可用",
    yappy: "Yappy",
    card: "银行卡",
    waitingOnShop: "等待商店开通",
    on: "已开通",
    off: "未开通",
    savedCards: "已保存的银行卡",
    cardHolder: "持卡人",
    expires: "有效期",
    noCardYet: "暂无银行卡",
    cardNote: "商店连接自己的收款账户后即可用银行卡付款。你的卡号直接发送给支付机构，绝不经过 FIA'O。",

    linkIntro: "输入店家在柜台给你的邀请码。",

    yourDetails: "你的资料",
    name: "姓名",
    province: "省份",
    provinceNote: "你的省份决定哪些商店可以赊账给你。搬家后请告诉我们更改。",
    language: "语言",
    appearance: "外观",
    logOut: "退出登录",

    navDashboard: "总览",
    navCustomers: "客户",
    navInventory: "库存",
    navSales: "销售",
    navReports: "报表",
    navSettings: "设置",
    groupMenu: "菜单",
    groupInsights: "分析",
    groupAccount: "账户",
    owner: "店主",
    quickAccess: "快捷入口",
    searchCustomers: "搜索客户",
    searchProducts: "搜索商品",
    searchSales: "搜索销售",
    dashDesc: "截至今天，客户欠你的金额。",
    kpiOutstanding: "未收赊账",
    kpiWithBalanceOne: "{n} 位客户有欠款",
    kpiWithBalanceMany: "{n} 位客户有欠款",
    kpiOverdue: "已逾期",
    kpiPastDue: "已过还款日",
    kpiDueWeek: "本周到期",
    kpiNext7: "未来 7 天",
    kpiCollectedWeek: "本周已收",
    kpiVsPrior: "与前 7 天相比",
    cardCollected: "已收款",
    cardPortfolio: "按状态划分的账款",
    cardTopDebtors: "欠款最多的客户",
    nobodyOwes: "目前没有人欠你钱。",
    gettingStarted: "开始使用",
    noSalesTitle: "还没有赊账销售",
    noSalesBody: "先添加客户和商品，然后登记第一笔赊账销售。",
    addCustomer: "添加客户",
  },
} as const satisfies Record<Lang, Record<Key, string>>

/**
 * El texto en el idioma pedido, con el ingles de red de seguridad.
 *
 * `vars` rellena los huecos `{nombre}`. Existe porque el orden de las palabras cambia
 * entre idiomas: "24 points to Fair" en chino es "再得 24 分即可达到一般", con el numero
 * en otro sitio. Pegar trozos sueltos solo funciona en ingles.
 */
export function t(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  const text = DICT[lang][key] || DICT[DEFAULT_LANG][key]
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (hueco, nombre) => String(vars[nombre] ?? hueco))
}
