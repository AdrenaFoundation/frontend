import 'tippy.js/dist/tippy.css';

export default function FactionsDocs({
  showLegacySections = true,
}: {
  showLegacySections?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {showLegacySections && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 border border-[#333] rounded-md p-5 hover:border-[#444] transition-colors">
            <div className="flex items-center gap-2">
              <div className="text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 3.75V6a4.5 4.5 0 01-9 0V3.75m9 0h2.25A2.25 2.25 0 0120.25 6c0 3.728-2.94 6.75-6.75 6.75S6.75 9.728 6.75 6A2.25 2.25 0 019 3.75h7.5zm-9 0V6a4.5 4.5 0 009 0V3.75M12 15v4.5m0 0h3.75m-3.75 0H8.25"
                  />
                </svg>
              </div>
              <div className="font-bold text-lg text-white">Rewards</div>
            </div>

            <div className="w-full h-[1px] bg-[#333]" />

            <div className="flex flex-col text-base gap-2">
              <div className="text-[#bbb] leading-relaxed">
                Season 2 rewards are{' '}
                <span className="text-yellow-400 font-bold">DOUBLED</span>—earn
                weekly payouts plus massive end-of-season bonuses!
              </div>

              <div className="text-[#bbb] leading-relaxed">
                Unlike Season 1&apos;s fixed prize pool, Season 2 features a
                dynamic prize pool that unlocks progressively across 10
                action-packed weeks.
              </div>

              <div className="text-[#bbb] leading-relaxed">
                Attack the boss with mutagens to unlock rewards. Each health bar
                you destroy releases weekly ADX/JTO/BONK rewards and seasonal
                ADX bonuses. Defeat the boss every week to claim the full prize
                pool!
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border border-[#333] rounded-md p-5 hover:border-[#444] transition-colors">
            <div className="flex items-center gap-2">
              <div className="text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
                    clipRule="evenodd"
                  />
                  <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                </svg>
              </div>
              <div className="font-bold text-lg text-white">Officers</div>
            </div>

            <div className="w-full h-[1px] bg-[#333]" />

            <div className="flex flex-col text-base gap-2">
              <div className="text-[#bbb] leading-relaxed">
                Each faction has 3 commanding officers: a{' '}
                <span className="text-blue-400">General</span>, a{' '}
                <span className="text-blue-300">Lieutenant</span>, and a{' '}
                <span className="text-blue-200">Sergeant</span>.
              </div>

              <div className="text-[#bbb] leading-relaxed">
                Officers must complete 3 weekly mutagen generation targets to
                maximize their team&apos;s pillage potential and activate
                powerful mutagen self-referrals.
              </div>

              <div className="text-[#bbb] leading-relaxed">
                First week officers are selected from the top 6 traders during
                interseason.
              </div>

              <div className="text-[#bbb] leading-relaxed mt-1">
                Leadership can change weekly through a ruthless promotion
                system:
              </div>
              <div className="text-[#bbb] leading-relaxed pl-4">
                → Lieutenants who generate{' '}
                <span className="text-blue-300 font-regular">2×</span> their
                General&apos;s mutagen seize command.
              </div>
              <div className="text-[#bbb] leading-relaxed pl-4">
                → Sergeants who produce{' '}
                <span className="text-blue-300 font-regular">3×</span> their
                Lieutenant&apos;s mutagen earn promotion.
              </div>
              <div className="text-[#bbb] leading-relaxed pl-4">
                → Any faction member generating{' '}
                <span className="text-blue-300 font-regular">4×</span> their
                Sergeant&apos;s mutagen claims the officer role.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border border-[#333] rounded-md p-5 hover:border-[#444] transition-colors">
            <div className="flex items-center gap-2">
              <div className="text-[#cec161f0]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="font-bold text-lg text-white">Weekly Trading</div>
            </div>

            <div className="w-full h-[1px] bg-[#333]" />

            <div className="flex flex-col text-base gap-2">
              <div className="text-[#bbb] leading-relaxed">
                Only trades that are both{' '}
                <span className="text-yellow-400 font-bold">
                  opened AND closed
                </span>{' '}
                within the same weekly period (
                <span className="text-yellow-400 font-regular">
                  Saturday 12:00:00 AM UTC to Friday 11:59:59 PM UTC
                </span>
                ) will count toward that week&apos;s mutagen generation and
                leaderboard rankings.
              </div>

              <div className="text-[#bbb] leading-relaxed">
                Trades carried over from previous weeks or left open at
                week&apos;s end will{' '}
                <span className="text-red-400">not contribute</span> to your
                weekly score. Plan your trading strategy accordingly to maximize
                your impact!
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border border-[#333] rounded-md p-5 hover:border-[#444] transition-colors">
            <div className="flex items-center gap-2">
              <div className="text-[#e47dbb]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12V6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25V12m-19.5 0v4.5A2.25 2.25 0 004.5 18.75h15a2.25 2.25 0 002.25-2.25V12m-19.5 0h19.5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 12V9.75A2.25 2.25 0 019 7.5h6a2.25 2.25 0 012.25 2.25V12"
                  />
                </svg>
              </div>
              <div className="font-bold text-lg text-white">Pillage</div>
            </div>

            <div className="w-full h-[1px] bg-[#333]" />

            <div className="flex flex-col text-base gap-2">
              <div className="text-[#bbb] leading-relaxed">
                After each battle week, damage differential determines pillage
                potential. The dominant team can raid up to{' '}
                <span className="text-white font-regular">30%</span> of enemy
                rewards—if their officers fulfilled their weekly mutagen
                generation targets.
              </div>

              <div className="p-3 rounded-md mt-1 border border-[#222]">
                <div className="text-white mb-1">Example 1: Total Victory</div>
                <div className="text-[#bbb] leading-relaxed">
                  Team <span className="text-[#5AA6FA] font-regular">JITO</span>
                  : <span className="text-[#e47dbb]">200</span> mutagen damage |
                  Team <span className="text-[#FA6724] font-regular">BONK</span>
                  : <span className="text-[#e47dbb]">150</span> mutagen damage
                </div>
                <div className="text-[#bbb] leading-relaxed pl-4">
                  → <span className="text-[#5AA6FA] font-regular">JITO</span>
                  &apos;s <span className="text-white font-regular">33%</span>{' '}
                  damage advantage + completed officer goals giving a max cap of{' '}
                  <span className="text-white font-regular">30%.</span>
                </div>
                <div className="text-[#bbb] leading-relaxed pl-4">
                  → Result:{' '}
                  <span className="text-[#5AA6FA] font-regular">JITO</span>{' '}
                  seizes the maximum{' '}
                  <span className="text-white font-regular">30%</span> of{' '}
                  <span className="text-[#FA6724] font-regular">BONK</span>
                  &apos;s weekly rewards, adding them to their own treasure
                  hoard.
                </div>
              </div>

              <div className="p-3 rounded-md mt-1 border border-[#222]">
                <div className="text-white mb-1">
                  Example 2: Partial Success
                </div>
                <div className="text-[#bbb] leading-relaxed">
                  Team <span className="text-[#FA6724] font-regular">BONK</span>
                  : <span className="text-[#e47dbb]">200</span> mutagen damage |
                  Team <span className="text-[#5AA6FA] font-regular">JITO</span>
                  : <span className="text-[#e47dbb]">150</span> mutagen damage.
                </div>
                <div className="text-[#bbb] leading-relaxed pl-4">
                  → <span className="text-[#FA6724] font-regular">BONK</span>
                  &apos;s <span className="text-white font-regular">33%</span>{' '}
                  damage advantage, but officers only completed half their
                  missions, giving a max cap of{' '}
                  <span className="text-white font-regular">15%.</span>
                </div>
                <div className="text-[#bbb] leading-relaxed pl-4">
                  → Result:{' '}
                  <span className="text-[#FA6724] font-regular">BONK</span>{' '}
                  pillages just{' '}
                  <span className="text-white font-regular">15%</span> of{' '}
                  <span className="text-[#5AA6FA] font-regular">JITO</span>
                  &apos;s rewards—officer performance halved their raiding
                  potential.
                </div>
              </div>

              <div className="p-3 rounded-md mt-1 border border-[#222]">
                <div className="text-white mb-1">
                  Example 3: Proportional Plunder
                </div>
                <div className="text-[#bbb] leading-relaxed">
                  Team <span className="text-[#5AA6FA] font-regular">JITO</span>
                  : <span className="text-[#e47dbb]">230</span> mutagen damage |
                  Team <span className="text-[#FA6724] font-regular">BONK</span>
                  : <span className="text-[#e47dbb]">200</span> mutagen damage
                </div>
                <div className="text-[#bbb] leading-relaxed pl-4">
                  → <span className="text-[#5AA6FA] font-regular">JITO</span>
                  &apos;s modest{' '}
                  <span className="text-white font-regular">15%</span> damage
                  advantage + fully completed officer goals, giving a max cap of{' '}
                  <span className="text-white font-regular">30%.</span>
                </div>
                <div className="text-[#bbb] leading-relaxed pl-4">
                  → Result:{' '}
                  <span className="text-[#5AA6FA] font-regular">JITO</span>{' '}
                  claims <span className="text-white font-regular">15%</span> of{' '}
                  <span className="text-[#FA6724] font-regular">BONK</span>
                  &apos;s rewards—pillage percentage matches their damage
                  differential.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
