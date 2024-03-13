function capitalizeFirstLetter(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Utility function to be able to generate short column name automatically
// from attribute name
//
// i.e
// swapUsd -> swap
// addLiquidityUsd -> add liq.
export default function abbreviateWords(input: string) {
  // Words to abreviate
  const mapping = {
    Usd: '',
    Liquidity: 'Liq.',
    Position: 'Pos.',
    Contributor: '',
  };

  return (
    input
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters to separate words
      .trim() // Remove any leading/trailing whitespace
      .split(' ') // Split the string into an array of words
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((word: string) => (mapping as any)[word] ?? word) // Map each word to its abbreviation if it exists
      .map(capitalizeFirstLetter)
      .join(' ') // Join the words back into a string
      .trim()
  ); // Ensure no leading/trailing whitespace
}
