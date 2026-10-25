import{notes}from'./data';
import{type RecordItem,readLocal,writeLocal,uid}from'./model';import{validDate}from'./calendar';
export const THOUGHT_KEY='between-notes-demo:bn-v6-thoughts',PLAN_KEY='between-notes-demo:bn-v6-plans',COLLAGE_KEY='between-notes-demo:bn-v6-collages';
export type Post={id:number;author:string;title:string;body:string[];images:string[];locationLabel:string;tags:string[]};
export type Thought={origin?:'user-save'|'legacy-import';id:string;sourcePostId:number;selectedText:string;userText:string;image?:string;plannedDate?:string;completed:boolean;createdAt:string;updatedAt:string};
export type SceneExperience={id:string;sourceThoughtIds:string[];title:string;description:string;plannedDate?:string;status:'draft'|'scheduled';visibility:'private'|'public';completed:boolean;createdAt:string;updatedAt:string};
export function readThoughts(fallback:RecordItem[]=[],key=THOUGHT_KEY){const rows=readLocal<unknown>(key,null);if(!Array.isArray(rows))return fallback;return rows.filter((r:any)=>r&&typeof r.id==='string'&&notes.some(n=>n.id===r.sourcePostId)&&typeof r.userText==='string'&&r.userText.trim()).map((r:Thought)=>({id:r.id,noteId:r.sourcePostId,quote:r.selectedText??'',text:r.userText,image:r.image,plannedDate:validDate(r.plannedDate)?r.plannedDate:undefined,completed:!!r.completed,createdAt:r.createdAt,updatedAt:r.updatedAt??r.createdAt,origin:r.origin??'user-save',visibility:'private' as const}))}
export function thoughtRows(rs:RecordItem[]):Thought[]{return rs.map(r=>({origin:r.origin??'user-save',id:r.id,sourcePostId:r.noteId,selectedText:r.quote,userText:r.text,image:r.image,plannedDate:r.plannedDate,completed:!!r.completed,createdAt:r.createdAt,updatedAt:r.updatedAt??r.createdAt}))}
export function readPlans():SceneExperience[]{const rows=readLocal<unknown>(PLAN_KEY,[]);return Array.isArray(rows)?rows.filter((p:any)=>p&&typeof p.id==='string'&&Array.isArray(p.sourceThoughtIds)&&typeof p.title==='string'&&typeof p.description==='string').map((p:any)=>({...p,sourceThoughtIds:p.sourceThoughtIds.filter((id:unknown)=>typeof id==='string'),plannedDate:validDate(p.plannedDate)?p.plannedDate:undefined,status:p.status==='scheduled'&&validDate(p.plannedDate)?'scheduled':'draft',completed:!!p.completed,visibility:p.visibility==='public'?'public':'private'})):[]}
export function reconcilePlans(plans:SceneExperience[],records:RecordItem[]){return plans.flatMap(p=>{const ids=p.sourceThoughtIds.filter(id=>records.some(r=>r.id===id));if(ids.length<2)return [];const changed=ids.length!==p.sourceThoughtIds.length;return [{...p,sourceThoughtIds:ids,...(changed?{status:'draft' as const,visibility:'private' as const,plannedDate:undefined,completed:false,updatedAt:new Date().toISOString()}:{})}]})}
export function relatedThoughts(records:RecordItem[]){return [0,2,1].flatMap(noteId=>{const r=[...records].reverse().find(r=>r.noteId===noteId);return r?[r]:[]})}

// Versioned initialization never converts community Posts into user Thoughts.
export const DATA_VERSION=6;
export const META_KEY='between-notes-demo:bn-v6-meta';
export function initializeDemoStorage(){
  const meta=readLocal<{schemaVersion?:number}>(META_KEY,{});
  if(meta.schemaVersion===DATA_VERSION)return;
  // Keep any existing v6 user data, and leave all earlier versions untouched.
  for(const key of [THOUGHT_KEY,PLAN_KEY,COLLAGE_KEY]){
    if(readLocal<unknown>(key,null)===null)writeLocal(key,[]);
  }
  writeLocal(META_KEY,{schemaVersion:DATA_VERSION,initialization:'empty',initializedAt:new Date().toISOString()});
}
export function legacyArchive(){
  const saved=new Map<string,RecordItem>();
  const isFixture=(r:any)=>r?.origin==='seed'||r?.origin==='fixture'||r?.isDemo===true||r?.seeded===true||r?.createdBy==='fixture';
  const canonical=readLocal<unknown>('between-notes-demo:bn-v5-thoughts',[]);
  if(Array.isArray(canonical)){
    const valid=canonical.filter(r=>!isFixture(r));
    const rows=readThoughts([], 'between-notes-demo:bn-v5-thoughts');
    for(const r of rows)if(valid.some((x:any)=>x.id===r.id))saved.set(r.id,{...r,origin:'legacy-import'});
  }
  const older=readLocal<unknown>('between-notes-demo:bn-v3-records',[]);
  if(Array.isArray(older))for(const r of older){
    if(!isFixture(r)&&r&&typeof r.id==='string'&&[0,1,2].includes(r.noteId)&&typeof r.text==='string'&&r.text.trim()&&!saved.has(r.id))saved.set(r.id,{...r,origin:'legacy-import',visibility:'private'});
  }
  const oldPlans=readLocal<unknown>('between-notes-demo:bn-v5-plans',[]);
  const plans=Array.isArray(oldPlans)?oldPlans.filter(p=>p&&typeof p.id==='string'&&Array.isArray(p.sourceThoughtIds)&&typeof p.title==='string'&&typeof p.description==='string') as SceneExperience[]:[];
  return {records:[...saved.values()],plans};
}
export function selectedThoughts(ids:string[],records:RecordItem[]){
  const unique=[...new Set(ids)];
  return unique.flatMap(id=>{const r=records.find(r=>r.id===id);return r?[r]:[]});
}
export function selectionError(ids:string[],records:RecordItem[]){
  const rs=selectedThoughts(ids,records);
  if(rs.length<2)return '至少选两个想法';
  if(rs.length>3)return '最多选择 3 个想法';
  return '';
}
export function composeExperience(ids:string[],records:RecordItem[]):SceneExperience{
  const error=selectionError(ids,records);if(error)throw new Error(error);
  const rs=selectedThoughts(ids,records);
  const sources=[...new Set(rs.map(r=>r.noteId))].sort((a,b)=>a-b);
  const rules:Record<string,[string,string]>={
    '0,2':['带本书去咖啡馆','找个靠窗的位置，带本书坐一下午。'],
    '0,1':['西湖边的慢下午','喝杯咖啡，傍晚再沿湖走走。'],
    '1,2':['给自己一个慢周末','带本书出门，傍晚再去湖边散步。'],
    '0,1,2':['西湖边的慢下午','带本书去咖啡馆坐坐，傍晚再沿湖走走。']
  };
  // Two separate thoughts from one post stay as two nodes in a neutral draft.
  const copy=sources.length===rs.length?rules[sources.join(',')]:undefined;
  const [title,description]=copy??['把这些想法放在一起','写一句话，想想它们可以怎样连接。'];
  const order=[0,2,1];
  const ordered=[...rs].sort((a,b)=>order.indexOf(a.noteId)-order.indexOf(b.noteId));
  const now=new Date().toISOString();
  return {id:uid(),sourceThoughtIds:ordered.map(r=>r.id),title,description,status:'draft',visibility:'private',completed:false,createdAt:now,updatedAt:now};
}
export function sameExperience(a:SceneExperience,b:SceneExperience){
  return [...a.sourceThoughtIds].sort().join() === [...b.sourceThoughtIds].sort().join()&&a.title.trim()===b.title.trim()&&a.description.trim()===b.description.trim();
}
