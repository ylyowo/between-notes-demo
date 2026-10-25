import { useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, X, ChevronRight, Check, Lock } from 'lucide-react';
import type { SceneExperience } from '../planning';
import type { RecordItem } from '../model';
import { dayLabel } from '../calendar';
import { DateField } from './DateControls';
import { Cover, Source } from './IdeaLayer';
import { NoteDetail } from './NoteDetail';
import { notes } from '../data';

export const sceneRoles = ['地点', '延伸', '体验'];
export const sceneLabels = ['去西湖边的咖啡馆', '傍晚沿着湖边散步', '带本书，慢慢翻几页'];
export const sceneSteps = ['去西湖周边的咖啡馆坐坐。', '傍晚沿湖慢慢走。', '带本书，随便翻翻。'];

type Props = {
  initial: SceneExperience;
  records: RecordItem[];
  isNew?: boolean;
  onClose: () => void;
  onSave: (plan: SceneExperience) => SceneExperience;
  onScheduled: (date: string) => void;
  onCollage: (ids: string[]) => void;
  notify: (message: string) => void;
};

export function PlanEditor({ initial, records, isNew, onClose, onSave, onScheduled, onCollage, notify }: Props) {
  const [plan, setPlan] = useState(structuredClone(initial));
  const [mode, setMode] = useState<'edit' | 'preview' | 'public'>(initial.visibility === 'public' ? 'public' : 'edit');
  const [sourceId, setSourceId] = useState<number | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [dateRequest, setDateRequest] = useState(0);
  const scroll = useRef<HTMLDivElement>(null);
  const dateArea = useRef<HTMLDivElement>(null);
  const selected = plan.sourceThoughtIds
    .map(id => records.find(record => record.id === id))
    .filter((record): record is RecordItem => !!record);
  const valid = selected.length >= 2 && selected.length <= 3 && !!plan.title.trim() && !!plan.description.trim();
  const neutral = new Set(selected.map(record => record.noteId)).size !== selected.length;
  const dates = selected.map(record => record.plannedDate);
  const commonDate = dates.length > 0 && dates.every(date => date && date === dates[0]) ? dates[0] : undefined;

  function change(patch: Partial<SceneExperience>) {
    setPlan(previous => ({ ...previous, ...patch, updatedAt: new Date().toISOString() }));
  }
  function save(action: 'draft' | 'scheduled' | 'public') {
    if (!valid) {
      notify(selected.length < 2 ? '至少保留两个想法才能组成体验' : '请写好体验标题和描述');
      return;
    }
    if (action === 'scheduled' && !plan.plannedDate) {
      setDateRequest(previous => previous + 1);
      requestAnimationFrame(() => scroll.current?.scrollTo({ top: (dateArea.current?.offsetTop ?? 0) - 20, behavior: 'smooth' }));
      return;
    }
    const next: SceneExperience = {
      ...plan,
      sourceThoughtIds: selected.map(record => record.id),
      title: plan.title.trim(),
      description: plan.description.trim(),
      status: action === 'scheduled' ? 'scheduled' : plan.status,
      visibility: action === 'public' ? 'public' : plan.visibility,
      updatedAt: new Date().toISOString(),
    };
    const stored = onSave(next);
    setPlan(stored);
    const merged = stored.id !== next.id;
    if (action === 'scheduled') {
      onScheduled(stored.plannedDate!);
      if (!merged) notify('已加入这一天');
    } else if (action === 'draft') {
      if (!merged) notify('体验已存好');
      onClose();
    } else {
      setMode('public');
      if (!merged) notify('发布成功');
    }
  }
  function move(index: number, direction: number) {
    const ids = [...plan.sourceThoughtIds];
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    change({ sourceThoughtIds: ids });
  }

  if (sourceId !== null) return (
    <div className="flow-source">
      <NoteDetail note={notes[sourceId]} onBack={() => setSourceId(null)} onSwitch={setSourceId}
        onShare={() => { setSourceId(null); setShowSources(true); }}
        onSelection={() => notify('返回原笔记后可以记想法')} />
    </div>
  );

  return (
    <section className="plan-editor">
      <header className="flow-header">
        <button aria-label="返回体验上一级" onClick={() => {
          if (showSources) setShowSources(false);
          else if (mode === 'preview') setMode('edit');
          else onClose();
        }}><ArrowLeft size={22} /></button>
        <b>{showSources ? '灵感来源' : mode === 'preview' ? '发布笔记' : mode === 'public' ? '我的体验笔记' : isNew ? '新的体验 ✨' : '我的体验'}</b>
        <span className="privacy-tag">{plan.visibility === 'public' ? '已公开' : <><Lock size={11} />仅自己可见</>}</span>
      </header>
      <div ref={scroll} className="flow-scroll plan-scroll">
        {showSources ? selected.map(record => (
          <div className="lookup-result" key={record.id}><Source id={record.noteId} onOpen={() => setSourceId(record.noteId)} /></div>
        )) : <>
          {mode === 'edit' && <p className="connection-success">这 {selected.length} 个想法，可以这样连起来。</p>}
          {mode === 'public' ? <><div className="published-feedback"><Check size={14} />已在演示社区发布</div><h2>{plan.title}</h2></> : (
            <label className="plan-field">体验标题<input aria-label="体验标题" value={plan.title} onChange={event => change({ title: event.target.value })} /></label>
          )}
          <div className="plan-photo-strip">{selected.map(record => (
            <button key={record.id} aria-label={'查看体验来源 ' + record.text} onClick={() => setSourceId(record.noteId)}>
              <Cover id={record.noteId} /><span>{sceneRoles[record.noteId]}</span>
            </button>
          ))}</div>
          {mode === 'public' ? <p className="plan-description">{plan.description}</p> : (
            <label className="plan-field">一句话描述<textarea aria-label="体验描述" value={plan.description} onChange={event => change({ description: event.target.value })} /></label>
          )}
          {mode === 'edit' && <>
            <p className="plan-mini-label">想法之间</p>
            <div className="connection-nodes">{selected.map((record, index) => (
              <article className="connection-node" key={record.id} data-thought-id={record.id}>
                <span className="connection-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="connection-node-body">
                  <b>{neutral ? record.text : (sceneLabels[record.noteId] ?? record.text)}</b>
                  <p>{record.text}</p>
                  <button className="node-source" onClick={() => setSourceId(record.noteId)}>来源：{notes[record.noteId].author}<ChevronRight size={12} /></button>
                </div>
                <div className="step-controls">
                  <button disabled={index === 0} aria-label={'上移想法 ' + record.text} onClick={() => move(index, -1)}><ArrowUp size={13} /></button>
                  <button disabled={index === selected.length - 1} aria-label={'下移想法 ' + record.text} onClick={() => move(index, 1)}><ArrowDown size={13} /></button>
                  <button disabled={selected.length <= 1} aria-label={'移除想法 ' + record.text} onClick={() => change({ sourceThoughtIds: plan.sourceThoughtIds.filter(id => id !== record.id), status: 'draft', plannedDate: undefined })}><X size={14} /></button>
                </div>
              </article>
            ))}</div>
            {selected.length < 2 && <p className="field-error" role="alert">至少保留两个想法才能组成体验</p>}
            <div ref={dateArea}><DateField value={plan.plannedDate} onChange={date => change({ plannedDate: date, status: date === initial.plannedDate ? initial.status : 'draft' })} label="体验安排在哪天？" openRequest={dateRequest} /></div>
            {commonDate && !plan.plannedDate && <button className="date-recommendation" onClick={() => change({ plannedDate: commonDate })}>推荐 {dayLabel(commonDate)} <b>用这一天</b></button>}
            {!commonDate && !plan.plannedDate && <p className="draft-note">日期可稍后再选。</p>}
          </>}
          {mode !== 'edit' && plan.plannedDate && <p className="plan-date-summary">{dayLabel(plan.plannedDate)} · {plan.status === 'scheduled' ? '已加入日历' : '还未加入日历'}</p>}
          <button className="collage-sources" onClick={() => setShowSources(true)}>灵感来自 {new Set(selected.map(record => record.noteId)).size} 篇笔记<ChevronRight size={14} /></button>
          {mode === 'edit' && <button className="inline-muted plan-collage-entry" disabled={!valid} onClick={() => onCollage(selected.map(record => record.id))}>也可以拼成一张生活手账 ›</button>}
          {mode === 'public' && <button className="quiet-button full-width" onClick={() => setMode('edit')}>继续编辑体验</button>}
        </>}
      </div>
      {!showSources && <footer className={'experience-actions ' + (mode === 'edit' ? 'plan-three-actions' : '')}>
        {mode === 'edit' ? <>
          <button className="quiet-button" disabled={!valid} onClick={() => save('draft')}>先存着</button>
          <button className="quiet-button schedule-button" disabled={!valid} onClick={() => save('scheduled')}>加入这一天</button>
          <button className="red-button" disabled={!valid} onClick={() => setMode('preview')}>分享成笔记</button>
        </> : mode === 'preview' ? <>
          <button className="quiet-button" onClick={() => setMode('edit')}>返回编辑</button>
          <button className="red-button" disabled={!valid} onClick={() => save('public')}>确认发布</button>
        </> : <button className="red-button" onClick={onClose}>回我的想法</button>}
      </footer>}
    </section>
  );
}
