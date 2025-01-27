export function generateUserColor(identifier: string): string {
    // List of pleasant, distinct colors
    const colors = [
        'text-blue-400', 'text-purple-400', 'text-green-400',
        'text-pink-400', 'text-yellow-400', 'text-cyan-400'
    ];

    // Simple hash function to get consistent color for each user
    const hash = identifier.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
} 