export default function FactionsDocs() {
    return <div className="grid md:grid-cols-2 gap-2">
        <div className="flex flex-col gap-2 border p-4">
            <div className="font-archivoblack">Rewards</div>

            <div className="w-full h-[1px] bg-bcolor" />

            <div className="flex flex-col text-base gap-0.5">
                <div className="text-txtfade">Season 2 rewards are doubled: weekly rewards distributed every week, and seasonal rewards distributed at the end of the season.</div>

                <div className="text-txtfade">Unlike the previous season, where the prize pool was fixed and distributed at the end, Season 2 features a prize pool that unlocks progressively over 10 weeks.</div>
                <br />
                <div className="text-txtfade">To unlock rewards, damage the boss using mutagens. Each time a health bar drops, weekly ADX/JTO/BONK rewards are unlocked, along with seasonal ADX rewards. Kill the boss every week to unlock the full prize pool.</div>
            </div>
        </div>

        <div className="flex flex-col gap-2 border p-4">
            <div className="font-archivoblack">Officers</div>

            <div className="w-full h-[1px] bg-bcolor" />

            <div className="flex flex-col text-base gap-0.5">
                <div className="text-txtfade">Each team has 3 officers: a General, a Lieutenant, and a Sergeant.</div>
                <div className="text-txtfade">Officers have 3 weekly mutagen generation goals. Completing them increases the team&apos;s pillage percentage and activates mutagen self-referral.</div>
                <br />
                <div className="text-txtfade">Officers for the first week are chosen from the top 6 traders during the interseason.</div>
                <br />
                <div className="text-txtfade">Officer roles can change once per week, at the end of the week:</div>
                <div className="text-txtfade">→ The General role can be taken by the Lieutenant if the Lieutenant produces 2x the General&apos;s mutagen during the week.</div>
                <div className="text-txtfade">→ The Lieutenant role can be taken by the Sergeant if the Sergeant produces 3x the Lieutenant&apos;s mutagen during the week.</div>
                <div className="text-txtfade">→ The Sergeant role can be taken by any team member who produces 4x the Sergeant&apos;s mutagen during the week.</div>
            </div>
        </div>

        <div className="flex flex-col gap-2 border p-4">
            <div className="font-archivoblack">Pillage</div>

            <div className="w-full h-[1px] bg-bcolor" />

            <div className="flex flex-col text-base gap-0.5">
                <div className="text-txtfade">At the end of each week, a damage difference between the teams is calculated. The higher the difference, the more the leading team can pillage—up to 30%—if their officers met their weekly goals.</div>
                <br />
                <div className="text-txtfade font-bold underline">Example 1:</div>
                <div className="text-txtfade">Team JITO deals 200 mutagen damage, and team BONK deals 150.</div>
                <div className="text-txtfade">→ JITO dealt 33% more damage than BONK.</div>
                <div className="text-txtfade">→ JITO&apos;s officers met their weekly goals.</div>
                <div className="text-txtfade">→ Result: JITO pillages the full 30% of BONK&apos;s weekly rewards. These are added to JITO&apos;s own rewards, punishing BONK and rewarding JITO&apos;s performance.</div>
                <br />
                <div className="text-txtfade font-bold underline">Example 2:</div>
                <div className="text-txtfade">Team BONK deals 200 mutagen damage, and team JITO deals 150.</div>
                <div className="text-txtfade">→ BONK dealt 33% more damage than JITO.</div>
                <div className="text-txtfade">→ BONK&apos;s officers only met half of their weekly goals.</div>
                <div className="text-txtfade">→ Result: BONK pillages only 15% of JITO&apos;s weekly rewards instead of the full 30%, due to incomplete officer performance.</div>
                <br />
                <div className="text-txtfade font-bold underline">Example 3:</div>
                <div className="text-txtfade">Team JITO deals 230 mutagen damage, and team BONK deals 200.</div>
                <div className="text-txtfade">→ JITO dealt 15% more damage than BONK.</div>
                <div className="text-txtfade">→ JITO&apos;s officers met all their weekly goals.</div>
                <div className="text-txtfade">→ Result: JITO pillages 15% of BONK&apos;s weekly rewards. The pillage percentage matches the damage difference since all officer goals were completed.</div>
            </div>
        </div>
    </div>;
}
