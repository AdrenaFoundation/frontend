import { useState, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AiChatProps {
    userProfile?: UserProfileExtended | null;
    chartData?: {
        symbol: string;
        timeframe: string;
        currentPrice?: number;
        // Add other relevant chart data
    } | null;
    recentTrades?: {
        symbol: string;
        side: 'long' | 'short';
        entryPrice: number;
        exitPrice?: number;
        pnl?: number;
        timestamp: string;
    }[];
}

export function AiChat({ userProfile, chartData, recentTrades }: AiChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    // Only set initial message once
    useEffect(() => {
        if (initialized) return;

        let context = 'Hello, how may I help you today?';

        if (chartData) {
            context = `You are currently viewing the ${chartData.symbol} chart on ${chartData.timeframe} timeframe`;
            if (chartData.currentPrice) {
                context += `. Current price is $${chartData.currentPrice}`;
            }
        }

        if (recentTrades?.length) {
            context += `. Your last ${recentTrades.length} trades were:\n` +
                recentTrades.map(trade =>
                    `- ${trade.symbol} ${trade.side.toUpperCase()} at $${trade.entryPrice}` +
                    (trade.exitPrice ? ` (closed at $${trade.exitPrice}, PnL: $${trade.pnl})` : ' (open)')
                ).join('\n');
        }

        setMessages([{
            role: 'assistant',
            content: context
        }]);
        setInitialized(true);
    }, [initialized, chartData, recentTrades]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user' as const, content: input };
        setLoading(true);
        setError(null);

        // Add user message immediately and keep previous messages
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput(''); // Clear input early for better UX

        try {
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentInput,
                    context: {
                        chartData,
                        recentTrades,
                        userProfile: userProfile ? {
                            nickname: userProfile.nickname,
                            totalTradeVolumeUsd: userProfile.totalTradeVolumeUsd,
                            totalPnlUsd: userProfile.totalPnlUsd
                        } : null
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || 'Failed to get AI response');
            }

            // Add AI response to existing messages
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response
            }]);
        } catch (error) {
            console.error('AI chat error:', error);
            setError(error instanceof Error ? error.message : 'Failed to get AI response');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i}
                        className={`p-2 rounded-lg ${msg.role === 'user'
                            ? 'bg-blue-500/20 ml-auto border border-blue-500/30'
                            : 'bg-purple-500/10 border border-purple-500/30'
                            } max-w-[80%]`}
                    >
                        <div className="text-xs mb-1 font-medium">
                            {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        </div>
                        <p className="text-sm">{msg.content}</p>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask AI assistant..."
                        disabled={loading}
                        className="flex-1 bg-gray-800/50 rounded px-3 py-2 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
} 