export const DAY=86400000;
export function localDate(date=new Date()):string{return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
export function today():string{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return `${p.find(x=>x.type==='year')!.value}-${p.find(x=>x.type==='month')!.value}-${p.find(x=>x.type==='day')!.value}`}
export function parseDate(s:string){const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)}
export function validDate(s?:string):s is string{return !!s&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&localDate(parseDate(s))===s}
export function addDays(s:string,n:number){const d=parseDate(s);d.setDate(d.getDate()+n);return localDate(d)}
export function dayLabel(s:string){const d=parseDate(s);return `${d.getMonth()+1}月${d.getDate()}日 周${'日一二三四五六'[d.getDay()]}`}
export function nextSaturday(){const s=today(),d=parseDate(s);return addDays(s,(6-d.getDay()+7)%7)}
