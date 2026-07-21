export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plantName, sunlight } = req.body;
    if (!plantName || !sunlight) {
      return res.status(400).json({ error: 'Brak nazwy rośliny lub poziomu nasłonecznienia' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    const prompt = `Jesteś ekspertem od pielęgnacji roślin domowych. Użytkownik ma roślinę: "${plantName}", a poziom nasłonecznienia w jego mieszkaniu to: "${sunlight}".

Napisz krótki, konkretny przewodnik pielęgnacji po polsku, w formacie:
- Podlewanie: [konkretna częstotliwość, różna latem/zimą jeśli to ważne]
- Światło: [czy ten poziom światła jest odpowiedni dla tej rośliny, i co zrobić jeśli nie]
- Wilgotność: [konkretna wskazówka]
- Nawożenie: [kiedy i jak często]
- Częsty problem: [jeden najczęstszy problem z tym gatunkiem i jak go rozpoznać/uniknąć]

Bądź konkretny i zwięzły, максимум 120 słów łącznie. Nie dodawaj wstępu ani podsumowania, tylko te pięć punktów.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Błąd generowania porady' });
    }

    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ guide: text });
  } catch (err) {
    return res.status(500).json({ error: 'Błąd serwera: ' + err.message });
  }
}