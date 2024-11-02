const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.generateContent = async (req, res) => {
  try {
    const { prompt, productData, contentType } = req.body;

    let systemPrompt = '';
    switch (contentType) {
      case 'description':
        systemPrompt = `You are a professional product description writer. Create a compelling, detailed, and SEO-friendly product description. Focus on benefits, features, and unique selling points.`;
        break;
      case 'seo':
        systemPrompt = `You are an SEO expert. Generate SEO-optimized content including:
1. Meta title (50-60 characters)
2. Meta description (150-160 characters)
3. Focus keywords (5-7 keywords)
4. SEO-optimized product description (300 words)`;
        break;
      case 'features':
        systemPrompt = `You are a product specialist. Create a clear, organized list of product features and specifications. Use bullet points and categorize features logically.`;
        break;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: prompt || `Generate ${contentType} content for the following product:\n${JSON.stringify(productData, null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    res.json({ content: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error generating AI content:', error);
    res.status(500).json({ 
      message: 'Error generating content',
      error: error.message 
    });
  }
}; 