import { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

const supabase = createClient(
  "https://pkqhzkrkxmipivlabpzb.supabase.co",
  "sb_publishable_uHSKWOeaYyUo07g59N6y-A_cJMhLCUx"
);

const fmt = (n) => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n);
const fmtUSD = (n) => "USD " + fmt(n);

const BARRIOS = {
  // Precios actualizados jun-2026. Fuentes: Mudafy ene-2026, Ambito dic-2025, Zonaprop feb-2026, RE/MAX
  // sin_ref = a reciclar (lo que comprás) | reciclado = post-refacción premium (tu ARV) | nuevo = a estrenar
  "Palermo":           { sin_ref: 2000, reciclado: 2900, nuevo: 3800, pozo: 3200, tendencia: "sube", demanda: "alta",  nota: "Alta rotación de reciclados. El mercado premia terminaciones premium. Fuerte demanda post-crédito UVA." },
  "Palermo Soho":      { sin_ref: 2200, reciclado: 3200, nuevo: 4200, pozo: 3500, tendencia: "sube", demanda: "alta",  nota: "Sub-barrio premium. Perfil aspiracional con fuerte demanda de alquiler y compra." },
  "Palermo Hollywood": { sin_ref: 2100, reciclado: 3000, nuevo: 4000, pozo: 3300, tendencia: "sube", demanda: "alta",  nota: "Alta demanda con perfil creativo y gastronómico. Precios sostenidos." },
  "Las Cañitas":       { sin_ref: 2100, reciclado: 3100, nuevo: 4100, pozo: 3400, tendencia: "sube", demanda: "alta",  nota: "Barrio boutique ABC1. Ideal para unidades pequeñas con terminaciones de lujo." },
  "Belgrano":          { sin_ref: 1900, reciclado: 2800, nuevo: 3700, pozo: 3000, tendencia: "sube", demanda: "alta",  nota: "Amplio parque habitacional envejecido. Gran margen de reciclado. Demanda sostenida." },
  "Núñez":             { sin_ref: 1950, reciclado: 2850, nuevo: 3800, pozo: 3100, tendencia: "sube", demanda: "alta",  nota: "Fuerte crecimiento 2024-2026 (+16,5%). Demanda residencial y nuevos proyectos de diseño." },
  "Recoleta":          { sin_ref: 1850, reciclado: 2700, nuevo: 4000, pozo: 3300, tendencia: "sube", demanda: "media", nota: "Mercado premium. Flipping viable solo con refacción de lujo y terminaciones de alta gama." },
  "Barrio Norte":      { sin_ref: 1800, reciclado: 2650, nuevo: 3600, pozo: 3000, tendencia: "sube", demanda: "media", nota: "Gran stock de edificios 60-80s. Buenas oportunidades de revalorización post-refacción." },
  "Almagro":           { sin_ref: 1500, reciclado: 2300, nuevo: 2900, pozo: 2400, tendencia: "sube", demanda: "alta",  nota: "PH para reciclar: comprar a u$s1.400-1.600/m² y vender a u$s2.200-2.600/m². Muy buen margen." },
  "Villa Crespo":      { sin_ref: 1550, reciclado: 2400, nuevo: 3000, pozo: 2500, tendencia: "sube", demanda: "alta",  nota: "Fuerte transformación (+15-20% en 2025-2026). Precios convergiendo con Palermo." },
  "Caballito":         { sin_ref: 1450, reciclado: 2200, nuevo: 2900, pozo: 2400, tendencia: "estable", demanda: "media", nota: "Barrio céntrico consolidado. Mejor relación precio-demanda para 2 ambientes." },
  "Flores":            { sin_ref: 1200, reciclado: 1850, nuevo: 2400, pozo: 2000, tendencia: "estable", demanda: "media", nota: "Precios accesibles. Buena relación precio-demanda para 2 ambientes." },
  "Balvanera":         { sin_ref: 1150, reciclado: 1750, nuevo: 2300, pozo: 1900, tendencia: "estable", demanda: "baja",  nota: "Zona comercial con demanda residencial moderada. Solo viable con precios muy bajos." },
  "San Telmo":         { sin_ref: 1300, reciclado: 2000, nuevo: 2700, pozo: 2200, tendencia: "estable", demanda: "media", nota: "Amplia dispersión de precios (u$s865-1.875). Bueno para turismo y alquiler temporario." },
  "Puerto Madero":     { sin_ref: 4000, reciclado: 5500, nuevo: 7500, pozo: 6500, tendencia: "estable", demanda: "baja",  nota: "Ultralujo. Mercado ilíquido. No recomendable para flipping." },
  "Colegiales":        { sin_ref: 1750, reciclado: 2550, nuevo: 3400, pozo: 2800, tendencia: "sube", demanda: "alta",  nota: "Crecimiento fuerte (+14,9% anual). Emergente consolidado, más accesible que Palermo." },
  "Chacarita":         { sin_ref: 1600, reciclado: 2350, nuevo: 3100, pozo: 2600, tendencia: "sube", demanda: "alta",  nota: "Mucho stock antiguo. Crecimiento del 9% anual. Buenos márgenes para unidades medianas." },
  "Villa Urquiza":     { sin_ref: 1650, reciclado: 2450, nuevo: 3200, pozo: 2600, tendencia: "sube", demanda: "media", nota: "Consolidada con subte y vida comercial. Precios en alza sostenida." },
  "Saavedra":          { sin_ref: 1500, reciclado: 2200, nuevo: 2900, pozo: 2400, tendencia: "estable", demanda: "media", nota: "Residencial tranquilo. Demanda estable, menor dinamismo que barrios céntricos." },
  "Devoto":            { sin_ref: 1400, reciclado: 2050, nuevo: 2700, pozo: 2200, tendencia: "estable", demanda: "media", nota: "Precio de entrada accesible pero velocidad de venta media-baja." },
  "Villa del Parque":  { sin_ref: 1300, reciclado: 1950, nuevo: 2600, pozo: 2100, tendencia: "estable", demanda: "baja",  nota: "Mercado tranquilo. Requiere precio de compra bajo para que el margen cierre." },
  "Boedo":             { sin_ref: 1400, reciclado: 2050, nuevo: 2700, pozo: 2200, tendencia: "sube", demanda: "media", nota: "Revalorización gradual. Stock antiguo con buen potencial de reciclado." },
  "Paternal":          { sin_ref: 1250, reciclado: 1850, nuevo: 2500, pozo: 2000, tendencia: "estable", demanda: "baja",  nota: "Mercado lento. Solo viable con precios muy por debajo del mercado." },
};

const STORAGE_KEY = "flip-watchlist-v1";

const C = {
  bg:          "#0F1117",
  panel:       "#1C1F2E",
  panelAlt:    "#161924",
  border:      "#2A2D3E",
  borderLight: "#363A50",
  accent:      "#3A8EF6",
  accentDim:   "#1A2A4A",
  text:        "#FFFFFF",
  textSub:     "#C8CCDE",
  textMuted:   "#8A8FA8",
  green:       "#34C759",
  greenDim:    "#0D2B1D",
  red:         "#FF3B30",
  redDim:      "#2B0D0D",
  amber:       "#F5A623",
  amberDim:    "#2B1A0D",
  gold:        "#F5A623",
  mono:        "-apple-system, 'SF Mono', 'Courier New', monospace",
};

const Tag = ({ children, color = C.textSub, bg = C.panelAlt, border = C.border }) => (
  <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, background: bg, border: `1px solid ${border}`, borderRadius: 3, padding: "2px 7px" }}>
    {children}
  </span>
);

const Divider = () => <div style={{ height: 1, background: C.border, margin: "20px 0" }} />;

const Row = ({ label, value, valueColor = C.text, mono = true, bold = false, sub }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 0", borderBottom: `0.5px solid ${C.border}` }}>
    <span style={{ fontSize: 12, color: C.textSub, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
    <div style={{ textAlign: "right" }}>
      <span style={{ fontSize: bold ? 18 : 14, fontWeight: bold ? 700 : 600, color: valueColor, fontFamily: mono ? C.mono : "inherit", letterSpacing: bold ? "-0.02em" : "0" }}>
        {value}
      </span>
      {sub && <div style={{ fontSize: 10, color: C.textMuted, fontFamily: C.mono }}>{sub}</div>}
    </div>
  </div>
);

const StatBox = ({ label, value, color = C.text, sub, tag }) => (
  <div style={{ background: C.panel, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
      {tag && <Tag color={tag.color} bg={tag.bg} border={tag.border}>{tag.label}</Tag>}
    </div>
    <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: C.mono, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6, fontFamily: C.mono }}>{sub}</div>}
  </div>
);

const Slider = ({ label, min, max, step, value, onChange, prefix = "", suffix = "" }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: C.mono, letterSpacing: "-0.02em" }}>
          {prefix}{value >= 1000 ? fmt(value) : value}{suffix}
        </span>
      </div>
      <div style={{ position: "relative", height: 3, background: C.border, borderRadius: 2 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: C.accent, borderRadius: 2 }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "absolute", top: "50%", left: 0, width: "100%", transform: "translateY(-50%)", opacity: 0, cursor: "pointer", height: 20, margin: 0 }} />
        <div style={{ position: "absolute", top: "50%", left: `${pct}%`, transform: "translate(-50%, -50%)", width: 14, height: 14, borderRadius: "50%", background: C.panel, border: `2px solid ${C.accent}`, boxShadow: "0 1px 4px rgba(0,0,0,0.15)", pointerEvents: "none" }} />
      </div>
    </div>
  );
};

const SectionHeader = ({ title, sub, mt = 28 }) => (
  <div style={{ marginTop: mt, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
    <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>{title}</span>
    {sub && <span style={{ fontSize: 10, color: C.textMuted }}>{sub}</span>}
  </div>
);

export default function FlipCalc() {
  const [loggedIn, setLoggedIn] = useState(() => !!sessionStorage.getItem("flippar_user"));
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [currentUser, setCurrentUser] = useState(() => sessionStorage.getItem("flippar_user") || "");
  const [tab, setTab] = useState("calc");
  // MAO tab state
  const [maoArv, setMaoArv] = useState("");
  const [maoM2, setMaoM2] = useState("");
  const [maoCostoPorM2, setMaoCostoPorM2] = useState(500);
  const [maoGastosCompra, setMaoGastosCompra] = useState(6);
  const [maoGastosTenenciaMes, setMaoGastosTenenciaMes] = useState(200);
  const [maoDuracion, setMaoDuracion] = useState(8);
  const [maoCostosVenta, setMaoCostosVenta] = useState(5);
  const [maoRentabilidadAnual, setMaoRentabilidadAnual] = useState(40);
  const [maoModo, setMaoModo] = useState("mao"); // "mao" o "arv"
  const modo = "avanzado";
  const [listPrice, setListPrice] = useState(120000);
  const [m2, setM2] = useState(55);
  const [negPct, setNegPct] = useState(10);
  const [refType, setRefType] = useState("media");
  const [refExtra, setRefExtra] = useState(0);
  const [closingPct] = useState(0);
  const [comisionCompraPct, setComisionCompraPct] = useState(0);
  const [escribanoCompraPct, setEscribanoCompraPct] = useState(1);
  const [valorMuebles, setValorMuebles] = useState(0);
  const [precioVentaPublicado, setPrecioVentaPublicado] = useState("");
  const [precioVentaCierre, setPrecioVentaCierre] = useState("");
  // Airbnb / alquiler temporario
  const [airbnbPrecioNoche, setAirbnbPrecioNoche] = useState(0);
  const [airbnbDiasMes, setAirbnbDiasMes] = useState(0);
  const [airbnbGastosMensuales, setAirbnbGastosMensuales] = useState(0);
  const [sellCommPct, setSellCommPct] = useState(3);
  const [escribanoPct, setEscribanoPct] = useState(1);
  const [sellMonths, setSellMonths] = useState(8);
  const [expensas, setExpensas] = useState(150000);
  const [expensasMoneda, setExpensasMoneda] = useState("ARS");
  const [blueRate, setBlueRate] = useState(1300);
  const [alquilerM2, setAlquilerM2] = useState(0);
  const [barrioInput, setBarrioInput] = useState("");
  const [barrio, setBarrio] = useState(null);
  const [showSug, setShowSug] = useState(false);
  const [customUsadoM2, setCustomUsadoM2] = useState("");
  const [customNuevoM2, setCustomNuevoM2] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveLink, setSaveLink] = useState("");
  const [saveNotas, setSaveNotas] = useState("");

  useEffect(() => {
    const loadWatchlist = async () => {
      if (!currentUser) return;
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("usuario", currentUser)
        .order("roi_anual", { ascending: false });
      if (!error && data) setWatchlist(data);
    };
    loadWatchlist();
  }, [currentUser]);

  const saveToStorage = async (entry) => {
    await supabase.from("watchlist").insert([entry]);
  };

  const deleteFromStorage = async (id) => {
    await supabase.from("watchlist").delete().eq("id", id);
  };

  const refRates  = { estetica: 300, media: 500, integral: 850 };
  const refLabels = { estetica: "Estética", media: "Media", integral: "Integral" };
  const refDesc   = { estetica: "200–400/m²", media: "400–700/m²", integral: "700–1.000/m²" };

  const c = useMemo(() => {
    const buyPrice    = listPrice * (1 - negPct / 100);
    const refCost     = refRates[refType] * m2 + refExtra;
    const closing     = buyPrice * closingPct / 100;
    const comisionCompra = buyPrice * comisionCompraPct / 100;
    const escribanoCompra = buyPrice * escribanoCompraPct / 100;
    const totalCost   = buyPrice + refCost + closing + comisionCompra + escribanoCompra;
    const arvM2       = barrio ? (customUsadoM2 ? Number(customUsadoM2) : BARRIOS[barrio].reciclado) : null;
    const arv         = arvM2 ? arvM2 * m2 : null;
    const pctDelARV   = arv ? (buyPrice / arv) * 100 : null;
    const nuevoM2ref  = barrio ? (customNuevoM2 ? Number(customNuevoM2) : BARRIOS[barrio].nuevo) : null;
    const nuevoTotal  = nuevoM2ref ? nuevoM2ref * m2 : null;
    const usandoCustom = !!(customUsadoM2 || customNuevoM2);
    const sellComm    = arv ? arv * sellCommPct / 100 : null;
    const escribanoCost = arv ? arv * escribanoPct / 100 : null;
    const netSale     = arv ? arv - sellComm - escribanoCost : null;
    const profit      = arv ? netSale - totalCost : null;
    const roi         = profit ? (profit / totalCost) * 100 : null;
    const roiAnual    = roi ? (roi / sellMonths) * 12 : null;
    const viable      = profit > 0 && roi > 10;
    const discVsNuevo = arv && nuevoTotal ? ((nuevoTotal - arv) / nuevoTotal) * 100 : null;
    // Venta: usar precio de cierre manual si está completo, sino el ARV calculado
    const ventaFinal = precioVentaCierre ? Number(precioVentaCierre) : arv;
    const sellCommFinal = ventaFinal ? ventaFinal * sellCommPct / 100 : null;
    const escribanoCostFinal = ventaFinal ? ventaFinal * escribanoPct / 100 : null;
    const netSaleFinal = ventaFinal ? ventaFinal - sellCommFinal - escribanoCostFinal : null;
    const profitFinal = ventaFinal ? netSaleFinal - totalCost : null;
    const gananciaConMuebles = profitFinal !== null ? profitFinal + Number(valorMuebles || 0) : null;
    // Airbnb / alquiler temporario
    const airbnbIngresoMensual = airbnbPrecioNoche * airbnbDiasMes;
    const airbnbIngresoAnualBruto = airbnbIngresoMensual * 12;
    const airbnbGastosAnuales = airbnbGastosMensuales * 12;
    const airbnbIngresoAnualNeto = airbnbIngresoAnualBruto - airbnbGastosAnuales;
    // Expensas durante tenencia
    const expensasUSD = expensasMoneda === "ARS" ? expensas / blueRate : expensas;
    const expensasTotal = expensasUSD * sellMonths;
    const profitNeto = profitFinal !== null ? profitFinal - expensasTotal : null;
    const roiNeto = profitNeto !== null ? (profitNeto / totalCost) * 100 : null;
    const roiNetoAnual = roiNeto !== null ? (roiNeto / sellMonths) * 12 : null;
    const roiMinimoExigido = (sellMonths / 6) * 10;
    const viableNeto = profitNeto > 0 && roiNeto > roiMinimoExigido;
    // Alquiler
    const alquilerMensual = alquilerM2 > 0 ? alquilerM2 * m2 : null;
    const alquilerAnual = alquilerMensual ? alquilerMensual * 12 : null;
    const alquilerROI = alquilerAnual ? (alquilerAnual / totalCost) * 100 : null;
    return { buyPrice, refCost, closing, comisionCompra, escribanoCompra, totalCost, arv, arvM2, pctDelARV, nuevoTotal, sellComm, escribanoCost, netSale, profit, roi, roiAnual, viable, discVsNuevo, usandoCustom, expensasTotal, profitNeto, roiNeto, roiNetoAnual, viableNeto, roiMinimoExigido, alquilerMensual, alquilerAnual, alquilerROI, ventaFinal, sellCommFinal, escribanoCostFinal, netSaleFinal, profitFinal, gananciaConMuebles, airbnbIngresoMensual, airbnbIngresoAnualBruto, airbnbGastosAnuales, airbnbIngresoAnualNeto };
  }, [listPrice, m2, negPct, refType, refExtra, closingPct, comisionCompraPct, escribanoCompraPct, sellCommPct, escribanoPct, sellMonths, barrio, customUsadoM2, customNuevoM2, expensas, expensasMoneda, blueRate, alquilerM2, precioVentaCierre, valorMuebles, airbnbPrecioNoche, airbnbDiasMes, airbnbGastosMensuales]);

  const filtered = Object.keys(BARRIOS).filter(b =>
    barrioInput.length > 0 && b.toLowerCase().includes(barrioInput.toLowerCase())
  );
  const selectBarrio = (b) => { setBarrio(b); setBarrioInput(b); setShowSug(false); setCustomUsadoM2(""); setCustomNuevoM2(""); };

  const handleSave = async () => {
    if (!barrio || !saveName.trim()) return;
    const entry = {
      usuario: currentUser,
      nombre: saveName.trim(),
      link: saveLink.trim(),
      notas: saveNotas.trim(),
      barrio, m2,
      list_price: listPrice,
      ref_type: refType,
      arv: c.arv,
      nuevo_total: c.nuevoTotal,
      disc_vs_nuevo: c.discVsNuevo,
      profit: Math.round(c.profit),
      roi: c.roi,
      roi_anual: c.roiAnual,
      viable: c.viable,
      fecha: new Date().toLocaleDateString("es-AR"),
      datos: { buyPrice: Math.round(c.buyPrice), totalCost: Math.round(c.totalCost), negPct },
    };
    await saveToStorage(entry);
    const { data } = await supabase
      .from("watchlist")
      .select("*")
      .eq("usuario", currentUser)
      .order("roi_anual", { ascending: false });
    if (data) setWatchlist(data);
    setShowSaveModal(false);
    setSaveName(""); setSaveLink(""); setSaveNotas("");
    setTab("watchlist");
  };

  const handleDelete = async (id) => {
    await deleteFromStorage(id);
    setWatchlist(prev => prev.filter(w => w.id !== id));
  };

  const tendIcon = (t) => t === "sube" ? "▲" : t === "baja" ? "▼" : "—";
  const tendColor = (t) => t === "sube" ? C.green : t === "baja" ? C.red : C.textSub;
  const demandaColor = (d) => d === "alta" ? C.green : d === "baja" ? C.red : C.amber;
  const barrioData = barrio ? BARRIOS[barrio] : null;

  const inputBase = (active) => ({
    width: "100%", padding: "12px 14px", boxSizing: "border-box",
    background: C.panelAlt,
    border: `1px solid ${active ? C.accent : C.border}`,
    borderRadius: 6, color: C.text, fontSize: 15,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", outline: "none",
  });

  const Bar = ({ label, val, pct, color, bold, sub }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: bold ? C.text : C.textSub, fontWeight: bold ? 700 : 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: bold ? C.text : C.textSub, fontFamily: C.mono }}>{fmtUSD(Math.round(val))}</span>
          {sub && <div style={{ fontSize: 10, color: C.textMuted, fontFamily: C.mono }}>{sub}</div>}
        </div>
      </div>
      <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );

  const now = new Date().toLocaleString("es-AR", { day:"2-digit", month:"2-digit", year:"2-digit", hour:"2-digit", minute:"2-digit" });

  // MAO calculation
  const maoCalc = useMemo(() => {
    const arv = Number(maoArv) || 0;
    const m2 = Number(maoM2) || 0;
    const capex = m2 * maoCostoPorM2;
    const gastosCompra = arv * maoGastosCompra / 100;
    const opex = maoGastosTenenciaMes * maoDuracion;
    const gastosVenta = arv * maoCostosVenta / 100;
    const rentabilidadNecesaria = arv * (maoRentabilidadAnual / 100) * (maoDuracion / 12);
    const mao = arv - capex - gastosCompra - opex - gastosVenta - rentabilidadNecesaria;
    const pctDelArv = arv ? (mao / arv) * 100 : 0;
    // ARV objetivo (modo inverso)
    const arvObjetivo = maoArv ? 0 : 0; // se calcula si el usuario pone MAO y quiere saber ARV
    return { arv, m2, capex, gastosCompra, opex, gastosVenta, rentabilidadNecesaria, mao, pctDelArv };
  }, [maoArv, maoM2, maoCostoPorM2, maoGastosCompra, maoGastosTenenciaMes, maoDuracion, maoCostosVenta, maoRentabilidadAnual]);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = [];

    // SECCIÓN 1: ANÁLISIS
    rows.push(["ANÁLISIS DE INVERSIÓN", "", "", ""]);
    rows.push(["Fecha", new Date().toLocaleDateString("es-AR"), "", ""]);
    rows.push(["Usuario", currentUser, "", ""]);
    rows.push([]);
    rows.push(["Precio publicación", listPrice, "Total invertido", Math.round(c.totalCost)]);
    rows.push(["Precio de compra", Math.round(c.buyPrice), "ARV", Math.round(c.arv || 0)]);
    rows.push(["Barrio", barrio || "—", "Venta neta", Math.round(c.netSaleFinal || 0)]);
    rows.push(["Superficie (m²)", m2, "Ganancia bruta", Math.round(c.profitFinal || 0)]);
    rows.push(["Tipo refacción", refType, "Ganancia neta", Math.round(c.profitNeto || 0)]);
    rows.push(["Plazo (meses)", sellMonths, "ROI neto total", `${c.roiNeto?.toFixed(2)}%`]);
    rows.push(["% del ARV (compra)", `${c.pctDelARV?.toFixed(0)}%`, "ROI mínimo exigido", `${c.roiMinimoExigido?.toFixed(1)}%`]);
    rows.push(["", "", "Viabilidad", c.viableNeto ? "✓ VIABLE" : "✕ NO VIABLE"]);
    rows.push([]);

    // SECCIÓN 2: MAO
    if (maoCalc.arv > 0) {
      rows.push(["CALCULADORA MAO", "", "", ""]);
      rows.push(["ARV", maoCalc.arv, "CAPEX", maoCalc.capex]);
      rows.push([`Gastos compra (${maoGastosCompra}%)`, Math.round(maoCalc.gastosCompra), `OPEX (${maoDuracion} meses)`, maoCalc.opex]);
      rows.push([`Gastos venta (${maoCostosVenta}%)`, Math.round(maoCalc.gastosVenta), `Rentabilidad (${maoRentabilidadAnual}% anual)`, Math.round(maoCalc.rentabilidadNecesaria)]);
      rows.push(["MAO (Máximo a Ofrecer)", Math.round(maoCalc.mao), "MAO % del ARV", `${maoCalc.pctDelArv.toFixed(0)}%`]);
      rows.push(["Regla 70%", maoCalc.pctDelArv <= 70 ? "✓ Cumple" : "⚠ No cumple", "", ""]);
      rows.push([]);
    }

    // SECCIÓN 3: WATCHLIST
    if (watchlist.length > 0) {
      rows.push(["WATCHLIST", "", "", "", "", "", "", "", ""]);
      rows.push(["Nombre", "Barrio", "m²", "Precio compra", "Valor m²", "Ganancia", "ROI total", "ROI mínimo", "Viable", "% del ARV", "Fecha", "Link"]);
      watchlist.forEach(w => {
        const roiMinimo = w.roi_anual != null ? `${((w.roi_anual / 12) * 6).toFixed(1)}%` : "—";
        const pctArv = w.datos?.buyPrice && w.arv ? `${((w.datos.buyPrice / w.arv) * 100).toFixed(0)}%` : "—";
        rows.push([
          w.nombre,
          w.barrio,
          w.m2,
          w.datos?.buyPrice || "—",
          w.datos?.buyPrice && w.m2 ? Math.round(w.datos.buyPrice / w.m2) : "—",
          w.profit,
          w.roi != null ? `${w.roi.toFixed(2)}%` : "—",
          roiMinimo,
          w.viable ? "✓ Sí" : "✕ No",
          pctArv,
          w.fecha,
          w.link || "",
        ]);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 28 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws, "flippar");
    XLSX.writeFile(wb, `flippar_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const USERS = {
    "Daniela": "dani0812",
    "Juliana": "bejsof",
    "Varios": "1234",
    "Admin": "fjjDani0812",
  };

  const handleLogin = () => {
    if (USERS[loginUser] && USERS[loginUser] === loginPass) {
      sessionStorage.setItem("flippar_user", loginUser);
      setCurrentUser(loginUser);
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("flippar_user");
    setLoggedIn(false);
    setCurrentUser("");
    setLoginUser("");
    setLoginPass("");
  };

  if (!loggedIn) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: C.text, letterSpacing: "-0.03em", marginBottom: 8 }}>flippar</div>
          <div style={{ fontSize: 15, color: C.textMuted }}>Calculadora de Flipping · CABA</div>
        </div>
        <div style={{ background: C.panel, borderRadius: 16, padding: 24, boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Usuario</div>
            <input
              value={loginUser}
              onChange={e => setLoginUser(e.target.value)}
              placeholder="Tu nombre de usuario"
              style={{ width: "100%", padding: "12px 14px", boxSizing: "border-box", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 16, color: C.text, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Contraseña</div>
            <input
              type="password"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px 14px", boxSizing: "border-box", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 16, color: C.text, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          {loginError && <div style={{ fontSize: 13, color: C.red, marginBottom: 14, textAlign: "center" }}>{loginError}</div>}
          <button onClick={handleLogin} style={{ width: "100%", padding: 14, background: C.accent, border: "none", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", paddingBottom: 80, color: C.text }}>

      <style>{`
  * { -webkit-font-smoothing: antialiased; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif; background: #0F1117; }
  input[type=number]::-webkit-outer-spin-button,
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`}</style>

      {/* Top bar */}
      <div style={{ background: "rgba(15,17,23,0.95)", borderBottom: `1px solid ${C.border}`, padding: "0 20px", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: C.text, letterSpacing: "-0.02em" }}>Flippear</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>{currentUser}</span>
            <button onClick={handleLogout} style={{ fontSize: 12, color: C.accent, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Salir</button>
            <button onClick={exportToExcel} style={{ fontSize: 12, color: C.green, background: "transparent", border: `1px solid ${C.green}`, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, padding: "3px 8px" }}>⬇ Excel</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginTop: 0, borderBottom: `1px solid ${C.border}` }}>
          {[["mao", "En el sitio"], ["calc", "Análisis completo"], ["watchlist", `Watchlist${watchlist.length > 0 ? ` (${watchlist.length})` : ""}`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "12px 16px 11px", fontSize: 13, fontWeight: tab === key ? 700 : 400,
              background: "transparent", border: "none",
              borderBottom: `2px solid ${tab === key ? C.amber : "transparent"}`,
              color: tab === key ? C.amber : C.textMuted,
              cursor: "pointer", letterSpacing: "-0.01em",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif", transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px", maxWidth: 520, margin: "0 auto" }}>

        {/* ===== CALC ===== */}
        {tab === "calc" && (
          <div style={{ margin: "0 -20px" }}>
            <div style={{ background: "#0F1117", minHeight: "calc(100vh - 100px)", padding: "20px 20px 40px" }}>

              {/* Two column layout */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* LEFT — Inputs mínimos */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Datos de la propiedad</div>

                  {[
                    { label: "Precio publicación (USD)", val: listPrice || "", set: v => setListPrice(Number(v) || 0), placeholder: "ej: 90000" },
                    { label: "Superficie (m²)", val: m2 || "", set: v => setM2(Number(v) || 0), placeholder: "ej: 45" },
                  ].map(({ label, val, set, placeholder }) => (
                    <div key={label} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "#8A8FA8", marginBottom: 5, fontWeight: 500 }}>{label}</div>
                      <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "#1C1F2E", border: `1.5px solid ${val ? "#3A8EF6" : "#2A2D3E"}`, borderRadius: 8, color: "#FFFFFF", fontSize: 17, fontWeight: 700, fontFamily: "monospace", outline: "none" }} />
                    </div>
                  ))}

                  {/* Barrio */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#8A8FA8", marginBottom: 5, fontWeight: 500 }}>Barrio</div>
                    <div style={{ position: "relative" }}>
                      <input type="text" placeholder="Buscar barrio..." value={barrioInput}
                        onChange={(e) => { setBarrioInput(e.target.value); setShowSug(true); if (!e.target.value) setBarrio(null); }}
                        onFocus={() => setShowSug(true)}
                        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "#1C1F2E", border: `1.5px solid ${barrio ? "#34C759" : "#2A2D3E"}`, borderRadius: 8, color: "#FFFFFF", fontSize: 15, fontWeight: 600, outline: "none" }} />
                      {barrio && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#34C759", fontWeight: 700 }}>✓</span>}
                      {showSug && filtered.length > 0 && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: "#1C1F2E", border: `1px solid #2A2D3E`, borderRadius: 8, marginTop: 2, maxHeight: 200, overflowY: "auto" }}>
                          {filtered.map(b => (
                            <div key={b} onClick={() => selectBarrio(b)}
                              style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: "#FFFFFF", borderBottom: `1px solid #2A2D3E` }}
                              onMouseEnter={e => e.currentTarget.style.background = "#2A2D3E"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >{b}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Descuento */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#8A8FA8", marginBottom: 5, fontWeight: 500 }}>Descuento negociación (%)</div>
                    <input type="number" value={negPct} onChange={e => setNegPct(Number(e.target.value) || 0)} placeholder="10"
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "#1C1F2E", border: `1.5px solid #2A2D3E`, borderRadius: 8, color: "#FFFFFF", fontSize: 17, fontWeight: 700, fontFamily: "monospace", outline: "none" }} />
                  </div>

                  {/* Tipo refacción */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#8A8FA8", marginBottom: 8, fontWeight: 500 }}>Tipo de refacción</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                      {Object.entries(refRates).map(([k, v]) => (
                        <button key={k} onClick={() => setRefType(k)} style={{
                          padding: "8px 4px", fontSize: 11, fontWeight: 700,
                          background: refType === k ? "#F5A623" : "#1C1F2E",
                          border: `1px solid ${refType === k ? "#F5A623" : "#2A2D3E"}`,
                          borderRadius: 8, cursor: "pointer",
                          color: refType === k ? "#000" : "#8A8FA8",
                          textAlign: "center",
                        }}>
                          <div>{k.charAt(0).toUpperCase() + k.slice(1)}</div>
                          <div style={{ fontSize: 9, marginTop: 2, opacity: 0.8 }}>${fmt(v)}/m²</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comparables del barrio */}
                  {barrio && (
                    <div style={{ background: "#1C1F2E", borderRadius: 10, padding: "12px 14px", marginTop: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Comparables · {barrio}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {[
                          { label: "A reciclar", val: BARRIOS[barrio].sin_ref, color: "#8A8FA8" },
                          { label: "Reciclado", val: BARRIOS[barrio].reciclado, color: "#F5A623" },
                          { label: "Nuevo", val: BARRIOS[barrio].nuevo, color: "#34C759" },
                        ].map(({ label, val, color }) => (
                          <div key={label} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 9, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{fmtUSD(val)}</div>
                            <div style={{ fontSize: 9, color: "#8A8FA8" }}>/m²</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT — Resultados */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Resultado</div>

                  {/* Precio de compra */}
                  <div style={{ background: "#1C1F2E", borderRadius: 12, padding: "16px", marginBottom: 12, border: `1px solid #2A2D3E` }}>
                    <div style={{ fontSize: 10, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Precio de compra</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: "#3A8EF6", fontFamily: "monospace" }}>{fmtUSD(Math.round(c.buyPrice))}</div>
                    {m2 > 0 && <div style={{ fontSize: 11, color: "#8A8FA8", marginTop: 4 }}>{fmtUSD(Math.round(c.buyPrice / m2))}/m²</div>}
                    {c.pctDelARV != null && (
                      <div style={{ display: "inline-block", marginTop: 8, padding: "3px 10px", borderRadius: 6, background: c.pctDelARV <= 70 ? "#0D2B1D" : c.pctDelARV <= 85 ? "#2B1A0D" : "#2B0D0D", border: `1px solid ${c.pctDelARV <= 70 ? "#34C759" : c.pctDelARV <= 85 ? "#F5A623" : "#FF3B30"}` }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c.pctDelARV <= 70 ? "#34C759" : c.pctDelARV <= 85 ? "#F5A623" : "#FF3B30" }}>{c.pctDelARV?.toFixed(0)}% del ARV</span>
                      </div>
                    )}
                  </div>

                  {/* ARV */}
                  {barrio && m2 > 0 && (
                    <div style={{ background: "#1C1F2E", borderRadius: 12, padding: "16px", marginBottom: 12, border: `1px solid #34C759` }}>
                      <div style={{ fontSize: 10, color: "#34C759", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>ARV estimado · {barrio}</div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: "#34C759", fontFamily: "monospace" }}>{fmtUSD(Math.round(c.arv || 0))}</div>
                      <div style={{ fontSize: 11, color: "#8A8FA8", marginTop: 4 }}>{fmt(c.arvM2)} USD/m²</div>
                    </div>
                  )}

                  {/* Precios por m2 */}
                  {m2 > 0 && barrio && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                      {[
                        { label: "Compra/m²", val: fmtUSD(Math.round(c.buyPrice / m2)), color: "#3A8EF6" },
                        { label: "Invertido/m²", val: fmtUSD(Math.round(c.totalCost / m2)), color: "#F5A623" },
                        { label: "Venta/m²", val: fmtUSD(c.arvM2), color: "#34C759" },
                      ].map(({ label, val, color }) => (
                        <div key={label} style={{ background: "#1C1F2E", borderRadius: 8, padding: "10px 10px", textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ganancia y ROI */}
                  {barrio && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        <div style={{ background: "#1C1F2E", borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ fontSize: 9, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Ganancia bruta</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: c.profitFinal > 0 ? "#34C759" : "#FF3B30", fontFamily: "monospace" }}>{fmtUSD(Math.round(c.profitFinal || 0))}</div>
                        </div>
                        <div style={{ background: "#1C1F2E", borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ fontSize: 9, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>ROI total</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: c.roiNeto > c.roiMinimoExigido ? "#34C759" : "#FF3B30", fontFamily: "monospace" }}>{c.roiNeto?.toFixed(1)}%</div>
                          <div style={{ fontSize: 9, color: "#8A8FA8", marginTop: 2 }}>mín. {c.roiMinimoExigido?.toFixed(1)}%</div>
                        </div>
                      </div>

                      {/* Veredicto */}
                      <div style={{ background: c.viableNeto ? "#0D2B1D" : "#2B0D0D", border: `1.5px solid ${c.viableNeto ? "#34C759" : "#FF3B30"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16, textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: c.viableNeto ? "#34C759" : "#FF3B30", letterSpacing: "0.04em" }}>
                          {c.viableNeto ? "✓ ENTRA" : "✕ NO ENTRA"}
                        </div>
                        <div style={{ fontSize: 11, color: "#8A8FA8", marginTop: 6 }}>
                          {c.viableNeto
                            ? `ROI ${c.roiNeto?.toFixed(1)}% ≥ mínimo ${c.roiMinimoExigido?.toFixed(1)}%`
                            : `ROI ${c.roiNeto?.toFixed(1)}% < mínimo ${c.roiMinimoExigido?.toFixed(1)}%`
                          }
                        </div>
                      </div>

                      {/* Botón guardar */}
                      <button onClick={() => setShowSaveModal(true)} style={{
                        width: "100%", padding: "12px", background: "#F5A623", border: "none", borderRadius: 10,
                        cursor: "pointer", color: "#000", fontWeight: 800, fontSize: 13,
                        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", letterSpacing: "0.04em",
                      }}>
                        + Guardar en Watchlist
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MAO ===== */}
        {tab === "mao" && (
          <div style={{ paddingTop: 20, paddingBottom: 40 }}>

              {/* Modo selector */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[["mao", "Calcular MAO"], ["arv", "Calcular ARV Objetivo"]].map(([key, label]) => (
                  <button key={key} onClick={() => setMaoModo(key)} style={{
                    flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 700,
                    background: maoModo === key ? "#F5A623" : "#1C1F2E",
                    border: `1px solid ${maoModo === key ? "#F5A623" : "#2A2D3E"}`,
                    borderRadius: 10, cursor: "pointer",
                    color: maoModo === key ? "#000" : "#8A8FA8",
                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                  }}>{label}</button>
                ))}
              </div>

              {/* Two column layout */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* LEFT — Inputs */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Parámetros del proyecto</div>

                  {/* Input helper */}
                  {[
                    { label: "ARV — Precio de venta (USD)", val: maoArv, set: setMaoArv, placeholder: "ej: 120000", highlight: true },
                    { label: "Superficie (m²)", val: maoM2, set: setMaoM2, placeholder: "ej: 45" },
                    { label: "Costo remodelación por m² (USD)", val: maoCostoPorM2, set: v => setMaoCostoPorM2(Number(v) || 0), placeholder: "ej: 500" },
                    { label: "Gastos de compra (%)", val: maoGastosCompra, set: v => setMaoGastosCompra(Number(v) || 0), placeholder: "ej: 6" },
                    { label: "OPEX mensual (expensas, luz…)", val: maoGastosTenenciaMes, set: v => setMaoGastosTenenciaMes(Number(v) || 0), placeholder: "ej: 200" },
                    { label: "Duración del proyecto (meses)", val: maoDuracion, set: v => setMaoDuracion(Number(v) || 1), placeholder: "ej: 8" },
                    { label: "Gastos de venta (%)", val: maoCostosVenta, set: v => setMaoCostosVenta(Number(v) || 0), placeholder: "ej: 5" },
                    { label: "Rentabilidad anual bruta (%)", val: maoRentabilidadAnual, set: v => setMaoRentabilidadAnual(Number(v) || 0), placeholder: "ej: 40" },
                  ].map(({ label, val, set, placeholder, highlight }) => (
                    <div key={label} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "#8A8FA8", marginBottom: 5, fontWeight: 500 }}>{label}</div>
                      <input
                        type="number"
                        value={val}
                        onChange={e => set(e.target.value)}
                        placeholder={placeholder}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          padding: "10px 12px",
                          background: "#1C1F2E",
                          border: `1.5px solid ${highlight && val ? "#F5A623" : val ? "#3A8EF6" : "#2A2D3E"}`,
                          borderRadius: 8,
                          color: "#FFFFFF",
                          fontSize: highlight ? 18 : 15,
                          fontWeight: 700,
                          fontFamily: "-apple-system, BlinkMacSystemFont, monospace",
                          outline: "none",
                        }}
                      />
                    </div>
                  ))}

                  {/* Nota rentabilidad */}
                  <div style={{ fontSize: 11, color: "#8A8FA8", lineHeight: 1.6, marginTop: 8, padding: "10px 12px", background: "#1C1F2E", borderRadius: 8, borderLeft: "3px solid #F5A623" }}>
                    Flipping Master usa <strong style={{ color: "#F5A623" }}>40% anual</strong> (20% inversor + 20% operador). Si trabajás solo, usá 20%.
                  </div>
                </div>

                {/* RIGHT — Results */}
                <div>
                  {maoCalc.arv > 0 ? (
                    <>
                      {/* MAO result */}
                      <div style={{ background: "#1C1F2E", borderRadius: 14, padding: "20px 16px", marginBottom: 14, textAlign: "center", border: `1px solid ${maoCalc.mao > 0 ? "#F5A623" : "#FF3B30"}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                          {maoCalc.mao > 0 ? "Oferta Máxima Admisible (MAO)" : "ARV insuficiente"}
                        </div>
                        <div style={{ fontSize: 36, fontWeight: 800, color: maoCalc.mao > 0 ? "#F5A623" : "#FF3B30", fontFamily: "monospace", letterSpacing: "-0.02em", marginBottom: 4 }}>
                          {maoCalc.mao > 0 ? fmtUSD(Math.round(maoCalc.mao)) : "—"}
                        </div>
                        {maoCalc.mao > 0 && (
                          <>
                          <div style={{ fontSize: 12, color: "#8A8FA8" }}>{maoCalc.pctDelArv.toFixed(0)}% del ARV</div>
                          {Number(maoM2) > 0 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12, paddingTop: 12, borderTop: "1px solid #2A2D3E" }}>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>MAO / m²</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#F5A623", fontFamily: "monospace" }}>{fmtUSD(Math.round(maoCalc.mao / Number(maoM2)))}</div>
                              </div>
                              <div style={{ width: 1, background: "#2A2D3E" }} />
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>ARV / m²</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#34C759", fontFamily: "monospace" }}>{fmtUSD(Math.round(maoCalc.arv / Number(maoM2)))}</div>
                              </div>
                            </div>
                          )}
                          </>
                        )}
                      </div>

                      {/* Regla del 70% */}
                      {maoCalc.mao > 0 && (
                        <div style={{ background: maoCalc.pctDelArv <= 70 ? "#0D2B1D" : "#2B1A0D", border: `1px solid ${maoCalc.pctDelArv <= 70 ? "#34C759" : "#F5A623"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: maoCalc.pctDelArv <= 70 ? "#34C759" : "#F5A623" }}>
                            {maoCalc.pctDelArv <= 70 ? "✓ Cumple la regla del 70%" : `⚠ ${maoCalc.pctDelArv.toFixed(0)}% del ARV — por encima del 70%`}
                          </span>
                        </div>
                      )}

                      {/* Desglose */}
                      <div style={{ background: "#1C1F2E", borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ padding: "10px 14px", borderBottom: "1px solid #2A2D3E" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#8A8FA8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Desglose</span>
                        </div>
                        {[
                          { label: "ARV", val: fmtUSD(maoCalc.arv), color: "#34C759" },
                          { label: `CAPEX (${maoM2}m² × $${fmt(maoCostoPorM2)})`, val: `−${fmtUSD(maoCalc.capex)}`, color: "#FF6B6B" },
                          { label: `Gastos compra (${maoGastosCompra}%)`, val: `−${fmtUSD(Math.round(maoCalc.gastosCompra))}`, color: "#FF6B6B" },
                          { label: `OPEX (${maoDuracion} meses)`, val: `−${fmtUSD(maoCalc.opex)}`, color: "#FF6B6B" },
                          { label: `Gastos venta (${maoCostosVenta}%)`, val: `−${fmtUSD(Math.round(maoCalc.gastosVenta))}`, color: "#FF6B6B" },
                          { label: `Rentabilidad (${maoRentabilidadAnual}% × ${maoDuracion}m)`, val: `−${fmtUSD(Math.round(maoCalc.rentabilidadNecesaria))}`, color: "#F5A623" },
                        ].map(({ label, val, color }) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderBottom: "1px solid #1A1D2A" }}>
                            <span style={{ fontSize: 11, color: "#8A8FA8" }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{val}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#0F1117" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF" }}>MAO</span>
                          <span style={{ fontSize: 16, fontWeight: 800, color: maoCalc.mao > 0 ? "#F5A623" : "#FF3B30", fontFamily: "monospace" }}>{fmtUSD(Math.round(maoCalc.mao))}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ background: "#1C1F2E", borderRadius: 14, padding: "40px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>🏠</div>
                      <div style={{ fontSize: 14, color: "#8A8FA8", lineHeight: 1.6 }}>
                        Ingresá el ARV para ver el resultado
                      </div>
                    </div>
                  )}
                </div>
              </div>
          </div>
        )}

        {/* ===== WATCHLIST ===== */}
        {tab === "watchlist" && (
          <div style={{ marginTop: 24 }}>
            {watchlist.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted, fontSize: 13, fontFamily: C.mono }}>
                — WATCHLIST VACÍA —<br /><br />
                <span style={{ fontSize: 12 }}>Analizá una propiedad y guardala para comparar</span>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: C.textMuted, fontFamily: C.mono, marginBottom: 16 }}>
                  {watchlist.length} REGISTRO{watchlist.length !== 1 ? "S" : ""} · ORDENADO POR ROI ANUAL DESC
                </div>
                {watchlist.map((w, i) => (
                  <div key={w.id} style={{ background: C.panel, border: `1px solid ${i === 0 ? C.accent : C.border}`, borderRadius: 12, marginBottom: 14, overflow: "hidden", position: "relative" }}>
                    {/* Header tarjeta */}
                    <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: i === 0 ? C.accentDim : "transparent" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{w.nombre}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: C.mono }}>{w.barrio} · {w.m2}m² · {w.fecha}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {i === 0 && <Tag color={C.accent} bg={C.accentDim} border={C.accent}>#1 ROI</Tag>}
                        <button onClick={() => handleDelete(w.id)} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16, padding: 4 }}
                          onMouseEnter={e => e.currentTarget.style.color = C.red}
                          onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
                        >✕</button>
                      </div>
                    </div>

                    {/* Resumen rápido */}
                    <div style={{ padding: "0 14px" }}>
                      <Row label="Precio de compra" value={fmtUSD(w.datos?.buyPrice)} bold />
                      <Row label="Superficie" value={`${w.m2} m²`} />
                      <Row label="Valor m² (compra)" value={w.datos?.buyPrice && w.m2 ? fmtUSD(Math.round(w.datos.buyPrice / w.m2)) : "—"} />
                      <Row label="Ganancia" value={fmtUSD(w.profit)} valueColor={w.profit > 0 ? C.green : C.red} bold />
                      <Row label="ROI total" value={w.roi != null ? `${w.roi.toFixed(2)}%` : "—"} valueColor={w.roi > 10 ? C.green : C.red} bold />
                    </div>

                    {/* Footer */}
                    <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Tag color={w.viable ? C.green : C.red} bg={w.viable ? C.greenDim : C.redDim} border={w.viable ? C.greenDim : C.redDim}>
                        {w.viable ? "VIABLE" : "NO VIABLE"}
                      </Tag>
                      {w.link && (
                        <a href={w.link} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, fontWeight: 700, color: C.accent, textDecoration: "none", letterSpacing: "0.06em" }}>
                          ↗ VER PUBLICACIÓN
                        </a>
                      )}
                    </div>
                    {w.notas && (
                      <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textSub, fontStyle: "italic" }}>
                        {w.notas}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        <div style={{ marginTop: 32, fontSize: 11, color: C.textMuted, lineHeight: 1.7, borderTop: `1px solid ${C.border}`, paddingTop: 16, fontFamily: C.mono }}>
          ARV = precio usado reciclado × superficie · REF: ZonaProp/ArgenProp 2025-2026 · No incluye impuesto a las ganancias ni IIBB
        </div>
      </div>

      {/* Modal */}
      {showSaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSaveModal(false); }}>
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "20px 20px 0 0", padding: "24px 20px 48px", width: "100%", maxWidth: 520 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: C.text, letterSpacing: "-0.02em", marginBottom: 20 }}>Guardar en Watchlist</div>

            {[
              { label: "NOMBRE / DESCRIPCIÓN *", val: saveName, set: setSaveName, placeholder: "Ej: 3A Thames 1200 Palermo" },
              { label: "LINK ZONAPROP / ARGENPROP", val: saveLink, set: setSaveLink, placeholder: "https://..." },
            ].map(({ label, val, set, placeholder }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
                <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                  style={{ width: "100%", padding: "12px 14px", boxSizing: "border-box", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 14, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", outline: "none" }} />
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", marginBottom: 6 }}>NOTAS</div>
              <textarea value={saveNotas} onChange={e => setSaveNotas(e.target.value)} rows={2}
                placeholder="Observaciones adicionales..."
                style={{ width: "100%", padding: "12px 14px", boxSizing: "border-box", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 14, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", outline: "none", resize: "none" }} />
            </div>

            <div style={{ padding: "10px 14px", background: C.accentDim, border: `1px solid ${C.accent}`, borderRadius: 6, marginBottom: 20, fontSize: 12, color: C.textSub, fontFamily: C.mono }}>
              {barrio} · {m2}m² · {fmtUSD(listPrice)} → ARV {fmtUSD(c.arv)} · ROI {c.roi?.toFixed(1)}% ({c.roiAnual?.toFixed(1)}% anual)
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowSaveModal(false)} style={{ flex: 1, padding: "13px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, cursor: "pointer", color: C.textSub, fontSize: 13, fontWeight: 700, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", letterSpacing: "0.06em" }}>
                CANCELAR
              </button>
              <button onClick={handleSave} disabled={!saveName.trim()} style={{ flex: 2, padding: "13px", background: saveName.trim() ? C.accent : C.border, border: "none", borderRadius: 6, cursor: saveName.trim() ? "pointer" : "default", color: saveName.trim() ? "#fff" : C.textMuted, fontWeight: 700, fontSize: 13, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                GUARDAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
