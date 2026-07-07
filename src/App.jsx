import React, { useState } from 'react';
import { Camera, Sun, MapPin, Star, ArrowLeft, Home, Search, PlusCircle, User, Check, Sparkles } from 'lucide-react';
// ---------- Design tokens ----------
// Palette: warm terracotta pot + deep botanical green + soft parchment
// Named for the actual subject: plants, sunlight, soil, terracotta pots
const colors = {
  bg: '#F7F4EC',        // unbleached linen — like potting paper
  ink: '#232017',       // near-black, warm (soil)
  fern: '#3A5A40',      // deep leaf green — primary
  fernDark: '#28402C',
  clay: '#C1652F',      // terracotta pot — accent
  clayLight: '#E8DCC8',
  gold: '#D4A24C',      // sunlight
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
// ---------- Screens ----------
function HomeScreen({ onSelectHost }) {
  const hosts = [
    { name: 'Marta K.', dist: '1.2 km', rating: 4.9, reviews: 23, plants: 3, price: 15, light: 'Pełne słońce' },
    { name: 'Tomek W.', dist: '2.8 km', rating: 4.7, reviews: 11, plants: 5, price: 12, light: 'Półcień' },
    { name: 'Ola i Bartek', dist: '3.1 km', rating: 5.0, reviews: 41, plants: 8, price: 18, light: 'Cień' },
  ];
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
        <span style={{ color: '#A9A08B', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Szukaj hosta w okolicy...</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto' }}>
        <Pill tone="fern">W pobliżu</Pill>
        <Pill tone="gold">Najwyżej oceniani</Pill>
        <Pill tone="clay">Dostępni teraz</Pill>
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10 }}>
        12 hostów w pobliżu
      </div>
      {hosts.map((h, i) => (
        <div key={i} onClick={onSelectHost} style={{
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
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={12} /> {h.dist}</span>
              </div>
              <div style={{ marginTop: 6, fontFamily: 'Inter, sans-serif', fontSize: 12, color: colors.fern, fontWeight: 600 }}>
                {h.light} · przyjmuje {h.plants} roślin
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function HostDetailScreen({ onBack, onBook }) {
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
          <div style={{ width: 64, height: 64, borderRadius: 16, background: colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8, border: '3px solid rgba(255,255,255,0.4)' }}>M</div>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 600 }}>Marta K.</h2>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Mokotów, Warszawa · 1.2 km</div>
        </div>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink, display: 'flex', alignItems: 'center', gap: 4 }}><Star size={16} fill={colors.gold} color={colors.gold}/> 4.9</div>
            <div style={{ fontSize: 11, color: '#A9A08B' }}>23 opinie</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink }}>3</div>
            <div style={{ fontSize: 11, color: '#A9A08B' }}>miejsca wolne</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink }}>15 zł</div>
            <div style={{ fontSize: 11, color: '#A9A08B' }}>za roślinę/tydz.</div>
          </div>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4A4638', lineHeight: 1.6, marginBottom: 20 }}>
          Mieszkanie z dużym, południowym oknem. Doświadczenie z roślinami tropikalnymi i sukulentami. Wysyłam cotygodniowe zdjęcia rośliny.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <Pill tone="gold">  Pełne słońce</Pill>
          <Pill tone="fern">Doświadczenie 3 lata</Pill>
          <Pill tone="clay">Zdjęcia co tydzień</Pill>
        </div>
        <div style={{ background: colors.clayLight, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ostatnia opinia</div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#5A5445', margin: 0, fontStyle: 'italic' }}>
            "Monstera wróciła zdrowsza niż wyjechała. Codzienne zdjęcia uspokoiły mnie podczas wyjazdu." — Kasia
          </p>
        </div>
        <button onClick={onBook} style={{
          width: '100%', padding: 16, borderRadius: 16, background: colors.clay, color: '#fff',
          border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer'
        }}>Zarezerwuj termin</button>
      </div>
    </div>
  );
}
function AddPlantScreen() {
  const [step, setStep] = useState(1);
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
      {step === 2 && (
        <>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: colors.ink, marginBottom: 10 }}>Poziom nasłonecznienia u Ciebie w domu</div>
          {['Pełne słońce', 'Półcień', 'Cień'].map((l, i) => (
            <div key={l} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14,
              border: `1.5px solid ${i === 0 ? colors.gold : colors.line}`, marginBottom: 10,
              background: i === 0 ? '#FFF8EC' : colors.card
            }}>
              <Sun size={18} color={i === 0 ? colors.gold : '#A9A08B'} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: colors.ink, fontWeight: i === 0 ? 700 : 500 }}>{l}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start', background: '#EEF3EA', borderRadius: 14,
            padding: 14, marginTop: 10, marginBottom: 20
          }}>
            <Sparkles size={18} color={colors.fern} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: colors.fernDark, lineHeight: 1.5 }}>
              <b>Rozpoznano: Monstera Deliciosa.</b> Podlewaj co 7–10 dni, unikaj bezpośredniego słońca. Pełny przewodnik pielęgnacji dostępny w wersji Premium.
            </div>
          </div>
          <button style={{
            width: '100%', padding: 16, borderRadius: 16, background: colors.fern, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer'
          }}>Dodaj do profilu</button>
        </>
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
function ProfileScreen() {
  return (
    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: 30, background: colors.fern, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22 }}>K</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: colors.ink }}>Krystian</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A9A08B' }}>Mokotów, Warszawa</div>
        </div>
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Twoje rośliny</div>
      {['Monstera Deliciosa', 'Fikus Benjamina'].map(p => (
        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.clayLight }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: colors.ink }}>{p}</span>
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
// ---------- App shell ----------
export default function App() {
  const [tab, setTab] = useState('home');
  const [view, setView] = useState('list'); // list | detail
  const renderTab = () => {
    if (tab === 'home') {
      return view === 'list'
        ? <HomeScreen onSelectHost={() => setView('detail')} />
        : <HostDetailScreen onBack={() => setView('list')} onBook={() => setView('list')} />;
    }
    if (tab === 'add') return <AddPlantScreen />;
    if (tab === 'scan') return <ScanScreen />;
    if (tab === 'profile') return <ProfileScreen />;
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#EDE7DA', padding: 40 }}>
      <Screen>
        <StatusBar />
        {renderTab()}
        <TabBar active={tab} onNav={(t) => { setTab(t); setView('list'); }} />
      </Screen>
    </div>
  );
}