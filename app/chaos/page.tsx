/* eslint-disable react-hooks/immutability */
"use client"

import { useEffect,useState } from "react"
import { loadSim } from "@/lib/predictionEngine"

export default function Chaos(){

 const [matches,setMatches]=useState<unknown[]>([])

 useEffect(()=>{init()},[])

 async function init(){
   const d = await loadSim()

   const sorted=d
   .map(m=>{
     const [hg,ag]=String(m.PredictedScore).split("-").map(Number)
     return {...m,total:hg+ag}
   })
   .sort((a,b)=>b.total-a.total)
   .slice(0,50)

   setMatches(sorted)
 }

 return(
  <div className="p-10 bg-black text-white min-h-screen">

   <h1 className="text-5xl mb-8">Chaos Matches 🔥</h1>

   <table className="w-full bg-[#111827]">
    <thead>
     <tr>
      <th>Season</th>
      <th>Home</th>
      <th>Away</th>
      <th>Score</th>
      <th>Total Goals</th>
     </tr>
    </thead>

    <tbody>
     {matches.map((m:unknown,i:number)=>(
      <tr key={i} className="border-b border-gray-800">
        <td>{m.Season}</td>
        <td>{m.HomeTeam}</td>
        <td>{m.AwayTeam}</td>
        <td className="text-green-400 font-bold">{m.PredictedScore}</td>
        <td>{m.total}</td>
      </tr>
     ))}
    </tbody>
   </table>

  </div>
 )
}
