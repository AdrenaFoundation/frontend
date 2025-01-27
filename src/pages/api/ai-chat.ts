import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// DeepSeek API endpoint
const API_URL = 'https://api.deepseek.com/v1/chat/completions';  // Back to original endpoint
const API_KEY = process.env.DEEPSEEK_API_KEY;

if (!API_KEY) {
    throw new Error('DeepSeek API key is missing. Please check your .env file.');
}

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, context } = req.body;

    try {
        // Create system message with context
        let systemMessage = "You are a helpful crypto trading assistant answering questions about the crypto market, offering crypto trade ideas and strategies. You answer in a short and concise manner. Provide a single trade idea at a time, and focus on the currently displayed chart.";
        systemMessage += `The user is currently viewing ${context.chartData.symbol} chart on ${context.chartData.timeframe} timeframe. `;

        const response = await axios.post(API_URL, {
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 1000
        }, {
            headers,
            validateStatus: (status) => status < 500
        });

        console.log('API Response:', response.status, response.data); // Debug logging

        if (response.status === 200 && response.data?.choices?.[0]?.message?.content) {
            res.status(200).json({
                response: response.data.choices[0].message.content
            });
        } else {
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        console.error('DeepSeek API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            error: 'Failed to get AI response',
            details: errorMessage
        });
    }
} 