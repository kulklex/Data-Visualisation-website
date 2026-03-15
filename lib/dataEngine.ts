import Papa from "papaparse"

export async function loadData(){
  const res = await fetch("/england.csv")
  const text = await res.text()

  return new Promise<unknown[]>((resolve)=>{
    Papa.parse(text,{
      header:true,
      dynamicTyping:true,
      complete:(r)=>resolve(r.data)
    })
  })
}

export function getTeams(data:unknown[]){
  return [...new Set(data.map(d=>d.HomeTeam))]
}

export function getSeasons(data:unknown[]){
  return [...new Set(data.map(d=>d.Season))]
}
