export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Brak zdjęcia' });
    }

    const apiKey = process.env.PLANTNET_API_KEY;
    const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`;

    const formData = new FormData();
    const byteString = Buffer.from(imageBase64.split(',')[1], 'base64');
    const blob = new Blob([byteString], { type: 'image/jpeg' });
    formData.append('images', blob, 'plant.jpg');
    formData.append('organs', 'leaf');

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Błąd rozpoznawania' });
    }

    const best = data.results && data.results[0];
    if (!best) {
      return res.status(200).json({ name: null, confidence: 0 });
    }

    const name = best.species.commonNames?.[0] || best.species.scientificNameWithoutAuthor;
    const confidence = Math.round(best.score * 100);

    return res.status(200).json({ name, confidence });
  } catch (err) {
    return res.status(500).json({ error: 'Błąd serwera: ' + err.message });
  }
}