import axios from 'axios';

// OpenAI API service
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Process an image with GPT-4-vision to extract information
 * @param {string} base64Image - Base64 encoded image
 * @param {Array} fieldsToExtract - Array of fields to extract from the document
 * @returns {Promise} - Promise with the extracted data
 */
export const extractInformationFromImage = async (base64Image, fieldsToExtract) => {
  try {
    // Construct the fields string for the prompt
    const fieldsString = fieldsToExtract.map(field => field.name).join(', ');
    
    // Create the system prompt
    const systemPrompt = `あなたは日本語の不動産書類から情報を抽出する専門家です。与えられた画像から以下の情報を抽出してください: ${fieldsString}. 
    JSONフォーマットで回答してください。例: {"フィールド名": "値"}`;
    
    // Prepare the API request payload
    const payload = {
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この画像から指定された情報を抽出してください。"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    };

    // Call the OpenAI API
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    // Parse the JSON response from content
    const content = response.data.choices[0].message.content;
    let extractedData = {};
    
    try {
      // Try to parse as JSON
      extractedData = JSON.parse(content);
    } catch (error) {
      // If it's not valid JSON, try to extract JSON pattern
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[0]);
        } catch (error) {
          console.error('Failed to parse extracted JSON:', error);
        }
      }
    }
    
    return extractedData;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

export default {
  extractInformationFromImage
}; 