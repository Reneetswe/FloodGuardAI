import { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, Activity, AlertTriangle, Users, MessageSquare, Camera, Waves, Bell, MapPin, Gauge } from 'lucide-react';
import { socket } from '../lib/socket';
import { api, getTotalPostsCount, scanSocialPosts, manualUpload } from '../lib/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TABS = ['Dashboard', 'IoT Sensors', 'Social AI', 'Vision AI', 'ML Predictions', 'Alerts', 'SMS Delivery'];

export default function Dashboard() {
  const [active, setActive] = useState('Dashboard');
  const [sensors, setSensors] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [overall, setOverall] = useState({ status: 'NORMAL', risk: 20, affectedAreas: 0, peopleAtRisk: 0 });

  useEffect(() => {
    let mounted = true;
    api.get('/sensors').then(r => { if (mounted) setSensors(r.data || []); }).catch(()=>{});
    api.get('/predictions').then(r => { if (mounted) setPredictions(r.data || []); }).catch(()=>{});
    api.get('/overall').then(r => { if (mounted) setOverall(r.data || overall); }).catch(()=>{});

    socket.on('sensors', data => setSensors(data));
    socket.on('predictions', data => setPredictions(data));
    socket.on('overall', data => setOverall(data));
    return () => {
      mounted = false;
      socket.off('sensors');
      socket.off('predictions');
      socket.off('overall');
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <RiskBanner overall={overall} />

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <StatCard icon={<Activity className="text-teal-700" />} title="Active Sensors" value={sensors.length || 5} status="All Online" dotColor="text-teal-600" />
        <StatCard icon={<Brain className="text-slate-600" />} title="AI Models" value={4} status="Running" dotColor="text-teal-600" />
        <StatCard icon={<AlertTriangle className="text-red-700" />} title="Critical Areas" value={2} status="Immediate" dotColor="text-red-600" />
        <StatCard icon={<Users className="text-slate-600" />} title="People at Risk" value={8400} status="Need Alert" dotColor="text-slate-500" />
        <StatCard icon={<MessageSquare className="text-slate-600" />} title="Social Mentions" value={127} status="Increasing" dotColor="text-slate-500" />
        <StatCard icon={<Camera className="text-slate-600" />} title="Photos Analyzed" value={43} status="Processing" dotColor="text-slate-500" />
      </div>

      <div className="mt-8">
        <TabNav active={active} onChange={setActive} />
      </div>

      <div className="mt-6">
        {active === 'Dashboard' && <DashboardHome sensors={sensors} predictions={predictions} />}
        {active === 'IoT Sensors' && <IotSensorsView sensors={sensors} />}
        {active === 'Social AI' && <SocialAIView />}
        {active === 'Vision AI' && <VisionAIView sensors={sensors} />}
        {active === 'ML Predictions' && <PredictionsView predictions={predictions} />}
        {active === 'Alerts' && <AlertsView />}
        {active === 'SMS Delivery' && <SMSDeliveryView />}
      </div>
    </div>
  );
}

function RiskBanner({ overall }) {
  const style = overall.status === 'CRITICAL'
    ? 'bg-red-50 border-red-200 animate-[pulseSlow_2s_ease-in-out_infinite]'
    : overall.status === 'WARNING'
    ? 'bg-amber-50 border-amber-200'
    : 'bg-teal-50 border-teal-200';
  return (
    <div className={`border rounded-xl p-5 shadow-professional relative overflow-hidden ${style}`}>
      <div className="text-sm font-semibold text-primary">SYSTEM STATUS: {overall.status || 'NORMAL'}</div>
      <div className="mt-1 text-2xl font-extrabold text-primary">{overall.risk ?? 20}% Overall Flood Risk</div>
      <div className="mt-1 text-sm text-secondary">Affected Areas: {overall.affectedAreas ?? 2} • People at risk: {overall.peopleAtRisk ?? 8400}</div>
    </div>
  );
}

function StatCard({ icon, title, value, status, dotColor }) {
  return (
    <div className="p-4 bg-secondary rounded-lg border border-custom shadow-professional hover:shadow-professional-lg transition hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div>{icon}</div>
        <div className="text-sm text-secondary">{title}</div>
      </div>
      <div className="mt-2 text-2xl font-bold text-primary">{value}</div>
      <div className={`mt-1 text-xs badge-dot ${dotColor}`}>{status}</div>
    </div>
  );
}

function TabNav({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map(t => (
        <button key={t} onClick={() => onChange(t)} className={`px-4 py-2 rounded-full border text-sm transition ${active===t ? 'bg-white text-gray-900 border-transparent shadow-professional' : 'bg-secondary border-custom hover:bg-primary text-primary'}`}>{t}</button>
      ))}
    </div>
  );
}

function DashboardHome({ sensors, predictions }) {
  return (
    <div className="space-y-6">
      <div className="p-5 border rounded-lg bg-red-50 border-red-200 animate-pulse shadow-professional">
        <div className="text-red-900 font-extrabold text-lg">MULTI-SYSTEM FAILURE WARNING</div>
        <div className="text-sm text-red-800 mt-1">Sensor data + AI models confirm imminent flooding in 2 areas</div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <AreaPanel title="Main Mall District" sensor="87% water level (CRITICAL)" cv="Drain 78% blocked (CONFIRMED)" social="47 panic mentions" ml="94% flood in 1.5hrs" />
          <AreaPanel title="CBD Business Area" sensor="91% water level (CRITICAL)" cv="Culvert 85% blocked" social="23 reports" ml="88% flood in 2hrs" />
        </div>
        <div className="mt-3 font-semibold text-red-900">RECOMMENDED ACTION: Evacuate ~8,400 people immediately</div>
      </div>

      <div className="p-5 border rounded-lg bg-secondary shadow-professional">
        <div className="font-bold text-primary">Hybrid Intelligence Architecture</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          <ArchCard icon={<Waves className="text-floodwater" />} title="IoT Sensors" items={["Water, vibration, temperature","24/7 telemetry","Low-power, solar"]} />
          <ArchCard icon={<MessageSquare className="text-floodwater" />} title="NLP" items={["Keyword & location extraction","Trend detection","Realtime scoring"]} />
          <ArchCard icon={<Camera className="text-floodwater" />} title="Computer Vision" items={["Drain blockage detection","Confidence scoring","Citizen uploads"]} />
          <ArchCard icon={<Brain className="text-floodwater" />} title="ML Predictions" items={["Time-series fusion","7-year history","Explainability"]} />
        </div>
      </div>

      <FloodBehaviorMap sensors={sensors} predictions={predictions} />

      <div className="p-5 border rounded-lg bg-secondary border-custom">
        <div className="font-bold text-primary">Why Hybrid Sensor + AI Outperforms Single-Method Systems</div>
        <div className="grid sm:grid-cols-3 gap-4 mt-3">
          <Bullet title="Redundancy & Validation" />
          <Bullet title="Complete Coverage" />
          <Bullet title="Early + Late Warnings" />
        </div>
      </div>
    </div>
  );
}

function AreaPanel({ title, sensor, cv, social, ml }) {
  return (
    <div className="p-4 border rounded-lg bg-secondary shadow-professional">
      <div className="font-semibold text-primary">{title}</div>
      <ul className="text-sm text-secondary mt-1 space-y-1">
        <li>Sensor: {sensor}</li>
        <li>CV: {cv}</li>
        <li>Social: {social}</li>
        <li>ML Prediction: {ml}</li>
      </ul>
    </div>
  );
}

function ArchCard({ icon, title, items }) {
  return (
    <div className="p-4 border rounded-lg bg-secondary shadow-professional">
      <div className="flex items-center gap-2">{icon}<div className="font-semibold text-primary">{title}</div></div>
      <ul className="text-sm text-secondary mt-2 list-disc pl-5 space-y-1">
        {items.map((x,i)=> <li key={i}>{x}</li>)}
      </ul>
    </div>
  );
}

function Bullet({ title }) {
  return <div className="p-4 bg-secondary border rounded-lg shadow-professional text-primary">{title}</div>;
}

function FloodBehaviorMap({ sensors, predictions }) {
  const now = new Date();
  const [rainfallMm, setRainfallMm] = useState(40);
  const [durationHrs, setDurationHrs] = useState(3);
  const [year, setYear] = useState(2025);
  const [selectedId, setSelectedId] = useState(null);

  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef(null);

  const areas = useMemo(() => {
    const safeSensors = Array.isArray(sensors) ? sensors : [];
    const safePredictions = Array.isArray(predictions) ? predictions : [];

    const month = now.getMonth() + 1;
    const moonPhase = 0.5;
    const weekday = now.getDay();
    const weights = { lstm: 0.4, rf: 0.4, prophet: 0.2 };

    const isRainySeason = month >= 11 || month <= 3;
    const seasonFactor = isRainySeason ? 1 : 0.4;
    const moonFactor = 0.7 + 0.3 * moonPhase;
    const weekdayFactor = weekday === 1 || weekday === 2 || weekday === 3 || weekday === 4 || weekday === 5 ? 1 : 0.9;

    const memory = [
      {
        id: 'block6-3rd',
        name: 'Block 6, 3rd Street',
        coordinates: [-24.6551, 25.9284],
        history: { events: 16, years: '2017-2025', last: '2025-02-08' },
        patterns: [
          { rainfallMin: 30, durationMin: 2, etaHrs: 4, confidence: 0.86, rule: 'Rain > 30mm for 2+ hrs' },
          { rainfallMin: 50, durationMin: 1.5, etaHrs: 2.2, confidence: 0.92, rule: 'Rain > 50mm' },
          { rainfallMin: 22, durationMin: 3, etaHrs: 5.2, confidence: 0.78, rule: 'Sustained rain in rainy season' },
        ],
      },
      {
        id: 'mainmall-drain',
        name: 'Main Mall District',
        coordinates: [-24.6282, 25.9231],
        history: { events: 10, years: '2017-2025', last: '2025-01-14' },
        patterns: [
          { rainfallMin: 28, durationMin: 1.5, etaHrs: 3.2, confidence: 0.88, rule: 'Moderate rain + high blockage risk' },
          { rainfallMin: 45, durationMin: 1, etaHrs: 1.6, confidence: 0.94, rule: 'Heavy rain event' },
          { rainfallMin: 18, durationMin: 4, etaHrs: 4.8, confidence: 0.76, rule: 'Long duration rainfall' },
        ],
      },
      {
        id: 'cbd-business',
        name: 'CBD Business Area',
        coordinates: [-24.6464, 25.9119],
        history: { events: 7, years: '2017-2025', last: '2025-02-20' },
        patterns: [
          { rainfallMin: 26, durationMin: 2, etaHrs: 3.8, confidence: 0.84, rule: 'Rain + runoff concentration' },
          { rainfallMin: 40, durationMin: 1.2, etaHrs: 2.1, confidence: 0.91, rule: 'Storm burst scenario' },
        ],
      },
      {
        id: 'broadhurst',
        name: 'Broadhurst Residential',
        coordinates: [-24.6397, 25.8876],
        history: { events: 13, years: '2017-2025', last: '2025-03-01' },
        patterns: [
          { rainfallMin: 24, durationMin: 2.5, etaHrs: 5.0, confidence: 0.83, rule: 'Seasonal high groundwater' },
          { rainfallMin: 36, durationMin: 1.8, etaHrs: 3.0, confidence: 0.89, rule: 'Rain + drainage saturation' },
        ],
      },
      {
        id: 'station-area',
        name: 'Station Area',
        coordinates: [-24.6535, 25.9084],
        history: { events: 6, years: '2017-2025', last: '2025-01-25' },
        patterns: [
          { rainfallMin: 20, durationMin: 3, etaHrs: 6.0, confidence: 0.75, rule: 'Sustained rainfall + pump sensitivity' },
          { rainfallMin: 34, durationMin: 2, etaHrs: 3.6, confidence: 0.86, rule: 'Heavy traffic drainage stress' },
        ],
      },
      {
        id: 'tlokweng',
        name: 'Tlokweng',
        coordinates: [-24.6750, 25.9800],
        history: { events: 8, years: '2017-2025', last: '2025-02-04' },
        patterns: [
          { rainfallMin: 26, durationMin: 2, etaHrs: 4.6, confidence: 0.84, rule: 'Rain > 26mm for 2+ hrs' },
          { rainfallMin: 42, durationMin: 1.5, etaHrs: 2.8, confidence: 0.90, rule: 'Heavy rainfall burst' },
          { rainfallMin: 18, durationMin: 4, etaHrs: 5.8, confidence: 0.78, rule: 'Long rainfall duration in rainy season' },
        ],
      },
      {
        id: 'the-village',
        name: 'The Village',
        coordinates: [-24.6515, 25.9140],
        history: { events: 7, years: '2017-2025', last: '2025-02-16' },
        patterns: [
          { rainfallMin: 24, durationMin: 2, etaHrs: 4.2, confidence: 0.83, rule: 'Moderate rain + runoff concentration' },
          { rainfallMin: 38, durationMin: 1.2, etaHrs: 2.4, confidence: 0.89, rule: 'Storm burst scenario' },
        ],
      },
    ];

    function clamp(n, min, max) {
      return Math.max(min, Math.min(max, n));
    }

    function hashString(str) {
      let h = 2166136261;
      for (let i = 0; i < str.length; i += 1) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }

    function mulberry32(a) {
      return function () {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    function getYearStats(zoneId, y) {
      const rand = mulberry32(hashString(`${zoneId}:${y}`));
      const rainySeasonBoost = y === 2020 || y === 2024 || y === 2025 ? 1.12 : 1;
      const rainMm = clamp(Math.round((18 + rand() * 72) * rainySeasonBoost), 8, 120);
      const coveredKm2 = clamp(Number((0.35 + rand() * 2.85).toFixed(2)), 0.15, 3.8);
      return { year: y, rainMm, coveredKm2 };
    }
    function normalizeWeights(w) {
      const s = (w?.lstm ?? 0) + (w?.rf ?? 0) + (w?.prophet ?? 0);
      if (!s) return { lstm: 1 / 3, rf: 1 / 3, prophet: 1 / 3 };
      return { lstm: (w.lstm ?? 0) / s, rf: (w.rf ?? 0) / s, prophet: (w.prophet ?? 0) / s };
    }
    const w = normalizeWeights(weights);

    function dist2(a, b) {
      const dx = (a[0] - b[0]);
      const dy = (a[1] - b[1]);
      return dx * dx + dy * dy;
    }
    function nearestSensor(coords) {
      if (!safeSensors.length) return null;
      let best = safeSensors[0];
      let bestD = Infinity;
      for (const s of safeSensors) {
        const c = [s?.location?.lat, s?.location?.lng];
        if (typeof c[0] !== 'number' || typeof c[1] !== 'number') continue;
        const d = dist2(coords, c);
        if (d < bestD) {
          bestD = d;
          best = s;
        }
      }
      return best;
    }

    function parseEtaHours(str) {
      if (!str) return null;
      const m = String(str).match(/([0-9]+(?:\.[0-9]+)?)/);
      if (!m) return null;
      return Number(m[1]);
    }

    function sigmoid(x) {
      return 1 / (1 + Math.exp(-x));
    }

    function modelLSTM(features) {
      const x =
        0.04 * features.rainfall +
        0.22 * features.duration +
        0.65 * features.season +
        0.35 * features.moon +
        0.28 * features.sensor +
        0.18 * features.weekday -
        3.2;
      return sigmoid(x);
    }

    function modelRF(features) {
      const x =
        0.06 * features.rainfall +
        0.25 * features.duration +
        0.55 * features.season +
        0.15 * features.moon +
        0.6 * features.sensor +
        0.12 * features.weekday -
        3.4;
      return sigmoid(x);
    }

    function modelProphet(features) {
      const seasonal = 0.65 * features.season + 0.15 * features.moon;
      const x = 0.05 * features.rainfall + 0.18 * features.duration + seasonal - 2.9;
      return sigmoid(x);
    }

    return memory.map((m) => {
      const s = nearestSensor(m.coordinates);
      const water = typeof s?.waterLevel === 'number' ? s.waterLevel : 0;
      const blockage = typeof s?.blockage === 'number' ? s.blockage : 0;
      const sensorStress = clamp((0.6 * water + 0.4 * blockage) / 100, 0, 1);

      const yearStats = getYearStats(m.id, year);

      const matched = m.patterns
        .filter(p => rainfallMm >= p.rainfallMin && durationHrs >= p.durationMin)
        .sort((a, b) => (b.confidence - a.confidence));

      const baseEta = matched.length ? matched[0].etaHrs : clamp(6.5 - (rainfallMm / 80) * 2.5 - (durationHrs / 6) * 1.5, 1.2, 8);
      const baseConf = matched.length ? matched[0].confidence : clamp(0.55 + (rainfallMm / 100) * 0.2 + (durationHrs / 8) * 0.15, 0.5, 0.85);

      const pred = safePredictions.find(p => {
        const a = String(p?.area || '').toLowerCase();
        const n = String(m.name || '').toLowerCase();
        return a && (a.includes(n) || n.includes(a));
      });
      const predProb = typeof pred?.probability === 'number' ? clamp(pred.probability / 100, 0, 1) : null;
      const predEta = parseEtaHours(pred?.timeToFlood);

      const features = {
        rainfall: rainfallMm,
        duration: durationHrs,
        season: seasonFactor,
        moon: moonFactor,
        weekday: weekdayFactor,
        sensor: sensorStress,
      };

      const pLSTM = modelLSTM(features);
      const pRF = modelRF(features);
      const pProphet = modelProphet(features);
      const ensemble = clamp(pLSTM * w.lstm + pRF * w.rf + pProphet * w.prophet, 0, 1);
      const combined = predProb == null ? ensemble : clamp(0.6 * ensemble + 0.4 * predProb, 0, 1);

      const yearIntensity = clamp(0.75 + (yearStats.rainMm / 120) * 0.5 + yearStats.coveredKm2 / 6, 0.7, 1.4);
      const combinedYear = clamp(combined * yearIntensity, 0, 1);

      const eta = predEta != null ? predEta : clamp(baseEta * (1.05 - 0.35 * combined), 0.8, 10);
      const confidence = clamp(0.55 * baseConf + 0.25 * (matched[0]?.confidence ?? 0.65) + 0.2 * (0.65 + 0.35 * combined), 0.5, 0.98);

      const insight = matched.length
        ? `When ${matched[0].rule}, ${m.name} floods in ~${matched[0].etaHrs} hours`
        : `When rain reaches ~${Math.round(rainfallMm)}mm for ${Math.round(durationHrs * 10) / 10}h, ${m.name} risk rises quickly`;

      return {
        ...m,
        sensor: s ? { id: s.id, name: s.name, waterLevel: s.waterLevel, blockage: s.blockage, status: s.status } : null,
        yearStats,
        models: { lstm: pLSTM, rf: pRF, prophet: pProphet, ensemble, combined, combinedYear },
        etaHours: eta,
        confidence,
        insight,
        matchedPatterns: matched.slice(0, 3),
      };
    });
  }, [sensors, predictions, rainfallMm, durationHrs, year]);

  const summary = useMemo(() => {
    if (!areas.length) return { avgRainMm: 0, totalCoveredKm2: 0 };
    const totalRain = areas.reduce((acc, a) => acc + (a.yearStats?.rainMm ?? 0), 0);
    const totalCovered = areas.reduce((acc, a) => acc + (a.yearStats?.coveredKm2 ?? 0), 0);
    return {
      avgRainMm: Math.round(totalRain / areas.length),
      totalCoveredKm2: Number(totalCovered.toFixed(2)),
    };
  }, [areas]);

  function getRiskColor(risk) {
    if (risk > 0.7) return '#ef4444';
    if (risk > 0.4) return '#f59e0b';
    if (risk > 0.2) return '#eab308';
    return '#10b981';
  }

  function getRiskLabel(risk) {
    if (risk > 0.7) return 'High Risk';
    if (risk > 0.4) return 'Medium Risk';
    if (risk > 0.2) return 'Low Risk';
    return 'Minimal Risk';
  }

  const selected = selectedId ? areas.find(a => a.id === selectedId) : null;

  useEffect(() => {
    if (mapRef.current || !mapElRef.current) return;

    const map = L.map(mapElRef.current, { zoomControl: false, attributionControl: true });
    map.setView([-24.6541, 25.9087], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layersRef.current = group;

    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const group = layersRef.current;
    if (!group) return;

    group.clearLayers();

    areas.forEach((a) => {
      const risk = a.models?.combinedYear ?? a.models?.combined ?? 0;
      const coveredKm2 = a.yearStats?.coveredKm2 ?? 0.6;
      const radius = Math.max(220, Math.sqrt((coveredKm2 * 1000000) / Math.PI));
      const color = getRiskColor(risk);
      const circle = L.circle(a.coordinates, {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.45,
        opacity: 0.9,
      });

      const tooltipHtml = `
        <div style="min-width: 160px">
          <div style="font-weight: 600">${a.name}</div>
          <div>Year: ${year} • Rain: ${a.yearStats?.rainMm ?? '-'}mm</div>
          <div>Covered: ${a.yearStats?.coveredKm2 ?? '-'} km²</div>
          <div>Risk: ${getRiskLabel(risk)} (${Math.round(risk * 100)}%)</div>
        </div>
      `;

      circle.bindTooltip(tooltipHtml, { direction: 'top', offset: [0, -8], opacity: 1 });
      circle.on('click', () => setSelectedId(a.id));
      circle.addTo(group);
    });
  }, [areas, selectedId, year]);

  return (
    <div className="p-5 border border-white/40 rounded-lg glass-surface-strong">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-bold text-primary">Behavioral Pattern Recognition - Flood Map</div>
          <div className="text-sm text-secondary mt-1">Hyper-local flood memory from 2017-2025 patterns (LSTM, Random Forest, Prophet ensemble)</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-secondary">Year</div>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="border rounded px-2 py-1 text-sm bg-secondary border-custom text-primary">
            {Array.from({ length: 9 }).map((_, i) => {
              const y = 2017 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-[420px] rounded-lg overflow-hidden border">
          <div ref={mapElRef} style={{ height: '100%', width: '100%' }} />
        </div>

        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg bg-secondary shadow-professional">
            <div className="text-sm font-semibold text-primary">Rainfall (mm)</div>
            <div className="flex items-center gap-3 mt-2">
              <input className="w-full border rounded px-2 py-1 bg-primary border-custom text-primary" type="range" min={0} max={120} value={rainfallMm} onChange={e => setRainfallMm(Number(e.target.value))} />
              <div className="w-14 text-right font-semibold text-primary">{rainfallMm}</div>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-secondary shadow-professional">
            <div className="text-sm font-semibold text-primary">Duration (hours)</div>
            <div className="flex items-center gap-3 mt-2">
              <input className="w-full border rounded px-2 py-1 bg-primary border-custom text-primary" type="range" min={0} max={10} step={0.5} value={durationHrs} onChange={e => setDurationHrs(Number(e.target.value))} />
              <div className="w-14 text-right font-semibold text-primary">{durationHrs}</div>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-secondary shadow-professional">
            <div className="text-sm font-semibold text-primary">Avg Rain ({year})</div>
            <div className="mt-2 text-2xl font-extrabold text-primary">{summary.avgRainMm}mm</div>
            <div className="text-xs text-secondary mt-1">Average across all mapped zones</div>
          </div>

          <div className="p-4 border rounded-lg bg-secondary shadow-professional">
            <div className="text-sm font-semibold text-primary">Total Covered ({year})</div>
            <div className="mt-2 text-2xl font-extrabold text-primary">{summary.totalCoveredKm2} km²</div>
            <div className="text-xs text-secondary mt-1">Sum of impacted surface area</div>
          </div>
        </div>

        {!selected ? (
          <div className="mt-4 p-4 border rounded-lg bg-secondary shadow-professional text-sm text-secondary">
            Click a zone on the map to view its flood memory.
          </div>
        ) : (
          <div className="mt-4 p-4 border rounded-lg bg-secondary shadow-professional">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-primary">{selected.name}</div>
                <div className="text-xs text-secondary">Historical: {selected.history.events} events ({selected.history.years}) • Last: {selected.history.last}</div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-sm text-secondary hover:text-primary">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Gauge component for displaying sensor values
function SensorGauge({ value, min, max, label, unit, color = '#3b82f6' }) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  
  // Generate tick marks
  const ticks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    const tickValue = min + (max - min) * (i / tickCount);
    const tickRotation = (i / tickCount) * 180 - 90;
    const isMajorTick = i % 2 === 0;
    
    ticks.push(
      <div 
        key={i}
        className={`absolute bottom-0 left-1/2 origin-bottom ${isMajorTick ? 'w-0.5 h-4' : 'w-px h-2'} bg-slate-300`}
        style={{
          transform: `translateX(-50%) rotate(${tickRotation}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        {isMajorTick && (
          <span 
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-500"
            style={{ transform: 'translateX(-50%) rotate(0deg)' }}
          >
            {tickValue}
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full h-32 mb-2 overflow-hidden">
        {/* Gauge background */}
        <div className="absolute w-full h-1/2 bottom-0 rounded-t-full bg-slate-100"></div>
        
        {/* Ticks */}
        {ticks}
        
        {/* Gauge fill */}
        <div 
          className="absolute w-full h-1/2 bottom-0 origin-bottom"
          style={{
            background: `conic-gradient(from -90deg, ${color} 0%, ${color} ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.5s ease-out',
            borderRadius: '9999px 9999px 0 0',
          }}
        ></div>
        
        {/* Gauge center line */}
        <div className="absolute w-1 h-8 bg-slate-700 bottom-0 left-1/2 transform -translate-x-1/2"></div>
        
        {/* Value display */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <div className="text-3xl font-bold">{value.toFixed(1)}</div>
          <div className="text-sm text-slate-500">{unit}</div>
        </div>
      </div>
      <div className="text-sm font-medium text-slate-700 mt-2">{label}</div>
    </div>
  );
}

function IotSensorsView() {
  const [sensors] = useState([
    {
      id: 1,
      name: 'Station Pump #3',
      type: 'pump',
      status: 'critical',
      waterLevel: 14,
      temperature: 15,
      vibration: 7,
      blockage: 76,
      flowRate: 64,
      updatedAt: Date.now(),
      aiPrediction: 'Maintenance needed in 6 hours'
    },
    {
      id: 2,
      name: 'Drain Sensor A2',
      type: 'drain',
      status: 'warning',
      waterLevel: 8,
      temperature: 12,
      vibration: 3,
      blockage: 45,
      flowRate: 82,
      updatedAt: Date.now() - 30000,
      aiPrediction: 'Operating normally'
    },
    {
      id: 3,
      name: 'Station Pump #1',
      type: 'pump',
      status: 'normal',
      waterLevel: 5,
      temperature: 18,
      vibration: 2,
      blockage: 12,
      flowRate: 95,
      updatedAt: Date.now() - 60000,
      aiPrediction: 'Operating normally'
    }
  ]);

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">IoT Sensors</h1>
          <p className="text-gray-500">Monitor and manage your flood detection sensors</p>
        </div>

        {/* Sensor Cards */}
        <div className="space-y-6">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    sensor.type === 'pump' ? 'bg-teal-50' : 'bg-teal-50'
                  }`}>
                    {sensor.type === 'pump' ? (
                      <Activity className="w-5 h-5 text-teal-700" />
                    ) : (
                      <Waves className="w-5 h-5 text-teal-700" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{sensor.name}</h3>
                    <p className="text-sm text-gray-500">Type: {sensor.type} · Updated {formatTimeAgo(sensor.updatedAt)}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  sensor.status === 'critical' 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : sensor.status === 'warning'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-teal-50 text-teal-800 border border-teal-200'
                }`}>
                  {sensor.status.toUpperCase()}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="p-4 grid grid-cols-5 gap-4">
                <Metric 
                  label="Water Level" 
                  value={`${sensor.waterLevel}%`} 
                  progress={sensor.waterLevel}
                  color={sensor.waterLevel > 70 ? 'red' : sensor.waterLevel > 40 ? 'yellow' : 'green'}
                />
                <Metric 
                  label="Temperature" 
                  value={`${sensor.temperature}°C`} 
                  progress={sensor.temperature * 2}
                  color={sensor.temperature > 30 ? 'red' : sensor.temperature > 20 ? 'yellow' : 'green'}
                />
                <Metric 
                  label="Vibration" 
                  value={`${sensor.vibration}%`} 
                  progress={sensor.vibration}
                  color={sensor.vibration > 70 ? 'red' : sensor.vibration > 40 ? 'yellow' : 'green'}
                />
                <Metric 
                  label="Blockage" 
                  value={`${sensor.blockage}%`} 
                  progress={sensor.blockage}
                  color={sensor.blockage > 70 ? 'red' : sensor.blockage > 40 ? 'yellow' : 'green'}
                />
                <Metric 
                  label="Flow Rate" 
                  value={`${sensor.flowRate} L/s`} 
                  progress={sensor.flowRate}
                  color={sensor.flowRate < 30 ? 'red' : sensor.flowRate < 60 ? 'yellow' : 'green'}
                />
              </div>

              {/* AI Prediction */}
              <div className="bg-gray-50 p-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-teal-700" />
                  <span className="text-sm font-medium text-teal-700">AI Prediction:</span>
                  <span className={`text-sm ${
                    sensor.status === 'critical' 
                      ? 'text-red-800' 
                    : sensor.status === 'warning' 
                      ? 'text-amber-800' 
                      : 'text-gray-600'
                  }`}>
                    {sensor.aiPrediction}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SensorCard({ s, onClick }) {
  const color = s.status === 'critical' ? 'text-red-800' : s.status === 'warning' ? 'text-amber-800' : 'text-teal-800';
  const icon = s.type === 'drain' ? <Waves className="text-floodwater" /> : s.type === 'pump' ? <Gauge className="text-floodwater" /> : <Waves className="text-floodwater" />;
  return (
    <button onClick={onClick} className="w-full text-left p-4 border border-white/40 rounded-lg glass-surface shadow-soft hover:shadow-glow transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            {icon}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-800">{s.name}</div>
            <div className="text-xs text-slate-500">Type: {s.type} • Updated {Math.round((Date.now() - (s.updatedAt||Date.now()))/1000)} sec ago</div>
            <div className="text-xs text-slate-600 mt-1">Flow: {s.flowRate || 45} L/s • Level: {s.waterLevel || 2.3}m</div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs border ${color} ${s.status==='critical'?'bg-red-50 text-red-800':s.status==='warning'?'bg-amber-50 text-amber-800':'bg-teal-50 text-teal-900'}`}>
          {s.status?.toUpperCase()}
        </div>
      </div>
    </button>
  );
}

function SensorModal({ s, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="glass-surface-strong rounded-lg border border-white/40 shadow max-w-xl w-full p-6">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">{s.name}</div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">Close</button>
        </div>
        <div className="p-4 text-sm text-slate-700 space-y-2">
          <div>Type: {s.type} • Status: {s.status}</div>
          <div>Location: {s.location?.lat}, {s.location?.lng}</div>
          <div>Maintenance: None recorded</div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, progress, color = 'blue' }) {
  const colorMap = {
    red: 'bg-red-300',
    yellow: 'bg-amber-300',
    green: 'bg-teal-400',
    blue: 'bg-slate-300'
  };
  
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${colorMap[color]}`}></div>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorMap[color]}`} 
          style={{ width: `${Math.min(100, progress)}%` }}
        ></div>
      </div>
    </div>
  );
}

function SocialAIView() {
  const [platform, setPlatform] = useState('Facebook');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('not_connected');
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadedPosts, setLoadedPosts] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsOffset, setPostsOffset] = useState(0);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    loadTotalPostsCount();
  }, []);

  const handleImageUpload = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedImage(null);
      setImagePreview('');
      return;
    }
    const file = e.target.files[0];
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  async function loadTotalPostsCount() {
    try {
      const count = await getTotalPostsCount();
      setTotalPosts(count.total);
    } catch (error) {
      console.error('Error loading posts count:', error);
      setTotalPosts(10); // fallback
    }
  }

  async function scanSocialMedia() {
    setIsScanning(true);
    setConnectionStatus('scanning'); // Add scanning state
    
    // Simulate API connection
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setConnectionStatus('connected');
    setIsScanning(false);
  }

  async function loadPosts() {
    setIsLoadingPosts(true);
    try {
      console.log('Loading posts from database...');
      const newPosts = await scanSocialPosts(3, postsOffset);
      console.log('Posts loaded from API:', newPosts);
      
      // Process posts - use database values directly
      const postsWithAnalysis = newPosts.map(post => ({
        ...post,
        text: post.content,
        user: post.username,
        time: 'just loaded'
      }));
      
      console.log('Processed posts:', postsWithAnalysis);
      
      setLoadedPosts([...loadedPosts, ...postsWithAnalysis]);
      setFeed([...loadedPosts, ...postsWithAnalysis, ...feed]);
      setPostsOffset(postsOffset + 3);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  }

  function fill(text) { setMessage(text); }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Form submission started');
      console.log('Platform:', platform);
      console.log('Username:', username);
      console.log('Message:', message);
      console.log('Location:', location);
      console.log('Selected Image:', selectedImage);
      
      // Upload to database with image
      //const result = await manualUpload(platform, username, message, location, selectedImage);
     // console.log('Upload result:', result);
      
      // Create post with backend-determined values
      const newPost = {
        platform,
        user: username || 'Anonymous',
        text: message,
        sentiment: result.sentiment,
        risk: result.risk,
        location: result.location || location,
        time: 'just now',
        imageUrl: result.imageUrl
      };
      
      setLoadedPosts([newPost, ...loadedPosts]);
      setFeed([newPost, ...feed]);
      
      // Clear form
      setMessage('');
      setLocation('');
      setSelectedImage(null);
      setImagePreview('');
      
      console.log('Post added to feed:', newPost);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload post. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Social Media Monitor - Always on top for small screens */}
      <div className="lg:col-span-3 order-1 lg:order-none">
        <div className="p-5 rounded-lg border bg-secondary">
          <div className="font-bold">Social Media Monitor</div>
          <div className="mt-3 text-sm">
            {connectionStatus === 'not_connected' ? (
              <div>
                <div className="text-red-700">Not connected to Facebook and Twitter APIs</div>
                <div className="text-gray-600 mt-1">Click "Scan Social Media" to connect</div>
              </div>
            ) : connectionStatus === 'scanning' ? (
              <div>
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Scanning social media APIs...</span>
                </div>
                <div className="text-gray-600 mt-1">Connecting to Facebook and Twitter</div>
              </div>
            ) : (
              <div>
                <div className="text-green-700">✓ Connected to Facebook and Twitter APIs</div>
                <div className="text-blue-600 mt-1">Found 10 social media posts in the last 2 hours</div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Always on top for small screens */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={scanSocialMedia}
            disabled={isScanning}
            className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold disabled:opacity-50 transition"
          >
            {isScanning ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Scanning...</span>
              </div>
            ) : 'Scan Social Media'}
          </button>
          <button
            onClick={loadPosts}
            disabled={isLoadingPosts || connectionStatus !== 'connected' || loadedPosts.length >= totalPosts}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold disabled:opacity-50 transition"
          >
            {isLoadingPosts ? 'Loading...' : 
              loadedPosts.length >= totalPosts ? 'All posts loaded' : 
              'Load Posts'
            }
          </button>
        </div>
      </div>


      {/* Live Social Media Feed - Right column on large screens */}
      <div className="lg:col-span-2 order-2 lg:order-none">
        {/* Live Social Media Feed */}
        <div className="p-5 border border-white/40 rounded-lg glass-surface">
          <div className="flex items-center justify-between">
            <div className="font-bold">Live Social Media Feed</div>
            <div className="text-sm text-teal-700 badge-dot">Monitoring Active</div>
          </div>
          <div className="mt-4 space-y-3 max-h-[540px] overflow-auto pr-2">
            {feed.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {connectionStatus === 'not_connected' 
                  ? 'Connect to social media to see posts' 
                  : 'Press "Load Posts" to see social media posts'
                }
              </div>
            ) : (
              feed.map((p, i) => <PostCard key={i} p={p} />)
            )}
          </div>
        </div>

        <div className="mt-4 p-4 border border-white/40 rounded-lg glass-surface">
          <div className="font-semibold">NLP Model Insights</div>
          <div className="grid sm:grid-cols-4 gap-3 text-sm text-slate-700 mt-2">
            <div>Most Mentioned Location: <b>Main Mall (47 mentions)</b></div>
            <div>Trending Keywords: <b>flooding, blocked, water</b></div>
            <div>Sentiment Trend: <b>Increasing panic (↑32%)</b></div>
            <div>Model Accuracy: <b>91.3% on test data</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ p }) {
  const color = p.sentiment === 'critical' ? 'border-red-200' : p.sentiment === 'warning' ? 'border-amber-200' : 'border-slate-200';
  const imageUrl = p.imageUrl || p.image_url;
  
  return (
    <div className={`p-3 border rounded-lg ${color} glass-surface`}>
      <div className="flex items-center gap-2 text-sm">
        <div className="font-semibold">{p.platform}</div>
        <div className="text-slate-500">{p.user || p.username}</div>
        <div className="ml-auto text-slate-400">{p.time}</div>
      </div>
      <div className="mt-1 text-slate-800">{p.text || p.content}</div>
      {imageUrl && (
        <div className="mt-2">
          <img 
            src={imageUrl}
            alt={`Post from ${p.platform}`}
            className="w-full h-48 object-cover rounded-lg"
            onLoad={() => console.log('Image loaded successfully:', imageUrl)}
            onError={(e) => {
              console.log('Image failed to load:', imageUrl);
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="mt-2 text-xs flex items-center gap-4">
        <span className={`px-2 py-1 rounded-full border ${color}`}>{p.sentiment.toUpperCase()}</span>
        <span>Location: {p.location}</span>
        <span>Risk: {p.risk}%</span>
      </div>
    </div>
  );
}

function VisionAIView({ sensors }) {
  const [items, setItems] = useState([
    {
      emoji: '',
      location: 'Main Mall Drain #3',
      status: 'blocked',
      confidence: 87,
      risk: 'high',
      match: 'Sensor ID: 1',
      time: '3 min ago',
      image: null
    },
    {
      emoji: '',
      location: 'Broadhurst Ave',
      status: 'clear',
      confidence: 94,
      risk: 'low',
      match: 'Sensor ID: 3',
      time: '15 min ago',
      image: null
    }
  ]);
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState('');

  // Create a preview whenever selectedImage changes
  useEffect(() => {
    if (!selectedImage) {
      setPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreview(objectUrl);

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedImage(null);
      return;
    }
    setSelectedImage(e.target.files[0]);
  };

  async function analyze() {
    if (!selectedImage || !location.trim()) {
      alert('Please select an image and enter a location');
      return;
    }

    try {
      // Use real AI service for flood detection
      const result = await detectFlood(selectedImage);
      
      let emoji, status, risk;
      
      // Parse AI service response
      if (result.flood_detected) {
        emoji = '🌊';
        status = 'blocked';
        risk = 'high';
      } else if (result.blockage_level > 0.7) {
        emoji = '⚠️';
        status = 'partially blocked';
        risk = 'medium';
      } else {
        emoji = '✅';
        status = 'clear';
        risk = 'low';
      }

      const confidence = result.confidence || Math.floor(70 + Math.random() * 25);
      const match = sensors.length > 0 ? `Sensor ID: ${sensors[0].id}` : 'No sensor nearby';

      const newItem = {
        emoji,
        location: location.trim(),
        status,
        confidence,
        risk,
        match,
        time: 'just now',
        image: preview
      };

      setItems([newItem, ...items]);
      setOpen(false);
      setLocation('');
      setSelectedImage(null);
    } catch (error) {
      console.error('AI analysis failed:', error);
      alert('Failed to analyze image with AI service. Please try again.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold">Computer Vision Analysis</div>
          <div className="text-sm text-slate-600">AI-powered drain blockage detection from citizen photos</div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-glow hover:scale-[1.01] transition"
        >
          Upload Photo
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {items.map((item, i) => (
          <div
            key={i}
            className={`p-4 border rounded-lg glass-surface shadow-soft hover:shadow-glow transition ${
              item.risk === 'high' ? 'border-red-200' :
                item.risk === 'medium' ? 'border-amber-200' : 'border-teal-200'
            }`}
          >
            {item.image && (
              <img
                src={item.image}
                alt={`Drain at ${item.location}`}
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
            <div className="text-5xl">{item.emoji}</div>
            <div className="mt-2 font-semibold">{item.location}</div>
            <div className="text-xs mt-1">Status: {item.status}</div>
            <div className="text-xs">AI Confidence: {item.confidence}%</div>
            <div className="text-xs">Risk: {item.risk}</div>
            <div className="text-xs">Matches: {item.match}</div>
            <div className="text-xs text-slate-500 mt-1">{item.time}</div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="glass-surface-strong border border-white/40 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="font-semibold text-lg mb-4">Upload Drain Photo for AI Analysis</div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Main Mall Drain #3"
                  className="mt-1 w-full border-2 border-gray-300 rounded px-3 py-2 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Photo
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover"
                      />
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer glass-surface rounded-md font-medium text-teal-700 hover:text-teal-800 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={onSelectFile}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setOpen(false);
                  setSelectedImage(null);
                  setLocation('');
                  setPreview('');
                }}
                className="px-4 py-2 border border-white/40 rounded-md shadow-sm text-sm font-medium text-gray-700 glass-surface hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={analyze}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Analyze with AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function PredictionsView({ predictions }) {
  return (
    <div className="space-y-3">
      {predictions.map((p,i)=> <div key={i} className="p-4 border border-white/40 rounded-lg glass-surface shadow-soft hover:shadow-glow transition">
        <div className="text-lg font-bold">{p.area}</div>
        <div className="text-sm text-slate-600">Pattern: {p.pattern}</div>
        <div className="grid sm:grid-cols-3 gap-4 mt-2 text-sm">
          <div>Time to Flood: <b>{p.timeToFlood}</b></div>
          <div>Historical Events: <b>{p.history}</b></div>
          <div>Confidence: <b>{p.confidence}</b></div>
        </div>
        <div className="mt-2 text-sm">Recommendation: <b className={p.probability>=80?'text-red-800':p.probability>=60?'text-amber-800':'text-teal-800'}>{p.recommendation}</b></div>
        <div className="h-2 bg-slate-100 rounded mt-2 overflow-hidden">
          <div className={`h-full progress-striped ${p.probability>=80?'bg-red-700':p.probability>=60?'bg-amber-700':'bg-teal-700'}`} style={{ width: `${p.probability}%` }} />
        </div>
      </div>)}
    </div>
  );
}

function AlertsView() {
  const [phone, setPhone] = useState('26775017902,26773602510,26773603746');
  const [bulkPhones, setBulkPhones] = useState('26775017902\n26773602510\n26773603746');
  const [area, setArea] = useState('Main Mall District (94% - 1.5h)');
  const [sending, setSending] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [log, setLog] = useState([]);
  const [useBulk, setUseBulk] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [bulkError, setBulkError] = useState('');
 
  // Real-time updates using setInterval
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.get('/alerts');
        const alerts = response.data || [];
        // Sort by creation time (newest first)
        const sortedAlerts = alerts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setLog(sortedAlerts);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };
 
    // Initial fetch
    fetchAlerts();
   
    // Real-time updates every 2 seconds
    const interval = setInterval(fetchAlerts, 2000);
   
    return () => clearInterval(interval);
  }, []);
 
  // Format timestamp for real-time display
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp || now);
    const diffMs = now - alertTime;
    const diffSecs = Math.floor(diffMs / 1000);
   
    if (diffSecs < 60) {
      return `${diffSecs}s ago`;
    } else if (diffSecs < 3600) {
      return `${Math.floor(diffSecs / 60)}m ago`;
    } else {
      return alertTime.toLocaleTimeString();
    }
  };
 
  // Test function to verify SMS logging
  const testSMSLogging = async () => {
    try {
      console.log('Testing SMS logging...');
      const response = await api.post('/api/test-sms');
      console.log('Test SMS response:', response.data);
      alert('Test SMS logged successfully! Check SMS Delivery tab.');
    } catch (error) {
      console.error('Test SMS failed:', error);
      alert('Test SMS failed: ' + (error.response?.data?.error || error.message));
    }
  };

  // Clean, simple send function using direct API approach (like test)
  const send = async () => {
    if (!phone.trim() || !area.trim()) {
      setPhoneError('Please enter phone number and area');
      return;
    }
    
    const phoneNumbers = phone.split(',').map(p => p.trim()).filter(p => p);
    
    if (phoneNumbers.length === 0) {
      setPhoneError('Add at least one phone number');
      return;
    }
    
    setSending(true);
    setPhoneError('');
    
    try {
      console.log('=== SENDING SMS ===');
      console.log('Phone numbers:', phoneNumbers);
      console.log('Area:', area);
      
      // Send to each phone number using the working test approach
      let successCount = 0;
      for (const phoneNumber of phoneNumbers) {
        const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        
        try {
          console.log('Sending SMS to:', cleanPhone);
          const response = await api.post('/api/test-sms', {
            phone: cleanPhone,
            area: area.split(' (')[0], // Clean area name
            risk: 90,
            timeToFlood: '2 hours',
            action: 'EVACUATE IMMEDIATELY',
            status: 'delivered',
            deliveryTime: '2.1s',
            messageId: `SMS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            simulated: false
          });
          console.log('✅ SMS sent successfully:', response.data);
          successCount++;
        } catch (error) {
          console.error('❌ Failed to send SMS to', cleanPhone, error);
          console.error('Error details:', error.response?.data || error.message);
        }
      }
      
      console.log(`=== SMS SEND COMPLETE: ${successCount}/${phoneNumbers.length} successful ===`);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 bg-green-500 text-white max-w-md';
      successDiv.innerHTML = `
        <div class="font-semibold">✅ SMS Successfully Delivered!</div>
        <div class="text-sm mt-1">SMS Alert successfully sent to ${successCount} of ${phoneNumbers.length} numbers</div>
        <div class="text-xs mt-2">Check SMS Delivery tab for details</div>
        <button class="mt-3 px-3 py-1 bg-white text-green-500 rounded text-sm" onclick="this.parentElement.remove()">OK</button>
      `;
      document.body.appendChild(successDiv);
      
      // Remove popup after 5 seconds
      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.parentNode.removeChild(successDiv);
        }
      }, 5000);
      
      // Clear phone input
      setPhone('');
      
      // Trigger a refresh of the SMS Delivery tab data
      setTimeout(() => {
        console.log('Triggering data refresh...');
        // This will trigger the useEffect in SMSDeliveryView to refetch data
        window.dispatchEvent(new CustomEvent('sms-sent', { detail: { count: successCount } }));
      }, 1000);
      
    } catch (error) {
      console.error('❌ Send SMS error:', error);
      alert('Failed to send SMS: ' + (error.response?.data?.error || error.message));
    } finally {
      setSending(false);
    }
  };

  // Clean, simple sendBulk function using direct API approach (like test)
  const sendBulk = async () => {
    const phoneNumbers = bulkPhones.split('\n').map(p => p.trim()).filter(p => p);
   
    if (phoneNumbers.length === 0) {
      setBulkError('Add at least one phone number');
      return;
    }
   
    setSendingBulk(true);
    setBulkError('');
    
    try {
      console.log('=== SENDING BULK SMS ===');
      console.log('Phone numbers:', phoneNumbers);
      console.log('Area:', area);
      
      // Send to each phone number using the working test approach
      let successCount = 0;
      for (const phoneNumber of phoneNumbers) {
        const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        
        try {
          console.log('Sending bulk SMS to:', cleanPhone);
          const response = await api.post('/api/test-sms', {
            phone: cleanPhone,
            area: area.split(' (')[0], // Clean area name
            risk: 90,
            timeToFlood: '2 hours',
            action: 'EVACUATE IMMEDIATELY',
            status: 'delivered',
            deliveryTime: '2.1s',
            messageId: `BULK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            simulated: false
          });
          console.log('✅ Bulk SMS sent successfully:', response.data);
          successCount++;
        } catch (error) {
          console.error('❌ Failed to send bulk SMS to', cleanPhone, error);
          console.error('Error details:', error.response?.data || error.message);
        }
      }
      
      console.log(`=== BULK SMS SEND COMPLETE: ${successCount}/${phoneNumbers.length} successful ===`);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 bg-green-500 text-white max-w-md';
      successDiv.innerHTML = `
        <div class="font-semibold">✅ Bulk SMS Successfully Delivered!</div>
        <div class="text-sm mt-1">Bulk SMS Alert successfully sent to ${successCount} of ${phoneNumbers.length} numbers</div>
        <div class="text-xs mt-2">Check SMS Delivery tab for details</div>
        <button class="mt-3 px-3 py-1 bg-white text-green-500 rounded text-sm" onclick="this.parentElement.remove()">OK</button>
      `;
      document.body.appendChild(successDiv);
      
      // Remove popup after 5 seconds
      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.parentNode.removeChild(successDiv);
        }
      }, 5000);
      
      // Trigger a refresh of the SMS Delivery tab data
      setTimeout(() => {
        console.log('🔄 Triggering bulk SMS data refresh...');
        // This will trigger the useEffect in SMSDeliveryView to refetch data
        window.dispatchEvent(new CustomEvent('sms-sent', { detail: { count: successCount } }));
      }, 1000);
      
    } catch (error) {
      console.error('❌ Send bulk SMS error:', error);
      alert('Failed to send bulk SMS: ' + (error.response?.data?.error || error.message));
    } finally {
      setSendingBulk(false);
    }
  };
 
  return (
    <div>
      <div className="p-5 border rounded-lg bg-gradient-to-b from-orange-50 to-red-50">
        <div className="flex items-center gap-2 text-orange-700">
          <Bell />
          <h2 className="text-lg font-bold">SMS Alert System</h2>
          <button
            onClick={testSMSLogging}
            className="ml-auto px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Test SMS
          </button>
        </div>
       
        {/* Toggle between single and bulk */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setUseBulk(false)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              !useBulk
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Single SMS
          </button>
          <button
            onClick={() => setUseBulk(true)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              useBulk
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bulk SMS
          </button>
        </div>
       
        {!useBulk ? (
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Phone Numbers (comma-separated)</label>
              <input value={phone} onChange={e=>{setPhone(e.target.value); setPhoneError('');}} placeholder="26775017902,26773602510,26773603746" className="mt-1 w-full border-2 border-orange-300 rounded px-3 py-2 text-lg" />
              <div className="text-xs text-slate-600 mt-1">Format: +267XXXXXXXX or +27XXXXXXXXX (comma-separated for multiple)</div>
              {phoneError && <div className="text-xs text-red-600 mt-1">{phoneError}</div>}
            </div>
            <div>
              <label className="text-sm font-medium">Critical Area to Alert About</label>
              <select value={area} onChange={e=>setArea(e.target.value)} className="mt-1 w-full border-2 border-orange-300 rounded px-3 py-2 text-lg">
                <option>Main Mall District (94% risk - 1.5 hours)</option>
                <option>CBD Business Area (88% risk - 2 hours)</option>
                <option>Broadhurst Residential (71% risk - 4 hours)</option>
                <option>Station Area (65% risk - 4 hours)</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Bulk Phone Numbers (one per line)</label>
              <textarea
                value={bulkPhones}
                onChange={e=>{setBulkPhones(e.target.value); setBulkError('');}}
                placeholder="26775017902&#10;26773602510&#10;26773603746"
                className="mt-1 w-full border-2 border-orange-300 rounded px-3 py-2 text-lg h-32 font-mono text-sm"
              />
              <div className="text-xs text-slate-600 mt-1">Enter multiple phone numbers, one per line</div>
              {bulkError && <div className="text-xs text-red-600 mt-1">{bulkError}</div>}
            </div>
            <div>
              <label className="text-sm font-medium">Critical Area to Alert About</label>
              <select value={area} onChange={e=>setArea(e.target.value)} className="mt-1 w-full border-2 border-orange-300 rounded px-3 py-2 text-lg">
                <option>Main Mall District (94% risk - 1.5 hours)</option>
                <option>CBD Business Area (88% risk - 2 hours)</option>
                <option>Broadhurst Residential (71% risk - 4 hours)</option>
                <option>Station Area (65% risk - 4 hours)</option>
              </select>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-sm font-medium text-blue-800">Bulk SMS Summary</div>
                <div className="text-xs text-blue-600 mt-1">Recipients: {bulkPhones.split('\n').filter(p => p.trim()).length}</div>
              </div>
            </div>
          </div>
        )}
       
        <button
          disabled={!useBulk ? sending : sendingBulk}
          onClick={!useBulk ? send : sendBulk}
          className="mt-4 w-full py-4 rounded bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg shadow hover:scale-[1.01] disabled:opacity-60"
        >
          {!useBulk ? (sending ? 'Sending Alerts...' : 'Send SMS to Multiple Numbers') : (sendingBulk ? 'Sending Bulk Alerts...' : 'Send Bulk SMS to Multiple Numbers')}
        </button>
      </div>
 
      {!!log.length && (
        <div className="mt-4 p-4 border rounded-lg bg-green-50">
          <div className="font-semibold flex items-center gap-2">✓ Alerts Sent This Session <span className="px-2 py-0.5 text-xs bg-white border rounded">{log.length}</span></div>
          <div className="mt-2 space-y-2 max-h-[320px] overflow-auto pr-2">
            {log.map((a,i)=> <div key={i} className={`p-3 border rounded-lg flex items-center gap-4 text-sm ${a.simulated ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <div className="text-slate-500 w-36">{formatTimestamp(a.createdAt)}</div>
              <div className="w-40">{(a.phoneNumber||a.phone||'').replace(/\d(?=(?:\D*\d){4})/g,'*')}</div>
              <div className="flex-1">{a.area}</div>
              <div className={`font-medium ${a.simulated ? 'text-yellow-700' : 'text-emerald-700'}`}>
                {a.simulated ? '✓ Simulated' : '✓ Sent via SMS'}
              </div>
              <div className="text-xs text-slate-400">
                {a.deliveryTime || '2.1s'}
              </div>
            </div>)}
          </div>
        </div>
      )}
 
      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        <SmallStat title="Alerts Sent" value={log.length} icon={<Bell className="text-sky-600" />} />
        <SmallStat title="Delivery Success" value={log.filter(x=> (x.status||'').toLowerCase()==='delivered').length} icon={<Gauge className="text-emerald-600" />} />
        <SmallStat title="Avg Delivery Time" value={
          log.filter(x=> (x.status||'').toLowerCase()==='delivered').length > 0
            ? (log.filter(x=> (x.status||'').toLowerCase()==='delivered').reduce((sum, a) => {
                const time = parseFloat(a.deliveryTime?.replace('s', '') || '0');
                return sum + time;
              }, 0) / log.filter(x=> (x.status||'').toLowerCase()==='delivered').length).toFixed(1) + 's'
            : 'N/A'
        } icon={<Activity className="text-purple-600" />} />
      </div>
    </div>
  );
}

function SMSDeliveryView() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
 
  // Real-time updates using setInterval
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        console.log('🔄 Fetching alerts from /api/alerts...');
        const response = await api.get('/alerts');
        const alertsData = response.data || [];
        console.log('📊 Received alerts data:', alertsData);
        console.log('📊 Alerts data length:', alertsData.length);
        // Sort by creation time (newest first)
        const sortedAlerts = alertsData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        console.log('📊 Setting alerts state with:', sortedAlerts);
        setAlerts(sortedAlerts);
        setLoading(false);
      } catch (error) {
        console.error('❌ Failed to fetch alerts:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        setLoading(false);
      }
    };
 
    // Initial fetch
    fetchAlerts();
   
    // Real-time updates every 2 seconds
    const interval = setInterval(fetchAlerts, 2000);
   
    // Listen for SMS sent events to trigger immediate refresh
    const handleSMSSent = (event) => {
      console.log('📬 SMS sent event received:', event.detail);
      console.log('🔄 Immediate refresh triggered...');
      fetchAlerts(); // Immediate refresh
    };
    
    window.addEventListener('sms-sent', handleSMSSent);
   
    return () => {
      clearInterval(interval);
      window.removeEventListener('sms-sent', handleSMSSent);
    };
  }, []);
 
  // Format timestamp for real-time display
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp || now);
    const diffMs = now - alertTime;
    const diffSecs = Math.floor(diffMs / 1000);
   
    if (diffSecs < 60) {
      return `${diffSecs}s ago`;
    } else if (diffSecs < 3600) {
      return `${Math.floor(diffSecs / 60)}m ago`;
    } else {
      return alertTime.toLocaleTimeString();
    }
  };
 
  const deliveredAlerts = alerts.filter(alert =>
    alert.status === 'delivered' || alert.status === 'sent'
  );

  const stats = {
    total: alerts.length,
    delivered: deliveredAlerts.length,
    live: alerts.filter(a => !a.simulated).length,
    simulated: alerts.filter(a => a.simulated).length,
    avgDeliveryTime: deliveredAlerts.length > 0
      ? (deliveredAlerts.reduce((sum, a) => {
          const time = parseFloat(a.deliveryTime?.replace('s', '') || '0');
          return sum + time;
        }, 0) / deliveredAlerts.length).toFixed(1) + 's'
      : 'N/A'
  };
 
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading SMS delivery data...</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-blue-900">SMS Delivery Status</h2>
        </div>
       
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-slate-600">Total Sent</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-xs text-slate-600">Delivered</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.live}</div>
            <div className="text-xs text-slate-600">Live SMS</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.simulated}</div>
            <div className="text-xs text-slate-600">Demo</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.avgDeliveryTime}</div>
            <div className="text-xs text-slate-600">Avg Time</div>
          </div>
        </div>
      </div>
 
      {/* Delivered Messages List */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="font-semibold text-green-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Successfully Delivered Messages ({deliveredAlerts.length})
          </h3>
        </div>
       
        {deliveredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Bell className="mx-auto mb-2 opacity-50" size={32} />
            <p>No delivered messages yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {deliveredAlerts.map((alert, index) => (
              <div key={index} className={`p-4 hover:bg-slate-50 transition-colors ${alert.simulated ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        alert.simulated
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {alert.simulated ? 'DEMO' : 'LIVE'}
                      </span>
                      <span className="font-medium text-slate-900">{alert.area}</span>
                      <span className="text-sm text-slate-500">Risk: {alert.risk}%</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {(alert.phoneNumber || alert.phone || '').replace(/\d(?=(?:\D*\d){4})/g, '*')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity size={14} />
                        {alert.deliveryTime || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bell size={14} />
                        {alert.action}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">
                      {formatTimestamp(alert.createdAt)}
                    </div>
                    <div className="text-sm font-medium text-green-600 mt-1">
                      ✓ Delivered
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
 
      {/* All Messages (including non-delivered) */}
      {alerts.length > deliveredAlerts.length && (
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-gray-50">
            <h3 className="font-semibold text-slate-800">All Messages ({alerts.length})</h3>
          </div>
          <div className="divide-y">
            {alerts
              .filter(alert => alert.status !== 'delivered' && alert.status !== 'sent')
              .map((alert, index) => (
              <div key={index} className="p-4 hover:bg-slate-50 transition-colors opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        alert.simulated
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.simulated ? 'DEMO' : 'LIVE'}
                      </span>
                      <span className="font-medium text-slate-900">{alert.area}</span>
                      <span className="text-sm text-slate-500">Risk: {alert.risk}%</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {(alert.phoneNumber || alert.phone || '').replace(/\d(?=(?:\D*\d){4})/g, '*')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity size={14} />
                        {alert.deliveryTime || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">
                      {formatTimestamp(alert.createdAt)}
                    </div>
                    <div className="text-sm font-medium text-slate-600 mt-1">
                      {alert.status || 'pending'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
 
function SmallStat({ title, value, icon }) {
  return (
    <div className="p-4 bg-white border rounded-lg">
      <div className="flex items-center gap-2 text-slate-500 text-sm">{icon}{title}</div>
      <div className="text-2xl font-bold mt-1">{typeof value === 'number' ? value : value}</div>
    </div>
  );
}
