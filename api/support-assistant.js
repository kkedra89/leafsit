// api/support-assistant.js
// Asystent wsparcia klienta oparty o Claude Haiku, z twardą, słowną eskalacją do człowieka.

const ESCALATION_KEYWORDS = [
  'kradzież', 'kradziez', 'ukradł', 'ukradl', 'skradzion',
  'zniszczon', 'zniszczył', 'zniszczyl', 'uszkodz',
  'boję się', 'boje sie', 'przestraszo', 'zagrożo', 'zagrozo',
  'nie odpowiada', 'nie mogę się dostać', 'nie moge sie dostac',
  'oszust', 'wyłudz', 'wyludz', 'nabra',
  'chcę rozmawiać z człowiekiem', 'chce rozmawiac z czlowiekiem',
  'chcę człowieka', 'chce czlowieka', 'prawdziwą osobą', 'prawdziwa osoba',
  'policj', 'reklamacj', 'pozew', 'prawnik',
];

const SYSTEM_PROMPT = `Jesteś pomocnym asystentem wsparcia klienta aplikacji Leafsit — platformy łączącej właścicieli roślin doniczkowych z opiekunami na czas wyjazdu.

Odpowiadaj krótko (maks. 3-4 zdania), rzeczowo, po polsku, w przyjaznym, ciepłym tonie.

Najczęstsze pytania i odpowiedzi:
- Jak zarezerwować: wejdź w "Szukaj", wybierz hosta, kliknij "Zarezerwuj", wybierz rośliny i termin.
- Jak anulować rezerwację: w Profilu, w sekcji "Twoje rezerwacje" — przycisk "Anuluj" (przed opłaceniem) lub "Anuluj i zwróć płatność" (po opłaceniu, tylko przed terminem).
- Jak zostać hostem: w Profilu, przycisk "Zarabiaj na wolnym miejscu w domu", wypełnij formularz z ceną i opisem.
- Jak działają płatności: przez Stripe; host otrzymuje 90% ceny, 10% to prowizja platformy; wypłata następuje po zaakceptowaniu rezerwacji i jej opłaceniu.
- Jak działa funkcja Premium: jednorazowa opłata 9 zł za spersonalizowany przewodnik pielęgnacyjny generowany przez AI, dostępna przy dodawaniu rośliny.
- Problemy z logowaniem: zaproponuj wylogowanie i ponowne zalogowanie.

Jeśli pytanie wykracza poza Twoją wiedzę o aplikacji, dotyczy sporu między użytkownikami, zwrotu pieniędzy poza standardową ścieżką, lub użytkownik jest wyraźnie sfrustrowany — nie zgaduj i nie obiecuj niczego w imieniu firmy. Zamiast tego jasno powiedz, że przekażesz sprawę zespołowi.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history, userEmail } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message' });
    }

    const lower = message.toLowerCase();
    const escalate = ESCALATION_KEYWORDS.some((kw) => lower.includes(kw));

    if (escalate) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Leafsit <onboarding@resend.dev>',
            to: 'krystian.kedra@icloud.com',
            subject: 'Pilne zgłoszenie wsparcia — Leafsit',
            text: `Użytkownik (${userEmail || 'brak adresu'}) napisał do asystenta wsparcia:\n\n"${message}"\n\nTa wiadomość została automatycznie oznaczona jako pilna. Sprawdź panel Supabase (tabela support_messages) i odpowiedz bezpośrednio do użytkownika.`,
          }),
        });
      } catch (emailError) {
        console.error('Nie udało się wysłać maila eskalacyjnego:', emailError);
      }

      return res.status(200).json({
        reply:
          'Przekazuję Twoje zgłoszenie bezpośrednio do zespołu Leafsit — odezwiemy się jak najszybciej, zwykle w ciągu kilku godzin. Jeśli to sytuacja zagrażająca bezpieczeństwu, rozważ też kontakt z odpowiednimi służbami.',
        escalated: true,
      });
    }

    const conversationHistory = Array.isArray(history)
      ? history.slice(-8).map((h) => ({
          role: h.sender === 'user' ? 'user' : 'assistant',
          content: h.content,
        }))
      : [];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [...conversationHistory, { role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(200).json({
        reply: 'Przepraszam, mam teraz problem z odpowiedzią. Spróbuj ponownie za chwilę.',
        escalated: false,
      });
    }

    const data = await response.json();
    const reply =
      data?.content?.[0]?.text ||
      'Przepraszam, nie udało się wygenerować odpowiedzi. Spróbuj ponownie.';

    return res.status(200).json({ reply, escalated: false });
  } catch (error) {
    console.error('Support assistant error:', error);
    return res.status(500).json({ error: 'Wystąpił błąd. Spróbuj ponownie.' });
  }
}
