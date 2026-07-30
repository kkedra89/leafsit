import React, { useState, useEffect, useRef } from 'react';
import { Camera, Sun, MapPin, Star, ArrowLeft, Home, Search, PlusCircle, User, Check, Sparkles, Droplets, Cloud, CloudRain, CloudSun, Loader2, LogOut, Mail, Lock, X, DollarSign, Calendar, Clock, XCircle, CheckCircle, MessageCircle, RefreshCw, Crown, Phone, Navigation, Pencil, Trash2, Wallet, CreditCard, Bell } from 'lucide-react';
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

function sunlightInfo(value) {
  if (value === 'Pełne słońce') return { Icon: Sun, tone: colors.gold };
  if (value === 'Półcień') return { Icon: CloudSun, tone: colors.gold };
  if (value === 'Cień') return { Icon: Cloud, tone: '#8A8574' };
  return { Icon: Sun, tone: colors.gold };
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

function isUpcoming(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) > today;
}

function displayNameOf(user) {
  return user?.user_metadata?.full_name || user?.email || '';
}

function avatarUrlOf(user) {
  return user?.user_metadata?.avatar_url || null;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function resizeImage(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Central place for creating an in-app notification. Email sending will be
// wired in here later (Etap C) without needing to change every call site.
async function createNotification(userId, type, title, body, bookingId = null, recipientEmail = null) {
  if (!userId) return;
  await supabase.from('notifications').insert([{
    user_id: userId,
    type,
    title,
    body,
    related_booking_id: bookingId,
  }]);
  if (recipientEmail) {
    const { data: profile } = await supabase.from('profiles').select('email_notifications').eq('id', userId).maybeSingle();
    const wantsEmail = profile ? profile.email_notifications !== false : true;
    if (wantsEmail) {
      try {
        await fetch('/api/send-notification-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: recipientEmail, title, body }),
        });
      } catch (e) { /* email jest opcjonalne, powiadomienie w apce już zapisane */ }
    }
  }
}

function Avatar({ photoUrl, name, size = 56, radius = 14 }) {
  if (photoUrl) {
    return (
      <img src={photoUrl} alt={name} style={{
        width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0
      }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, background: `linear-gradient(135deg, ${colors.fern}, ${colors.fernDark})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700,
      fontSize: Math.round(size * 0.32), flexShrink: 0
    }}>{name.charAt(0)}</div>
  );
}

function Screen({ children }) {
  return (
    <div className="app-screen" style={{
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
    <div className="app-statusbar" style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 12, fontFamily: 'Inter, sans-serif', color: colors.ink, fontWeight: 600 }}>
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

function Pill({ children, tone = 'fern', active, onClick }) {
  const bg = tone === 'fern' ? colors.fern : tone === 'clay' ? colors.clay : tone === 'gray' ? '#A9A08B' : colors.gold;
  return (
    <span
      onClick={onClick}
      style={{
        background: active === false ? colors.clayLight : bg,
        color: active === false ? '#7A7261' : '#fff',
        fontSize: 11, fontWeight: 700, padding: '4px 10px',
        borderRadius: 20, fontFamily: 'Inter, sans-serif', letterSpacing: 0.3,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap',
        border: active === false ? `1px solid ${colors.line}` : 'none'
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailConsent, setEmailConsent] = useState(true);
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
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setError(error.message);
      } else {
        if (signUpData?.user) {
          await supabase.from('profiles').upsert({ id: signUpData.user.id, email_notifications: emailConsent });
        }
        setInfo('Konto utworzone! Możesz się teraz zalogować.');
      }
    }
    setLoading(false);
  };

  const canSubmit = mode === 'login' ? (email && password) : (name && email && password);

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

      {mode === 'signup' && (
        <TextField icon={User} placeholder="Imię i nazwisko (lub nick)" value={name} onChange={e => setName(e.target.value)} />
      )}
      {mode === 'signup' && (
        <div onClick={() => setEmailConsent(c => !c)} style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer'
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
            border: `2px solid ${emailConsent ? colors.fern : colors.line}`,
            background: emailConsent ? colors.fern : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {emailConsent && <Check size={13} color="#fff" strokeWidth={3} />}
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#7A7261' }}>
            Chcę otrzymywać powiadomienia email (np. o nowych rezerwacjach)
          </span>
        </div>
      )}
      <TextField icon={Mail} type="email" placeholder="Adres email" value={email} onChange={e => setEmail(e.target.value)} />
      <TextField icon={Lock} type="password" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)} />

      {error && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>}
      {info && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.fern, marginBottom: 12 }}>{info}</div>}

      <button onClick={handleSubmit} disabled={loading || !canSubmit} style={{
        width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
        border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
        cursor: loading ? 'default' : 'pointer', opacity: (loading || !canSubmit) ? 0.6 : 1,
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
  const [myCoords, setMyCoords] = useState(null);
  const [locStatus, setLocStatus] = useState('idle');
  const [activeFilter, setActiveFilter] = useState(null);

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

  useEffect(() => {
    if (!navigator.geolocation) { setLocStatus('denied'); return; }
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMyCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLocStatus('granted'); },
      () => setLocStatus('denied'),
      { timeout: 8000 }
    );
  }, []);

  const toggleFilter = (name) => {
    if (name === 'near' && !myCoords) return;
    setActiveFilter(prev => prev === name ? null : name);
  };

  const q = query.trim().toLowerCase();
  let list = q
    ? hosts.filter(h =>
        (h.name || '').toLowerCase().includes(q) ||
        (h.location || '').toLowerCase().includes(q)
      )
    : hosts;

  list = list.map(h => {
    const hasCoords = myCoords && h.latitude != null && h.longitude != null;
    const dist = hasCoords ? distanceKm(myCoords.lat, myCoords.lon, h.latitude, h.longitude) : null;
    return { ...h, __dist: dist };
  });

  if (activeFilter === 'available') {
    list = list.filter(h => (h.plants_capacity ?? 0) > 0);
  }

  if (activeFilter === 'top') {
    list = [...list].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  } else if (activeFilter === 'near' || myCoords) {
    list = [...list].sort((a, b) => {
      if (a.__dist == null && b.__dist == null) return 0;
      if (a.__dist == null) return 1;
      if (b.__dist == null) return -1;
      return a.__dist - b.__dist;
    });
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 0' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: colors.clay, fontWeight: 700, letterSpacing: 1.5, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
          {locStatus === 'granted' ? <><Navigation size={11} /> Twoja okolica</> : 'Warszawa · Mokotów'}
        </div>
        <h1 style={{ fontSize: 28, color: colors.ink, margin: '4px 0 2px', fontWeight: 600 }}>Komu zostawisz<br/>swoje rośliny?</h1>
      </div>

      {locStatus === 'denied' && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#A9A08B', marginBottom: 14 }}>
          Brak dostępu do lokalizacji — hosty pokazane bez sortowania po odległości.
        </div>
      )}

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
        <Pill tone="fern" active={activeFilter === 'near'} onClick={() => toggleFilter('near')}>W pobliżu</Pill>
        <Pill tone="gold" active={activeFilter === 'top'} onClick={() => toggleFilter('top')}>Najwyżej oceniani</Pill>
        <Pill tone="clay" active={activeFilter === 'available'} onClick={() => toggleFilter('available')}>Dostępni teraz</Pill>
      </div>

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10 }}>
        {loading ? 'Ładowanie...' : `${list.length} hostów${q ? ' pasujących do wyszukiwania' : ' w pobliżu'}`}
      </div>

      {!loading && list.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B' }}>
          {q ? `Brak hostów pasujących do "${query}".` : 'Nie ma jeszcze żadnych hostów spełniających te kryteria.'}
        </div>
      )}

      {list.map((h) => {
        const si = sunlightInfo(h.sunlight);
        const SIcon = si.Icon;
        return (
          <div key={h.id} onClick={() => onSelectHost(h)} style={{
            background: colors.card, borderRadius: 18, padding: 16, marginBottom: 12,
            border: `1px solid ${colors.line}`, cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Avatar photoUrl={h.photo_url} name={h.name} size={56} radius={14} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, color: colors.ink, fontSize: 16 }}>{h.name}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: colors.clay, fontSize: 14 }}>{h.price} zł<span style={{ fontSize: 11, color: '#A9A08B', fontWeight: 500 }}>/roślinę/dzień</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={12} fill={colors.gold} color={colors.gold} /> {h.rating ?? '—'} ({h.reviews ?? 0})</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={12} /> {h.__dist != null ? `${h.__dist < 1 ? Math.round(h.__dist * 1000) + ' m' : h.__dist.toFixed(1) + ' km'}` : h.location}
                  </span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {host.photo_url ? (
            <img src={host.photo_url} alt={host.name} style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 16, background: colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', border: '3px solid rgba(255,255,255,0.4)' }}>{host.name.charAt(0)}</div>
          )}
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 600 }}>{host.name}</h2>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>{host.location}</div>
          </div>
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
            <div style={{ fontSize: 11, color: '#A9A08B' }}>za roślinę/dzień</div>
          </div>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4A4638', lineHeight: 1.6, marginBottom: 20 }}>
          {host.description}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <Pill tone="gold"><SIcon size={13} color="#fff" /> {host.sunlight}</Pill>
        </div>

        <div style={{
          background: colors.clayLight, borderRadius: 14, padding: 14, marginBottom: 24,
          fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#5A5445', lineHeight: 1.5
        }}>
          Dokładny adres i numer telefonu hosta zobaczysz dopiero po zaakceptowaniu Twojej rezerwacji — dla bezpieczeństwa obu stron.
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={13} fill={n <= r.rating ? colors.gold : 'none'} color={colors.gold} />
                ))}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: '#A9A08B' }}>{formatDate(r.created_at)}</span>
            </div>
            {r.comment && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#5A5445', margin: '0 0 6px', fontStyle: 'italic' }}>{r.comment}</p>
            )}
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#7A7261', fontWeight: 600 }}>— {r.renter_name || 'Anonimowy gość'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingForm({ host, userId, userEmail, userName, onCancel, onBooked }) {
  const [plants, setPlants] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
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
  const maxQuantity = selectedPlant?.quantity || 1;
  const canSave = selectedPlantId && startDate && endDate;
  const estimatedDays = (startDate && endDate) ? daysBetween(startDate, endDate) : null;
  const estimatedTotal = estimatedDays ? (estimatedDays * host.price * quantity) : null;

  useEffect(() => {
    setQuantity(1);
  }, [selectedPlantId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { data, error } = await supabase.from('bookings').insert([{
      host_id: host.id,
      renter_user_id: userId,
      renter_email: userEmail,
      renter_name: userName || null,
      renter_phone: renterPhone || null,
      plant_id: selectedPlantId,
      plant_name: selectedPlant ? selectedPlant.name : '',
      quantity: quantity,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      payment_status: 'unpaid',
    }]).select().single();
    setSaving(false);
    if (error) {
      setError('Nie udało się wysłać prośby: ' + error.message);
    } else {
      if (host.user_id) {
        const qtyLabel = quantity > 1 ? ` (×${quantity} szt.)` : '';
        await createNotification(
          host.user_id,
          'booking_request',
          'Nowa prośba o rezerwację',
          `${userName || userEmail} chce zostawić u Ciebie roślinę "${selectedPlant ? selectedPlant.name : ''}"${qtyLabel}`,
          data?.id || null,
          host.email || null
        );
      }
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
          Czeka na akceptację przez {host.name}. Gdy host zaakceptuje, będziesz mógł opłacić i potwierdzić rezerwację w zakładce Profil.
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
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A9A08B' }}>{host.price} zł / roślinę / dzień</div>
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
              <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.clayLight, overflow: 'hidden', flexShrink: 0 }}>
                {p.photo_url && <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, fontWeight: selectedPlantId === p.id ? 700 : 500 }}>{p.name}</span>
            </div>
          ))}

          {maxQuantity > 1 && (
            <>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginTop: 16, marginBottom: 10 }}>Ile sztuk? (masz {maxQuantity})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{
                  width: 36, height: 36, borderRadius: 10, background: colors.clayLight, border: 'none',
                  fontSize: 18, fontWeight: 700, color: colors.ink, cursor: 'pointer'
                }}>−</button>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700, color: colors.ink, minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))} style={{
                  width: 36, height: 36, borderRadius: 10, background: colors.fern, border: 'none',
                  fontSize: 18, fontWeight: 700, color: '#fff', cursor: 'pointer'
                }}>+</button>
              </div>
            </>
          )}

          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginTop: 16, marginBottom: 10 }}>Na jakie daty?</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
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

          {estimatedTotal != null && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.fern, fontWeight: 600, marginBottom: 16 }}>
              Szacowany koszt: {estimatedTotal} zł ({estimatedDays} {estimatedDays === 1 ? 'dzień' : 'dni'}) — płatność dopiero po akceptacji przez hosta
            </div>
          )}

          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10 }}>Twój telefon (opcjonalnie)</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#A9A08B', marginBottom: 8 }}>Host zobaczy go dopiero po zaakceptowaniu — ułatwi ustalenie godziny odbioru</div>
          <TextField icon={Phone} type="tel" placeholder="np. 500 100 200" value={renterPhone} onChange={e => setRenterPhone(e.target.value)} />

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

function ReviewForm({ booking, userId, userName, onCancel, onSaved }) {
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
      renter_name: userName || null,
      rating,
      comment,
    }]);
    if (error) {
      setSaving(false);
      setError('Nie udało się zapisać opinii: ' + error.message);
      return;
    }
    await supabase.rpc('update_host_rating', { host_id_param: booking.host_id });
    if (booking.hosts?.user_id) {
      await createNotification(
        booking.hosts.user_id,
        'new_review',
        'Nowa opinia',
        `${userName || 'Gość'} wystawił(a) Ci ocenę ${rating}/5 za "${booking.plant_name}"`,
        booking.id,
        booking.hosts.email || null
      );
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

function HostReviewForm({ booking, hostName, onCancel, onSaved }) {
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
      renter_user_id: booking.renter_user_id,
      renter_name: booking.renter_name || null,
      reviewer_role: 'host',
      rating,
      comment,
    }]);
    if (error) {
      setSaving(false);
      setError('Nie udało się zapisać opinii: ' + error.message);
      return;
    }
    await createNotification(
      booking.renter_user_id,
      'new_review',
      'Otrzymałeś opinię',
      `${hostName || 'Host'} wystawił(a) Ci ocenę ${rating}/5 za rezerwację "${booking.plant_name}"`,
      booking.id,
      booking.renter_email || null
    );
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
        <h2 style={{ fontSize: 18, color: colors.ink, fontWeight: 600, margin: 0 }}>Oceń wynajmującego</h2>
      </div>

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7A7261', marginBottom: 20 }}>
        {booking.renter_name || booking.renter_email} — roślina: {booking.plant_name}
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

function CareGuide({ text }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {lines.map((line, i) => {
        const match = line.match(/^-?\s*\*{0,2}([^:]+)\*{0,2}:\s*(.+)$/);
        if (!match) {
          return <div key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#4A4638' }}>{line}</div>;
        }
        return (
          <div key={i}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 700, color: colors.fern, textTransform: 'uppercase', letterSpacing: 0.4 }}>{match[1]}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#4A4638', lineHeight: 1.5 }}>{match[2]}</div>
          </div>
        );
      })}
    </div>
  );
}

const PENDING_PLANT_KEY = 'leafsit_pending_plant';

function AddPlantScreen({ userId, onPlantAdded, premiumReturn, onPremiumReturnHandled }) {
  const fileInputRef = useRef(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [identifying, setIdentifying] = useState(false);
  const [identifyError, setIdentifyError] = useState(null);
  const [plantName, setPlantName] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [showPremium, setShowPremium] = useState(false);
  const [premiumSunlight, setPremiumSunlight] = useState('Pełne słońce');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [guideError, setGuideError] = useState(null);
  const [careGuide, setCareGuide] = useState(null);

  useEffect(() => {
    if (!premiumReturn) return;
    const saved = sessionStorage.getItem(PENDING_PLANT_KEY);
    let restoredName = premiumReturn.plant || '';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPhotoDataUrl(parsed.photoDataUrl || null);
        setConfidence(parsed.confidence ?? null);
        if (parsed.plantName) restoredName = parsed.plantName;
      } catch (e) { /* ignore malformed cache */ }
    }
    setPlantName(restoredName);
    setPremiumSunlight(premiumReturn.sunlight || 'Pełne słońce');
    setShowPremium(true);
    setVerifyingPayment(true);

    (async () => {
      try {
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: premiumReturn.sessionId }),
        });
        const data = await res.json();
        if (data.paid) {
          sessionStorage.removeItem(PENDING_PLANT_KEY);
          await generateGuide(restoredName, premiumReturn.sunlight || 'Pełne słońce');
        } else {
          setGuideError('Nie udało się potwierdzić płatności. Spróbuj ponownie.');
        }
      } catch (err) {
        setGuideError('Błąd sprawdzania płatności.');
      }
      setVerifyingPayment(false);
      onPremiumReturnHandled();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdentifyError(null);
    setPlantName('');
    setConfidence(null);
    setCareGuide(null);
    setShowPremium(false);

    const resized = await resizeImage(file);
    setPhotoDataUrl(resized);

    setIdentifying(true);
    try {
      const res = await fetch('/api/identify-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: resized }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIdentifyError(data.error || 'Nie udało się rozpoznać rośliny.');
      } else if (!data.name) {
        setIdentifyError('Nie rozpoznano gatunku. Spróbuj wyraźniejszego zdjęcia liścia.');
      } else {
        setPlantName(data.name);
        setConfidence(data.confidence);
      }
    } catch (err) {
      setIdentifyError('Błąd połączenia z rozpoznawaniem roślin.');
    }
    setIdentifying(false);
  };

  const generateGuide = async (name, sunlight) => {
    setGeneratingGuide(true);
    setGuideError(null);
    try {
      const res = await fetch('/api/plant-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantName: name, sunlight }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGuideError(data.error || 'Nie udało się wygenerować porady.');
      } else {
        setCareGuide(data.guide);
      }
    } catch (err) {
      setGuideError('Błąd połączenia z generatorem porad.');
    }
    setGeneratingGuide(false);
  };

  const handleUnlockPremium = async () => {
    setCheckoutLoading(true);
    setGuideError(null);
    sessionStorage.setItem(PENDING_PLANT_KEY, JSON.stringify({ photoDataUrl, plantName, confidence }));
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantName, sunlight: premiumSunlight, origin: window.location.origin }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setGuideError(data.error || 'Nie udało się utworzyć płatności.');
        setCheckoutLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setGuideError('Błąd połączenia z systemem płatności.');
      setCheckoutLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('plants')
      .insert([{
        name: plantName,
        user_id: userId,
        photo_url: photoDataUrl,
        sunlight: careGuide ? premiumSunlight : null,
        care_guide: careGuide,
        quantity: quantity,
      }]);
    setSaving(false);
    if (error) {
      setError('Nie udało się zapisać: ' + error.message);
    } else {
      setSaved(true);
      if (onPlantAdded) onPlantAdded();
    }
  };

  return (
    <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <h2 style={{ fontSize: 22, color: colors.ink, fontWeight: 600, marginBottom: 4 }}>Dodaj roślinę</h2>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A9A08B', marginBottom: 20 }}>Zrób zdjęcie, a rozpoznamy gatunek</div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {!saved && (
        <div onClick={() => fileInputRef.current?.click()} style={{
          aspectRatio: '1', background: photoDataUrl ? '#000' : colors.clayLight, borderRadius: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          border: photoDataUrl ? 'none' : `2px dashed ${colors.clay}`, marginBottom: 20, cursor: 'pointer',
          overflow: 'hidden', position: 'relative', flexShrink: 0
        }}>
          {photoDataUrl ? (
            <>
              <img src={photoDataUrl} alt="Twoja roślina" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: identifying ? 0.5 : 1 }} />
              <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 8, display: 'flex' }}>
                <RefreshCw size={16} color="#fff" />
              </div>
            </>
          ) : (
            <>
              <Camera size={40} color={colors.clay} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: colors.clay, fontSize: 14 }}>Zrób zdjęcie rośliny</span>
            </>
          )}
        </div>
      )}

      {identifying && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginBottom: 20 }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Rozpoznaję gatunek...
        </div>
      )}

      {identifyError && !identifying && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FFF3EC', borderRadius: 14,
          padding: 14, marginBottom: 20, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay
        }}>{identifyError}</div>
      )}

      {plantName && !identifying && !saved && (
        <>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start', background: '#EEF3EA', borderRadius: 14,
            padding: 14, marginBottom: 16
          }}>
            <Sparkles size={18} color={colors.fern} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.fernDark, lineHeight: 1.5 }}>
              <b>Rozpoznano: {plantName}</b> {confidence != null && `(pewność ${confidence}%)`}
            </div>
          </div>

          {!premiumReturn && (
            <>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A9A08B', marginBottom: 8 }}>Nazwa nie zgadza się? Popraw ją:</div>
              <TextField value={plantName} onChange={e => setPlantName(e.target.value)} />
            </>
          )}

          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A9A08B', marginBottom: 8 }}>Ile masz takich samych roślin?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{
              width: 36, height: 36, borderRadius: 10, background: colors.clayLight, border: 'none',
              fontSize: 18, fontWeight: 700, color: colors.ink, cursor: 'pointer'
            }}>−</button>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700, color: colors.ink, minWidth: 20, textAlign: 'center' }}>{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(20, q + 1))} style={{
              width: 36, height: 36, borderRadius: 10, background: colors.fern, border: 'none',
              fontSize: 18, fontWeight: 700, color: '#fff', cursor: 'pointer'
            }}>+</button>
          </div>

          {!careGuide && !showPremium && (
            <button onClick={() => setShowPremium(true)} style={{
              width: '100%', padding: 14, borderRadius: 16, background: `linear-gradient(135deg, ${colors.gold}, ${colors.clay})`,
              color: '#fff', border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16
            }}>
              <Crown size={16} /> Odblokuj pełny przewodnik Premium
            </button>
          )}

          {showPremium && !careGuide && (
            <div style={{ background: colors.card, border: `1.5px solid ${colors.gold}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Crown size={16} color={colors.gold} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.ink }}>Przewodnik Premium — 9 zł</span>
              </div>

              {verifyingPayment && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', padding: '8px 0' }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sprawdzam płatność...
                </div>
              )}

              {!verifyingPayment && (
                <>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261', marginBottom: 10 }}>Jaki poziom nasłonecznienia ma ta roślina u Ciebie?</div>
                  {['Pełne słońce', 'Półcień', 'Cień'].map((l) => {
                    const si = sunlightInfo(l);
                    const SIcon = si.Icon;
                    return (
                      <div key={l} onClick={() => setPremiumSunlight(l)} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12,
                        border: `1.5px solid ${premiumSunlight === l ? colors.gold : colors.line}`, marginBottom: 8,
                        background: premiumSunlight === l ? '#FFF8EC' : colors.bg, cursor: 'pointer'
                      }}>
                        <SIcon size={16} color={premiumSunlight === l ? si.tone : '#A9A08B'} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: colors.ink, fontWeight: premiumSunlight === l ? 700 : 500 }}>{l}</span>
                      </div>
                    );
                  })}

                  {guideError && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.clay, marginTop: 8, marginBottom: 4 }}>{guideError}</div>}

                  <button onClick={handleUnlockPremium} disabled={checkoutLoading} style={{
                    width: '100%', padding: 12, borderRadius: 12, background: colors.fern, color: '#fff', border: 'none',
                    fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, cursor: checkoutLoading ? 'default' : 'pointer',
                    opacity: checkoutLoading ? 0.7 : 1, marginTop: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}>
                    {checkoutLoading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                    {checkoutLoading ? 'Przekierowuję do płatności...' : 'Zapłać 9 zł i odblokuj przewodnik'}
                  </button>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: '#A9A08B', textAlign: 'center', marginTop: 8 }}>
                    Tryb testowy — użyj karty 4242 4242 4242 4242, dowolna data i CVC
                  </div>
                </>
              )}
            </div>
          )}

          {generatingGuide && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginBottom: 16 }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generuję Twój przewodnik...
            </div>
          )}

          {careGuide && (
            <div style={{ background: '#FFF8EC', border: `1.5px solid ${colors.gold}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Crown size={16} color={colors.gold} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: colors.ink }}>Twój przewodnik pielęgnacji (opłacony ✓)</span>
              </div>
              <CareGuide text={careGuide} />
            </div>
          )}

          {error && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay, marginBottom: 12 }}>{error}</div>
          )}
          <button onClick={handleSave} disabled={saving || !plantName} style={{
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
  const fileInputRef = useRef(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [identifying, setIdentifying] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);

    const resized = await resizeImage(file);
    setPhotoDataUrl(resized);

    setIdentifying(true);
    try {
      const res = await fetch('/api/identify-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: resized }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Nie udało się rozpoznać rośliny.');
      } else if (!data.name) {
        setError('Nie rozpoznano gatunku. Spróbuj wyraźniejszego zdjęcia liścia.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Błąd połączenia z rozpoznawaniem roślin.');
    }
    setIdentifying(false);
  };

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <h2 style={{ fontSize: 22, color: colors.ink, fontWeight: 600, marginBottom: 4 }}>Rozpoznaj roślinę</h2>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginBottom: 20 }}>Szybkie sprawdzenie gatunku — bez zapisywania w profilu</div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div onClick={() => fileInputRef.current?.click()} style={{
        aspectRatio: '4/5', background: photoDataUrl ? '#000' : `linear-gradient(160deg, ${colors.fern}22, ${colors.gold}22)`,
        borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 14, marginBottom: 20, border: photoDataUrl ? 'none' : `1px solid ${colors.line}`, cursor: 'pointer',
        overflow: 'hidden', position: 'relative'
      }}>
        {photoDataUrl ? (
          <img src={photoDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: identifying ? 0.5 : 1 }} />
        ) : (
          <>
            <div style={{ width: 88, height: 88, borderRadius: 44, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <Camera size={36} color={colors.fern} />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: colors.ink, fontSize: 15 }}>Zrób lub wgraj zdjęcie</span>
          </>
        )}
      </div>

      {identifying && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginBottom: 20 }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Rozpoznaję gatunek...
        </div>
      )}

      {error && !identifying && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FFF3EC', borderRadius: 14,
          padding: 14, marginBottom: 20, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.clay
        }}>{error}</div>
      )}

      {result && !identifying && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start', background: '#EEF3EA', borderRadius: 14,
          padding: 16, marginBottom: 20
        }}>
          <Sparkles size={18} color={colors.fern} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, color: colors.fernDark }}>{result.name}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.fern, marginTop: 2 }}>Pewność rozpoznania: {result.confidence}%</div>
          </div>
        </div>
      )}

      <div style={{
        border: `1.5px solid ${colors.gold}`, background: '#FFF8EC', borderRadius: 16, padding: 16,
        display: 'flex', gap: 12, alignItems: 'center'
      }}>
        <Crown size={20} color={colors.gold} style={{ flexShrink: 0 }} />
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.ink }}>Chcesz dodać ją do swoich roślin?</div>
          <div style={{ fontSize: 12, color: '#7A7261', marginTop: 2 }}>Przejdź do zakładki "Dodaj" — tam też odblokujesz pełny przewodnik Premium.</div>
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

function BecomeHostForm({ userId, existingHost, userAvatarUrl, onCancel, onSaved }) {
  const isEdit = !!existingHost;
  const [name, setName] = useState(existingHost?.name || '');
  const [price, setPrice] = useState(existingHost ? String(existingHost.price) : '');
  const [location, setLocation] = useState(existingHost?.location || '');
  const [address, setAddress] = useState(existingHost?.address || '');
  const [phone, setPhone] = useState(existingHost?.phone || '');
  const [sunlight, setSunlight] = useState(existingHost?.sunlight || 'Pełne słońce');
  const [capacity, setCapacity] = useState(existingHost ? String(existingHost.plants_capacity) : '');
  const [description, setDescription] = useState(existingHost?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [coords, setCoords] = useState(
    existingHost?.latitude != null ? { lat: existingHost.latitude, lon: existingHost.longitude } : null
  );
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(null);

  const canSave = name && price && location && capacity;

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Twoja przeglądarka nie obsługuje lokalizacji.');
      return;
    }
    setLocLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        setLocError('Nie udało się pobrać lokalizacji. Sprawdź uprawnienia przeglądarki.');
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const payload = {
      name,
      price: Number(price),
      location,
      address: address || null,
      phone: phone || null,
      sunlight,
      plants_capacity: Number(capacity),
      description,
      photo_url: userAvatarUrl || null,
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lon : null,
    };
    const { error } = isEdit
      ? await supabase.from('hosts').update(payload).eq('id', existingHost.id)
      : await supabase.from('hosts').insert([{ ...payload, user_id: userId, rating: null, reviews: 0 }]);
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
        <h2 style={{ fontSize: 20, color: colors.ink, fontWeight: 600, margin: 0 }}>{isEdit ? 'Edytuj profil hosta' : 'Zostań hostem'}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <Avatar photoUrl={userAvatarUrl} name={name || 'H'} size={64} radius={16} />
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink }}>Zdjęcie z Twojego konta</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#A9A08B', marginTop: 2 }}>
            Aby je zmienić, przejdź do zakładki Profil i kliknij w swój awatar.
          </div>
        </div>
      </div>

      <TextField placeholder="Twoje imię" value={name} onChange={e => setName(e.target.value)} />
      <TextField icon={DollarSign} type="number" placeholder="Cena za roślinę / dzień (zł)" value={price} onChange={e => setPrice(e.target.value)} />
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#A9A08B', marginTop: -6, marginBottom: 14 }}>
        Sugerowana cena: 2-5 zł za roślinę dziennie
      </div>
      {Number(price) > 10 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.clay, marginTop: -6, marginBottom: 14 }}>
          To znacznie powyżej średniej — czy na pewno?
        </div>
      )}
      <TextField icon={MapPin} placeholder="Okolica (np. Mokotów, Warszawa)" value={location} onChange={e => setLocation(e.target.value)} />
      <TextField icon={Phone} type="tel" placeholder="Telefon (opcjonalnie, widoczny po akceptacji)" value={phone} onChange={e => setPhone(e.target.value)} />
      <TextField placeholder="Dokładny adres (opcjonalnie, widoczny po akceptacji)" value={address} onChange={e => setAddress(e.target.value)} />

      <button onClick={handleUseLocation} disabled={locLoading} style={{
        width: '100%', padding: 12, borderRadius: 12, background: coords ? '#EEF3EA' : colors.clayLight,
        border: `1.5px solid ${coords ? colors.fern : colors.line}`, color: coords ? colors.fern : colors.ink,
        fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, cursor: locLoading ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12
      }}>
        {locLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Navigation size={15} />}
        {locLoading ? 'Pobieram lokalizację...' : coords ? 'Lokalizacja zapisana ✓ (kliknij by zaktualizować)' : 'Użyj mojej lokalizacji (dla odległości)'}
      </button>
      {locError && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.clay, marginBottom: 12 }}>{locError}</div>}

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
        {saving ? 'Zapisywanie...' : isEdit ? 'Zapisz zmiany' : 'Zostań hostem'}
      </button>
    </div>
  );
}

function statusInfo(status) {
  if (status === 'accepted') return { label: 'Zaakceptowana', tone: 'fern' };
  if (status === 'rejected') return { label: 'Odrzucona', tone: 'clay' };
  if (status === 'cancelled') return { label: 'Anulowana', tone: 'gray' };
  return { label: 'Oczekuje', tone: 'gold' };
}

function ContactBlock({ title, phone, address, extra }) {
  if (!phone && !address && !extra) return null;
  return (
    <div style={{ marginTop: 10, background: '#EEF3EA', borderRadius: 10, padding: 10 }}>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 700, color: colors.fern, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>{title}</div>
      {phone && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.ink, display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={12} /> {phone}</div>}
      {address && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.ink, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}><MapPin size={12} /> {address}</div>}
      {extra && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#7A7261', marginTop: 2 }}>{extra}</div>}
    </div>
  );
}

function ProfileScreen({ user, refreshKey, onSignOut, onUserUpdated, connectReturn, onConnectReturnHandled, bookingPaymentReturn, onBookingPaymentReturnHandled }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myHost, setMyHost] = useState(null);
  const [hostLoading, setHostLoading] = useState(true);
  const [showHostForm, setShowHostForm] = useState(false);
  const [editingHost, setEditingHost] = useState(false);
  const [hostRefresh, setHostRefresh] = useState(0);

  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(true);
  const [incoming, setIncoming] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(true);
  const [bookingsRefresh, setBookingsRefresh] = useState(0);

  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewsRefresh, setReviewsRefresh] = useState(0);
  const [hostReviewedBookingIds, setHostReviewedBookingIds] = useState(new Set());
  const [reviewingAsHostBooking, setReviewingAsHostBooking] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadHostReviews() {
      if (!myHost) return;
      const { data, error } = await supabase
        .from('reviews')
        .select('booking_id')
        .eq('host_id', myHost.id)
        .eq('reviewer_role', 'host');
      if (!cancelled && !error && data) {
        setHostReviewedBookingIds(new Set(data.map(r => r.booking_id)));
      }
    }
    loadHostReviews();
    return () => { cancelled = true; };
  }, [myHost, reviewsRefresh]);

  const [expandedPlantId, setExpandedPlantId] = useState(null);
  const [deletingPlantId, setDeletingPlantId] = useState(null);
  const [plantHistory, setPlantHistory] = useState({});
  const [loadingPlantHistory, setLoadingPlantHistory] = useState(null);

  const togglePlantExpand = async (plantId) => {
    if (expandedPlantId === plantId) {
      setExpandedPlantId(null);
      return;
    }
    setExpandedPlantId(plantId);
    if (!plantHistory[plantId]) {
      setLoadingPlantHistory(plantId);
      const { data } = await supabase
        .from('bookings')
        .select('id, start_date, end_date, status, payment_status, quantity, hosts(name, location)')
        .eq('plant_id', plantId)
        .order('start_date', { ascending: false });
      setPlantHistory(prev => ({ ...prev, [plantId]: data || [] }));
      setLoadingPlantHistory(null);
    }
  };

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayNameOf(user));
  const [savingName, setSavingName] = useState(false);
  const hasName = !!user?.user_metadata?.full_name;

  const avatarFileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savingEmailPref, setSavingEmailPref] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('avatar_url, email_notifications').eq('id', user.id).maybeSingle();
      if (!cancelled) {
        setProfileAvatarUrl(data?.avatar_url || null);
        setEmailNotifications(data?.email_notifications !== false);
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [user.id]);

  const toggleEmailNotifications = async () => {
    const next = !emailNotifications;
    setSavingEmailPref(true);
    setEmailNotifications(next);
    await supabase.from('profiles').upsert({ id: user.id, email_notifications: next });
    setSavingEmailPref(false);
  };

  const [connectLoading, setConnectLoading] = useState(false);
  const [connectChecking, setConnectChecking] = useState(false);

  const [payingBookingId, setPayingBookingId] = useState(null);
  const [verifyingBookingPayment, setVerifyingBookingPayment] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifRefresh, setNotifRefresh] = useState(0);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    let cancelled = false;
    async function loadNotifications() {
      setNotifLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      if (!cancelled) {
        if (!error && data) setNotifications(data);
        setNotifLoading(false);
      }
    }
    loadNotifications();
    return () => { cancelled = true; };
  }, [user.id, notifRefresh]);

  const markNotificationRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

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
        .select('*, hosts(user_id, name, location, phone, address, price, stripe_account_id, stripe_charges_enabled, email)')
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

  useEffect(() => {
    if (!connectReturn || hostLoading) return;
    if (!myHost || !myHost.stripe_account_id) { onConnectReturnHandled(); return; }
    (async () => {
      setConnectChecking(true);
      try {
        const res = await fetch('/api/check-connect-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: myHost.stripe_account_id }),
        });
        const data = await res.json();
        if (res.ok) {
          await supabase.from('hosts').update({ stripe_charges_enabled: !!data.chargesEnabled }).eq('id', myHost.id);
          setHostRefresh(k => k + 1);
        }
      } catch (e) { /* ignore, host can just try again */ }
      setConnectChecking(false);
      onConnectReturnHandled();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectReturn, hostLoading, myHost]);

  useEffect(() => {
    if (!bookingPaymentReturn) return;
    (async () => {
      setVerifyingBookingPayment(true);
      try {
        const res = await fetch('/api/verify-booking-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: bookingPaymentReturn.sessionId }),
        });
        const data = await res.json();
        if (res.ok && data.paid) {
          await supabase.from('bookings').update({
            payment_status: 'paid',
            amount_total: data.amountTotal,
            stripe_session_id: bookingPaymentReturn.sessionId,
            stripe_payment_intent_id: data.paymentIntentId,
          }).eq('id', bookingPaymentReturn.bookingId);
          const { data: bd } = await supabase
            .from('bookings')
            .select('plant_name, hosts(user_id, email)')
            .eq('id', bookingPaymentReturn.bookingId)
            .maybeSingle();
          if (bd?.hosts?.user_id) {
            await createNotification(
              bd.hosts.user_id,
              'booking_paid',
              'Otrzymano płatność',
              `Rezerwacja "${bd.plant_name}" została opłacona — ${data.amountTotal} zł`,
              bookingPaymentReturn.bookingId,
              bd.hosts.email || null
            );
          }
          setBookingsRefresh(k => k + 1);
        }
      } catch (e) { /* ignore, renter can retry from the booking */ }
      setVerifyingBookingPayment(false);
      onBookingPaymentReturnHandled();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingPaymentReturn]);

  const respondToBooking = async (bookingId, newStatus) => {
    const b = incoming.find(x => x.id === bookingId);

    if (newStatus === 'accepted' && b && myHost) {
      const { data: overlapping } = await supabase
        .from('bookings')
        .select('id, quantity')
        .eq('host_id', myHost.id)
        .eq('status', 'accepted')
        .lte('start_date', b.end_date)
        .gte('end_date', b.start_date);
      const currentCount = (overlapping || []).reduce((sum, o) => sum + (o.quantity || 1), 0);
      if (currentCount + (b.quantity || 1) > myHost.plants_capacity) {
        alert(`Nie możesz zaakceptować tej prośby — w tym terminie masz już ${currentCount} zaakceptowanych roślin, a Twój limit to ${myHost.plants_capacity}.`);
        return;
      }
    }

    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    if (b) {
      await createNotification(
        b.renter_user_id,
        newStatus === 'accepted' ? 'booking_accepted' : 'booking_rejected',
        newStatus === 'accepted' ? 'Rezerwacja zaakceptowana!' : 'Rezerwacja odrzucona',
        newStatus === 'accepted'
          ? `Twoja prośba dla "${b.plant_name}" została zaakceptowana — możesz teraz opłacić rezerwację w Profilu.`
          : `Twoja prośba dla "${b.plant_name}" została odrzucona przez hosta.`,
        bookingId,
        b.renter_email || null
      );
    }
    setBookingsRefresh(k => k + 1);
  };

  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  const cancelMyBooking = async (bookingId) => {
    const b = myBookings.find(x => x.id === bookingId);
    setCancellingBookingId(bookingId);

    if (b?.payment_status === 'paid' && b?.stripe_payment_intent_id) {
      try {
        const res = await fetch('/api/refund-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: b.stripe_payment_intent_id }),
        });
        if (!res.ok) {
          setCancellingBookingId(null);
          alert('Nie udało się zwrócić płatności. Spróbuj ponownie lub skontaktuj się z pomocą.');
          return;
        }
        await supabase.from('bookings').update({ status: 'cancelled', payment_status: 'refunded' }).eq('id', bookingId);
      } catch (e) {
        setCancellingBookingId(null);
        alert('Nie udało się zwrócić płatności. Spróbuj ponownie lub skontaktuj się z pomocą.');
        return;
      }
    } else {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    }

    if (b?.hosts?.user_id) {
      await createNotification(
        b.hosts.user_id,
        'booking_cancelled',
        'Rezerwacja anulowana',
        b.payment_status === 'paid'
          ? `Rezerwacja "${b.plant_name}" została anulowana i zwrócona — środki zostaną wycofane z Twojego konta.`
          : `Prośba dla "${b.plant_name}" została anulowana przez wynajmującego.`,
        bookingId,
        b.hosts.email || null
      );
    }
    setCancellingBookingId(null);
    setBookingsRefresh(k => k + 1);
  };

  const deletePlant = async (plantId) => {
    setDeletingPlantId(plantId);
    const { error } = await supabase.from('plants').delete().eq('id', plantId);
    setDeletingPlantId(null);
    if (!error) {
      setPlants(prev => prev.filter(p => p.id !== plantId));
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: nameInput.trim() } });
    setSavingName(false);
    if (!error && data?.user) {
      onUserUpdated(data.user);
      setEditingName(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const resized = await resizeImage(file, 400);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, avatar_url: resized, updated_at: new Date().toISOString() });
    if (!error) {
      setProfileAvatarUrl(resized);
      if (myHost) {
        await supabase.from('hosts').update({ photo_url: resized }).eq('id', myHost.id);
        setHostRefresh(k => k + 1);
      }
    }
    setAvatarUploading(false);
  };

  const handleConnectStripe = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: myHost.id,
          existingAccountId: myHost.stripe_account_id || null,
          email: user.email,
          origin: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setConnectLoading(false);
        return;
      }
      if (!myHost.stripe_account_id && data.accountId) {
        await supabase.from('hosts').update({ stripe_account_id: data.accountId }).eq('id', myHost.id);
      }
      window.location.href = data.url;
    } catch (e) {
      setConnectLoading(false);
    }
  };

  const handlePayForBooking = async (booking) => {
    setPayingBookingId(booking.id);
    try {
      const res = await fetch('/api/create-booking-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          hostStripeAccountId: booking.hosts?.stripe_account_id,
          hostPricePerDay: booking.hosts?.price,
          startDate: booking.start_date,
          endDate: booking.end_date,
          hostName: booking.hosts?.name,
          plantName: booking.plant_name,
          quantity: booking.quantity,
          origin: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setPayingBookingId(null);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setPayingBookingId(null);
    }
  };

  if (showHostForm || editingHost) {
    return (
      <BecomeHostForm
        userId={user.id}
        existingHost={editingHost ? myHost : null}
        userAvatarUrl={profileAvatarUrl}
        onCancel={() => { setShowHostForm(false); setEditingHost(false); }}
        onSaved={() => { setShowHostForm(false); setEditingHost(false); setHostRefresh(k => k + 1); }}
      />
    );
  }

  if (reviewingBooking) {
    return (
      <ReviewForm
        booking={reviewingBooking}
        userId={user.id}
        userName={displayNameOf(user) !== user.email ? displayNameOf(user) : null}
        onCancel={() => setReviewingBooking(null)}
        onSaved={() => { setReviewingBooking(null); setReviewsRefresh(k => k + 1); }}
      />
    );
  }

  if (reviewingAsHostBooking) {
    return (
      <HostReviewForm
        booking={reviewingAsHostBooking}
        hostName={myHost?.name}
        onCancel={() => setReviewingAsHostBooking(null)}
        onSaved={() => { setReviewingAsHostBooking(null); setReviewsRefresh(k => k + 1); }}
      />
    );
  }

  const pendingIncoming = incoming.filter(b => b.status === 'pending');
  const acceptedIncoming = incoming.filter(b => b.status === 'accepted');

  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <input
          ref={avatarFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />
        <div onClick={() => avatarFileInputRef.current?.click()} style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <Avatar photoUrl={profileAvatarUrl} name={displayNameOf(user)} size={60} radius={30} />
          <div style={{
            position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11,
            background: colors.gold, border: `2px solid ${colors.bg}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {avatarUploading
              ? <Loader2 size={11} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
              : <Pencil size={10} color="#fff" />}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.ink, wordBreak: 'break-word' }}>{displayNameOf(user)}</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#A9A08B', wordBreak: 'break-all' }}>{user.email}</div>
        </div>
        <button onClick={() => setShowNotifications(s => !s)} style={{
          background: colors.clayLight, border: 'none', borderRadius: 12, padding: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          position: 'relative'
        }}>
          <Bell size={16} color={colors.ink} />
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8,
              background: colors.clay, color: '#fff', fontSize: 9.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px'
            }}>{unreadCount > 9 ? '9+' : unreadCount}</div>
          )}
        </button>
        <button onClick={onSignOut} style={{
          background: colors.clayLight, border: 'none', borderRadius: 12, padding: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}>
          <LogOut size={16} color={colors.clay} />
        </button>
      </div>

      {showNotifications && (
        <div style={{
          background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16,
          marginBottom: 20, overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${colors.line}` }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, color: colors.ink }}>Powiadomienia</span>
            <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <X size={15} color="#A9A08B" />
            </button>
          </div>
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {notifLoading && <div style={{ padding: 14, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#A9A08B' }}>Ładowanie...</div>}
            {!notifLoading && notifications.length === 0 && (
              <div style={{ padding: 14, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#A9A08B' }}>Brak powiadomień.</div>
            )}
            {!notifLoading && notifications.map(n => (
              <div key={n.id} onClick={() => !n.read && markNotificationRead(n.id)} style={{
                padding: '12px 14px', borderBottom: `1px solid ${colors.line}`, cursor: n.read ? 'default' : 'pointer',
                background: n.read ? 'transparent' : '#FFF8EC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!n.read && <div style={{ width: 6, height: 6, borderRadius: 3, background: colors.gold, flexShrink: 0 }} />}
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, color: colors.ink }}>{n.title}</span>
                </div>
                {n.body && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#7A7261', marginTop: 3 }}>{n.body}</div>}
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#A9A08B', marginTop: 4 }}>{formatDate(n.created_at)}</div>
              </div>
            ))}
          </div>
          <div onClick={toggleEmailNotifications} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: `1px solid ${colors.line}`, cursor: 'pointer'
          }}>
            <div style={{
              width: 34, height: 20, borderRadius: 10, flexShrink: 0, position: 'relative',
              background: emailNotifications ? colors.fern : colors.line, transition: 'background 0.15s'
            }}>
              <div style={{
                position: 'absolute', top: 2, left: emailNotifications ? 16 : 2, width: 16, height: 16, borderRadius: 8,
                background: '#fff', transition: 'left 0.15s'
              }} />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>
              {savingEmailPref ? 'Zapisywanie...' : 'Powiadomienia email'}
            </span>
          </div>
        </div>
      )}

      {myHost && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#A9A08B', marginBottom: 20 }}>
          To zdjęcie jest też widoczne na Twoim ogłoszeniu hosta.
        </div>
      )}

      {!hasName && !editingName && (
        <div onClick={() => setEditingName(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: '#FFF8EC', border: `1.5px solid ${colors.gold}`,
          borderRadius: 12, padding: 12, marginBottom: 20, cursor: 'pointer'
        }}>
          <Pencil size={14} color={colors.gold} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.ink }}>Uzupełnij swoje imię — host zobaczy je zamiast samego emaila</span>
        </div>
      )}
      {hasName && !editingName && (
        <div onClick={() => setEditingName(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 20, cursor: 'pointer' }}>
          <Pencil size={11} color="#A9A08B" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#A9A08B' }}>Zmień imię</span>
        </div>
      )}
      {editingName && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <TextField placeholder="Twoje imię i nazwisko" value={nameInput} onChange={e => setNameInput(e.target.value)} />
          </div>
          <button onClick={handleSaveName} disabled={savingName || !nameInput.trim()} style={{
            padding: '0 16px', borderRadius: 14, background: colors.fern, color: '#fff', border: 'none',
            fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0
          }}>{savingName ? '...' : 'Zapisz'}</button>
        </div>
      )}

      <WeatherWidget />

      {myHost && pendingIncoming.length > 0 && (
        <>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Prośby o rezerwację ({pendingIncoming.length})
          </div>
          {pendingIncoming.map(b => (
            <div key={b.id} style={{ background: colors.card, border: `1.5px solid ${colors.gold}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: colors.ink, marginBottom: 2 }}>
                {b.plant_name}{b.quantity > 1 ? ` × ${b.quantity}` : ''}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261', marginBottom: 2 }}>od {b.renter_name || b.renter_email}</div>
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

      {myHost && acceptedIncoming.length > 0 && (
        <>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, marginTop: pendingIncoming.length > 0 ? 20 : 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Zaakceptowane rezerwacje ({acceptedIncoming.length})
          </div>
          {acceptedIncoming.map(b => (
            <div key={b.id} style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: colors.ink, marginBottom: 2 }}>{b.plant_name}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>{b.start_date} → {b.end_date}</div>
              {b.payment_status === 'paid' ? (
                <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={13} /> Opłacona — {b.amount_total} zł (Twoja część: {Math.round(b.amount_total * 0.9 * 100) / 100} zł)
                </div>
              ) : (
                <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#A9A08B' }}>
                  Oczekuje na opłacenie przez wynajmującego
                </div>
              )}
              <ContactBlock title="Kontakt do właściciela rośliny" phone={b.renter_phone} extra={`${b.renter_name || 'Bez podanego imienia'} · ${b.renter_email}`} />
              {b.payment_status === 'paid' && !hostReviewedBookingIds.has(b.id) && (
                <button onClick={() => setReviewingAsHostBooking(b)} style={{
                  marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: colors.gold, color: '#fff',
                  border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}><MessageCircle size={14} /> Oceń wynajmującego</button>
              )}
              {b.payment_status === 'paid' && hostReviewedBookingIds.has(b.id) && (
                <div style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={13} /> Opinia o wynajmującym wystawiona
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, marginTop: (myHost && (pendingIncoming.length > 0 || acceptedIncoming.length > 0)) ? 20 : 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Twoje rezerwacje</div>
      {myBookingsLoading && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginBottom: 20 }}>Ładowanie...</div>
      )}
      {!myBookingsLoading && myBookings.length === 0 && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B', marginBottom: 20 }}>Nie masz jeszcze żadnych rezerwacji.</div>
      )}
      {!myBookingsLoading && myBookings.map(b => {
        const si = statusInfo(b.status);
        const alreadyReviewed = reviewedBookingIds.has(b.id);
        const needsPayment = b.status === 'accepted' && b.payment_status !== 'paid';
        const hostReady = b.hosts?.stripe_account_id && b.hosts?.stripe_charges_enabled;
        const estDays = daysBetween(b.start_date, b.end_date);
        const estTotal = b.amount_total ?? (estDays * (b.hosts?.price ?? 0) * (b.quantity || 1));
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

            {b.status === 'accepted' && (
              <ContactBlock title="Kontakt do hosta" phone={b.hosts?.phone} address={b.hosts?.address} />
            )}

            {b.payment_status === 'paid' && (
              <div style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={13} /> Zapłacono {b.amount_total} zł
              </div>
            )}

            {needsPayment && verifyingBookingPayment && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#A9A08B' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sprawdzam płatność...
              </div>
            )}

            {needsPayment && !verifyingBookingPayment && hostReady && (
              <button onClick={() => handlePayForBooking(b)} disabled={payingBookingId === b.id} style={{
                marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: colors.clay, color: '#fff',
                border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: payingBookingId === b.id ? 0.7 : 1
              }}>
                {payingBookingId === b.id
                  ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  : <CreditCard size={14} />}
                {payingBookingId === b.id ? 'Przekierowuję...' : `Zapłać i potwierdź (${estTotal} zł)`}
              </button>
            )}

            {needsPayment && !verifyingBookingPayment && !hostReady && (
              <div style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#A9A08B' }}>
                Host jeszcze nie podłączył konta do wypłat — spróbuj ponownie za chwilę.
              </div>
            )}

            {b.status === 'pending' && (
              <button onClick={() => cancelMyBooking(b.id)} disabled={cancellingBookingId === b.id} style={{
                marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: colors.clayLight, color: colors.clay,
                border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: cancellingBookingId === b.id ? 0.7 : 1
              }}>
                {cancellingBookingId === b.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <X size={14} />}
                Anuluj prośbę
              </button>
            )}

            {b.status === 'accepted' && (b.payment_status === 'paid' || b.payment_status === 'unpaid') && isUpcoming(b.start_date) && (
              <button
                onClick={() => {
                  const msg = b.payment_status === 'paid'
                    ? `Na pewno anulować? Zapłacone ${b.amount_total} zł zostanie w pełni zwrócone.`
                    : 'Na pewno anulować tę rezerwację?';
                  if (window.confirm(msg)) cancelMyBooking(b.id);
                }}
                disabled={cancellingBookingId === b.id}
                style={{
                  marginTop: 10, width: '100%', padding: 10, borderRadius: 10, background: colors.clayLight, color: colors.clay,
                  border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  opacity: cancellingBookingId === b.id ? 0.7 : 1
                }}
              >
                {cancellingBookingId === b.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <X size={14} />}
                {cancellingBookingId === b.id ? 'Anulowanie...' : b.payment_status === 'paid' ? 'Anuluj i zwróć płatność' : 'Anuluj rezerwację'}
              </button>
            )}

            {b.status === 'accepted' && b.payment_status === 'paid' && !alreadyReviewed && (
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

      {!loading && plants.map(p => {
        const history = plantHistory[p.id] || [];
        const active = history.find(h => h.status === 'accepted' && new Date(h.end_date) >= new Date().setHours(0,0,0,0));
        return (
        <div key={p.id} style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, marginBottom: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
            <div onClick={() => togglePlantExpand(p.id)} style={{
              width: 40, height: 40, borderRadius: 10, background: colors.clayLight, overflow: 'hidden', flexShrink: 0, cursor: 'pointer'
            }}>
              {p.photo_url && <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div onClick={() => togglePlantExpand(p.id)} style={{ flex: 1, cursor: 'pointer' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: colors.ink }}>
                {p.name}{p.quantity > 1 ? ` × ${p.quantity}` : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                {p.care_guide && (
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.gold, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Crown size={11} /> Premium
                  </div>
                )}
                {active ? (
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: colors.fern, fontWeight: 700 }}>
                    Obecnie u {active.hosts?.name}
                  </div>
                ) : (
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#A9A08B' }}>U Ciebie w domu</div>
                )}
              </div>
            </div>
            <button
              onClick={() => { if (window.confirm(`Usunąć "${p.name}" z Twoich roślin?`)) deletePlant(p.id); }}
              disabled={deletingPlantId === p.id}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {deletingPlantId === p.id
                ? <Loader2 size={16} color="#A9A08B" style={{ animation: 'spin 1s linear infinite' }} />
                : <Trash2 size={16} color="#A9A08B" />}
            </button>
          </div>
          {expandedPlantId === p.id && (
            <div style={{ padding: '0 16px 16px' }}>
              {p.care_guide && <div style={{ marginBottom: 14 }}><CareGuide text={p.care_guide} /></div>}
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: colors.ink, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
                Historia u hostów
              </div>
              {loadingPlantHistory === p.id && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#A9A08B' }}>Ładowanie...</div>
              )}
              {loadingPlantHistory !== p.id && history.length === 0 && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#A9A08B' }}>Ta roślina nigdy nie była jeszcze u hosta.</div>
              )}
              {loadingPlantHistory !== p.id && history.map(h => (
                <div key={h.id} style={{ background: colors.bg, borderRadius: 10, padding: 10, marginBottom: 6 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 700, color: colors.ink }}>
                    {h.hosts?.name} {h.quantity > 1 ? `(×${h.quantity})` : ''} · {h.hosts?.location}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#7A7261', marginTop: 2 }}>
                    {h.start_date} → {h.end_date}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Pill tone={statusInfo(h.status).tone}>{statusInfo(h.status).label}</Pill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );})}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 10px' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {myHost ? 'Twój profil hosta' : 'Chcesz zostać hostem?'}
        </span>
        {myHost && (
          <button onClick={() => setEditingHost(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0
          }}>
            <Pencil size={11} color="#A9A08B" />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#A9A08B' }}>Edytuj</span>
          </button>
        )}
      </div>

      {hostLoading && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A9A08B' }}>Ładowanie...</div>
      )}

      {!hostLoading && myHost && (
        <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Avatar photoUrl={myHost.photo_url} name={myHost.name} size={40} radius={10} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: colors.ink }}>{myHost.name}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: colors.clay }}>{myHost.price} zł</span>
            </div>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261' }}>{myHost.location} · {myHost.plants_capacity} miejsc</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: colors.fern, marginTop: 6 }}>
            Twój profil jest już widoczny na liście hostów ✓{myHost.latitude != null ? ' · lokalizacja GPS zapisana' : ''}
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.line}` }}>
            {connectChecking ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#A9A08B' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sprawdzam status konta wypłat...
              </div>
            ) : myHost.stripe_charges_enabled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.fern, fontWeight: 700 }}>
                <CheckCircle size={14} /> Konto do wypłat podłączone
              </div>
            ) : (
              <>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#7A7261', marginBottom: 8 }}>
                  Aby otrzymywać wypłaty za rezerwacje, podłącz konto Stripe (kilka minut).
                </div>
                <button onClick={handleConnectStripe} disabled={connectLoading} style={{
                  width: '100%', padding: 12, borderRadius: 12, background: colors.ink, color: '#fff', border: 'none',
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, cursor: connectLoading ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: connectLoading ? 0.7 : 1
                }}>
                  {connectLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Wallet size={15} />}
                  {connectLoading ? 'Przekierowuję...' : 'Podłącz konto Stripe'}
                </button>
              </>
            )}
          </div>
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

function readPremiumReturnFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('premium_paid') === '1' && params.get('session_id')) {
    const result = {
      plant: params.get('plant') || '',
      sunlight: params.get('sunlight') || '',
      sessionId: params.get('session_id'),
    };
    window.history.replaceState({}, '', window.location.pathname);
    return result;
  }
  if (params.get('premium_cancelled') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
  }
  return null;
}

function readConnectReturnFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('connect_return') === '1' || params.get('connect_refresh') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }
  return false;
}

function readBookingPaymentReturnFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('booking_paid') === '1' && params.get('session_id') && params.get('booking_id')) {
    const result = {
      bookingId: params.get('booking_id'),
      sessionId: params.get('session_id'),
    };
    window.history.replaceState({}, '', window.location.pathname);
    return result;
  }
  if (params.get('booking_payment_cancelled') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
  }
  return null;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('home');
  const [view, setView] = useState('list');
  const [selectedHost, setSelectedHost] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [premiumReturn, setPremiumReturn] = useState(null);
  const [connectReturn, setConnectReturn] = useState(false);
  const [bookingPaymentReturn, setBookingPaymentReturn] = useState(null);

  useEffect(() => {
    const pending = readPremiumReturnFromUrl();
    if (pending) {
      setPremiumReturn(pending);
      setTab('add');
    }
    const connectPending = readConnectReturnFromUrl();
    if (connectPending) {
      setConnectReturn(true);
      setTab('profile');
    }
    const bookingPaymentPending = readBookingPaymentReturnFromUrl();
    if (bookingPaymentPending) {
      setBookingPaymentReturn(bookingPaymentPending);
      setTab('profile');
    }
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

  const handleUserUpdated = (updatedUser) => {
    setSession(prev => prev ? { ...prev, user: updatedUser } : prev);
  };

  const renderTab = () => {
    const userName = displayNameOf(session.user) !== session.user.email ? displayNameOf(session.user) : null;

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
            userName={userName}
            onCancel={() => setView('detail')}
            onBooked={() => setView('list')}
          />
        );
      }
      return <HomeScreen onSelectHost={(h) => { setSelectedHost(h); setView('detail'); }} />;
    }
    if (tab === 'add') {
      return (
        <AddPlantScreen
          userId={session.user.id}
          onPlantAdded={() => setRefreshKey(k => k + 1)}
          premiumReturn={premiumReturn}
          onPremiumReturnHandled={() => setPremiumReturn(null)}
        />
      );
    }
    if (tab === 'scan') return <ScanScreen />;
    if (tab === 'profile') {
      return (
        <ProfileScreen
          user={session.user}
          refreshKey={refreshKey}
          onSignOut={handleSignOut}
          onUserUpdated={handleUserUpdated}
          connectReturn={connectReturn}
          onConnectReturnHandled={() => setConnectReturn(false)}
          bookingPaymentReturn={bookingPaymentReturn}
          onBookingPaymentReturnHandled={() => setBookingPaymentReturn(null)}
        />
      );
    }
  };

  return (
    <div className="app-outer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#EDE7DA', padding: 40 }}>
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