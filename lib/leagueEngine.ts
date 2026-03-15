export function splitLeagues(
  data:Record<string,unknown>[],
  season:string
){
  const seasonGames = data.filter(d=>String(d.Season)===season)

  const played:Record<string,number>={}

  seasonGames.forEach(m=>{
    const h=String(m.HomeTeam)
    const a=String(m.AwayTeam)

    played[h]=(played[h]||0)+1
    played[a]=(played[a]||0)+1
  })

  const sorted = Object.entries(played)
    .sort((a,b)=>b[1]-a[1])

  const eplTeams = sorted.slice(0,20).map(x=>x[0])
  const champTeams = sorted.slice(20).map(x=>x[0])

  return {eplTeams,champTeams}
}

export function buildTable(
  data:Record<string,unknown>[],
  season:string,
  teams:string[]
){
  const games = data.filter(d=>String(d.Season)===season)

  const table:Record<string,unknown>={}

  teams.forEach(t=>{
    table[t]={team:t,pts:0,gf:0,ga:0,gd:0,played:0,w:0,d:0,l:0}
  })

  games.forEach(m=>{
    const h=String(m.HomeTeam)
    const a=String(m.AwayTeam)

    if(!teams.includes(h) || !teams.includes(a)) return

    const hg=Number(m.PredictedHomeGoals||0)
    const ag=Number(m.PredictedAwayGoals||0)

    table[h].gf+=hg
    table[h].ga+=ag
    table[a].gf+=ag
    table[a].ga+=hg

    table[h].played++
    table[a].played++

    if(hg>ag){table[h].pts+=3;table[h].w++;table[a].l++}
    else if(ag>hg){table[a].pts+=3;table[a].w++;table[h].l++}
    else{
      table[h].pts+=1
      table[a].pts+=1
      table[h].d++
      table[a].d++
    }
  })

  const arr = Object.values(table)
    .map((t:unknown)=>({...t,gd:t.gf-t.ga}))
    .sort((a:unknown,b:unknown)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf)

  return arr
}
