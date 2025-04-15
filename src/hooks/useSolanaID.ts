import { useEffect, useState } from "react";
import { z } from "zod";

import { SolanaIDType } from "@/types";

// Match the API response
const SolanaIDSchema = z.object({
  solidUser: z.object({
    // solidScore: z.number(),
    tierGroup: z.enum(["tier_1", "tier_2", "tier_3", "tier_4"]),
    isSolanaIdUser: z.boolean().optional().nullable(),
  }),
});

const useSolanaID = ({
  walletAddress,
}: {
  walletAddress: string | null;
}): {
  data: SolanaIDType | null;
  loading: boolean;
  error: string | null;
} => {
  const [data, setData] = useState<SolanaIDType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress === null) {
      setData(null);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_SOLANA_ID_API_KEY;

    if (!apiKey) {
      console.error("API key is not set");
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://score.solana.id/api/solid-score/address/${walletAddress}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
          },
        );

        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          return null;
        }

        const json = await response.json();

        if (json === null) {
          setData(null);
          return;
        }

        const parsed = SolanaIDSchema.safeParse(json);

        // Enforce the API answer
        if (!parsed.success) {
          console.log(
            "SOLANA ID API response does not match schema",
            parsed.error,
          );
          setData(null);
          return;
        }

        if (parsed.data.solidUser.isSolanaIdUser) {
          setData(parsed.data);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [walletAddress]);

  return { data, loading, error };
};

export default useSolanaID;
