import React, { useState, useEffect } from 'react';
import { Camera, Sun, MapPin, Star, ArrowLeft, Home, Search, PlusCircle, User, Check, Sparkles, Droplets, Cloud, CloudRain, CloudSun, Loader2, LogOut, Mail, Lock, X, DollarSign, Calendar, Clock, XCircle, CheckCircle, MessageCircle } from 'lucide-react';
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

// Maps a sunlight condition string to the matching icon + color,
// so hosts with "Cień" or "Półcień" don't show a sun icon.
function sunlightInfo(value) {
  if (value === 'Pełne słońce') return { Icon: Sun, tone: colors.gold };
  if (value === 'Półcień') return { Icon: CloudSun, tone: colors.gold };
  if (value === 'Cień') return { Icon: Cloud, tone: '#8A8574' };
  return { Icon: Sun, tone: colors.gold };
}

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
  const bg = tone === 'fern' ? colors.fern : tone === 'clay' ? colors.clay : tone === 'gray' ? '#A9A08B' : colors.gold;
  return (
    <span style={{
      background: bg, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px',
      borderRadius: 20, fontFamily: 'Inter, sans-serif', letterSpacing: 0.3,
      display: 'inline-flex', alignItems: 'center', gap: 5
    }}>{children}</span>
  );
}

function TextField({ icon: Icon, ...props }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, background: colors.card,
      border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: '12px 16px', marginBottom: 12
    }}>
      {Icon && <Icon size={18} color="#A9A08B" style={{ flexShrink: 0 }} />}
      <input
        {...props}
        style={{ border: 'none', outline: 'none', flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 14, background: 'transparent', color: colors.ink }}
      />
    </div>
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

      <TextField icon={Mail} type="email" placeholder="Adres email" value={email} onChange={e => setEmail(e.target.value)} />
      <TextField icon={Lock} type="password" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)} />

      {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}
      {info && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.fern, marginBottom: 12 }}>{info}</div>}

      <button onClick={handleSubmit} disabled={loading || !email || !password} style={{
        width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
        border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
        cursor: loading ? 'default' : 'pointer', opacity: (loading || !email || !password) ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, marginBottom: 16
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

      {filteredHosts.map((h) => {
        const si = sunlightInfo(h.sunlight);
        const SIcon = si.Icon;
        return (
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={12} fill={colors.gold} color={colors.gold} /> {h.rating ?? '—'} ({h.reviews ?? 0})</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={12} /> {h.location}</span>
                </div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.fern, fontWeight: 600 }}>
                  <SIcon size={13} color={si.tone} /> {h.sunlight} · przyjmuje {h.plants_capacity} roślin
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HostDetailScreen({ host, onBack, onBook }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadReviews() {
      if (!host) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('host_id', host.id)
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) setReviews(data);
        setLoading(false);
      }
    }
    loadReviews();
    return () => { cancelled = true; };
  }, [host]);

  if (!host) return null;

  const si = sunlightInfo(host.sunlight);
  const SIcon = si.Icon;

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
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink, display: 'flex', alignItems: 'center', gap: 4 }}><Star size={16} fill={colors.gold} color={colors.gold}/> {host.rating ?? '—'}</div>
            <div style={{ fontSize: 11, color: '#A9A08B' }}>{host.reviews ?? 0} opinii</div>
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
          <Pill tone="gold"><SIcon size={13} color="#fff" /> {host.sunlight}</Pill>
        </div>

        <button onClick={onBook} style={{
          width: '100%', padding: 16, borderRadius: 16, background: colors.clay, color: '#fff',
          border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 24
        }}>Zarezerwuj termin</button>

        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Opinie</div>

        {loading && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B' }}>Ładowanie...</div>
        )}

        {!loading && reviews.length === 0 && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B' }}>Ten host nie ma jeszcze żadnych opinii.</div>
        )}

        {!loading && reviews.map(r => (
          <div key={r.id} style={{ background: colors.clayLight, borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={13} fill={n <= r.rating ? colors.gold : 'none'} color={colors.gold} />
              ))}
            </div>
            {r.comment && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#5A5445', margin: 0, fontStyle: 'italic' }}>{r.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingForm({ host, userId, userEmail, onCancel, onBooked }) {
  const [plants, setPlants] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadPlants() {
      setPlantsLoading(true);
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) {
          setPlants(data);
          if (data.length > 0) setSelectedPlantId(data[0].id);
        }
        setPlantsLoading(false);
      }
    }
    loadPlants();
    return () => { cancelled = true; };
  }, [userId]);

  const selectedPlant = plants.find(p => p.id === selectedPlantId);
  const canSave = selectedPlantId && startDate && endDate;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('bookings').insert([{
      host_id: host.id,
      renter_user_id: userId,
      renter_email: userEmail,
      plant_id: selectedPlantId,
      plant_name: selectedPlant ? selectedPlant.name : '',
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
    }]);
    setSaving(false);
    if (error) {
      setError('Nie udało się wysłać prośby: ' + error.message);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={30} color="#fff" />
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, color: colors.ink }}>Prośba wysłana!</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7A7261', textAlign: 'center' }}>
          Czeka na akceptację przez {host.name}. Sprawdź status w zakładce Profil.
        </div>
        <button onClick={onBooked} style={{
          padding: '12px 24px', borderRadius: 14, background: colors.fern, color: '#fff',
          border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8
        }}>Wróć do listy</button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <div>
          <h2 style={{ fontSize: 18, color: colors.ink, fontWeight: 600, margin: 0 }}>Zarezerwuj u {host.name}</h2>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A9A08B' }}>{host.price} zł / roślinę / tydzień</div>
        </div>
      </div>

      {plantsLoading && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B' }}>Ładowanie Twoich roślin...</div>
      )}

      {!plantsLoading && plants.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginBottom: 16 }}>
          Nie masz jeszcze żadnych roślin. Dodaj pierwszą w zakładce "Dodaj", żeby móc zarezerwować hosta.
        </div>
      )}

      {!plantsLoading && plants.length > 0 && (
        <>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10 }}>Która roślina?</div>
          {plants.map(p => (
            <div key={p.id} onClick={() => setSelectedPlantId(p.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14,
              border: `1.5px solid ${selectedPlantId === p.id ? colors.fern : colors.line}`, marginBottom: 10,
              background: selectedPlantId === p.id ? '#EEF3EA' : colors.card, cursor: 'pointer'
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.clayLight }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, fontWeight: selectedPlantId === p.id ? 700 : 500 }}>{p.name}</span>
            </div>
          ))}

          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginTop: 16, marginBottom: 10 }}>Na jakie daty?</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#A9A08B', marginBottom: 4 }}>Od</div>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{
                width: '100%', border: `1.5px solid ${colors.line}`, borderRadius: 12, padding: 10,
                fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.ink, boxSizing: 'border-box'
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#A9A08B', marginBottom: 4 }}>Do</div>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{
                width: '100%', border: `1.5px solid ${colors.line}`, borderRadius: 12, padding: 10,
                fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.ink, boxSizing: 'border-box'
              }} />
            </div>
          </div>

          {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}

          <button onClick={handleSave} disabled={!canSave || saving} style={{
            width: '100%', padding: 16, borderRadius: 16, background: colors.clay, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
            cursor: (!canSave || saving) ? 'default' : 'pointer', opacity: (!canSave || saving) ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {saving ? 'Wysyłanie...' : 'Wyślij prośbę o rezerwację'}
          </button>
        </>
      )}
    </div>
  );
}

function ReviewForm({ booking, userId, onCancel, onSaved }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('reviews').insert([{
      host_id: booking.host_id,
      booking_id: booking.id,
      renter_user_id: userId,
      rating,
      comment,
    }]);
    if (error) {
      setSaving(false);
      setError('Nie udało się zapisać opinii: ' + error.message);
      return;
    }
    const { data: hostReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('host_id', booking.host_id);
    if (hostReviews && hostReviews.length > 0) {
      const avg = hostReviews.reduce((sum, r) => sum + r.rating, 0) / hostReviews.length;
      await supabase.from('hosts').update({
        rating: Math.round(avg * 10) / 10,
        reviews: hostReviews.length,
      }).eq('id', booking.host_id);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <h2 style={{ fontSize: 18, color: colors.ink, fontWeight: 600, margin: 0 }}>Oceń hosta</h2>
      </div>

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7A7261', marginBottom: 20 }}>
        Twoja roślina: {booking.plant_name}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Star size={32} fill={n <= rating ? colors.gold : 'none'} color={colors.gold} />
          </button>
        ))}
      </div>

      <textarea
        placeholder="Jak przebiegła współpraca? (opcjonalnie)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={4}
        style={{
          width: '100%', border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: 14,
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, marginBottom: 16,
          resize: 'none', boxSizing: 'border-box'
        }}
      />

      {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
        border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
        cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
      }}>
        {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
        {saving ? 'Zapisywanie...' : 'Wyślij opinię'}
      </button>
    </div>
  );
}

function AddPlantScreen({ userId, onPlantAdded }) {
  const [plantName] = useState('Monstera Deliciosa');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('plants')
      .insert([{ name: plantName, user_id: userId }]);
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
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A9A08B', marginBottom: 20 }}>Zrób zdjęcie, a rozpoznamy gatunek</div>

      {!photoTaken && !saved && (
        <>
          <div onClick={() => setPhotoTaken(true)} style={{
            aspectRatio: '1', background: colors.clayLight, borderRadius: 20, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            border: `2px dashed ${colors.clay}`, marginBottom: 20, cursor: 'pointer'
          }}>
            <Camera size={40} color={colors.clay} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: colors.clay, fontSize: 14 }}>Zrób zdjęcie rośliny</span>
          </div>
        </>
      )}

      {photoTaken && !saved && (
        <>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start', background: '#EEF3EA', borderRadius: 14,
            padding: 14, marginBottom: 20
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

function BecomeHostForm({ userId, onCancel, onSaved }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [sunlight, setSunlight] = useState('Pełne słońce');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canSave = name && price && location && capacity;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('hosts').insert([{
      user_id: userId,
      name,
      price: Number(price),
      location,
      sunlight,
      plants_capacity: Number(capacity),
      description,
      rating: null,
      reviews: 0,
    }]);
    setSaving(false);
    if (error) {
      setError('Nie udało się zapisać: ' + error.message);
    } else {
      onSaved();
    }
  };

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{
          width: 34, height: 34, borderRadius: 17, background: colors.clayLight, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}><ArrowLeft size={18} color={colors.ink} /></button>
        <h2 style={{ fontSize: 20, color: colors.ink, fontWeight: 600, margin: 0 }}>Zostań hostem</h2>
      </div>

      <TextField placeholder="Twoje imię" value={name} onChange={e => setName(e.target.value)} />
      <TextField icon={DollarSign} type="number" placeholder="Cena za roślinę / tydzień (zł)" value={price} onChange={e => setPrice(e.target.value)} />
      <TextField icon={MapPin} placeholder="Lokalizacja (np. Mokotów, Warszawa)" value={location} onChange={e => setLocation(e.target.value)} />
      <TextField type="number" placeholder="Ile roślin możesz przyjąć?" value={capacity} onChange={e => setCapacity(e.target.value)} />

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10, marginTop: 4 }}>Nasłonecznienie u Ciebie</div>
      {['Pełne słońce', 'Półcień', 'Cień'].map((l) => {
        const si = sunlightInfo(l);
        const SIcon = si.Icon;
        return (
          <div key={l} onClick={() => setSunlight(l)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14,
            border: `1.5px solid ${sunlight === l ? colors.gold : colors.line}`, marginBottom: 10,
            background: sunlight === l ? '#FFF8EC' : colors.card, cursor: 'pointer'
          }}>
            <SIcon size={18} color={sunlight === l ? si.tone : '#A9A08B'} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, fontWeight: sunlight === l ? 700 : 500 }}>{l}</span>
          </div>
        );
      })}

      <textarea
        placeholder="Krótki opis (opcjonalnie) — np. doświadczenie z roślinami, jak często wysyłasz zdjęcia..."
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={4}
        style={{
          width: '100%', border: `1.5px solid ${colors.line}`, borderRadius: 14, padding: 14,
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, marginTop: 4, marginBottom: 16,
          resize: 'none', boxSizing: 'border-box'
        }}
      />

      {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}

      <button onClick={handleSave} disabled={!canSave || saving} style={{
        width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
        border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
        cursor: (!canSave || saving) ? 'default' : 'pointer', opacity: (!canSave || saving) ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
      }}>
        {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
        {saving ? 'Zapisywanie...' : 'Zostań hostem'}
      </button>
    </div>
  );
}

function statusInfo(status) {
  if (status === 'accepted') return { label: 'Zaakceptowana', tone: 'fern' };
  if (status === 'rejected') return { label: 'Odrzucona', tone: 'clay' };
  return { label: 'Oczekuje', tone: 'gold' };
}

function ProfileScreen({ user, refreshKey, onSignOut }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myHost, setMyHost] = useState(null);
  const [hostLoading, setHostLoading] = useState(true);
  const [showHostForm, setShowHostForm] = useState(false);
  const [hostRefresh, setHostRefresh] = useState(0);

  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(true);
  const [incoming, setIncoming] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(true);
  const [bookingsRefresh, setBookingsRefresh] = useState(0);

  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewsRefresh, setReviewsRefresh] = useState(0);

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

  useEffect(() => {
    let cancelled = false;
    async function loadMyHost() {
      setHostLoading(true);
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled) {
        if (!error) setMyHost(data);
        setHostLoading(false);
      }
    }
    loadMyHost();
    return () => { cancelled = true; };
  }, [user.id, hostRefresh]);

  useEffect(() => {
    let cancelled = false;
    async function loadMyBookings() {
      setMyBookingsLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*, hosts(name, location)')
        .eq('renter_user_id', user.id)
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) setMyBookings(data);
        setMyBookingsLoading(false);
      }
    }
    loadMyBookings();
    return () => { cancelled = true; };
  }, [user.id, bookingsRefresh]);

  useEffect(() => {
    let cancelled = false;
    async function loadIncoming() {
      if (!myHost) { setIncoming([]); setIncomingLoading(false); return; }
      setIncomingLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('host_id', myHost.id)
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error && data) setIncoming(data);
        setIncomingLoading(false);
      }
    }
    loadIncoming();
    return () => { cancelled = true; };
  }, [myHost, bookingsRefresh]);

  useEffect(() => {
    let cancelled = false;
    async function loadMyReviews() {
      const { data, error } = await supabase
        .from('reviews')
        .select('booking_id')
        .eq('renter_user_id', user.id);
      if (!cancelled && !error && data) {
        setReviewedBookingIds(new Set(data.map(r => r.booking_id)));
      }
    }
    loadMyReviews();
    return () => { cancelled = true; };
  }, [user.id, reviewsRefresh]);

  const respondToBooking = async (bookingId, newStatus) => {
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    setBookingsRefresh(k => k + 1);
  };

  if (showHostForm) {
    return (
      <BecomeHostForm
        userId={user.id}
        onCancel={() => setShowHostForm(false)}
        onSaved={() => { setShowHostForm(false); setHostRefresh(k => k + 1); }}
      />
    );
  }

  if (reviewingBooking) {
    return (
      <ReviewForm
        booking={reviewingBooking}
        userId={user.id}
        onCancel={() => setReviewingBooking(null)}
        onSaved={() => { setReviewingBooking(null); setReviewsRefresh(k => k + 1); }}
      />
    );
  }

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

      {myHost && incoming.filter(b => b.status === 'pending').length > 0 && (
        <>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Prośby o rezerwację ({incoming.filter(b => b.status === 'pending').length})
          </div>
          {incoming.filter(b => b.status === 'pending').map(b => (
            <div key={b.id} style={{ background: colors.card, border: `1.5px solid ${colors.gold}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: colors.ink, marginBottom: 2 }}>{b.plant_name}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261', marginBottom: 2 }}>od {b.renter_email}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261', marginBottom: 10 }}>{b.start_date} → {b.end_date}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => respondToBooking(b.id, 'accepted')} style={{
                  flex: 1, padding: 10, borderRadius: 10, background: colors.fern, color: '#fff', border: 'none',
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                }}><CheckCircle size={14} /> Akceptuj</button>
                <button onClick={() => respondToBooking(b.id, 'rejected')} style={{
                  flex: 1, padding: 10, borderRadius: 10, background: colors.clayLight, color: colors.clay, border: 'none',
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                }}><XCircle size={14} /> Odrzuć</button>
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, marginTop: myHost && incoming.filter(b => b.status === 'pending').length > 0 ? 20 : 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Twoje rezerwacje</div>
      {myBookingsLoading && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginBottom: 20 }}>Ładowanie...</div>
      )}
      {!myBookingsLoading && myBookings.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginBottom: 20 }}>Nie masz jeszcze żadnych rezerwacji.</div>
      )}
      {!myBookingsLoading && myBookings.map(b => {
        const si = statusInfo(b.status);
        const alreadyReviewed = reviewedBookingIds.has(b.id);
        return (
          <div key={b.id} style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: colors.ink }}>{b.plant_name}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>u {b.hosts?.name} · {b.hosts?.location}</div>
              </div>
              <Pill tone={si.tone}>{si.label}</Pill>
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>{b.start_date} → {b.end_date}</div>

            {b.status === 'accepted' && !alreadyReviewed && (
              <button onClick={() => setReviewingBooking(b)} style={{
                marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: colors.gold, color: '#fff',
                border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}><MessageCircle size={14} /> Zostaw opinię</button>
            )}
            {b.status === 'accepted' && alreadyReviewed && (
              <div style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={13} /> Opinia wystawiona
              </div>
            )}
          </div>
        );
      })}

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, marginTop: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>Twoje rośliny</div>

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
          </div>
        </div>
      ))}

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, margin: '20px 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {myHost ? 'Twój profil hosta' : 'Chcesz zostać hostem?'}
      </div>

      {hostLoading && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B' }}>Ładowanie...</div>
      )}

      {!hostLoading && myHost && (
        <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: colors.ink }}>{myHost.name}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: colors.clay }}>{myHost.price} zł</span>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>{myHost.location} · {myHost.plants_capacity} miejsc</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, marginTop: 6 }}>Twój profil jest już widoczny na liście hostów ✓</div>
        </div>
      )}

      {!hostLoading && !myHost && (
        <div onClick={() => setShowHostForm(true)} style={{ background: colors.fern, borderRadius: 16, padding: 16, color: '#fff', cursor: 'pointer' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Zarabiaj na wolnym miejscu w domu</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, opacity: 0.9 }}>Ustal cenę i przyjmuj rośliny sąsiadów pod nieobecność</div>
        </div>
      )}
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
      if (view === 'detail') {
        return <HostDetailScreen host={selectedHost} onBack={() => setView('list')} onBook={() => setView('booking')} />;
      }
      if (view === 'booking') {
        return (
          <BookingForm
            host={selectedHost}
            userId={session.user.id}
            userEmail={session.user.email}
            onCancel={() => setView('detail')}
            onBooked={() => setView('list')}
          />
        );
      }
      return <HomeScreen onSelectHost={(h) => { setSelectedHost(h); setView('detail'); }} />;
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