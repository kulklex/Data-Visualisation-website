/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect,useState } from "react"
import { loadSim } from "@/lib/predictionEngine"
import { BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer } from "recharts"

export default function Dominance(){

 const [data,setData]=useState<Record<string,unknown>[]>([])
 const [clubs,setClubs]=useState<Record<string,unknown>[]>([])

 useEffect(()=>{init()},[data])

 async function init(){
   const d = await loadSim()
   setData(d)
   buildDominance(d)
 }

 function buildDominance(d:Record<string,unknown>[]){

   const seasons=[...new Set(d.map(x=>String(x.Season)))]
   const clubStats:Record<string,unknown>={}

   seasons.forEach(season=>{
     const games=d.filter(x=>String(x.Season)===season)
     const table:Record<string,unknown>={}

     games.forEach(m=>{
       const h=String(m.HomeTeam)
       const a=String(m.AwayTeam)

       const [hg,ag]=String(m.PredictedScore).split("-").map(Number)

       if(!table[h]) table[h]={pts:0,gf:0,ga:0}
       if(!table[a]) table[a]={pts:0,gf:0,ga:0}

       table[h].gf+=hg; table[h].ga+=ag
       table[a].gf+=ag; table[a].ga+=hg

       if(hg>ag) table[h].pts+=3
       else if(ag>hg) table[a].pts+=3
       else{table[h].pts+=1; table[a].pts+=1}
     })

     const arr=Object.entries(table)
       .map(([team,v]:unknown)=>({team,...v}))
       .sort((a,b)=>b.pts-a.pts)

     const winner=arr[0].team

     if(!clubStats[winner])
       clubStats[winner]={team:winner,titles:0}

     clubStats[winner].titles++
   })

   const sorted=Object.values(clubStats)
     .sort((a,b)=>b.titles-a.titles)
     .slice(0,15)

   setClubs(sorted)
 }

 return(
  <div className="p-10 bg-black text-white min-h-screen">

   <h1 className="text-5xl font-bold mb-10">
     Club Dominance — 100 Years
   </h1>

   <div className="bg-[#111827] p-6 rounded-2xl">

   <ResponsiveContainer width="100%" height={500}>
    <BarChart data={clubs}>
      <XAxis dataKey="team"/>
      <YAxis/>
      <Tooltip/>
      <Bar dataKey="titles"/>
    </BarChart>
   </ResponsiveContainer>

   </div>
  </div>
 )
}
