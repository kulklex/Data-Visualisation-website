import Papa from "papaparse"

export async function loadSim(){
  const res = await fetch("/100_year_predictions.csv")
  const text = await res.text()

  return new Promise<Record<string,unknown>[]>((resolve)=>{
    Papa.parse(text,{
      header:true,
      dynamicTyping:true,
      complete:(r)=>resolve(r.data as Record<string,unknown>[])
    })
  })
}

export function getTeams(data:Record<string,unknown>[]){
  const set=new Set<string>()
  data.forEach(d=>{
    set.add(String(d.HomeTeam))
    set.add(String(d.AwayTeam))
  })
  return [...set]
}

export function getSeasons(data:Record<string,unknown>[]){
  return [...new Set(data.map(d=>String(d.Season)))]
}
