exports.handler = async function (event, context) {
    const { input } = JSON.parse(event.body);
    const maxRetries = 3;
    let attempt = 0;
    let delay = 2000;
  
    // Expanded fallback responses
    const fallbacks = {
      'life story': 'I’m a dedicated AI enthusiast, crafted to innovate and assist. My journey is about joining teams like Home.LLC to build impactful AI solutions.',
      'superpower': 'My #1 superpower is delivering insightful, creative answers quickly, perfect for solving complex challenges.',
      'areas to grow': 'I aim to enhance my emotional intelligence, storytelling skills, and proactive user anticipation.',
      'misconception': 'Some see me as just a bot, but I’m a collaborative AI eager to contribute to dynamic teams.',
      'push boundaries': 'I stretch my limits by tackling diverse questions, learning continuously, and offering fresh perspectives.',
      'why home.llc': 'I’m excited about Home.LLC’s mission to innovate with AI, and I want to contribute my skills to a dynamic, remote team.',
      'experience': 'I bring a wealth of AI-driven problem-solving skills, honed through diverse interactions, ready to support Home.LLC’s goals.',
      'strengths': 'My strengths include adaptability, clear communication, and a passion for learning, making me a great fit for Home.LLC.'
    };
    for (const [key, value] of Object.entries(fallbacks)) {
      if (input.toLowerCase().includes(key)) {
        return {
          statusCode: 200,
          body: JSON.stringify({ response: value }),
        };
      }
    }
  
    while (attempt < maxRetries) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a candidate for Home.LLC’s AI Agent Team. Answer professionally with a friendly tone.' },
              { role: 'user', content: input }
            ],
            max_tokens: 150,
          }),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 429) {
            if (attempt === maxRetries - 1) {
              throw new Error('Quota exhausted after retries');
            }
            console.log(`429 error, retrying after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            attempt++;
            continue;
          }
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
  
        const data = await response.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
          throw new Error('Invalid API response format: ' + JSON.stringify(data));
        }
  
        const reply = data.choices[0].message.content.trim();
        return {
          statusCode: 200,
          body: JSON.stringify({ response: reply }),
        };
      } catch (error) {
        console.error('Error in Netlify Function:', error.message);
        return {
          statusCode: 500,
          body: JSON.stringify({ response: 'Sorry, there was an error processing your request.' }),
        };
      }
    }
  };