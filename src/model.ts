export type RecordItem={id:string;noteId:number;quote:string;image?:string;text:string;createdAt:string;origin?:'user-save'|'legacy-import';visibility:'private';plannedDate?:string;completed?:boolean;updatedAt?:string};
export type Experience={id:string;noteIds:number[];title:string;text:string;visibility:'private'|'public';createdAt:string;parentId?:string;owner:string};
export function readLocal<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
export const uid=()=>crypto.randomUUID();
export const defaults=['周六下午去坐坐','喝完咖啡可以去走走','去的时候带本书',''];

export function writeLocal(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}

export function readArray<T>(key:string):T[]{const value=readLocal<unknown>(key,[]);return Array.isArray(value)?value:[]}
