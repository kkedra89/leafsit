import React, { useState, useEffect } from 'react';
import { Camera, Sun, MapPin, Star, ArrowLeft, Home, Search, PlusCircle, User, Check, Sparkles, Droplets, Cloud, CloudRain, CloudSun, Loader2, LogOut, Mail, Lock, X } from 'lucide-react';
import { supabase } from './supabaseClient';

const colors = {
  bg: '#F7F4EC',
  ink: '#232017',
  fern: '#3A5A40',
  fernDark: '#28402C',
  clay: '#C1652F',
  clayLight: '#E8DCC8',
  gold: '#D4A24C',
  line: '#DDD5C0',
  card: '#FFFFFF',
};

function Screen({ children }) {
  return (
    <div style={{
      width: 390, height: 780, background: colors.bg, borderRadius: 40,
      overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
      fontFamily: "'Fraunces', Georgia, serif", boxShadow: '0 20px 60px rgba(35,32,23,0.25)',
      border: `8px solid ${colors.ink}`
    }}>
      {children}
    </div>
  );
}

function StatusBar() {
  return (
    <div style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 12, fontFamily: 'Inter, sans-serif', color: colors.ink, fontWeight: 600 }}>
      <span>9:41</span>
      <span>●●●●</span>
    </div>
  );
}

function TabBar({ active, onNav }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Szukaj' },
    { id: 'add', icon: PlusCircle, label: 'Dodaj' },
    { id: 'scan', icon: Camera, label: 'Rozpoznaj' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 0 16px', borderTop: `1px solid ${colors.line}`, background: colors.card
    }}>
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onNav(t.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: isActive ? colors.fern : '#A9A08B', fontFamily: 'Inter, sans-serif'
          }}>
            <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Pill({ children, tone = 'fern' }) {
  const bg = tone === 'fern' ? colors.fern : tone === 'clay' ? colors.clay : colors.gold;
  return (
    <span style={{
      background: bg, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px',
      borderRadius: 20, fontFamily: 'Inter, sans-serif', letterSpacing: 0.3
    }}>{children}</span>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setInfo('Konto utworzone! Możesz się teraz zalogować.');
    }
    setLoading(false);
  };

  return (
    <div style={{ flex: 1, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18, background: colors.fern, margin: '0 auto 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Sparkles size={26} color="#fff" />
        </div>
        <h1 style={{ fontSize: 24, color: colors.ink, fontWeight: 600, margin: 0 }}>Leafsit</h1>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginTop: 4 }}>
          {mode === 'login' ? 'Zaloguj się do swojego konta' : 'Załóż nowe konto'}
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, background: colors.card,
        border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: '12px 16px', marginBottom: 12
      }}>
        <Mail size={18} color="#A9A08B" />
        <input
          type="email"
          placeholder="Adres email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ border: 'none', outline: 'none', flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 14, background: 'transparent' }}
        />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, background: colors.card,
        border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: '12px 16px', marginBottom: 16
      }}>
        <Lock size={18} color="#A9A08B" />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ border: 'none', outline: 'none', flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 14, background: 'transparent' }}
        />
      </div>

      {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}
      {info && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.fern, marginBottom: 12 }}>{info}</div>}

      <button onClick={handleSubmit} disabled={loading || !email || !password} style={{
        width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
        border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
        cursor: loading ? 'default' : 'pointer', opacity: (loading || !email || !password) ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16
      }}>
        {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
        {mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
      </button>

      <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7A7261' }}>
        {mode === 'login' ? 'Nie masz jeszcze konta?' : 'Masz już konto?'}{' '}
        <span
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null); }}
          style={{ color: colors.clay, fontWeight: 700, cursor: 'pointer' }}
        >
          {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
        </span>
      </div>
    </div>
  );
}

function HomeScreen({ onSelectHost }) {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadHosts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) setHosts(data);
        setLoading(false);
      }
    }
    loadHosts();
    return () => { cancelled = true; };
  }, []);

  const q = query.trim().toLowerCase();
  const filteredHosts = q
    ? hosts.filter(h =>
        (h.name || '').toLowerCase().includes(q) ||
        (h.location || '').toLowerCase().includes(q)
      )
    : hosts;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 0' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: colors.clay, fontWeight: 700, letterSpacing: 1.5, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>Warszawa · Mokotów</div>
        <h1 style={{ fontSize: 28, color: colors.ink, margin: '4px 0 2px', fontWeight: 600 }}>Komu zostawisz<br/>swoje rośliny?</h1>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, background: colors.card,
        border: `1.5px solid ${colors.line}`, borderRadius: 16, padding: '12px 16px', marginBottom: 20
      }}>
        <Search size={18} color="#A9A08B" />
        <input
          type="text"
          placeholder="Szukaj po imieniu lub lokalizacji..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 14, background: 'transparent', color: colors.ink }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={16} color="#A9A08B" />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto' }}>
        <Pill tone="fern">W pobliżu</Pill>
        <Pill tone="gold">Najwyżej oceniani</Pill>
        <Pill tone="clay">Dostępni teraz</Pill>
      </div>

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10 }}>
        {loading ? 'Ładowanie...' : `${filteredHosts.length} hostów${q ? ' pasujących do wyszukiwania' : ' w pobliżu'}`}
      </div>

      {!loading && filteredHosts.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B' }}>
          {q ? `Brak hostów pasujących do "${query}".` : 'Nie ma jeszcze żadnych hostów w Twojej okolicy.'}
        </div>
      )}

      {filteredHosts.map((h) => (
        <div key={h.id} onClick={() => onSelectHost(h)} style={{
          background: colors.card, borderRadius: 18, padding: 16, marginBottom: 12,
          border: `1px solid ${colors.line}`, cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${colors.fern}, ${colors.fernDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0
            }}>{h.name.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, color: colors.ink, fontSize: 16 }}>{h.name}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: colors.clay, fontSize: 14 }}>{h.price} zł<span style={{ fontSize: 11, color: '#A9A08B', fontWeight: 500 }}>/roślinę/tydz.</span></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={12} fill={colors.gold} color={colors.gold} /> {h.rating} ({h.reviews})</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={12} /> {h.location}</span>
              </div>
              <div style={{ marginTop: 6, fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.fern, fontWeight: 600 }}>
                {h.sunlight} · przyjmuje {h.plants_capacity} roślin
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HostDetailScreen({ host, onBack, onBook }) {
  if (!host) return null;
  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{
        height: 180, background: `linear-gradient(160deg, ${colors.fern}, ${colors.fernDark})`,
        position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 20
      }}>
        <button onClick={onBack} style={{
          position: 'absolute', top: 16, left: 16, width: 34, height: 34, borderRadius: 17,
          background: 'rgba(255,255,255,0.25)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}><ArrowLeft size={18} color="#fff" /></button>
        <div>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8, border: '3px solid rgba(255,255,255,0.4)' }}>{host.name.charAt(0)}</div>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 600 }}>{host.name}</h2>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>{host.location}</div>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink, display: 'flex', alignItems: 'center', gap: 4 }}><Star size={16} fill={colors.gold} color={colors.gold}/> {host.rating}</div>
            <div style={{ fontSize: 11, color: '#A9A08B' }}>{host.reviews} opinii</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink }}>{host.plants_capacity}</div>
            <div style={{ fontSize: 11, color: '#A9A08B' }}>miejsca wolne</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink }}>{host.price} zł</div>
            <div style={{ fontSize: 11, color: '#A9A08B' }}>za roślinę/tydz.</div>
          </div>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4A4638', lineHeight: 1.6, marginBottom: 20 }}>
          {host.description}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <Pill tone="gold">☀️ {host.sunlight}</Pill>
        </div>

        <button onClick={onBook} style={{
          width: '100%', padding: 16, borderRadius: 16, background: colors.clay, color: '#fff',
          border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer'
        }}>Zarezerwuj termin</button>
      </div>
    </div>
  );
}

function AddPlantScreen({ userId, onPlantAdded }) {
  const [step, setStep] = useState(1);
  const [plantName] = useState('Monstera Deliciosa');
  const [sunlight, setSunlight] = useState('Pełne słońce');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('plants')
      .insert([{ name: plantName, sunlight: sunlight, user_id: userId }]);
    setSaving(false);
    if (error) {
      setError('Nie udało się zapisać: ' + error.message);
    } else {
      setSaved(true);
      if (onPlantAdded) onPlantAdded();
    }
  };

  return (
    <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: 22, color: colors.ink, fontWeight: 600, marginBottom: 4 }}>Dodaj roślinę</h2>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A9A08B', marginBottom: 20 }}>Krok {step} z 2</div>

      {step === 1 && (
        <>
          <div style={{
            aspectRatio: '1', background: colors.clayLight, borderRadius: 20, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            border: `2px dashed ${colors.clay}`, marginBottom: 20, cursor: 'pointer'
          }}>
            <Camera size={40} color={colors.clay} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: colors.clay, fontSize: 14 }}>Zrób zdjęcie rośliny</span>
          </div>
          <button onClick={() => setStep(2)} style={{
            width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer'
          }}>Dalej</button>
        </>
      )}

      {step === 2 && !saved && (
        <>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10 }}>Poziom nasłonecznienia u Ciebie w domu</div>
          {['Pełne słońce', 'Półcień', 'Cień'].map((l) => (
            <div key={l} onClick={() => setSunlight(l)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14,
              border: `1.5px solid ${sunlight === l ? colors.gold : colors.line}`, marginBottom: 10,
              background: sunlight === l ? '#FFF8EC' : colors.card, cursor: 'pointer'
            }}>
              <Sun size={18} color={sunlight === l ? colors.gold : '#A9A08B'} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, fontWeight: sunlight === l ? 700 : 500 }}>{l}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start', background: '#EEF3EA', borderRadius: 14,
            padding: 14, marginTop: 10, marginBottom: 20
          }}>
            <Sparkles size={18} color={colors.fern} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.fernDark, lineHeight: 1.5 }}>
              <b>Rozpoznano: {plantName}.</b> Podlewaj co 7–10 dni, unikaj bezpośredniego słońca. Pełny przewodnik pielęgnacji dostępny w wersji Premium.
            </div>
          </div>
          {error && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>
          )}
          <button onClick={handleSave} disabled={saving} style={{
            width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
            cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {saving ? 'Zapisywanie...' : 'Dodaj do profilu'}
          </button>
        </>
      )}

      {saved && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14
        }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: colors.fern, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={32} color="#fff" />
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, color: colors.ink }}>Roślina dodana!</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7A7261', textAlign: 'center' }}>Sprawdź ją w zakładce Profil</div>
        </div>
      )}
    </div>
  );
}

function ScanScreen() {
  return (
    <div style={{ flex: 1, padding: 20 }}>
      <h2 style={{ fontSize: 22, color: colors.ink, fontWeight: 600, marginBottom: 4 }}>Rozpoznaj roślinę</h2>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginBottom: 20 }}>Zdjęcie + poziom światła → pełny przewodnik pielęgnacji</div>

      <div style={{
        aspectRatio: '4/5', background: `linear-gradient(160deg, ${colors.fern}22, ${colors.gold}22)`,
        borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 14, marginBottom: 20, border: `1px solid ${colors.line}`
      }}>
        <div style={{ width: 88, height: 88, borderRadius: 44, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
          <Camera size={36} color={colors.fern} />
        </div>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: colors.ink, fontSize: 15 }}>Zrób lub wgraj zdjęcie</span>
      </div>

      <div style={{
        border: `1.5px solid ${colors.gold}`, background: '#FFF8EC', borderRadius: 16, padding: 16,
        display: 'flex', gap: 12, alignItems: 'center'
      }}>
        <Sparkles size={22} color={colors.gold} style={{ flexShrink: 0 }} />
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.ink }}>Wersja Premium</div>
          <div style={{ fontSize: 12, color: '#7A7261', marginTop: 2 }}>Pełny plan podlewania, nawożenia i przesadzania — 9 zł jednorazowo</div>
        </div>
      </div>
    </div>
  );
}

function weatherFromCode(code) {
  if (code === 0) return { Icon: Sun, label: 'Bezchmurnie', tone: colors.gold };
  if ([1, 2].includes(code)) return { Icon: CloudSun, label: 'Częściowe zachmurzenie', tone: colors.gold };
  if (code === 3) return { Icon: Cloud, label: 'Pochmurno', tone: '#8A8574' };
  if ([45, 48].includes(code)) return { Icon: Cloud, label: 'Mgła', tone: '#8A8574' };
  if (code >= 51 && code <= 82) return { Icon: CloudRain, label: 'Opady', tone: '#5A7BA6' };
  return { Icon: Cloud, label: 'Zmiennie', tone: '#8A8574' };
}

function WeatherWidget() {
  const [state, setState] = useState({ loading: true, error: null, data: null, place: '' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const lat = 52.208, lon = 21.038;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,relative_humidity_2m,weather_code&forecast_days=2&timezone=Europe%2FWarsaw`;
        const res = await fetch(url);
        const json = await res.json();
        if (!cancelled) setState({ loading: false, error: null, data: json, place: 'Mokotów, Warszawa' });
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: 'Nie udało się pobrać pogody', data: null, place: '' });
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (state.loading) {
    return (
      <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 18, padding: 20, marginBottom: 20, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B' }}>
        Ładowanie pogody dla Twojej lokalizacji...
      </div>
    );
  }
  if (state.error || !state.data) {
    return (
      <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 18, padding: 20, marginBottom: 20, fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.clay }}>
        {state.error || 'Brak danych pogodowych'}
      </div>
    );
  }

  const { current, hourly } = state.data;
  const nowInfo = weatherFromCode(current.weather_code);
  const NowIcon = nowInfo.Icon;

  const nowIso = state.data.current.time;
  const startIdx = Math.max(0, hourly.time.findIndex(t => t === nowIso));
  const nextHours = hourly.time.slice(startIdx, startIdx + 6).map((t, i) => ({
    time: t,
    temp: hourly.temperature_2m[startIdx + i],
    humidity: hourly.relative_humidity_2m[startIdx + i],
    code: hourly.weather_code[startIdx + i],
  }));

  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 18, padding: 18, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <MapPin size={13} color="#A9A08B" />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#A9A08B', fontWeight: 600 }}>{state.place} · warunki dla Twoich roślin</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '10px 0 16px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: `${nowInfo.tone}1A`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <NowIcon size={28} color={nowInfo.tone} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: colors.ink, lineHeight: 1 }}>{Math.round(current.temperature_2m)}°C</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#7A7261', marginTop: 2 }}>{nowInfo.label}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5A7BA6', fontWeight: 700, fontSize: 14 }}>
            <Droplets size={14} /> {current.relative_humidity_2m}%
          </div>
          <div style={{ fontSize: 10.5, color: '#A9A08B' }}>wilgotność</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {nextHours.map((h, i) => {
          const info = weatherFromCode(h.code);
          const HIcon = info.Icon;
          const hour = new Date(h.time).getHours();
          return (
            <div key={i} style={{
              flex: '0 0 auto', width: 54, background: colors.bg, borderRadius: 12, padding: '10px 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif'
            }}>
              <span style={{ fontSize: 10.5, color: '#A9A08B', fontWeight: 600 }}>{i === 0 ? 'Teraz' : `${hour}:00`}</span>
              <HIcon size={16} color={info.tone} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: colors.ink }}>{Math.round(h.temp)}°</span>
              <span style={{ fontSize: 9.5, color: '#5A7BA6', display: 'flex', alignItems: 'center', gap: 2 }}><Droplets size={9}/>{h.humidity}%</span>
            </div>
          );
        })}
      </div>

      {current.relative_humidity_2m < 35 && (
        <div style={{ marginTop: 12, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.clay, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <Sparkles size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          Niska wilgotność powietrza — rozważ zraszanie liści.
        </div>
      )}
    </div>
  );
}

function ProfileScreen({ user, refreshKey, onSignOut }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadPlants() {
      setLoading(true);
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) setPlants(data);
        setLoading(false);
      }
    }
    loadPlants();
    return () => { cancelled = true; };
  }, [refreshKey, user.id]);

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: 30, background: colors.fern, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22 }}>
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.ink, wordBreak: 'break-all' }}>{user.email}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A9A08B' }}>Mokotów, Warszawa</div>
        </div>
        <button onClick={onSignOut} style={{
          background: colors.clayLight, border: 'none', borderRadius: 12, padding: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}>
          <LogOut size={16} color={colors.clay} />
        </button>
      </div>

      <WeatherWidget />

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Twoje rośliny</div>

      {loading && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B' }}>Ładowanie...</div>
      )}

      {!loading && plants.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B' }}>Nie masz jeszcze żadnych roślin — dodaj pierwszą w zakładce "Dodaj".</div>
      )}

      {!loading && plants.map(p => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.clayLight }} />
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: colors.ink }}>{p.name}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#A9A08B' }}>{p.sunlight}</div>
          </div>
        </div>
      ))}

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, margin: '20px 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Chcesz zostać hostem?</div>
      <div style={{ background: colors.fern, borderRadius: 16, padding: 16, color: '#fff' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Zarabiaj na wolnym miejscu w domu</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, opacity: 0.9 }}>Ustal cenę i przyjmuj rośliny sąsiadów pod nieobecność</div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('home');
  const [view, setView] = useState('list');
  const [selectedHost, setSelectedHost] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setTab('home');
    setView('list');
  };

  const renderTab = () => {
    if (tab === 'home') {
      return view === 'list'
        ? <HomeScreen onSelectHost={(h) => { setSelectedHost(h); setView('detail'); }} />
        : <HostDetailScreen host={selectedHost} onBack={() => setView('list')} onBook={() => setView('list')} />;
    }
    if (tab === 'add') return <AddPlantScreen userId={session.user.id} onPlantAdded={() => setRefreshKey(k => k + 1)} />;
    if (tab === 'scan') return <ScanScreen />;
    if (tab === 'profile') return <ProfileScreen user={session.user} refreshKey={refreshKey} onSignOut={handleSignOut} />;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#EDE7DA', padding: 40 }}>
      <Screen>
        <StatusBar />
        {authLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={28} color={colors.fern} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : !session ? (
          <AuthScreen />
        ) : (
          <>
            {renderTab()}
            <TabBar active={tab} onNav={(t) => { setTab(t); setView('list'); }} />
          </>
        )}
      </Screen>
    </div>
  );
}