export default function FactionsDocs() {
    return <div className="grid md:grid-cols-2 gap-2">
        <div className="flex flex-col gap-2 border p-4">
            <div className="font-archivoblack">Overall Concept</div>

            <div className="w-full h-[1px] bg-bcolor" />

            <div className="flex flex-col text-base gap-0.5">
                <div className="text-txtfade">The season 2 rewards are double. Weekly rewards that are given every week and seasonal rewards that are given at the end of the season.</div>

                <div className="text-txtfade">Unlike previous season, where the prize pool was fixed and distributed at season ends, the Season 2 prize pool is about rewards to be unlocked each week for 10 weeks.</div>
                <br />
                <div className="text-txtfade">To unlock the rewards damage the boss with mutagens. At each health bar going down, weekly ADX/JTO/BONK rewards are unlocked and ADX seasonal rewards. Kill the boss every week and unlock MAX PRIZE POOL.</div>
            </div>
        </div>

        <div className="flex flex-col gap-2 border p-4">
            <div className="font-archivoblack">Rewards</div>

            <div className="w-full h-[1px] bg-bcolor" />

            <div className="flex flex-col text-base gap-0.5">
                <div className="text-txtfade">The season 2 rewards are double. Weekly rewards that are given every week and seasonal rewards that are given at the end of the season.</div>

                <div className="text-txtfade">Unlike previous season, where the prize pool was fixed and distributed at season ends, the Season 2 prize pool is about rewards to be unlocked each week for 10 weeks.</div>
                <br />
                <div className="text-txtfade">To unlock the rewards damage the boss with mutagens. At each health bar going down, weekly ADX/JTO/BONK rewards are unlocked and ADX seasonal rewards. Kill the boss every week and unlock MAX PRIZE POOL.</div>
            </div>
        </div>

        <div className="flex flex-col gap-2 border p-4">
            <div className="font-archivoblack">Officers</div>

            <div className="w-full h-[1px] bg-bcolor" />

            <div className="flex flex-col text-base gap-0.5">
                <div className="text-txtfade">Each team has 3 officer, a general, a lieutenant and a sergeant.</div>
                <div className="text-txtfade">Officers have 3 weekly mutagen generation goals that unlocks higher team's pillage percentage and self mutagen-referral.</div>
                <br />
                <div className="text-txtfade">Season's first week officer are picked from the TOP 6 traders during interseason.</div>
                <br />
                <div className="text-txtfade">Officer can change once a week, at week end:</div>
                <div className="text-txtfade">→ General seat can be overtaken by Lieutenant, if the Lieutenant does 2x the General's mutagen during the week.</div>
                <div className="text-txtfade">→ Lieutenant seat can be overtaken by Sergeant, if the Sergeant does 3x the Lieutenant's mutagen during the week.</div>
                <div className="text-txtfade">→ Sergeant seat can be overtaken by any member of their team, if the team member does 4x the Sergeant's mutagen during the week.</div>
            </div>
        </div>

        <div className="flex flex-col gap-2 border p-4">
            <div className="font-archivoblack">Pillage</div>

            <div className="w-full h-[1px] bg-bcolor" />

            <div className="flex flex-col text-base gap-0.5">
                <div className="text-txtfade">At the end of each week. A differential of damage is calculated between teams. The bigger the differential the more the team doing more damage than the other can pillage, up to 0% to 30%, depending on the officer of that team meeting theirs weekly target.</div>
                <br />
                <div className="text-txtfade font-boldy underline">Example 1:</div>
                <div className="text-txtfade">Team JITO does 200 mutagen damage, and team BONK does 150 mutagen damage.</div>
                <div className="text-txtfade">→ JITO dealt 33% more damage than BONK.</div>
                <div className="text-txtfade">→ JITO's officers met their weekly goals.</div>
                <div className="text-txtfade">→ Result: JITO pillages the full 30% of BONK’s weekly rewards. These are added to JITO’s own weekly rewards, punishing BONK and rewarding JITO’s outperformance.</div>
                <br />
                <div className="text-txtfade font-boldy underline">Example 2:</div>
                <div className="text-txtfade">Team BONK does 200 mutagen damage, and team JITO does 150 mutagen damage.</div>
                <div className="text-txtfade">→ BONK dealt 33% more damage than JITO.</div>
                <div className="text-txtfade">→ BONK’s officers only met half of their weekly goals.</div>
                <div className="text-txtfade">→ Result: BONK pillages 15% of JITO’s weekly rewards instead of the full 30%, due to incomplete officer performance.</div>
                <br />
                <div className="text-txtfade font-boldy underline">Example 3:</div>
                <div className="text-txtfade">Team JITO does 230 mutagen damage, and team BONK does 200 mutagen damage.</div>
                <div className="text-txtfade">→ JITO dealt 15% more damage than BONK.</div>
                <div className="text-txtfade">→ JITO’s officers met all their weekly goals.</div>
                <div className="text-txtfade">→ Result: JITO pillages 15% of BONK’s weekly rewards. The pillage percentage matches the damage difference since all officer goals were completed.</div>
            </div>
        </div>
    </div>;
}