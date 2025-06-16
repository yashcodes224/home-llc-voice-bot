exports.handler = async function (event) {
    const { input } = JSON.parse(event.body);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2-5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Act as a candidate for Home.LLC’s AI Agent Team. Answer professionally with a friendly tone: ${input}`
            }]
          }],
        }),
      });
      const data = await response.json();
      const reply = data.candidates[0].content.parts[0].text;
      return {
        statusCode: 200,
        body: JSON.stringify({ response: reply }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ response: 'Sorry, there was an error processing your request.' }),
      };
    }
  };