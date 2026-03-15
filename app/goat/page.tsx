/* eslint-disable react-hooks/immutability */
"use client"

import { useEffect,useState } from "react"
import { loadSim } from "@/lib/predictionEngine"

export default function GOAT(){

 const [clubs,setClubs]=useState<unknown[]>([])

 useEffect(()=>{init()},[])

 async function init(){
   const d = await loadSim()

   const stats:Record<string,unknown>={}

   d.forEach(m=>{
     const h=String(m.HomeTeam)
     const a=String(m.AwayTeam)
     const [hg,ag]=String(m.PredictedScore).split("-").map(Number)

     if(!stats[h]) stats[h]={team:h,pts:0,gf:0,w:0}
     if(!stats[a]) stats[a]={team:a,pts:0,gf:0,w:0}

     stats[h].gf+=hg
     stats[a].gf+=ag

     if(hg>ag){stats[h].pts+=3; stats[h].w++}
     else if(ag>hg){stats[a].pts+=3; stats[a].w++}
     else{stats[h].pts++;stats[a].pts++}
   })

   const arr=Object.values(stats)
     .sort((a,b)=>b.pts-a.pts)
     .slice(0,25)

   setClubs(arr)
 }

 return(
  <div className="p-10 bg-black text-white min-h-screen">

   <h1 className="text-5xl mb-8 font-bold">Greatest Clubs Ever</h1>

   <table className="w-full bg-[#111827] rounded-xl">
    <thead>
     <tr className="border-b border-gray-700">
      <th>#</th><th>Club</th><th>Pts</th><th>Goals</th><th>Wins</th>
     </tr>
    </thead>

    <tbody>
     {clubs.map((c:unknown,i:number)=>(
      <tr key={i} className="border-b border-gray-800">
        <td>{i+1}</td>
        <td>{c.team}</td>
        <td>{c.pts}</td>
        <td>{c.gf}</td>
        <td>{c.w}</td>
      </tr>
     ))}
    </tbody>
   </table>
  </div>
 )
}
