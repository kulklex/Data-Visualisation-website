/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
"use client"

import { useEffect, useState } from "react"
import Papa from "papaparse"

type TeamRow = {
  team: string
  pts: number
  gf: number
  ga: number
  gd: number
  played: number
  w: number
  d: number
  l: number
}

type MatchRow = {
  Season: string
  HomeTeam: string
  AwayTeam: string
  PredictedHomeGoals: number
  PredictedAwayGoals: number
}

// ----------------------------
// TABLE BUILDER
// ----------------------------
function buildTable(matches: MatchRow[], teams: string[]): TeamRow[] {
  const table: Record<string, TeamRow> = {}

  teams.forEach(t => {
    table[t] = { team: t, pts: 0, gf: 0, ga: 0, gd: 0, played: 0, w: 0, d: 0, l: 0 }
  })

  matches.forEach(m => {
    const h = m.HomeTeam
    const a = m.AwayTeam
    if (!teams.includes(h) || !teams.includes(a)) return

    const hg = m.PredictedHomeGoals ?? 0
    const ag = m.PredictedAwayGoals ?? 0

    table[h].gf += hg
    table[h].ga += ag
    table[a].gf += ag
    table[a].ga += hg

    table[h].played++
    table[a].played++

    if (hg > ag) {
      table[h].pts += 3
      table[h].w++
      table[a].l++
    } else if (ag > hg) {
      table[a].pts += 3
      table[a].w++
      table[h].l++
    } else {
      table[h].pts++
      table[a].pts++
      table[h].d++
      table[a].d++
    }
  })

  return Object.values(table)
    .map(t => ({ ...t, gd: t.gf - t.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
}

// ----------------------------
// COMPONENT
// ----------------------------
export default function FootballDashboard() {
  const [data, setData] = useState<MatchRow[]>([])
  const [season, setSeason] = useState<string>("")
  const [seasons, setSeasons] = useState<string[]>([])

  const [epl, setEpl] = useState<TeamRow[]>([])
  const [champ, setChamp] = useState<TeamRow[]>([])
  const [relegated, setRelegated] = useState<TeamRow[]>([])
  const [promoted, setPromoted] = useState<TeamRow[]>([])

  // ----------------------------
  // LOAD CSV
  // ----------------------------
  useEffect(() => {
    async function load() {
      const res = await fetch("/100_year_predictions.csv")
      const text = await res.text()

      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        complete: (r: unknown) => {
          const d: MatchRow[] = r.data.filter((x: unknown) => x.Season && x.HomeTeam)
          setData(d)

          const ss = [...new Set(d.map((x: MatchRow) => x.Season))].sort()
          setSeasons(ss)
          setSeason(ss[0])
        },
      })
    }
    load()
  }, [])

  // ----------------------------
  // CALCULATE TABLES
  // ----------------------------
  useEffect(() => {
    if (!season || data.length === 0) return

    const seasonGames = data.filter(d => d.Season === season)

    const firstSeason = seasons[0]

    const originalEPLTeams = [...new Set(
      data
        .filter(d => d.Season === firstSeason)
        .map(d => d.HomeTeam)
        .concat(data.filter(d => d.Season === firstSeason).map(d => d.AwayTeam))
    )].slice(0, 20)

    const eplTeams = originalEPLTeams

    const champTeams = [...new Set(
      seasonGames.map(m => m.HomeTeam).concat(seasonGames.map(m => m.AwayTeam))
    )].filter(t => !eplTeams.includes(t))

    const eplTable = buildTable(seasonGames, eplTeams)
    const champTable = buildTable(seasonGames, champTeams)

    setEpl(eplTable)
    setChamp(champTable)
    setRelegated(eplTable.slice(-3))
    setPromoted(champTable.slice(0, 3))

  }, [season, data, seasons])

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="min-h-screen bg-linear-to-br from-[#020617] to-[#020617] text-white px-4 md:px-10 py-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          ⚽ Football Universe Simulator
        </h1>

        <select
          value={season}
          onChange={e => setSeason(e.target.value)}
          className="bg-[#111827] px-6 py-3 rounded-xl border border-gray-700 text-lg shadow-lg"
        >
          {seasons.map((s, i) => <option key={i}>{s}</option>)}
        </select>
      </div>

      {/* STATS CARDS */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-linear-to-br from-yellow-500/20 to-yellow-400/10 border border-yellow-500/30 p-6 rounded-2xl shadow-xl">
          <div className="text-sm opacity-70">Champion</div>
          <div className="text-2xl font-bold mt-2">{epl[0]?.team}</div>
          <div className="opacity-70">{epl[0]?.pts} pts</div>
        </div>

        <div className="bg-red-600/20 border border-red-500/30 p-6 rounded-2xl shadow-xl">
          <div className="text-sm opacity-70 mb-2">Relegated</div>
          {relegated.map((t, i) => (
            <div key={i} className="font-semibold">{t.team}</div>
          ))}
        </div>

        <div className="bg-green-600/20 border border-green-500/30 p-6 rounded-2xl shadow-xl">
          <div className="text-sm opacity-70 mb-2">Promoted</div>
          {promoted.map((t, i) => (
            <div key={i} className="font-semibold">{t.team}</div>
          ))}
        </div>

        <div className="bg-blue-600/20 border border-blue-500/30 p-6 rounded-2xl shadow-xl">
          <div className="text-sm opacity-70">Season</div>
          <div className="text-2xl font-bold mt-2">{season}</div>
          <div className="opacity-70">Simulation Year</div>
        </div>

      </div>

      {/* TABLE GRID */}
      <div className="grid xl:grid-cols-2 gap-10">

        {/* EPL TABLE */}
        <LeagueTable title="Premier League" data={epl} highlightTop highlightBottom />

        {/* CHAMPIONSHIP */}
        <LeagueTable title="Championship" data={champ} highlightTop />

      </div>

    </div>
  )
}

// ----------------------------
// TABLE COMPONENT
// ----------------------------
function LeagueTable({
  title,
  data,
  highlightTop = false,
  highlightBottom = false,
}: {
  title: string
  data: TeamRow[]
  highlightTop?: boolean
  highlightBottom?: boolean
}) {

  return (
    <div className="bg-[#020617] border border-gray-800 rounded-2xl shadow-2xl">

      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-sm opacity-60">{data.length} teams</span>
      </div>

      <div className="overflow-auto max-h-162.5">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#020617] text-gray-400 backdrop-blur">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Team</th>
              <th className="p-3 text-center">P</th>
              <th className="p-3 text-center">W</th>
              <th className="p-3 text-center">D</th>
              <th className="p-3 text-center">L</th>
              <th className="p-3 text-center">GF</th>
              <th className="p-3 text-center">GA</th>
              <th className="p-3 text-center">GD</th>
              <th className="p-3 text-center font-bold">Pts</th>
            </tr>
          </thead>

          <tbody>
            {data.map((t, i) => {

              let rowStyle = "border-b border-gray-800 hover:bg-[#0f172a] transition"

              if (highlightTop && i === 0)
                rowStyle += " bg-yellow-500/10"

              if (highlightBottom && i >= data.length - 3)
                rowStyle += " bg-red-500/10"

              if (highlightTop && i < 3 && title === "Championship")
                rowStyle += " bg-green-500/10"

              return (
                <tr key={i} className={rowStyle}>
                  <td className="p-3 font-bold">{i + 1}</td>
                  <td className="p-3 font-semibold">{t.team}</td>
                  <td className="p-3 text-center">{t.played}</td>
                  <td className="p-3 text-center">{t.w}</td>
                  <td className="p-3 text-center">{t.d}</td>
                  <td className="p-3 text-center">{t.l}</td>
                  <td className="p-3 text-center">{t.gf}</td>
                  <td className="p-3 text-center">{t.ga}</td>
                  <td className="p-3 text-center">{t.gd}</td>
                  <td className="p-3 text-center font-bold">{t.pts}</td>
                </tr>
              )
            })}
          </tbody>

        </table>
      </div>
    </div>
  )
}
