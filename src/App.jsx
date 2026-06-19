import { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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
  bg:          "#F2F2F7",
  panel:       "#FFFFFF",
  panelAlt:    "#F2F2F7",
  border:      "#D1D1D6",
  borderLight: "#C7C7CC",
  accent:      "#007AFF",
  accentDim:   "#EBF5FF",
  text:        "#000000",
  textSub:     "#3C3C43",
  textMuted:   "#8E8E93",
  green:       "#34C759",
  greenDim:    "#F0FFF4",
  red:         "#FF3B30",
  redDim:      "#FFF1F0",
  amber:       "#FF9500",
  amberDim:    "#FFF8EC",
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
  const [modo, setModo] = useState("simple");
  const [listPrice, setListPrice] = useState(120000);
  const [m2, setM2] = useState(55);
  const [negPct, setNegPct] = useState(10);
  const [refType, setRefType] = useState("media");
  const [refExtra, setRefExtra] = useState(0);
  const [closingPct, setClosingPct] = useState(5);
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
    const viableNeto = profitNeto > 0 && roiNeto > 10;
    // Alquiler
    const alquilerMensual = alquilerM2 > 0 ? alquilerM2 * m2 : null;
    const alquilerAnual = alquilerMensual ? alquilerMensual * 12 : null;
    const alquilerROI = alquilerAnual ? (alquilerAnual / totalCost) * 100 : null;
    return { buyPrice, refCost, closing, comisionCompra, escribanoCompra, totalCost, arv, arvM2, pctDelARV, nuevoTotal, sellComm, escribanoCost, netSale, profit, roi, roiAnual, viable, discVsNuevo, usandoCustom, expensasTotal, profitNeto, roiNeto, roiNetoAnual, viableNeto, alquilerMensual, alquilerAnual, alquilerROI, ventaFinal, sellCommFinal, escribanoCostFinal, netSaleFinal, profitFinal, gananciaConMuebles, airbnbIngresoMensual, airbnbIngresoAnualBruto, airbnbGastosAnuales, airbnbIngresoAnualNeto };
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
  body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif; }
`}</style>

      {/* Top bar */}
      <div style={{ background: "rgba(242,242,247,0.92)", borderBottom: `0.5px solid ${C.border}`, padding: "0 20px", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: C.text, letterSpacing: "-0.02em" }}>Flippear</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>{currentUser}</span>
            <button onClick={handleLogout} style={{ fontSize: 12, color: C.accent, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Salir</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginTop: 0 }}>
          {[["calc", "ANÁLISIS"], ["watchlist", `WATCHLIST${watchlist.length > 0 ? ` [${watchlist.length}]` : ""}`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "10px 18px 9px", fontSize: 11, fontWeight: 700,
              background: "transparent", border: "none",
              borderBottom: `2px solid ${tab === key ? C.accent : "transparent"}`,
              color: tab === key ? C.accent : C.textMuted,
              cursor: "pointer", letterSpacing: "0.1em",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px", maxWidth: 520, margin: "0 auto" }}>

        {/* ===== CALC ===== */}
        {tab === "calc" && (
          <>
            <div style={{ display: "flex", gap: 8, marginTop: 20, marginBottom: 4 }}>
              {[["simple", "Simple"], ["avanzado", "Avanzado"]].map(([key, label]) => (
                <button key={key} onClick={() => setModo(key)} style={{
                  flex: 1, padding: "9px 0", fontSize: 13, fontWeight: 600,
                  background: modo === key ? C.accent : C.panelAlt,
                  border: `1px solid ${modo === key ? C.accent : C.border}`,
                  borderRadius: 10, cursor: "pointer",
                  color: modo === key ? "#fff" : C.textSub,
                  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", transition: "all 0.15s",
                }}>{label}</button>
              ))}
            </div>
            <SectionHeader title="Parámetros de entrada" sub="CABA · USD" mt={24} />

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase" }}>Precio de publicación</span>
                <input
                  type="number"
                  value={listPrice}
                  onChange={e => setListPrice(Number(e.target.value) || 0)}
                  style={{ width: 130, padding: "4px 8px", background: C.panelAlt, border: `1px solid ${C.accent}`, borderRadius: 10, color: C.text, fontSize: 17, fontWeight: 600, fontFamily: C.mono, outline: "none", textAlign: "right" }}
                />
              </div>
              <div style={{ position: "relative", height: 3, background: C.border, borderRadius: 2 }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.min(((listPrice - 30000) / (400000 - 30000)) * 100, 100)}%`, background: C.accent, borderRadius: 2 }} />
                <input type="range" min={30000} max={400000} step={1000} value={Math.min(listPrice, 400000)}
                  onChange={e => setListPrice(Number(e.target.value))}
                  style={{ position: "absolute", top: "50%", left: 0, width: "100%", transform: "translateY(-50%)", opacity: 0, cursor: "pointer", height: 20, margin: 0 }} />
                <div style={{ position: "absolute", top: "50%", left: `${Math.min(((listPrice - 30000) / (400000 - 30000)) * 100, 100)}%`, transform: "translate(-50%, -50%)", width: 14, height: 14, borderRadius: "50%", background: C.panel, border: `2px solid ${C.accent}`, boxShadow: "0 1px 4px rgba(0,0,0,0.15)", pointerEvents: "none" }} />
              </div>
            </div>
            <Slider label="Descuento negociación" min={0} max={20} step={1} value={negPct} onChange={setNegPct} suffix="%" />

            <div style={{ background: C.accentDim, border: `1px solid ${C.accent}`, borderRadius: 6, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Precio de compra</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: C.mono }}>{fmtUSD(Math.round(c.buyPrice))}</span>
            </div>
            {m2 > 0 && (
              <div style={{ fontSize: 12, color: C.textMuted, textAlign: "right", marginBottom: 4, fontFamily: C.mono }}>
                = {fmtUSD(Math.round(c.buyPrice / m2))}/m² al comprar
              </div>
            )}
            {c.pctDelARV != null && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: C.mono, color: c.pctDelARV <= 70 ? C.green : c.pctDelARV <= 85 ? C.amber : C.red, background: c.pctDelARV <= 70 ? C.greenDim : c.pctDelARV <= 85 ? C.amberDim : C.redDim, padding: "3px 10px", borderRadius: 6 }}>
                  {c.pctDelARV.toFixed(0)}% del ARV
                </span>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase" }}>Superficie</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="number"
                    value={m2}
                    onChange={e => setM2(Number(e.target.value) || 0)}
                    style={{ width: 80, padding: "4px 8px", background: C.panelAlt, border: `1px solid ${C.accent}`, borderRadius: 10, color: C.text, fontSize: 17, fontWeight: 600, fontFamily: C.mono, outline: "none", textAlign: "right" }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.textSub, fontFamily: C.mono }}>m²</span>
                </div>
              </div>
              <div style={{ position: "relative", height: 3, background: C.border, borderRadius: 2 }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.min(((m2 - 25) / (200 - 25)) * 100, 100)}%`, background: C.accent, borderRadius: 2 }} />
                <input type="range" min={25} max={200} step={1} value={Math.min(m2, 200)}
                  onChange={e => setM2(Number(e.target.value))}
                  style={{ position: "absolute", top: "50%", left: 0, width: "100%", transform: "translateY(-50%)", opacity: 0, cursor: "pointer", height: 20, margin: 0 }} />
                <div style={{ position: "absolute", top: "50%", left: `${Math.min(((m2 - 25) / (200 - 25)) * 100, 100)}%`, transform: "translate(-50%, -50%)", width: 14, height: 14, borderRadius: "50%", background: C.panel, border: `2px solid ${C.accent}`, boxShadow: "0 1px 4px rgba(0,0,0,0.15)", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Barrio */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Barrio</div>
              <div style={{ position: "relative" }}>
                <input type="text" placeholder="Buscar barrio..." value={barrioInput}
                  onChange={(e) => { setBarrioInput(e.target.value); setShowSug(true); if (!e.target.value) setBarrio(null); }}
                  onFocus={() => setShowSug(true)}
                  style={inputBase(!!barrio)} />
                {barrio && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.green, fontWeight: 700 }}>✓ {barrio}</span>}
                {showSug && filtered.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, marginTop: 2, maxHeight: 220, overflowY: "auto" }}>
                    {filtered.map(b => (
                      <div key={b} onClick={() => selectBarrio(b)}
                        style={{ padding: "11px 14px", cursor: "pointer", fontSize: 14, color: C.text, borderBottom: `1px solid ${C.border}`, fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.background = C.accentDim}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >{b}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Precios custom */}
            {barrio && (
              <div style={{ background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Precios relevados en ZonaProp</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10, fontFamily: C.mono }}>
                  REF: a reciclar {fmt(BARRIOS[barrio].sin_ref)} · reciclado {fmt(BARRIOS[barrio].reciclado)} · nuevo {fmt(BARRIOS[barrio].nuevo)} USD/m²
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.text, fontWeight: 600 }}>A reciclar:</span> lo que pagás al comprar (sin renovar) ·{" "}
                  <span style={{ color: C.accent, fontWeight: 600 }}>Reciclado:</span> tu ARV, lo que vendés post-refacción ·{" "}
                  <span style={{ color: C.text, fontWeight: 600 }}>Nuevo:</span> a estrenar, tu competencia más cara
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "RECICLADO / m²", val: customUsadoM2, set: setCustomUsadoM2, ref: BARRIOS[barrio].reciclado },
                    { label: "NUEVO / m²", val: customNuevoM2, set: setCustomNuevoM2, ref: BARRIOS[barrio].nuevo },
                  ].map(({ label, val, set, ref }) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
                      <div style={{ position: "relative" }}>
                        <input type="number" placeholder={String(ref)} value={val} onChange={e => set(e.target.value)}
                          style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", background: val ? C.accentDim : C.bg, border: `1px solid ${val ? C.accent : C.border}`, borderRadius: 6, color: C.text, fontSize: 16, fontWeight: 700, fontFamily: C.mono, outline: "none" }} />
                        {val && <button onClick={() => set("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14 }}>✕</button>}
                      </div>
                      {val && Number(val) !== ref && (
                        <div style={{ fontSize: 10, fontFamily: C.mono, color: Number(val) > ref ? C.red : C.green, marginTop: 4 }}>
                          {Number(val) > ref ? `+${fmt(Number(val) - ref)}` : `−${fmt(ref - Number(val))}`} vs ref
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {c.usandoCustom && <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: C.accent, fontFamily: C.mono }}>▶ USANDO PRECIOS RELEVADOS</div>}
              </div>
            )}

            {/* Tipo refacción */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Tipo de refacción</div>
              <div style={{ display: "flex", gap: 6 }}>
                {Object.keys(refLabels).map(k => (
                  <button key={k} onClick={() => setRefType(k)} style={{
                    flex: 1, padding: "10px 6px",
                    background: refType === k ? C.accent : C.panelAlt,
                    border: `1px solid ${refType === k ? C.accent : C.border}`,
                    borderRadius: 6, cursor: "pointer",
                    color: refType === k ? "#fff" : C.textSub,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>{refLabels[k]}</div>
                    <div style={{ fontSize: 10, marginTop: 3, opacity: 0.7, fontFamily: C.mono }}>{refDesc[k]}</div>
                  </button>
                ))}
              </div>
            </div>

            <Slider label="Refacción adicional" min={0} max={30000} step={500} value={refExtra} onChange={setRefExtra} prefix="USD " />
            <Slider label="Gastos de compra" min={2} max={10} step={0.5} value={closingPct} onChange={setClosingPct} suffix="%" />
            {modo === "avanzado" && (
              <>
                <Slider label="Comisión inmobiliaria (compra)" min={0} max={6} step={0.5} value={comisionCompraPct} onChange={setComisionCompraPct} suffix="%" />
                <Slider label="Escribano (compra)" min={0} max={3} step={0.25} value={escribanoCompraPct} onChange={setEscribanoCompraPct} suffix="%" />
              </>
            )}
            <Slider label="Comisión de venta" min={1} max={6} step={0.5} value={sellCommPct} onChange={setSellCommPct} suffix="%" />
            {modo === "avanzado" && (
              <Slider label="Escribano (venta)" min={0} max={3} step={0.25} value={escribanoPct} onChange={setEscribanoPct} suffix="%" />
            )}
            <Slider label="Plazo hasta venta" min={3} max={24} step={1} value={sellMonths} onChange={setSellMonths} suffix=" meses" />
            {modo === "avanzado" && (
              <>
            {/* Expensas */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Expensas mensuales</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {["ARS", "USD"].map(m => (
                  <button key={m} onClick={() => setExpensasMoneda(m)} style={{
                    padding: "7px 16px", fontSize: 12, fontWeight: 700,
                    background: expensasMoneda === m ? C.accent : C.panelAlt,
                    border: `1px solid ${expensasMoneda === m ? C.accent : C.border}`,
                    borderRadius: 5, cursor: "pointer",
                    color: expensasMoneda === m ? "#fff" : C.textSub,
                    fontFamily: C.mono,
                  }}>{m}</button>
                ))}
                <input
                  type="number"
                  value={expensas}
                  onChange={e => setExpensas(Number(e.target.value) || 0)}
                  style={{ flex: 1, padding: "7px 12px", background: C.panelAlt, border: `1px solid ${C.accent}`, borderRadius: 10, color: C.text, fontSize: 17, fontWeight: 600, fontFamily: C.mono, outline: "none", textAlign: "right" }}
                />
              </div>
              {expensasMoneda === "ARS" && (
                <div style={{ background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 5, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: C.textSub, fontFamily: C.mono }}>Dólar blue</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: C.textMuted, fontFamily: C.mono }}>$</span>
                    <input
                      type="number"
                      value={blueRate}
                      onChange={e => setBlueRate(Number(e.target.value) || 1)}
                      style={{ width: 90, padding: "4px 8px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 14, fontWeight: 700, fontFamily: C.mono, outline: "none", textAlign: "right" }}
                    />
                    <span style={{ fontSize: 11, color: C.textMuted, fontFamily: C.mono }}>ARS/USD</span>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 11, color: C.textMuted, fontFamily: C.mono, marginTop: 8 }}>
                {expensasMoneda === "ARS"
                  ? `→ USD ${(expensas / blueRate).toFixed(0)}/mes · USD ${(expensas / blueRate * sellMonths).toFixed(0)} en ${sellMonths} meses`
                  : `→ USD ${fmt(expensas)}/mes · USD ${fmt(expensas * sellMonths)} en ${sellMonths} meses`
                }
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase" }}>Alquiler estimado / m²</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="number"
                    value={alquilerM2}
                    onChange={e => setAlquilerM2(Number(e.target.value) || 0)}
                    placeholder="0"
                    style={{ width: 80, padding: "4px 8px", background: alquilerM2 > 0 ? C.accentDim : C.panelAlt, border: `1px solid ${alquilerM2 > 0 ? C.accent : C.border}`, borderRadius: 10, color: C.text, fontSize: 17, fontWeight: 600, fontFamily: C.mono, outline: "none", textAlign: "right" }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.textSub, fontFamily: C.mono }}>USD/m²</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, fontFamily: C.mono }}>
                {alquilerM2 > 0 ? `→ USD ${fmt(alquilerM2 * m2)}/mes · USD ${fmt(alquilerM2 * m2 * 12)}/año` : "Dejá en 0 para omitir comparativa de alquiler"}
              </div>
            </div>
              </>
            )}

            {/* ── RESULTADOS ── */}
            {!barrio ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted, fontSize: 13, fontFamily: C.mono }}>
                — SELECCIONÁ UN BARRIO —
              </div>
            ) : (
              <>
                <SectionHeader title="Estructura de costos" />
                <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
                  <Row label="Precio de publicación" value={fmtUSD(listPrice)} />
                  <Row label={`Descuento (−${negPct}%)`} value={`− ${fmtUSD(Math.round(listPrice * negPct / 100))}`} valueColor={C.green} />
                  <Row label="Precio de compra" value={fmtUSD(Math.round(c.buyPrice))} bold valueColor={C.text} />
                  <Row label="Refacción" value={fmtUSD(c.refCost)} sub={`${fmt(Math.round(c.refCost/m2))} USD/m²`} />
                  <Row label="Gastos de compra" value={fmtUSD(Math.round(c.closing))} />
                  <Row label="Comisión inmobiliaria (compra)" value={fmtUSD(Math.round(c.comisionCompra))} />
                  <Row label="Escribano (compra)" value={fmtUSD(Math.round(c.escribanoCompra))} />
                  <Row label={`Expensas (${sellMonths} meses)`} value={fmtUSD(Math.round(c.expensasTotal))} valueColor={c.expensasTotal > 0 ? C.red : C.textMuted} sub={expensasMoneda === "ARS" ? `$ ${fmt(expensas)}/mes · blue $${fmt(blueRate)}` : undefined} />
                  <Row label="TOTAL INVERTIDO" value={fmtUSD(Math.round(c.totalCost))} bold valueColor={C.amber} />
                </div>

                <SectionHeader title={`ARV · ${barrio}`} sub={c.usandoCustom ? "PRECIO RELEVADO" : "REF 2026"} />
                <div style={{ background: C.panel, border: `1px solid ${C.green}`, borderRadius: 12, padding: "18px 16px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: C.green }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    Valor post-refacción (ARV)
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: C.text, fontFamily: C.mono, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {fmtUSD(c.arv)}
                  </div>
                  <div style={{ fontSize: 12, color: C.textSub, marginTop: 8, fontFamily: C.mono }}>
                    {fmt(c.arvM2)} USD/m² × {m2} m²
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  <div style={{ background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>m² antes (compra)</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: C.mono }}>{fmtUSD(Math.round(c.buyPrice / m2))}</div>
                  </div>
                  <div style={{ background: C.greenDim, border: `1px solid ${C.green}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>m² después (venta)</div>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        value={customUsadoM2}
                        onChange={e => setCustomUsadoM2(e.target.value)}
                        placeholder={String(c.arvM2)}
                        style={{ width: "100%", boxSizing: "border-box", padding: "0", background: "transparent", border: "none", color: C.text, fontSize: 18, fontWeight: 700, fontFamily: C.mono, outline: "none" }}
                      />
                      {customUsadoM2 && (
                        <button onClick={() => setCustomUsadoM2("")} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 12 }}>✕</button>
                      )}
                    </div>
                  </div>
                </div>

                <SectionHeader title="Venta futura" mt={20} />
                {modo === "avanzado" && (
                  <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Publicado / aspiracional</div>
                    <input type="number" value={precioVentaPublicado} onChange={e => setPrecioVentaPublicado(e.target.value)} placeholder={String(Math.round(c.arv || 0))}
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 15, fontWeight: 600, fontFamily: C.mono, outline: "none" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Cierre estimado</div>
                    <input type="number" value={precioVentaCierre} onChange={e => setPrecioVentaCierre(e.target.value)} placeholder={String(Math.round(c.arv || 0))}
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: C.greenDim, border: `1px solid ${C.green}`, borderRadius: 10, color: C.text, fontSize: 15, fontWeight: 600, fontFamily: C.mono, outline: "none" }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 16 }}>
                  Si dejás "Cierre estimado" vacío, se usa el ARV calculado ({fmtUSD(Math.round(c.arv || 0))}).
                </div>
                  </>
                )}

                <div style={{ background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                  <Row label="Comisión de venta" value={fmtUSD(Math.round(c.sellCommFinal))} valueColor={C.red} />
                  <Row label="Escribano (venta)" value={fmtUSD(Math.round(c.escribanoCostFinal))} valueColor={C.red} />
                  <Row label="Venta neta" value={fmtUSD(Math.round(c.netSaleFinal))} bold />
                </div>

                {modo === "avanzado" && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Valor muebles incluidos (extra)</div>
                  <input type="number" value={valorMuebles} onChange={e => setValorMuebles(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 15, fontWeight: 600, fontFamily: C.mono, outline: "none" }} />
                </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <StatBox label="Ganancia bruta" value={fmtUSD(Math.round(c.profitFinal))}
                    color={c.profitFinal > 0 ? C.green : C.red}
                    sub="sin descontar expensas" />
                  <StatBox label="Ganancia + muebles" value={fmtUSD(Math.round(c.gananciaConMuebles))}
                    color={c.gananciaConMuebles > 0 ? C.green : C.red}
                    tag={c.gananciaConMuebles > 0 ? { label: "LONG", color: C.green, bg: C.greenDim, border: C.greenDim } : { label: "NEG", color: C.red, bg: C.redDim, border: C.redDim }}
                    sub="venta con muebles incluidos" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <StatBox label="ROI neto total" value={`${c.roiNeto?.toFixed(2)}%`}
                    color={c.roiNeto > 10 ? C.green : C.red} />
                  <StatBox label={`ROI neto anual`}
                    value={`${c.roiNetoAnual?.toFixed(2)}%`}
                    color={c.roiNetoAnual > 15 ? C.green : c.roiNetoAnual > 0 ? C.amber : C.red}
                    sub={`${(c.roiNetoAnual / 12)?.toFixed(2)}% mensual`} />
                </div>

                {/* Veredicto */}
                <div style={{ background: c.viableNeto ? C.greenDim : C.redDim, border: `1px solid ${c.viableNeto ? C.green : C.red}`, borderRadius: 12, padding: "16px 16px", marginTop: 4, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.viableNeto ? C.green : C.red, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontFamily: C.mono }}>
                    {c.viableNeto ? "▶ OPERACIÓN VIABLE" : "✕ OPERACIÓN NO VIABLE"}
                  </div>
                  <div style={{ fontSize: 14, color: c.viableNeto ? "#065F46" : "#991B1B", lineHeight: 1.7 }}>
                    {c.viableNeto
                      ? `Compra: ${fmtUSD(Math.round(c.buyPrice))} → Venta: ${fmtUSD(Math.round(c.ventaFinal))} → Ganancia neta: ${fmtUSD(Math.round(c.profitNeto))} (${c.roiNeto?.toFixed(1)}% en ${sellMonths} meses)`
                      : `Con estos números el flip no cierra. Total invertido ${fmtUSD(Math.round(c.totalCost))} + expensas ${fmtUSD(c.expensasTotal)} deja margen insuficiente.`
                    }
                  </div>
                </div>

                {/* Alquiler vs Venta */}
                {c.alquilerMensual && (
                  <>
                    <SectionHeader title="Alquiler vs. Venta" mt={24} />
                    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
                      <Row label="Ingreso mensual alquiler" value={fmtUSD(c.alquilerMensual)} valueColor={C.accent} bold />
                      <Row label="Ingreso anual alquiler" value={fmtUSD(c.alquilerAnual)} valueColor={C.accent} />
                      <Row label="ROI alquiler anual" value={`${c.alquilerROI?.toFixed(2)}%`} valueColor={c.alquilerROI > 5 ? C.green : C.amber} bold />
                      <Row label="ROI flip neto anual" value={`${c.roiNetoAnual?.toFixed(2)}%`} valueColor={c.roiNetoAnual > 15 ? C.green : c.roiNetoAnual > 0 ? C.amber : C.red} bold />
                    </div>
                    <div style={{ background: c.roiNetoAnual > c.alquilerROI ? C.greenDim : C.accentDim, border: `1px solid ${c.roiNetoAnual > c.alquilerROI ? C.green : C.accent}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.roiNetoAnual > c.alquilerROI ? C.green : C.accent, letterSpacing: "0.1em", fontFamily: C.mono, marginBottom: 6 }}>
                        {c.roiNetoAnual > c.alquilerROI ? "▲ CONVIENE MÁS VENDER" : "▲ CONVIENE MÁS ALQUILAR"}
                      </div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                        {c.roiNetoAnual > c.alquilerROI
                          ? `El flip genera ${c.roiNetoAnual?.toFixed(1)}% anual vs. ${c.alquilerROI?.toFixed(1)}% del alquiler. Mejor vender y liberar el capital.`
                          : `El alquiler genera ${c.alquilerROI?.toFixed(1)}% anual vs. ${c.roiNetoAnual?.toFixed(1)}% del flip. Considerá quedarte con la propiedad.`
                        }
                      </div>
                    </div>
                  </>
                )}

                {/* Airbnb / Alquiler temporario */}
                {modo === "avanzado" && (
                <>
                <SectionHeader title="Renta Airbnb / Temporario" mt={28} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Precio por noche USD</div>
                    <input type="number" value={airbnbPrecioNoche} onChange={e => setAirbnbPrecioNoche(Number(e.target.value) || 0)}
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 15, fontWeight: 600, fontFamily: C.mono, outline: "none" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Días alquilados / mes</div>
                    <input type="number" value={airbnbDiasMes} onChange={e => setAirbnbDiasMes(Number(e.target.value) || 0)}
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 15, fontWeight: 600, fontFamily: C.mono, outline: "none" }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Gastos operativos mensuales (limpieza, expensas, plataforma, etc.)</div>
                  <input type="number" value={airbnbGastosMensuales} onChange={e => setAirbnbGastosMensuales(Number(e.target.value) || 0)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 15, fontWeight: 600, fontFamily: C.mono, outline: "none" }} />
                </div>

                {airbnbPrecioNoche > 0 && airbnbDiasMes > 0 && (
                  <>
                    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                      <Row label="Ingreso mensual bruto" value={fmtUSD(c.airbnbIngresoMensual)} valueColor={C.accent} />
                      <Row label="Ingreso anual bruto" value={fmtUSD(c.airbnbIngresoAnualBruto)} valueColor={C.accent} />
                      <Row label="Gastos operativos anuales" value={fmtUSD(c.airbnbGastosAnuales)} valueColor={C.red} />
                      <Row label="Ingreso anual neto" value={fmtUSD(c.airbnbIngresoAnualNeto)} bold valueColor={C.green} />
                    </div>

                    {/* Comparación final */}
                    <SectionHeader title="Comparación final" mt={24} />
                    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                      <Row label="Opción 1 · Airbnb 1 año" value={fmtUSD(Math.round(c.airbnbIngresoAnualNeto))} valueColor={C.accent} bold />
                      <Row label="Opción 2 · Vender con inmobiliaria" value={fmtUSD(Math.round(c.profitFinal))} valueColor={C.green} bold />
                      {valorMuebles > 0 && (
                        <Row label="Opción 2b · Vender + muebles" value={fmtUSD(Math.round(c.gananciaConMuebles))} valueColor={C.green} bold />
                      )}
                    </div>
                    <div style={{ background: c.profitFinal > c.airbnbIngresoAnualNeto ? C.greenDim : C.accentDim, border: `1px solid ${c.profitFinal > c.airbnbIngresoAnualNeto ? C.green : C.accent}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.profitFinal > c.airbnbIngresoAnualNeto ? C.green : C.accent, letterSpacing: "0.1em", fontFamily: C.mono, marginBottom: 6 }}>
                        {c.profitFinal > c.airbnbIngresoAnualNeto ? "▲ CONVIENE MÁS VENDER" : "▲ CONVIENE MÁS AIRBNB"}
                      </div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                        {c.profitFinal > c.airbnbIngresoAnualNeto
                          ? `Vender genera ${fmtUSD(Math.round(c.profitFinal))} de una vez vs. ${fmtUSD(Math.round(c.airbnbIngresoAnualNeto))} anuales con Airbnb. Mejor liberar el capital.`
                          : `Airbnb genera ${fmtUSD(Math.round(c.airbnbIngresoAnualNeto))} por año vs. ${fmtUSD(Math.round(c.profitFinal))} de ganancia única al vender. Considerá mantenerla en renta.`
                        }
                      </div>
                    </div>
                  </>
                )}
                </>
                )}

                <SectionHeader title="Comparativa de mercado" mt={28} />
                {(() => {
                  const maxVal = Math.max(c.totalCost, c.arv, c.nuevoTotal) * 1.1;
                  const flipMasBajo = c.arv < c.nuevoTotal;
                  return (
                    <>
                      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 16px", marginBottom: 12 }}>
                        <Bar label="Costo total flip" val={c.totalCost} pct={(c.totalCost/maxVal)*100} color={C.textMuted} sub={`${fmt(Math.round(c.totalCost/m2))} USD/m²`} />
                        <Bar label="ARV · reciclado" val={c.arv} pct={(c.arv/maxVal)*100} color={C.green} bold sub={`${fmt(Math.round(c.arv/m2))} USD/m²`} />
                        <Bar label="Nuevo en barrio" val={c.nuevoTotal} pct={(c.nuevoTotal/maxVal)*100} color={C.accent} sub={`${fmt(Math.round(c.nuevoTotal/m2))} USD/m²`} />
                      </div>
                      <div style={{ background: flipMasBajo ? C.greenDim : C.amberDim, border: `1px solid ${flipMasBajo ? C.green : C.amber}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: flipMasBajo ? C.green : C.amber, letterSpacing: "0.1em", fontFamily: C.mono, marginBottom: 6 }}>
                          {flipMasBajo ? `▲ RECICLADO ${c.discVsNuevo?.toFixed(0)}% DEBAJO DEL NUEVO` : "▼ ARV SUPERA AL NUEVO"}
                        </div>
                        <div style={{ fontSize: 13, color: flipMasBajo ? "#166534" : "#92400E", lineHeight: 1.6 }}>
                          {flipMasBajo
                            ? `El comprador ahorra ${fmtUSD(Math.round(c.nuevoTotal - c.arv))} eligiendo tu reciclado vs. nuevo en ${barrio}.`
                            : `Un depto nuevo en ${barrio} es más barato. Revisá el precio de compra.`
                          }
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Stats barrio */}
                <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                    {[
                      { label: "A RECICLAR/m²", val: `${fmt(barrioData.sin_ref)} USD` },
                      { label: "RECICLADO/m²", val: `${fmt(barrioData.reciclado)} USD` },
                      { label: "NUEVO/m²", val: `${fmt(barrioData.nuevo)} USD` },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ padding: "4px 8px", borderRight: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: C.mono }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 14px", display: "flex", gap: 16, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 3 }}>TENDENCIA</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: tendColor(barrioData.tendencia), fontFamily: C.mono }}>
                        {tendIcon(barrioData.tendencia)} {barrioData.tendencia.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 3 }}>DEMANDA FLIP</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: demandaColor(barrioData.demanda), fontFamily: C.mono }}>
                        {barrioData.demanda.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textSub, lineHeight: 1.6 }}>
                    {barrioData.nota}
                  </div>
                </div>

                <button onClick={() => setShowSaveModal(true)} style={{
                  width: "100%", padding: "14px",
                  background: C.accent, border: "none", borderRadius: 6,
                  cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 14,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  Guardar en Watchlist
                </button>
              </>
            )}
          </>
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

                    {/* Tabla de datos */}
                    <div style={{ padding: "0 14px" }}>
                      <Row label="Publicación" value={fmtUSD(w.list_price)} />
                      <Row label="ARV (reciclado)" value={fmtUSD(w.arv)} valueColor={C.green} bold />
                      {w.nuevo_total && <Row label="Nuevo en barrio" value={fmtUSD(w.nuevo_total)} valueColor={C.accent} />}
                      {w.disc_vs_nuevo != null && (
                        <Row label="ARV vs nuevo"
                          value={w.disc_vs_nuevo != null ? (w.disc_vs_nuevo > 0 ? `−${w.disc_vs_nuevo.toFixed(0)}%` : `+${Math.abs(w.disc_vs_nuevo).toFixed(0)}%`) : "—"}
                          valueColor={w.disc_vs_nuevo > 0 ? C.green : C.red} />
                      )}
                      <Row label="Ganancia" value={fmtUSD(w.profit)} valueColor={w.profit > 0 ? C.green : C.red} />
                      <Row label="ROI total" value={w.roi != null ? `${w.roi.toFixed(2)}%` : "—"} valueColor={w.roi > 10 ? C.green : C.red} />
                      <Row label="ROI anualizado" value={w.roi_anual != null ? `${w.roi_anual.toFixed(2)}%` : "—"} valueColor={w.roi_anual > 15 ? C.green : w.roi_anual > 0 ? C.amber : C.red} bold />
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
