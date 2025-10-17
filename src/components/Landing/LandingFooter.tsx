import Image from 'next/image';
import Link from 'next/link';

import discordLogo from '@/../public/images/discord.png';
import githubLogo from '@/../public/images/github.svg';
import bookIcon from '@/../public/images/Icons/book.svg';
import documentIcon from '@/../public/images/Icons/document.svg';
import voteIcon from '@/../public/images/Icons/vote-icon.svg';
import xLogo from '@/../public/images/x.svg';

import GeneratedFlickerEffect from '../FlickeringGrid.tsx/GeneratedFlickerEffect';

export default function LandingFooter() {
  const ADRENA_LOGO_BASE64 =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzEzIiBoZWlnaHQ9IjExMSIgdmlld0JveD0iMCAwIDcxMyAxMTEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMTUwMl85MTI2KSI+CjxtYXNrIGlkPSJtYXNrMF8xNTAyXzkxMjYiIHN0eWxlPSJtYXNrLXR5cGU6bHVtaW5hbmNlIiBtYXNrVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4PSIyMCIgeT0iMTkiIHdpZHRoPSI2NzMiIGhlaWdodD0iNzMiPgo8cmVjdCB4PSIyMCIgeT0iMTkiIHdpZHRoPSI2NzMiIGhlaWdodD0iNzMiIGZpbGw9InVybCgjcGF0dGVybjBfMTUwMl85MTI2KSIvPgo8L21hc2s+CjxnIG1hc2s9InVybCgjbWFzazBfMTUwMl85MTI2KSI+CjxwYXRoIGQ9Ik0xNDQuNTQ0IDkxLjY2MjNIMTE1LjExOEwxMDYuNzk1IDc3LjIzNThINTYuNzA0NUw0OC40ODc1IDkxLjY2MjNIMjAuMDAxTDYyLjUyNjIgMTlIMTAyLjAzNEwxNDQuNTYgOTEuNjYyM0gxNDQuNTQ0Wk04MS4zNDAzIDM0LjM2NTFMNjYuNDY3OSA2MC4xMTQ4SDk3LjAzMTZMODIuMjY1MiAzNC4zNjUxSDgxLjMyNTJIODEuMzQwM1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNDguOTI0IDU2LjU3MjVDMjQ4LjkyNCA4My4xMzk2IDIzNy43OTcgOTEuNjYyMyAyMDEuNjI0IDkxLjY2MjNIMTQ2LjYyMVYxOUgyMDAuNTc3QzIzNi43NSAxOSAyNDguOTI0IDI3LjUwNzYgMjQ4LjkyNCA1NC4wODk4VjU2LjU4NzZWNTYuNTcyNVpNMTcyLjQwOSAzNy4wNTk2VjczLjYwMjdIMTk0LjY0OUMyMTkuMDc0IDczLjYwMjcgMjIyLjYyMSA2OS43NTc2IDIyMi42MjEgNTUuNjQ5MVY1NS4yNDAzQzIyMi42MjEgNDEuMTE2NiAyMTkuMDg5IDM3LjA3NDcgMTk0LjY0OSAzNy4wNzQ3SDE3Mi40MDlWMzcuMDU5NloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yODAuNTM0IDkxLjY2MjNIMjU0Ljc0NlYxOUgzMjEuOTA3QzM0Ni41NDMgMTkgMzU1LjI3NSAyNC4xOTIzIDM1NS4yNzUgMzcuNDgzNVY0MS4xMTY2QzM1NS4yNzUgNTIuNjM2NiAzNTAuMTgxIDU2LjY5MzYgMzM4LjExMyA1Ny44Mjg5VjU4LjU1NTVDMzQ5Ljc1NyA2MC4wMDg4IDM1NS4yNzUgNjIuMjk0NiAzNTUuMjc1IDc1Ljc4MjZWOTEuNjYyM0gzMjkuNDg4Vjc3LjIzNThDMzI5LjQ4OCA3MC42OTYyIDMyNy42MjMgNjguNjIyMyAzMTIuOTYyIDY4LjYyMjNIMjgwLjUxOVY5MS42NjIzSDI4MC41MzRaTTI4MC41MzQgMzYuMTIxMVY1MS40ODYxSDMxOC4xNjNDMzI2LjQ4NSA1MS40ODYxIDMyOS40ODggNDkuODIwOSAzMjkuNDg4IDQ0LjQzMThWNDMuODExMUMzMjkuNDg4IDM3Ljc4NjIgMzI2LjU3NiAzNi4xMzYyIDMxMi45NjIgMzYuMTM2MkgyODAuNTE5TDI4MC41MzQgMzYuMTIxMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00NDkuMTUgOTEuNjYyM0gzNjIuMDM3VjE5SDQ0OS4xNVYzNi4xMjExSDM4Ny44MDlWNDYuNzAyNUg0NDkuMTVWNjMuODIzNkgzODcuODA5Vjc0LjUxMUg0NDkuMTVWOTEuNjMyVjkxLjY2MjNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTY1LjU4MyA5MS42NjIzSDUyNi42OTZMNDgxLjk4NyA0MC42OTI3SDQ4MS4wNDdWOTEuNjYyM0g0NTYuNTE4VjE5SDQ5NS40MDRMNTQwLjExMyA3MC4wNzU2SDU0MS4wNTNWMTlINTY1LjU4M1Y5MS42NjIzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTY5Mi4yMTggOTEuNjYyM0g2NjIuNzkxTDY1NC40NjggNzcuMjM1OEg2MDQuMzYyTDU5Ni4xNDUgOTEuNjYyM0g1NjcuNjU5TDYxMC4xODQgMTlINjQ5LjY5M0w2OTIuMjE4IDkxLjY2MjNaTTYyOC45OTkgMzQuMzY1MUw2MTQuMTI2IDYwLjExNDhINjQ0LjY4OUw2MjkuOTIzIDM0LjM2NTFINjI4Ljk4M0g2MjguOTk5WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTY2Ny4wMjUgMjkuNDk0M0M2NjYuMDE0IDI5LjQ5NDMgNjY1LjEwNSAyOS4yNzU3IDY2NC4yOTcgMjguODM4NEM2NjMuNTA0IDI4LjM4NDMgNjYyLjg3MyAyNy43NjIxIDY2Mi40MDIgMjYuOTcxNkM2NjEuOTQ3IDI2LjE4MTIgNjYxLjcyIDI1LjI3MyA2NjEuNzIgMjQuMjQ3MkM2NjEuNzIgMjMuMjIxMyA2NjEuOTQ3IDIyLjMxMzEgNjYyLjQwMiAyMS41MjI3QzY2Mi44NzMgMjAuNzMyMiA2NjMuNTA0IDIwLjExODQgNjY0LjI5NyAxOS42ODExQzY2NS4xMDUgMTkuMjI3IDY2Ni4wMTQgMTkgNjY3LjAyNSAxOUM2NjguMDM1IDE5IDY2OC45MzYgMTkuMjI3IDY2OS43MjggMTkuNjgxMUM2NzAuNTM3IDIwLjExODQgNjcxLjE2OCAyMC43MzIyIDY3MS42MjMgMjEuNTIyN0M2NzIuMDk0IDIyLjMxMzEgNjcyLjMzMSAyMy4yMjEzIDY3Mi4zMzEgMjQuMjQ3MkM2NzIuMzMxIDI1LjI3MyA2NzIuMDk0IDI2LjE4MTIgNjcxLjYyMyAyNi45NzE2QzY3MS4xNjggMjcuNzYyMSA2NzAuNTM3IDI4LjM4NDMgNjY5LjcyOCAyOC44Mzg0QzY2OC45MzYgMjkuMjc1NyA2NjguMDM1IDI5LjQ5NDMgNjY3LjAyNSAyOS40OTQzWk02NjcuMDI1IDI4LjQ2QzY2OC4yODkgMjguNDYgNjY5LjMwNyAyOC4wODE2IDY3MC4wODIgMjcuMzI0OEM2NzAuODU2IDI2LjU1MTIgNjcxLjI0NCAyNS41MjUzIDY3MS4yNDQgMjQuMjQ3MkM2NzEuMjQ0IDIyLjk4NTggNjcwLjg1NiAyMS45NjgzIDY3MC4wODIgMjEuMTk0N0M2NjkuMzA3IDIwLjQyMTEgNjY4LjI4OSAyMC4wMzQzIDY2Ny4wMjUgMjAuMDM0M0M2NjUuNzYyIDIwLjAzNDMgNjY0Ljc0MiAyMC40MjExIDY2My45NjggMjEuMTk0N0M2NjMuMTkzIDIxLjk1MTUgNjYyLjgwNSAyMi45NjkgNjYyLjgwNSAyNC4yNDcyQzY2Mi44MDUgMjUuNTA4NSA2NjMuMTkzIDI2LjUyNiA2NjMuOTY4IDI3LjI5OTZDNjY0Ljc0MiAyOC4wNzMyIDY2NS43NjIgMjguNDYgNjY3LjAyNSAyOC40NlpNNjY1LjIwNiAyNi45OTY5VjIxLjM5NjVINjY3LjM1M0M2NjcuOTc2IDIxLjM5NjUgNjY4LjQ0OCAyMS41NDc5IDY2OC43NjggMjEuODUwNkM2NjkuMDg4IDIyLjE1MzMgNjY5LjI0OCAyMi41MDY1IDY2OS4yNDggMjIuOTEwMUM2NjkuMjQ4IDIzLjI0NjUgNjY5LjE2NCAyMy41MzI0IDY2OC45OTYgMjMuNzY3OUM2NjguODQ0IDI0LjAwMzMgNjY4LjU5MSAyNC4xODgzIDY2OC4yMzcgMjQuMzIyOFYyNC41NzUxQzY2OC41MjQgMjQuNTkxOSA2NjguNzI2IDI0LjY4NDQgNjY4Ljg0NCAyNC44NTI2QzY2OC45NzggMjUuMDIwOCA2NjkuMDQ2IDI1LjIzOTQgNjY5LjA0NiAyNS41MDg1VjI2Ljk5NjlINjY4LjAxVjI1LjQ4MzNDNjY4LjAxIDI1LjEzMDEgNjY3LjgzMyAyNC45NTM1IDY2Ny40NzkgMjQuOTUzNUg2NjYuMjQxVjI2Ljk5NjlINjY1LjIwNlpNNjY2LjI0MSAyMy45OTQ5SDY2Ny4zNTNDNjY3LjY0IDIzLjk5NDkgNjY3Ljg1IDIzLjkxMDggNjY3Ljk4NSAyMy43NDI2QzY2OC4xMzYgMjMuNTc0NCA2NjguMjEyIDIzLjM4MSA2NjguMjEyIDIzLjE2MjRDNjY4LjIxMiAyMi45MjcgNjY4LjEzNiAyMi43MzM2IDY2Ny45ODUgMjIuNTgyMkM2NjcuODUgMjIuNDE0IDY2Ny42NCAyMi4zMjk5IDY2Ny4zNTMgMjIuMzI5OUg2NjYuMjQxVjIzLjk5NDlaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjwvZz4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJwYXR0ZXJuMF8xNTAyXzkxMjYiIHBhdHRlcm5Db250ZW50VW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj4KPHVzZSB4bGluazpocmVmPSIjaW1hZ2UwXzE1MDJfOTEyNiIgdHJhbnNmb3JtPSJzY2FsZSgwLjAwMTQ4ODEgMC4wMTM2OTg2KSIvPgo8L3BhdHRlcm4+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTUwMl85MTI2Ij4KPHJlY3Qgd2lkdGg9IjY3MyIgaGVpZ2h0PSI3MyIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwIDE5KSIvPgo8L2NsaXBQYXRoPgo8aW1hZ2UgaWQ9ImltYWdlMF8xNTAyXzkxMjYiIHdpZHRoPSI2NzIiIGhlaWdodD0iNzMiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBcUFBQUFCSkNBQUFBQURIZzh0NkFBQUFPR1ZZU1daTlRRQXFBQUFBQ0FBQmgya0FCQUFBQUFFQUFBQWFBQUFBQUFBQ29BSUFCQUFBQUFFQUFBS2dvQU1BQkFBQUFBRUFBQUJKQUFBQUFLUTA5WjRBQUFNN1NVUkJWSGdCN2R6UGk0MXhGTWZ4ZWN6RURCdkdETVdDOGFOQnMyQ2tLY20xWVltUVpDR1Rrckx6Ri9neldLUEVqcVpvd2c3ZE5HVTExNCtVeEU3VUpTRnpTY2w5NWp6UDk5ek5lWjdQNG0wMTkzeS9mYy9wZFQ3TmxLYkpPbjM4UTZBV2dkbXpIL3krUy93cjNFQWdSR0RUV0EvUEV0QWVrTGdTSXJCdVJ3L1BFdEFla0xnU0lqQTBPZWkvUzBCOUkyNEVDZXphNkQ5TVFIMGpiZ1FKakUvNkR4TlEzNGdiUVFJcjl5MTNYeWFnTGhFWHdnVDJibmVmSnFBdUVSZkNCTFkxTXU5dEF1b0pjUjRuc096Z0J1OXhBdW9KY1I0b01IWEFlNXlBZWtLY0J3cXNPcnplZVoyQU9rQWNod28wRGpuUEUxQUhpT05RZ2VFVG05UHZFOUMwRDZmQkFvMmovY2tPQkRUSncyRzB3SXBUVThrV0JEVEp3Mkc0d080ekk2a2VCRFNsdzFtOFFIYnNlQ3FFcWJQNDRlaUFRTi9vdWYwSkJRS2F3T0dvRW9FOUY3YVU5eUdnNVRhY1ZDUnc1UHh3YVNjQ1drckRRVlVDZzlQVFEyVzlDR2laRFBYcUJFWXVuaDRvNlVaQVMyQW9WeWt3ZHVsa3lmL1g5MSt1Y2c1NklWQXNNTHIxMDN6aG4yZ2dvTVZnVkNzV1dEdmVudjlWMEpPQUZxQlFxa0ZnemNUUDFnL2JsNEJhRXlxMUNLemV1ZlIxMjNUT0NuL3dtMnNVRUlnWGFOKzhNcmU0Q3dGZExNTG4rZ1FXSGw2ZCtaWnZUMER6SG55cVYrRE45UnN2Y3hNUTBCd0hIK29XK1A3ZzJyM1BYVU1RMEM0TXZsUVFlSC8zOXBQL1ArY0pxTUpPbUtGYm9OT2F1ZlBzWDBRSmFEY05YMnNJTExSbTd6Yy8vcDJGZ0dxc2hDbnlBcDEzang4OWZmWG4yeWdCemNQd1NVYmc2NHRtOC9rY0FaVlpDSU1ZZ1M5dkp3aW9VYUVnSkpEeCs2QkMyMkFVSzBCQXJRa1ZJUUVDS3JRTVJyRUNCTlNhVUJFU0lLQkN5MkFVSzBCQXJRa1ZJUUVDS3JRTVJyRUNCTlNhVUJFU0lLQkN5MkFVSzBCQXJRa1ZJUUVDS3JRTVJyRUNCTlNhVUJFU0lLQkN5MkFVSzBCQXJRa1ZJUUVDS3JRTVJyRUNCTlNhVUJFU0lLQkN5MkFVSzBCQXJRa1ZJUUVDS3JRTVJyRUNCTlNhVUJFU0lLQkN5MkFVSzBCQXJRa1ZJUUVDS3JRTVJyRUNCTlNhVUJFU0lLQkN5MkFVSzBCQXJRa1ZJUUVDS3JRTVJyRUNCTlNhVUJFU0lLQkN5MkFVSzBCQXJRa1ZJUUVDS3JRTVJyRUNCTlNhVUJFU0lLQkN5MkFVS3pCd3k5YW9JQ0FqOEJ2RFRGRzA0TC9PUFFBQUFBQkpSVTVFcmtKZ2dnPT0iLz4KPC9kZWZzPgo8L3N2Zz4K';

  return (
    <div className="relative w-full h-[25rem] border-t border-dashed border-inputcolor">
      <GeneratedFlickerEffect
        className="w-full"
        svgDataUrlForEffect={ADRENA_LOGO_BASE64}
        svgMaskGridSettingsForEffect={{
          color: '#ffffff',
          maxOpacity: 0.7,
          flickerChance: 0.18,
          squareSize: 3,
          gridGap: 4,
        }}
        backgroundGridSettingsForEffect={{
          color: '#15202c',
          maxOpacity: 0.6,
          flickerChance: 0.45,
          squareSize: 3,
          gridGap: 4,
        }}
      />
      <div className="flex flex-row justify-between items-center">
        <div>
          <p className="opacity-50 text-sm">
            Trade fair. Trade clear. Trade Adrena
          </p>
        </div>
        <div className="flex flex-row items-center">
          <div className="flex flex-row items-center gap-4 p-2 px-4">
            <Link
              href="https://docs.adrena.xyz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={bookIcon}
                alt="Learn Icon"
                className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>

            <Link
              href="https://dao.adrena.xyz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={voteIcon}
                alt="Vote Icon"
                className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>

            <Link href="/terms_and_conditions">
              <Image
                src={documentIcon}
                alt="Terms & Privacy"
                className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>
          </div>

          <div className="flex flex-row items-center gap-4 p-2 px-4">
            <Link
              href="https://github.com/AdrenaFoundation"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={githubLogo}
                alt="GitHub Icon"
                className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>
            <Link
              href="https://discord.com/invite/adrena"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={discordLogo}
                alt="Discord Logo"
                className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>
            <Link
              href="https://x.com/AdrenaProtocol"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={xLogo}
                alt="X Logo"
                className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 h-[18.75rem] w-full bg-gradient-to-t from-main to-transparent z-10" />
    </div>
  );
}
