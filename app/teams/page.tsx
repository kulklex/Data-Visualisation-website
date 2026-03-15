"use client"

import { useEffect, useState } from "react"
import { loadData, getTeams } from "@/lib/dataEngine"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export default function Teams(){

  const [data,setData]=useState<unknown[]>([])
  const [team,setTeam]=useState("Arsenal")
  const [teamGames,setTeamGames]=useState<unknown[]>([])

  // eslint-disable-next-line react-hooks/immutability
  useEffect(()=>{init()},[])

  async function init(){
    const d = await loadData()
    setData(d)
    setTeamGames(d.filter(x=>x.HomeTeam==="Arsenal"||x.AwayTeam==="Arsenal"))
  }

  useEffect(()=>{
    setTeamGames(
      data.filter(x=>x.HomeTeam===team||x.AwayTeam===team)
    )
  },[data, team])

  return(
    <div className="p-10 bg-black text-white min-h-screen">
      <h1 className="text-4xl mb-6">Team Analytics</h1>

      <select
        className="bg-gray-800 p-3 mb-6"
        onChange={(e)=>setTeam(e.target.value)}
      >
        {getTeams(data).map((t,i)=><option key={i}>{t}</option>)}
      </select>

      <LineChart width={900} height={400} data={teamGames}>
        <CartesianGrid stroke="#222"/>
        <XAxis dataKey="Date"/>
        <YAxis/>
        <Tooltip/>
        <Line dataKey="FTH Goals" stroke="#00ff88"/>
        <Line dataKey="FTA Goals" stroke="#ff3366"/>
      </LineChart>
    </div>
  )
}
