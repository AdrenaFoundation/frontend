# Unified Adrena (ADX) Cross-Chain Tokenomics Proposal

## Goal
Maintain a single ADX token (bridged/interoperable) for governance + revenue sharing across both Solana and the new BTC chain.
Expand total supply from 1B → 2B over time, with new emissions tied to the new chain's growth (avoiding dilution of existing holders).
Align incentives so both chains contribute to the same ecosystem/value accrual ("two factories, one company")

## Key Mechanics

### 1. Supply Expansion & Emission Schedule

- **Total Supply Cap:** 2B ADX (1B original on Solana + 1B newly minted on the BTC chain)
- **Minting Triggers:** New ADX is minted *only* when the BTC chain achieves milestones (time + activity)
  - **Time-Based Unlock:** Linear vesting over 2 years (e.g., 5% of the new 1B unlocked monthly)
  - **Activity-Based Boost:** If the BTC chain reaches X% of Solana's revenue/TVL/trading volume, minting accelerates (e.g., 1.5x speed)
  - **Hard Cap:** No more than 1B ADX can ever be minted for the BTC chain

### 2. Revenue Sharing

- **Unified Pool:** All revenue from both chains flows into a single treasury
- **Distribution:**
  - Existing holders (Solana ADX) keep their % share of revs *until* new ADX is minted
  - New ADX minted on BTC chain gets a proportional share (e.g., if 200M new ADX are minted, rev-share becomes 1B old + 200M new = 16.6% to new holders)

### 3. Bridging & Interoperability

- Use a canonical bridge (e.g., Wormhole) or a wrapped ADX on the BTC chain with 1:1 mint/burn
- Governance votes apply cross-chain (e.g., Snapshot with multichain voting)

### 4. Investor Vesting

- New investors (BTC chain) can buy into future ADX emissions (e.g., purchase vested tokens that unlock as the chain grows)
- Example: An investor buys 10M ADX upfront, but tokens are minted/distributed over 12 months based on milestones

### 5. Governance

- Single DAO controlling parameters for both chains (emission speed, fee structures)
- Proposals can originate from either chain

## Why This Works

- **Fairness:** Existing holders aren't diluted until the new chain proves value
- **Alignment:** New chain participants must grow the pie to earn their share
- **Scalability:** Model can extend to additional chains in the future (e.g., +1B ADX per new chain)

## Potential Risks & Mitigations

### New Chain Fails to Grow
**Fix:** Emissions halt automatically if activity stagnates (e.g., <10% of Solana's metrics for 3 months)

### Bridging Security
**Fix:** Use battle-tested bridges + multisig for mint/burn

### Governance Centralization
**Fix:** Weight votes by ADX age (e.g., long-term holders get higher voting power)

## Next Steps

- **Quantify Metrics:** Define exact milestones (e.g., "BTC chain must hit $50M TVL to mint 100M ADX")
- **Smart Contracts:**
  - Minting logic with time/activity checks
  - Cross-chain revenue aggregation
- **Community Vote:** Propose to ADX holders with clear projections (show how their % rev-share evolves under optimistic/pessimistic scenarios)

---

## Technical Details

### 1. Core Emission Framework

**Total New Supply for BTC Chain:** 1B ADX (expanding total supply from 1B → 2B)

**Key Drivers:**
- **Time:** Linear vesting over 36 months (baseline)
- **Activity:**
  - **Boost:** Accelerate emissions if outperforming
  - **Slowdown:** Reduce emissions below baseline if underperforming
  - **Freeze:** Halt emissions if inactive

#### Base Formula (Time-Based Unlock)

```math
M_time(t) = (t / T_total) × 1B
```

Where:
- `t` = Months since BTC chain launch
- `T_total` = 36 months

**Example:** At 18 months, `500M ADX` is the *baseline*

### 2. Activity-Based Adjustment (Boost or Slowdown)

**Metrics:**
Track BTC chain's *30-day average* of:
- Revenue (fees)
- TVL (total value locked)
- Volume (trading activity)

Normalize to Solana's metrics:

```math
A(t) = (BTC_metric) / (Solana_metric)
```

#### Dynamic Adjustment Formula

```math
Adjustment(t) = 1 + (A(t) - A_target)
```

Where `A_target` = Threshold for "good" performance (e.g., 100% of Solana's metrics)

**Behavior:**
- If `A(t) == A_target`: Baseline Emissions
  - Example: `A(t) = 1.0` (100%) → `Adjustment = 1 + (1.0 - 1) = 1x`
- If `A(t) > A_target`: Emissions *accelerate* (up to 2x cap)
  - Example: `A(t) = 1.4` (140%) → `Adjustment = 1 + (1.4 - 1) = 1.4x`
- If `A(t) < A_target`: Emissions *slow down* (can drop below baseline)
  - Example: `A(t) = 0.5` (50%) → `Adjustment = 1 + (0.5 - 1) = 0.5x`
- If `A(t) < A_min` (e.g., 5%): Emissions *freeze* (`Adjustment = 0`)

**Final Emissions:**

```math
M_total(t) = min( M_time(t) × Adjustment(t), 1B )
```

### 3. Staggered Vesting for Investors

Investors unlock tokens *only if emissions occur*:

```math
Investor_unlock(t) = Investor_allocation × (M_total(t) / 1B)
```

**Penalty for Slowdown:** If emissions drop to 60% of baseline, investors unlock 60% of their allocation

### 4. Freeze & Burn Safeguards

- **Freeze:** Emissions pause if `A(t) < A_min` for 1 month
- **Burn:** If frozen for >6 months, unvested ADX (e.g., `1B - M_total(t)`) is burned

### 5. Example Simulations

| Scenario                | Activity (`A(t)`) | Adjustment | Emissions (vs. Baseline) |
|------------------------|-------------------|------------|-------------------------|
| **Outperforming**      | 140% of Solana    | 1.4x       | 700M (vs. 500M at 18 mo)|
| **Regular Performance**| 100% of Solana    | 1.0x       | 500M (vs. 500M at 18 mo)|
| **Underperforming**    | 10% of Solana     | 0.2x       | 100M (vs. 500M at 18 mo)|
| **Inactive**           | 3% of Solana      | 0x (freeze)| 0M                      |

### 6. Parameter Tuning

| Parameter  | Description                    | Value          |
|------------|--------------------------------|----------------|
| `A_target` | "Good performance" threshold   | 100% of Solana |
| `A_min`    | Freeze threshold               | 5% of Solana   |

## Key Summary

- **Two-Way Adjustments:** Rewards growth *and* penalizes stagnation proportionally
- **Stronger Safety Nets:** Freeze + burn unvested supply if chain fails
- **Investor Alignment:** Vesting slows down automatically with emissions
