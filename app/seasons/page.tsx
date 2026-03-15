/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { loadData } from "@/lib/dataEngine"

export default function Seasons(){

  const [data,setData]=useState<unknown[]>([])
  const [season,setSeason]=useState<string>("2023-24")
  const [table,setTable]=useState<unknown[]>([])
  const [winner,setWinner]=useState<unknown>(null)

  useEffect(()=>{
    async function init(){
    const d = await loadData()
    setData(d)
  }
    init()
},[])

  

  useEffect(()=>{
    if(data.length) buildTable()
  },[season,data])

  function buildTable(){
    const seasonGames = data.filter(d=>d.Season===season)

    const teams:unknown = {}

    seasonGames.forEach(m=>{
      const h=m.HomeTeam
      const a=m.AwayTeam

      if(!teams[h]) teams[h]={team:h,pts:0,gf:0,ga:0,w:0,d:0,l:0,played:0}
      if(!teams[a]) teams[a]={team:a,pts:0,gf:0,ga:0,w:0,d:0,l:0,played:0}

      teams[h].gf+=m["FTH Goals"]
      teams[h].ga+=m["FTA Goals"]
      teams[a].gf+=m["FTA Goals"]
      teams[a].ga+=m["FTH Goals"]

      teams[h].played++
      teams[a].played++

      if(m["FT Result"]==="H"){
        teams[h].pts+=3; teams[h].w++
        teams[a].l++
      }
      else if(m["FT Result"]==="A"){
        teams[a].pts+=3; teams[a].w++
        teams[h].l++
      }
      else{
        teams[h].pts+=1; teams[a].pts+=1
        teams[h].d++; teams[a].d++
      }
    })

    const arr = Object.values(teams)
      .map((t:unknown)=>({...t, gd:t.gf-t.ga}))
      .sort((a:unknown,b:unknown)=>b.pts-a.pts || b.gd-a.gd)

    setTable(arr)
    setWinner(arr[0])
  }

  const seasons=[...new Set(data.map(d=>d.Season))]


useEffect(()=>{
  if(data.length===0) return
  buildTable()
},[season,data])

  return(
    <div className="bg-[#0b0f17] min-h-screen text-white p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Season Analytics</h1>

        <select
          value={season}
          onChange={(e)=>setSeason(e.target.value)}
          className="bg-[#111827] px-4 py-3 rounded-xl border border-gray-700"
        >
          {seasons.map((s,i)=><option key={i}>{s}</option>)}
        </select>
      </div>

      {/* WINNER CARD */}
      {winner && (
        <div className="bg-linear-to-r from-green-600 to-emerald-500 p-6 rounded-2xl mb-8 shadow-xl">
          <div className="text-sm opacity-80">League Winner</div>
          <div className="text-3xl font-bold mt-1">{winner.team}</div>
          <div className="mt-2 text-sm">
            {winner.pts} pts • GD {winner.gd} • {winner.gf} goals
          </div>
        </div>
      )}

      {/* SCROLLABLE TABLE */}
      <div className="bg-[#111827] rounded-2xl p-6 shadow-lg">

        <h2 className="text-2xl mb-4">League Table</h2>

        <div className="max-h-125 overflow-y-auto rounded-lg border border-gray-800">

          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#020617] text-gray-400">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3">P</th>
                <th className="p-3">W</th>
                <th className="p-3">D</th>
                <th className="p-3">L</th>
                <th className="p-3">GF</th>
                <th className="p-3">GA</th>
                <th className="p-3">GD</th>
                <th className="p-3">Pts</th>
              </tr>
            </thead>

            <tbody>
              {table.map((t,i)=>(
                <tr key={i} className="border-b border-gray-800 hover:bg-[#0f172a]">
                  <td className="p-3">{i+1}</td>
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
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  )
}
