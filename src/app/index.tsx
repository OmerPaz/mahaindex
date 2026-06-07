import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

// ── Language ──────────────────────────────────────────────────────────
type Lang = 'en' | 'he';

const TR = {
  en: {
    appName:        'Ma Haindex?',
    currentUV:      'Current UV Status',
    dailyForecast:  'Daily UV Forecast',
    aboutTitle:     'About the UV Index',
    low:            'Low',
    moderate:       'Moderate',
    high:           'High',
    veryHigh:       'Very High',
    extreme:        'Extreme',
    noProtection:   'No protection needed',
    wearSunscreen:  'Wear sunscreen SPF 30+',
    sunscreenHat:   'Sunscreen, hat & shade',
    minimize:       'Minimize sun exposure',
    avoidOutdoors:  'Avoid going outdoors',
    protectionFrom: (s: number, e: number) =>
      `Sun protection recommended from ${s}:00 to ${e}:00. Apply SPF 30+ sunscreen, wear a hat, and seek shade.`,
    lowUVDay:       'UV levels are low today. Enjoy the outdoors safely.',
    whoTitle:       'What is the WHO UV Index?',
    whoBody:        'The UV Index (UVI) is an international standard measurement of ultraviolet radiation intensity from the sun. Developed by the World Health Organization, it quantifies the risk of harm from unprotected sun exposure. Values are calculated from solar elevation, ozone levels, cloud cover, and surface reflectivity.',
    skinTitle:      'Risk by Skin Type',
    skinBody:       'Fair skin (Type I–II) burns easily at any UV level. Medium skin (Type III–IV) burns at UV 3+. Olive/dark skin (Type V–VI) burns at UV 6+. All skin types need protection when UV reaches 8 or higher, regardless of how quickly you tan.',
    effectsTitle:   'UV Index Health Effects',
    effectsBody:    'UV 1–2 (Low): Minimal risk. UV 3–5 (Moderate): Wear sunscreen and protective clothing. UV 6–7 (High): Reduce sun exposure 10 AM–4 PM. UV 8–10 (Very High): Unprotected skin can burn quickly — take extra precautions. UV 11+ (Extreme): Avoid outdoor activity during midday; full protection essential.',
    findingSun:     'Finding your sun...',
    useMyLocation:  'Use my location',
    searchCity:     'Search city...',
    noCities:       'No cities found',
    tryAgain:       'Try Again',
    dayLetters:     ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    weekdays:       ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months:         ['January','February','March','April','May','June','July','August','September','October','November','December'],
    monthsShort:    ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  },
  he: {
    appName:        '?מה האינדקס',
    currentUV:      'מצב UV נוכחי',
    dailyForecast:  'תחזית UV יומית',
    aboutTitle:     'על מדד ה-UV',
    low:            'נמוך',
    moderate:       'בינוני',
    high:           'גבוה',
    veryHigh:       'גבוה מאוד',
    extreme:        'קיצוני',
    noProtection:   'אין צורך בהגנה',
    wearSunscreen:  'מרחו קרם הגנה SPF 30+',
    sunscreenHat:   'קרם הגנה, כובע וצל',
    minimize:       'הפחיתו חשיפה לשמש',
    avoidOutdoors:  'הימנעו מיציאה לחוץ',
    protectionFrom: (s: number, e: number) =>
      `מומלץ הגנה מהשמש בין ${s}:00 ל-${e}:00. מרחו קרם הגנה SPF 30+, חבשו כובע וחפשו צל.`,
    lowUVDay:       'רמות UV נמוכות היום. צאו לטבע בבטחה.',
    whoTitle:       '?מהו מדד UV של ארגון הבריאות העולמי',
    whoBody:        'מדד ה-UV הוא מדידה בינלאומית של עוצמת קרינת האולטרה-סגול מהשמש. פותח על ידי ארגון הבריאות העולמי, הוא מכמת את הסיכון לנזק מחשיפה לשמש ללא הגנה. הערכים מחושבים על סמך גובה השמש, רמות אוזון, כיסוי עננים ורפלקטיביות פני השטח.',
    skinTitle:      'סיכון לפי סוג עור',
    skinBody:       'עור בהיר (סוג I–II) נשרף בקלות בכל רמת UV. עור בינוני (סוג III–IV) נשרף ב-UV 3 ומעלה. עור כהה (סוג V–VI) נשרף ב-UV 6 ומעלה. כל סוגי העור זקוקים להגנה כאשר מדד ה-UV מגיע ל-8 ומעלה.',
    effectsTitle:   'השפעות בריאותיות של מדד ה-UV',
    effectsBody:    '.UV 1–2 (נמוך): סיכון מינימלי. UV 3–5 (בינוני): מרחו קרם הגנה ולבשו בגדים מגנים. UV 6–7 (גבוה): הפחיתו חשיפה בין 10:00–16:00. UV 8–10 (גבוה מאוד): עור לא מוגן עלול להישרף מהר. UV 11+ (קיצוני): הימנעו מפעילות חיצונית בצהריים',
    findingSun:     '...מחפש את השמש שלך',
    useMyLocation:  'השתמש במיקום שלי',
    searchCity:     '...חיפוש עיר',
    noCities:       'לא נמצאו ערים',
    tryAgain:       'נסה שוב',
    dayLetters:     ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
    weekdays:       ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'],
    months:         ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'],
    monthsShort:    ["ינו'","פבר'",'מרץ',"אפר'",'מאי','יוני','יולי',"אוג'","ספט'","אוק'","נוב'","דצמ'"],
  },
} as const;

// ── M3 Theme ──────────────────────────────────────────────────────────
const M3 = {
  background:         '#F4EFF8',
  surface:            '#FFFBFE',
  surfaceVariant:     '#E7E0EC',
  primaryContainer:   '#EADDFF',
  onPrimaryContainer: '#21005D',
  primary:            '#6750A4',
  outline:            '#79747E',
  outlineVariant:     '#CAC4D0',
  onSurface:          '#1C1B1F',
  onSurfaceVariant:   '#49454F',
  tonal:              '#F0EBF6',
};

const CARD_SHADOW = Platform.OS === 'web'
  ? ({ boxShadow: '0px 1px 4px rgba(0,0,0,0.10)' } as object)
  : { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 };

// ── Types ─────────────────────────────────────────────────────────────
interface HourlyUV { hour: number; uv: number; }
interface DayForecast {
  date: Date;
  dateStr: string;
  peakUV: number;
  uvKey: 'low' | 'moderate' | 'high' | 'veryHigh' | 'extreme';
  uvColor: string;
  adviceKey: 'noProtection' | 'wearSunscreen' | 'sunscreenHat' | 'minimize' | 'avoidOutdoors';
  hourly: HourlyUV[];
}
interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

// ── Constants ─────────────────────────────────────────────────────────
const MAX_UV = 12;

// ── Helpers ───────────────────────────────────────────────────────────
function getUVMeta(uv: number): Pick<DayForecast, 'uvKey' | 'uvColor' | 'adviceKey'> {
  const r = Math.round(uv);
  if (r <= 2)  return { uvKey: 'low',      uvColor: '#2D6A4F', adviceKey: 'noProtection'  };
  if (r <= 5)  return { uvKey: 'moderate', uvColor: '#B45309', adviceKey: 'wearSunscreen' };
  if (r <= 7)  return { uvKey: 'high',     uvColor: '#C0392B', adviceKey: 'sunscreenHat'  };
  if (r <= 10) return { uvKey: 'veryHigh', uvColor: '#6A1B9A', adviceKey: 'minimize'      };
  return              { uvKey: 'extreme',  uvColor: '#880E4F', adviceKey: 'avoidOutdoors' };
}

function longDate(d: Date, lang: Lang): string {
  const tr = TR[lang];
  return `${tr.weekdays[d.getDay()]}, ${tr.months[d.getMonth()]} ${d.getDate()}`;
}

async function getCityName(lat: number, lon: number): Promise<string> {
  if (Platform.OS !== 'web') {
    try {
      const [g] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      return g?.city || g?.region || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    } catch { /* fall through */ }
  }
  try {
    const r = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const d = await r.json();
    return d.city || d.principalSubdivision || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  } catch {
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
}

async function resolveWebLocation(): Promise<{ latitude: number; longitude: number; ipCity?: string }> {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000,
        })
      );
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch { /* fall through */ }
  }
  const r = await fetch('https://ipapi.co/json/');
  const d = await r.json();
  if (!d.latitude || !d.longitude) throw new Error('IP geolocation failed');
  return { latitude: d.latitude, longitude: d.longitude, ipCity: d.city || d.region };
}

async function searchCities(query: string): Promise<GeoResult[]> {
  if (query.trim().length < 2) return [];
  const r = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`
  );
  const d = await r.json();
  return d.results ?? [];
}

function parseForecasts(data: { hourly: { time: string[]; uv_index: number[] } }): DayForecast[] {
  const byDate = new Map<string, HourlyUV[]>();
  data.hourly.time.forEach((t, i) => {
    const ds = t.split('T')[0];
    const hr = parseInt(t.split('T')[1], 10);
    if (!byDate.has(ds)) byDate.set(ds, []);
    byDate.get(ds)!.push({ hour: hr, uv: Math.max(0, data.hourly.uv_index[i] ?? 0) });
  });
  return Array.from(byDate.entries()).map(([ds, hourly]) => {
    const peak = Math.max(...hourly.map(h => h.uv), 0);
    return { date: new Date(ds + 'T12:00:00'), dateStr: ds, peakUV: peak, hourly, ...getUVMeta(peak) };
  });
}

function splinePath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  const n = pts.length;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, n - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// ── Sun Icon ──────────────────────────────────────────────────────────
function SunIcon({ size = 72, color = M3.primary }: { size?: number; color?: string }) {
  const c = size / 2, r = size * 0.22, inner = size * 0.33, outer = size * 0.46, sw = size * 0.04;
  return (
    <Svg width={size} height={size}>
      <Circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={sw} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = ((i * 45) - 90) * Math.PI / 180;
        return (
          <Line key={i}
            x1={(c + Math.cos(a) * inner).toFixed(1)} y1={(c + Math.sin(a) * inner).toFixed(1)}
            x2={(c + Math.cos(a) * outer).toFixed(1)} y2={(c + Math.sin(a) * outer).toFixed(1)}
            stroke={color} strokeWidth={sw} strokeLinecap="round" />
        );
      })}
    </Svg>
  );
}

// ── UV Chart ──────────────────────────────────────────────────────────
const SVG_H = 200;
const L = 62, R = 8, T = 10, B = 24;

function UVChart({ hourly, width, lang }: { hourly: HourlyUV[]; width: number; lang: Lang }) {
  const tr = TR[lang];
  const plotW = width - L - R, plotH = SVG_H - T - B;
  const toX = (h: number) => L + (h / 23) * plotW;
  const toY = (uv: number) => T + plotH - (Math.min(uv, MAX_UV) / MAX_UV) * plotH;
  const pct  = (uv: number) => `${((1 - uv / MAX_UV) * 100).toFixed(1)}%`;

  const pts   = hourly.map(h => ({ x: toX(h.hour), y: toY(h.uv) }));
  const curve = splinePath(pts);
  const fill  = pts.length
    ? `${curve} L ${toX(23).toFixed(1)} ${(T + plotH).toFixed(1)} L ${toX(0).toFixed(1)} ${(T + plotH).toFixed(1)} Z`
    : '';
  const peak  = hourly.reduce<HourlyUV | null>((b, h) => (!b || h.uv > b.uv ? h : b), null);
  const peakX = peak ? toX(peak.hour) : 0;
  const peakY = peak ? toY(peak.uv) : 0;
  const peakV = peak ? Math.round(peak.uv) : 0;

  const thresholds = [
    { uv: 2,  label: tr.low },
    { uv: 5,  label: tr.moderate },
    { uv: 7,  label: tr.high },
    { uv: 10, label: tr.veryHigh },
    { uv: 12, label: tr.extreme },
  ];

  return (
    <Svg width={width} height={SVG_H}>
      <Defs>
        <LinearGradient id="uvFill" x1="0" y1={T} x2="0" y2={T + plotH} gradientUnits="userSpaceOnUse">
          <Stop offset={pct(12)} stopColor="#FF2D55" stopOpacity="0.55" />
          <Stop offset={pct(10)} stopColor="#FF453A" stopOpacity="0.45" />
          <Stop offset={pct(7)}  stopColor="#FF9F0A" stopOpacity="0.38" />
          <Stop offset={pct(5)}  stopColor="#FFD60A" stopOpacity="0.3"  />
          <Stop offset={pct(2)}  stopColor="#34C759" stopOpacity="0.2"  />
          <Stop offset="100%"    stopColor="#34C759" stopOpacity="0.04" />
        </LinearGradient>
        <LinearGradient id="uvStroke" x1="0" y1={T} x2="0" y2={T + plotH} gradientUnits="userSpaceOnUse">
          <Stop offset={pct(12)} stopColor="#FF2D55" />
          <Stop offset={pct(10)} stopColor="#FF453A" />
          <Stop offset={pct(7)}  stopColor="#FF9F0A" />
          <Stop offset={pct(5)}  stopColor="#FFD60A" />
          <Stop offset={pct(2)}  stopColor="#34C759" />
          <Stop offset="100%"    stopColor="#31D158" />
        </LinearGradient>
      </Defs>
      {thresholds.map(th => (
        <G key={th.label}>
          <Line x1={L} y1={toY(th.uv)} x2={width - R} y2={toY(th.uv)} stroke="rgba(0,0,0,0.07)" strokeWidth={1} />
          <SvgText x={L - 5} y={toY(th.uv) + 4} fontSize={9} fill="rgba(0,0,0,0.38)" textAnchor="end">{th.label}</SvgText>
        </G>
      ))}
      {[6, 12, 18].map(h => (
        <Line key={h} x1={toX(h)} y1={T} x2={toX(h)} y2={T + plotH} stroke="rgba(0,0,0,0.08)" strokeWidth={1} strokeDasharray="3,3" />
      ))}
      {fill  && <Path d={fill}  fill="url(#uvFill)" />}
      {curve && <Path d={curve} fill="none" stroke="url(#uvStroke)" strokeWidth={2.5} strokeLinecap="round" />}
      {peakV > 0 && (
        <G>
          <Circle cx={peakX} cy={peakY} r={5} fill="#FF2D55" stroke="white" strokeWidth={2} />
          <SvgText x={peakX} y={peakY - 10} fontSize={12} fontWeight="600" fill={M3.onSurface} textAnchor="middle">{peakV}</SvgText>
        </G>
      )}
      {([{ h: 0, label: '12 AM' }, { h: 6, label: '6 AM' }, { h: 12, label: '12 PM' }, { h: 18, label: '6 PM' }]).map(({ h, label }) => (
        <SvgText key={h} x={toX(h)} y={T + plotH + 16} fontSize={10} fill="rgba(0,0,0,0.45)" textAnchor="middle">{label}</SvgText>
      ))}
    </Svg>
  );
}

// ── Accordion Row ─────────────────────────────────────────────────────
function AccordionRow({ title, body, open, onToggle, link = false, noBorder = false }: {
  title: string; body: string; open: boolean; onToggle: () => void; link?: boolean; noBorder?: boolean;
}) {
  return (
    <View style={[acc.row, noBorder && { borderTopWidth: 0 }]}>
      <TouchableOpacity style={acc.header} onPress={onToggle} activeOpacity={0.7}>
        <Text style={acc.title}>{title}</Text>
        <View style={acc.icons}>
          {link && <Text style={acc.linkIcon}>↗</Text>}
          <Text style={acc.chevron}>{open ? '⌃' : '⌄'}</Text>
        </View>
      </TouchableOpacity>
      {open && <Text style={acc.body}>{body}</Text>}
    </View>
  );
}

const acc = StyleSheet.create({
  row:     { borderTopWidth: 1, borderTopColor: M3.outlineVariant, paddingVertical: 4 },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  title:   { fontSize: 15, fontWeight: '500', color: M3.onSurface, flex: 1 },
  icons:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkIcon:{ fontSize: 14, color: M3.primary },
  chevron: { fontSize: 18, color: M3.onSurfaceVariant },
  body:    { fontSize: 14, lineHeight: 22, color: M3.onSurfaceVariant, paddingBottom: 12 },
});

// ── HomeScreen ────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof localStorage !== 'undefined') return (localStorage.getItem('mahaindex_lang') as Lang) || 'en';
    return 'en';
  });

  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [forecasts,     setForecasts]     = useState<DayForecast[]>([]);
  const [currentUV,     setCurrentUV]     = useState(0);
  const [city,          setCity]          = useState('');
  const [selectedDay,   setSelectedDay]   = useState(0);
  const [openAccordion, setOpenAccordion] = useState<number>(0);
  const [chartWidth,    setChartWidth]    = useState(320);
  const [showSearch,    setShowSearch]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching,     setSearching]     = useState(false);

  const tr = TR[lang];

  // Persist language choice
  useEffect(() => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('mahaindex_lang', lang);
  }, [lang]);

  const fetchUV = useCallback(async (lat: number, lon: number, name: string) => {
    const uvRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index&hourly=uv_index&forecast_days=7&timezone=auto`
    );
    const uvData = await uvRes.json();
    setCurrentUV(Math.round(uvData.current?.uv_index ?? 0));
    setForecasts(parseForecasts(uvData));
    setCity(name);
    setSelectedDay(0);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let lat: number, lon: number, ipCity: string | undefined;
      if (Platform.OS === 'web') {
        const loc = await resolveWebLocation();
        lat = loc.latitude; lon = loc.longitude; ipCity = loc.ipCity;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setError('Location access denied.'); return; }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = pos.coords.latitude; lon = pos.coords.longitude;
      }
      const name = ipCity || await getCityName(lat, lon);
      await fetchUV(lat, lon, name);
    } catch {
      setError('Could not fetch UV data.\nCheck your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchUV]);

  const loadCity = useCallback(async (lat: number, lon: number, name: string) => {
    setShowSearch(false); setSearchQuery(''); setSearchResults([]);
    setLoading(true); setError(null);
    try {
      await fetchUV(lat, lon, name);
    } catch {
      setError('Could not fetch UV data.\nCheck your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchUV]);

  // Debounced city search
  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try { setSearchResults(await searchCities(searchQuery)); }
      catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => { load(); }, [load]);

  const isRTL = lang === 'he';
  const rtl   = isRTL ? ({ direction: 'rtl', writingDirection: 'rtl' } as object) : {};

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={M3.primary} />
        <Text style={s.loadText}>{tr.findingSun}</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (error || !forecasts.length) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 56 }}>☁️</Text>
        <Text style={[s.loadText, { textAlign: 'center' }]}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={load}>
          <Text style={s.retryLabel}>{tr.tryAgain}</Text>
        </TouchableOpacity>
        <StatusBar style="dark" />
      </View>
    );
  }

  const day      = forecasts[selectedDay];
  const heroMeta = getUVMeta(currentUV);

  const protHours = day.hourly.filter(h => h.uv > 3);
  const protStart = protHours.length ? Math.min(...protHours.map(h => h.hour)) : null;
  const protEnd   = protHours.length ? Math.max(...protHours.map(h => h.hour)) : null;
  const protText  = protStart !== null && protEnd !== null
    ? tr.protectionFrom(protStart, protEnd)
    : tr.lowUVDay;

  return (
    <View style={[s.page, rtl as any]}>
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.inner}>

          {/* ── App bar ── */}
          {showSearch ? (
            <View style={s.searchBar}>
              <Text style={s.searchIcon}>🔍</Text>
              <TextInput
                style={s.searchInput}
                placeholder={tr.searchCity}
                placeholderTextColor={M3.onSurfaceVariant}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searching
                ? <ActivityIndicator size="small" color={M3.primary} />
                : <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}>
                    <Text style={s.searchClose}>✕</Text>
                  </TouchableOpacity>
              }
            </View>
          ) : (
            <View style={s.appBar}>
              <Text style={s.appBarTitle}>{tr.appName}</Text>
              <View style={s.appBarActions}>
                {/* Language toggle */}
                <TouchableOpacity
                  style={s.langBtn}
                  onPress={() => setLang(lang === 'en' ? 'he' : 'en')}
                >
                  <Text style={s.langBtnText}>{lang === 'en' ? 'עב' : 'EN'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowSearch(true)} hitSlop={12}>
                  <Text style={s.searchIconBtn}>🔍</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Search results ── */}
          {showSearch && (
            <View style={s.card}>
              <TouchableOpacity style={s.resultRow} onPress={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); load(); }}>
                <Text style={s.resultIcon}>📍</Text>
                <Text style={[s.resultName, { color: M3.primary }]}>{tr.useMyLocation}</Text>
              </TouchableOpacity>
              {searchResults.map((r, i) => {
                const subtitle = [r.admin1, r.country].filter(Boolean).join(', ');
                const label    = r.admin1 ? `${r.name}, ${r.admin1}` : `${r.name}, ${r.country}`;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[s.resultRow, i > 0 && { borderTopWidth: 1, borderTopColor: M3.outlineVariant }]}
                    onPress={() => loadCity(r.latitude, r.longitude, label)}
                  >
                    <Text style={s.resultIcon}>🏙</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.resultName}>{r.name}</Text>
                      <Text style={s.resultSub}>{subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <Text style={s.noResults}>{tr.noCities}</Text>
              )}
            </View>
          )}

          {/* ── Card A: Hero ── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{tr.currentUV}</Text>
            <View style={s.heroRow}>
              <View style={{ flex: 1 }}>
                <Text style={[s.heroNumber, { color: heroMeta.uvColor }]}>{currentUV}</Text>
                <Text style={[s.heroLabel,  { color: heroMeta.uvColor }]}>{tr[heroMeta.uvKey]}</Text>
              </View>
              <SunIcon size={80} color={heroMeta.uvColor} />
            </View>
            <View style={s.heroDivider} />
            <Text style={s.heroMeta}>{city ? `${city}  •  ` : ''}{longDate(day.date, lang)}</Text>
          </View>

          {/* ── Card B: Daily Forecast ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>{tr.dailyForecast}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
              <View style={s.dayRow}>
                {forecasts.map((f, i) => {
                  const sel = i === selectedDay;
                  return (
                    <TouchableOpacity key={f.dateStr} style={s.dayCol} onPress={() => setSelectedDay(i)}>
                      <Text style={[s.dayLetter, sel && s.dayLetterSel]}>
                        {tr.dayLetters[f.date.getDay()]}
                      </Text>
                      {sel ? (
                        <View style={s.selChip}><Text style={s.selChipNum}>{f.date.getDate()}</Text></View>
                      ) : (
                        <Text style={s.dayNum}>{f.date.getDate()}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <View onLayout={e => setChartWidth(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
              {chartWidth > 0 && <UVChart hourly={day.hourly} width={chartWidth} lang={lang} />}
            </View>
          </View>

          {/* ── Card C: Protection ── */}
          <View style={[s.card, s.protCard]}>
            <View style={s.protRow}>
              <Text style={s.protIcon}>🧢</Text>
              <Text style={s.protText}>{protText}</Text>
            </View>
          </View>

          {/* ── Card D: About ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>{tr.aboutTitle}</Text>
            <View style={{ marginTop: 8 }}>
              <AccordionRow title={tr.whoTitle} body={tr.whoBody} open={openAccordion === 0} onToggle={() => setOpenAccordion(openAccordion === 0 ? -1 : 0)} link noBorder />
              <AccordionRow title={tr.skinTitle} body={tr.skinBody} open={openAccordion === 1} onToggle={() => setOpenAccordion(openAccordion === 1 ? -1 : 1)} />
              <AccordionRow title={tr.effectsTitle} body={tr.effectsBody} open={openAccordion === 2} onToggle={() => setOpenAccordion(openAccordion === 2 ? -1 : 2)} />
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page:          { flex: 1, backgroundColor: M3.background },
  scrollContent: { flexGrow: 1 },
  inner:         { maxWidth: 700, alignSelf: 'center', width: '100%', padding: 16, gap: 12 },

  appBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4 },
  appBarTitle:   { fontSize: 22, fontWeight: '600', color: M3.onSurface, letterSpacing: 0.15 },
  appBarActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langBtn:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: M3.primaryContainer },
  langBtnText:   { fontSize: 13, fontWeight: '600', color: M3.onPrimaryContainer },
  searchIconBtn: { fontSize: 20 },

  card:          { backgroundColor: M3.surface, borderRadius: 16, padding: 20, ...CARD_SHADOW },
  cardLabel:     { fontSize: 11, fontWeight: '500', color: M3.onSurfaceVariant, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  cardTitle:     { fontSize: 20, fontWeight: '500', color: M3.onSurface, letterSpacing: 0.15 },

  heroRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  heroNumber:    { fontSize: 80, fontWeight: '300', lineHeight: 88, letterSpacing: -1 },
  heroLabel:     { fontSize: 22, fontWeight: '500', letterSpacing: 0.15, marginTop: 2 },
  heroDivider:   { height: 1, backgroundColor: M3.outlineVariant, marginVertical: 16 },
  heroMeta:      { fontSize: 14, color: M3.onSurfaceVariant, letterSpacing: 0.25 },

  dayRow:        { flexDirection: 'row', gap: 8, paddingHorizontal: 2 },
  dayCol:        { alignItems: 'center', gap: 6, minWidth: 44 },
  dayLetter:     { fontSize: 13, fontWeight: '500', color: M3.onSurfaceVariant },
  dayLetterSel:  { color: M3.onPrimaryContainer },
  dayNum:        { fontSize: 16, color: M3.onSurface, fontWeight: '400', paddingVertical: 10 },
  selChip:       { width: 40, height: 40, borderRadius: 20, backgroundColor: M3.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  selChipNum:    { fontSize: 16, fontWeight: '600', color: M3.onPrimaryContainer },

  protCard:      { backgroundColor: M3.tonal },
  protRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  protIcon:      { fontSize: 24, marginTop: 2 },
  protText:      { flex: 1, fontSize: 14, lineHeight: 22, color: M3.onSurface },

  searchBar:     { flexDirection: 'row', alignItems: 'center', backgroundColor: M3.surface, borderRadius: 28, paddingHorizontal: 16, paddingVertical: 10, gap: 10, ...CARD_SHADOW },
  searchIcon:    { fontSize: 16 },
  searchInput:   { flex: 1, fontSize: 16, color: M3.onSurface, outlineStyle: 'none' } as any,
  searchClose:   { fontSize: 16, color: M3.onSurfaceVariant, paddingLeft: 4 },
  resultRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  resultIcon:    { fontSize: 18, width: 24, textAlign: 'center' },
  resultName:    { fontSize: 15, fontWeight: '500', color: M3.onSurface },
  resultSub:     { fontSize: 13, color: M3.onSurfaceVariant, marginTop: 1 },
  noResults:     { fontSize: 14, color: M3.onSurfaceVariant, paddingVertical: 12, textAlign: 'center' },

  center:        { flex: 1, backgroundColor: M3.background, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  loadText:      { fontSize: 16, color: M3.onSurfaceVariant },
  retryBtn:      { backgroundColor: M3.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  retryLabel:    { color: '#fff', fontSize: 15, fontWeight: '600' },
});
