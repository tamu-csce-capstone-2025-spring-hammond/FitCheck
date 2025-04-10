// pages/api/virtual-try-on.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { personImageUrl, clothingImageUrl } = req.body;

    // Prepare payload for the Hugging Face space API
    const payload = {
      data: [{ path: personImageUrl }, { path: clothingImageUrl }, 0, true],
    };

    // Call the Kolors Virtual Try-On API
    const response = await fetch('https://kwai-kolors-kolors-virtual-try-on.hf.space/call/tryon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    const eventId = data.event_id;

    // Get the result using event ID
    const resultResponse = await fetch(
      `https://kwai-kolors-kolors-virtual-try-on.hf.space/call/tryon/${eventId}`
    );

    // Process the streaming response
    const reader = resultResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let resultUrl = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].startsWith('event:')) {
          const event = lines[i].split('event: ')[1];
          const eventData = JSON.parse(lines[i + 1].split('data: ')[1]);

          if (event === 'complete' && eventData && eventData[0]) {
            resultUrl = eventData[0].url;
            break;
          } else if (event === 'error') {
            throw new Error('Virtual try-on process failed');
          }
        }
      }

      if (resultUrl) break;
      buffer = lines[lines.length - 1];
    }

    if (!resultUrl) {
      throw new Error('No result URL found in the response');
    }

    return res.status(200).json({ resultUrl });
  } catch (error) {
    console.error('Error in virtual try-on process:', error);
    return res.status(500).json({ error: error.message });
  }
}