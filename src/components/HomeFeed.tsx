import{useState,type RefObject}from'react';
import{MessageCircle,Search,Heart,Plus,ChevronDown}from'lucide-react';
import{notes,type Note}from'../data';

export function HomeFeed({onOpen,notify,scrollRef}:{onOpen:(id:number)=>void;notify:(s:string)=>void;scrollRef:RefObject<HTMLDivElement|null>}){
  const[tab,setTab]=useState('发现'),[category,setCategory]=useState('推荐');
  const card=(note:Note)=><button className={'feed-card feed-card-'+note.id} key={note.id} onClick={()=>onOpen(note.id)} aria-label={'打开笔记：'+note.title}>
    <img className="feed-cover" src={import.meta.env.BASE_URL+'assets/'+note.images[0]+'.png'} alt={note.title}/>
    <div className="feed-card-copy"><h2>{note.title}</h2><div className="feed-card-meta"><span className={'feed-avatar avatar-'+note.id}>{note.avatar}</span><span className="feed-author">{note.author}</span><span className="feed-likes"><Heart size={14}/>{note.likes}</span></div></div>
  </button>;
  return <section className="home-feed" aria-label="小红书首页">
    <header className="feed-topbar"><button aria-label="首页消息" onClick={()=>notify('暂时没有新消息')}><MessageCircle size={23}/></button><nav aria-label="首页导航">{['关注','发现','杭州'].map(t=><button key={t} className={tab===t?'active':''} aria-current={tab===t?'page':undefined} onClick={()=>{setTab(t);if(t==='关注')notify('关注页演示 · 先看看这些生活分享')}}>{t}</button>)}</nav><button aria-label="首页搜索" onClick={()=>notify('搜索演示 · 当前可浏览下方四篇笔记')}><Search size={23}/></button></header>
    <nav className="feed-categories" aria-label="笔记分类">{['全城','推荐','活动','美食','新热打卡','周末出行'].map(c=><button key={c} className={category===c?'active':''} onClick={()=>{setCategory(c);if(c!=='推荐')notify(c+' · 展示本地演示笔记')}}>{c}{c==='全城'&&<ChevronDown size={12}/>}</button>)}</nav>
    <div className="feed-scroll" ref={scrollRef}><div className="feed-masonry"><div className="feed-column">{[notes[0],notes[2]].map(card)}</div><div className="feed-column">{[notes[1],notes[3]].map(card)}</div></div></div>
    <footer className="feed-bottom-tabs"><button className="active" aria-current="page" onClick={()=>{setTab('发现');setCategory('推荐');scrollRef.current?.scrollTo({top:0,behavior:'smooth'})}}>首页</button><button onClick={()=>notify('暂未开放')}>市集</button><button className="feed-publish" aria-label="发布笔记" onClick={()=>notify('暂未开放')}><Plus size={30} strokeWidth={2.4}/></button><button onClick={()=>notify('暂未开放')}>消息</button><button onClick={()=>notify('暂未开放')}>我</button></footer>
  </section>
}
