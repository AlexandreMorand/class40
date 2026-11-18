/* Classe 40 - app.js (VF) */
(function(){
"use strict";
var D = window.C40DATA || {};
var $ = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

/* ---------- COURSES / SESSIONS ---------- */
var COURSES = [
  {id:'cr', code:'CR', name:'Corporate Reporting', sub:'Module 1 - Corporate Financial Reporting'},
  {id:'da', code:'DA', name:'Data Analysis', sub:'Analyse de donnees'},
  {id:'fm', code:'FM', name:'Financial Management and Financial Markets', sub:'Gestion financiere et marches financiers'},
  {id:'cg', code:'CG', name:'Corporate Governance', sub:'Gouvernance'}
];
function courseOf(id){ for(var i=0;i<COURSES.length;i++) if(COURSES[i].id===id) return COURSES[i]; return COURSES[0]; }
function sessionsOf(cid){
  var raw = D.SESSIONS[cid], out = [];
  if(!raw) return out;
  if(cid==='fm'){
    (raw.partI||[]).forEach(function(s){ out.push({n:s.n, key:String(s.n), title:s.topic, hasFiche:!!s.hasFiche, part:'I'}); });
    (raw.partII||[]).forEach(function(s){ out.push({n:s.n, key:'II-'+s.n, title:s.topic, hasFiche:!!s.hasFiche, part:'II'}); });
  } else {
    raw.forEach(function(a){ out.push({n:a[0], key:String(a[0]), title:a[1], date:a[2]||null, hasFiche:!!(cid==='cr'?a[3]:a[2]&&cid==='cg'?a[2]:false)}); });
    if(cid==='cg') raw.forEach(function(a,i){ out[i].hasFiche=!!a[2]; });
  }
  return out;
}
function sessionKey(cid){ return cid; }
function contentSessionKey(cid, item){
  var key=String(item.session);
  if(cid==='fm' && item.part==='II' && key.indexOf('II-')!==0) return 'II-'+key;
  return key;
}
function matchesSession(cid, item, n){
  var wanted=String(n), actual=contentSessionKey(cid,item);
  return actual===wanted || actual.indexOf(wanted+'-')===0;
}
function bank(cid, n, set){
  var b = (D.QCM[cid]||[]).filter(function(q){ return matchesSession(cid,q,n); });
  if(set!=null) b = b.filter(function(q){ return (q.set||1)===set; });
  return b;
}
function levelBank(cid,n,level){
  var groups = (D.QCM_LEVELS||{})[cid]||{};
  var b = groups[String(n)]||[];
  return level==null ? b : b.filter(function(q){ return q.level===level; });
}
function levelLabel(level){ return ['','Medium','Difficile','Expert'][level]||''; }
function levelProgress(cid,n,level){
  var b=levelBank(cid,n,level),m=bestByQuestion(),done=0,corr=0;
  b.forEach(function(q){var a=m[questionProgressKey(cid,q)];if(a){done++;if(a.correct)corr++;}});
  return {done:done,total:b.length,pct:b.length?Math.round(done/b.length*100):0,acc:done?Math.round(corr/done*100):0};
}
function allQuestions(cid){
  var a=(D.QCM[cid]||[]).slice(),groups=(D.QCM_LEVELS||{})[cid]||{};
  Object.keys(groups).forEach(function(n){a=a.concat(groups[n]);});return a;
}
function levelTiles(cid,n){
  var descriptions=['','Application et raisonnement, sans questions de simple recitation.','Calculs lies et cas a plusieurs etapes.','Cas integres, contraintes et pieges de modelisation.'];
  return [1,2,3].filter(function(l){return levelBank(cid,n,l).length;}).map(function(l){
    var p=levelProgress(cid,n,l);
    return '<div class="tile" data-go="#/q/'+cid+'/'+n+'/level'+l+'"><span class="ic">'+IC.qcm+'</span><b>QCM '+l+' &middot; '+levelLabel(l)+'</b><span>'+descriptions[l]+'</span><span>'+p.done+'/'+p.total+' questions &middot; '+p.acc+'% reussite</span><div class="bar"><i class="'+(p.pct===100?'full':'')+'" data-w="'+p.pct+'"></i></div><span class="arrow">'+(p.done?'Continuer':'Commencer')+' &rarr;</span></div>';
  }).join('');
}
function setsOf(cid, n){
  var m = {}, out = [];
  bank(cid,n).filter(function(q){return !q.supplement;}).forEach(function(q){ var s = q.set||1; if(!m[s]){ m[s]=1; out.push(s); } });
  return out.sort(function(a,b){ return a-b; });
}
function setProgress(cid, n, set){
  var b = bank(cid,n,set); if(!b.length) return {done:0,total:0,pct:0,acc:0};
  var m = bestByQuestion(), done=0, corr=0;
  b.forEach(function(q){ var key=questionProgressKey(cid,q); if(m[key]){ done++; if(m[key].correct) corr++; } });
  return {done:done, total:b.length, pct:Math.round(done/b.length*100), acc:done?Math.round(corr/done*100):0};
}
function cards(cid, n){
  var all=D.FLASHCARDS[cid]||[];
  if(n==null) return all;
  return all.filter(function(q){ return matchesSession(cid,q,n); });
}
function progressKey(cid,session,id){ return cid+'|'+String(session)+'|'+String(id); }
function questionProgressKey(cid,q){ return progressKey(cid,contentSessionKey(cid,q),q.id); }
function ficheUrl(cid,n){ var k=String(n); var f=D.FICHE_URLS[cid]; var u=f ? f[k] : null; if(!u) return null; return u + (u.indexOf('?')>=0 ? '&' : '?') + 'v=20261116-f2'; }

/* ---------- STORE + MIGRATION ---------- */
var KEY='c40.v2', OLDKEY='c40.db.v1';
var store = loadStore();
function blank(){ return {v:1, attempts:[], fc:{}, fiches:{}, dlEdits:{}, dlCustom:{}, settings:{correction:'now'}, migrated:false}; }
function loadStore(){
  try{
    var raw = localStorage.getItem(KEY);
    if(raw){ var s = JSON.parse(raw); if(s && s.v===1) return s; }
  }catch(e){}
  var s2 = blank();
  migrate(s2);
  return s2;
}
function migrate(s){
  try{
    var raw = localStorage.getItem(OLDKEY);
    if(!raw){ s.migrated = true; save(s); return; }
    var old = JSON.parse(raw);
    var cols = old.collections || old;
    var seen = {};
    function pushAttempt(r){
      if(!r || !r.questionId) return;
      var k = r.questionId+'|'+(r.ts||0)+'|'+(r.correct?'1':'0');
      if(seen[k]) return; seen[k]=1;
      s.attempts.push({course:r.course||'', session:String(r.session==null?'':r.session), questionId:String(r.questionId), topic:r.topic||'', correct:!!r.correct, ts:r.ts||Date.now(), source:r.source||'session', secs:r.secs||0});
    }
    var qa = cols.qcmAttempts||{};
    Object.keys(qa).forEach(function(id){ pushAttempt(qa[id]); });
    var fl = cols.ficheLog||{};
    Object.keys(fl).forEach(function(id){ if(fl[id] && fl[id].seen) s.fiches[id]=true; });
    var fs2 = cols.fcStatus||{};
    Object.keys(fs2).forEach(function(id){ var v=fs2[id]; if(v && v.status) s.fc[id]=v.status; });
    var de = cols.deadlineEdits||{};
    Object.keys(de).forEach(function(id){ s.dlEdits[id]=de[id]; });
    var dc = cols.customDeadlines||{};
    Object.keys(dc).forEach(function(id){ s.dlCustom[id]=dc[id]; });
    s.migrated = true;
    save(s);
  }catch(e){ s.migrated = true; }
}
function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s||store)); }catch(e){} }
function addAttempt(rec){ store.attempts.push(rec); save(); }

/* ---------- PROGRESS ---------- */
function bestByQuestion(){
  var m = {};
  store.attempts.forEach(function(a){ var key=progressKey(a.course,a.session,a.questionId); if(!m[key]) m[key]={correct:a.correct, n:0}; m[key].n++; if(a.correct) m[key].correct=true; });
  return m;
}
function sessionProgress(cid, n){
  var b = bank(cid,n).concat(levelBank(cid,n)); if(!b.length) return {done:0,total:0,pct:0,acc:0};
  var m = bestByQuestion(), done=0, corr=0;
  b.forEach(function(q){ var key=questionProgressKey(cid,q); if(m[key]){ done++; if(m[key].correct) corr++; } });
  return {done:done, total:b.length, pct:Math.round(done/b.length*100), acc:done?Math.round(corr/done*100):0};
}
function courseProgress(cid){
  var all = allQuestions(cid); if(!all.length) return {pct:0, done:0, total:0};
  var m = bestByQuestion(), done=0;
  all.forEach(function(q){ if(m[questionProgressKey(cid,q)]) done++; });
  return {pct:Math.round(done/all.length*100), done:done, total:all.length};
}
function globalProgress(){
  var tot=0, done=0; var m = bestByQuestion();
  COURSES.forEach(function(c){ allQuestions(c.id).forEach(function(q){ tot++; if(m[questionProgressKey(c.id,q)]) done++; }); });
  return {pct: tot?Math.round(done/tot*100):0, done:done, total:tot};
}
function accuracy(){
  var m = bestByQuestion(), done=0, corr=0;
  Object.keys(m).forEach(function(k){ done++; if(m[k].correct) corr++; });
  return done?Math.round(corr/done*100):0;
}
function masteredTopics(){
  var t = {};
  store.attempts.forEach(function(a){ if(!a.topic) return; var k=a.topic; t[k]=t[k]||{n:0,c:0}; t[k].n++; if(a.correct) t[k].c++; });
  var out=0;
  Object.keys(t).forEach(function(k){ if(t[k].n>=3 && t[k].c/t[k].n>=0.8) out++; });
  return out;
}
function dayKey(ts){ var d=new Date(ts); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function streakDays(){
  var days = {};
  store.attempts.forEach(function(a){ days[dayKey(a.ts)]=1; });
  var fiches = Object.keys(store.fiches); if(!Object.keys(days).length && !fiches.length) return 0;
  var streak=0, d=new Date();
  if(!days[dayKey(d.getTime())]) d.setDate(d.getDate()-1); /* allow today not yet done */
  while(days[dayKey(d.getTime())]){ streak++; d.setDate(d.getDate()-1); }
  return streak;
}
function todayDone(){ var k=dayKey(Date.now()); return store.attempts.filter(function(a){ return dayKey(a.ts)===k && a.correct; }).length; }
function minutesToday(){
  var k=dayKey(Date.now()), s=0;
  store.attempts.forEach(function(a){ if(dayKey(a.ts)===k) s += (a.secs||0); });
  return Math.max(1, Math.round(s/60)) || 0;
}
function nextMission(){
  for(var ci=0; ci<COURSES.length; ci++){
    var cid = COURSES[ci].id, ss = sessionsOf(cid);
    for(var i=0;i<ss.length;i++){
      var p = sessionProgress(cid, ss[i].key);
      if(p.total && p.pct < 100) return {course:cid, s:ss[i], p:p};
    }
  }
  return null;
}

/* ---------- ICONS ---------- */
var IC = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>',
  qcm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>',
  card:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
  plan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4a2 2 0 0 1 6 0"/><path d="M9 11l2 2 4-4"/><path d="M9 16h6"/></svg>',
  pdf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  sheet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
  data:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>'
};

/* ---------- ROUTER ---------- */
var state = {course:'cr'};
try{ var _f=JSON.parse(localStorage.getItem('c40.v2')||'{}').focus; if(_f) state.course=_f; }catch(e){}
function parseHash(){
  var h = location.hash.replace(/^#\/?/, '');
  var p = h.split('/').filter(Boolean);
  if(!p.length) return {page:'home'};
  if(p[0]==='plan') return {page:'plan'};
  if(p[0]==='rev') return {page:'rev'};
  if(p[0]==='exam') return {page:'exam'};
  if(p[0]==='rc'&&p[1]) return {page:'recall', course:p[1]};
  if(p[0]==='c'&&p[1]) return {page:'course', course:p[1]};
  if(p[0]==='s'&&p[1]&&p[2]!=null) return {page:'session', course:p[1], n:p[2]};
  if(p[0]==='qb') return p[1]==='play' ? {page:'qplay'} : {page:'qbuilder'};
  if(p[0]==='q'&&p[1]) return {page:'quiz', course:p[1], n:p[2]||null, src:p[3]||null};
  if(p[0]==='f'&&p[1]) return {page:'flash', course:p[1], n:p[2]||null};
  if(p[0]==='cs'&&p[1]) return {page:'cheat', course:p[1]};
  if(p[0]==='dl') return {page:'deadlines'};
  if(p[0]==='pt'&&p[1]) return {page:'ptitem', item:p[1]};
  if(p[0]==='pt') return {page:'partiels'};
  if(p[0]==='moy') return {page:'moyennes'};
  if(p[0]==='ex') return {page:'ex', ch:p[1]||null, k:p[2]||null};
  return {page:'home'};
}
function go(h){ location.hash = h; }
window.addEventListener('hashchange', render);

/* ---------- PARTIELS ---------- */
var ptb = null;
function ptExams(){ return ((D.PARTIELS||{}).exams||[]).slice().sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); }); }
function ptItem(id){ return ((D.PARTIELS||{}).items||{})[id] || null; }
function ptDays(dateStr){ var d=new Date(dateStr); if(isNaN(d)) return null; var now=new Date(); if(d.getTime()<now.getTime()) return -1; var a=new Date(d.getFullYear(),d.getMonth(),d.getDate()), c=new Date(now.getFullYear(),now.getMonth(),now.getDate()); return Math.round((a-c)/86400000); }
function ptScores(){ try{ return JSON.parse(localStorage.getItem('c40-pt-v1')||'{}'); }catch(e){ return {}; } }
function ptScore(id){ var s=ptScores()[id] || null; if(s) s.stale=(s.revision||1)!==((ptItem(id)||{}).revision||1); return s; }
function ptSaveScore(id, ok, total){ var s=ptScores(); s[id]={ok:ok,total:total,ts:Date.now(),revision:(ptItem(id)||{}).revision||1}; try{ localStorage.setItem('c40-pt-v1', JSON.stringify(s)); }catch(e){} }
function ptTotal(){ return ptb ? ptb.item.mcq.length + ptb.item.open.length : 0; }
function ptStart(id){ var it=ptItem(id); if(!it||it.type!=='blanc') return; ptb={itemId:id, item:it, idx:0, phase:'run', ans:{}, texts:{}}; render(); }
function ptAnswer(i){ if(!ptb||ptb.phase!=='run') return; if(ptb.idx>=ptb.item.mcq.length) return; ptb.ans[ptb.idx]=i; render(); }
function ptCapture(){ var ta=document.getElementById('ptTa'); if(ta&&ptb&&ptb.phase==='run'&&ptb.idx>=ptb.item.mcq.length){ ptb.texts[ptb.idx-ptb.item.mcq.length]=ta.value; } }
function ptFinish(){ if(!ptb) return; ptCapture(); var ok=0; ptb.item.mcq.forEach(function(q,i){ if(ptb.ans[i]===q.correct) ok++; }); ptb.score={ok:ok, total:ptb.item.mcq.length}; ptb.phase='done'; ptSaveScore(ptb.itemId, ok, ptb.item.mcq.length); render(); }
document.addEventListener('input', function(e){ if(e.target&&e.target.id==='ptTa'&&ptb&&ptb.phase==='run'&&ptb.idx>=ptb.item.mcq.length){ ptb.texts[ptb.idx-ptb.item.mcq.length]=e.target.value; } });
function vPartiels(){
  var html = '<div class="page-h">Partiels</div><div class="page-sub">Must know et partiels blancs au format officiel, du plus proche au plus lointain.</div>';
  ptExams().forEach(function(ex){
    var days = ptDays(ex.date);
    var badge = ex.kind==='exercise'
      ? '<span class="pt-badge soft">seance d&#39;exercices</span>'
      : (days!=null && days>=0 ? '<span class="pt-badge">'+(days===0?"aujourd&#39;hui":'J-'+days)+'</span>' : (days!=null ? '<span class="pt-badge soft">passe</span>' : ''));
    var items = (ex.items||[]).map(function(iid){
      var it = ptItem(iid); if(!it) return '';
      var det = it.type==='blanc' ? ((it.mcq.length? it.mcq.length+' QCM'+(it.open.length?(' + '):'') : '')+(it.open.length? it.open.length+' ouvertes':'')+' &middot; '+it.duration+' min') : (it.type==='official' ? 'Énoncé et corrigé sur Blackboard · connexion Bocconi' : (it.det ? esc(it.det) : 'Synthese des Must Know, session par session'));
      var sc = it.type==='blanc' ? ptScore(it.id) : null;
      var st = sc ? '<span class="pt-done">fait &middot; '+sc.ok+'/'+sc.total+(sc.stale?' · ancienne version':'')+'</span>' : '<span class="pt-new">nouveau</span>';
      if(it.url) return '<a class="pt-item" style="text-decoration:none" href="'+esc(it.url)+'"><span class="pt-item-t"><b>'+esc(it.title)+'</b><span>'+det+'</span></span>'+(it.badge?'<span class="pt-new">'+esc(it.badge)+'</span>':'')+'</a>';
      return '<button class="pt-item" data-go="#/pt/'+it.id+'"><span class="pt-item-t"><b>'+esc(it.title)+'</b><span>'+det+'</span></span>'+st+'</button>';
    }).join('');
    html += '<div class="card pt-exam"><div class="pt-exam-h"><span class="pt-code">'+esc(ex.code)+'</span><div class="pt-exam-t"><b>'+esc(ex.label)+'</b><span>'+esc(ex.name)+'</span></div>'+badge+'</div>'
      + '<div class="pt-date">'+esc(ex.dateLabel)+'</div>'
      + '<div class="pt-meta">'+esc(ex.format)+'</div>'
      + (ex.scope ? '<div class="pt-meta">Perimetre : '+esc(ex.scope)+'</div>' : '')
      + '<div class="pt-items">'+(items || '<div class="pt-soon">Contenu en preparation</div>')+'</div></div>';
  });
  return html;
}
function vPtItem(id){
  var it = ptItem(id);
  if(!it) return '<button class="back" data-go="#/pt">&larr; Partiels</button><div class="page-h">Introuvable</div><div class="card"><p style="font-size:13px;color:var(--muted)">Ce contenu n&#39;existe pas.</p></div>';
  if(it.type==='official') return '<button class="back" data-go="#/pt">&larr; Partiels</button><div class="page-h">'+esc(it.title)+'</div><div class="page-sub">'+esc(it.sub)+'</div><div class="card"><p style="font-size:14px;line-height:1.7;margin-bottom:20px">'+esc(it.body)+'</p><div style="display:flex;flex-wrap:wrap;gap:12px">'+it.links.map(function(l){return '<a class="cta pri" href="'+esc(l.url)+'" target="_blank" rel="noopener">'+esc(l.label)+'</a>';}).join('')+'</div><p style="font-size:12px;color:var(--muted);margin-top:16px">Si Blackboard demande une connexion, utilise ton compte Bocconi.'+(it.loc?' Dossier du cours : '+esc(it.loc)+'.':'')+'</p></div>';
  if(it.type==='mustknow') return '<button class="back" data-go="#/pt">&larr; Partiels</button>'
    + '<div class="page-h">'+esc(it.title)+'</div><div class="page-sub">'+esc(it.sub)+'</div>'
    + (it.url ? '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px"><a class="cta pri" href="'+esc(it.url)+'">Ouvrir la fiche</a>'+(it.pdf?'<a class="cta line" href="'+esc(it.pdf)+'" download>Télécharger le PDF</a>':'')+'</div>' : '')
    + '<div class="card"><div class="md">'+mdLite(it.body)+'</div></div>';
  return vPtBlanc(it);
}
function vPtBlanc(it){
  if(!ptb || ptb.itemId!==it.id) ptb={itemId:it.id, item:it, idx:0, phase:'intro', ans:{}, texts:{}};
  var back = '<button class="back" data-go="#/pt">&larr; Partiels</button>';
  if(ptb.phase==='intro'){
    return back + '<div class="page-h">'+esc(it.title)+'</div><div class="page-sub">'+esc(((ptExams().filter(function(e){return e.id===it.exam})[0]||{}).label)||'Format officiel')+' &middot; format officiel</div>'
      + '<div class="qcard"><div class="pt-rules">'
      + '<div>'+IC.clock+'<span>'+(it.duration||45)+' minutes &middot; pas de chrono impose ici, chronometre-toi</span></div>'
      + '<div>'+IC.sheet+'<span>'+esc(it.formatNote||'4 QCM a 3 options + 2 questions ouvertes a rediger')+'</span></div>'
      + '<div>'+IC.data+'<span>'+esc(it.materialNote||'Closed book · calculatrice scientifique · corrige detaille devoile a la fin')+'</span></div>'
      + '</div><p style="font-size:13px;color:var(--muted);font-weight:600;margin-bottom:18px">'+esc(it.intro)+'</p>'
      + (it.links&&it.links.length ? '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:18px">'+it.links.map(function(l){return '<a class="cta line" href="'+esc(l.url)+'" download>'+esc(l.label)+'</a>';}).join('')+'</div>' : '')
      + '<button class="cta pri" data-act="ptstart" data-id="'+it.id+'">Commencer le partiel blanc</button></div>';
  }
  if(ptb.phase==='done'){
    var h = back + '<div class="page-h">'+esc(it.title)+' &middot; corrige</div>'
      + (ptb.score.total>0 ? '<div class="qcard" style="text-align:center;margin-bottom:16px"><div class="score-big">'+ptb.score.ok+' / '+ptb.score.total+'</div>'
      + '<p style="color:var(--muted);font-weight:600;margin:6px 0 4px">QCM &middot; corrige detaille ci-dessous</p>'
      + (ptb.item.open.length ? '<p style="font-size:12.5px;color:var(--muted);font-weight:600">Pour les ouvertes, compare ta redaction a la solution detaillee.</p>' : '') + '</div>' : '<div class="qcard" style="text-align:center;margin-bottom:16px"><p style="color:var(--muted);font-weight:600;margin:6px 0 4px">Corrige detaille ci-dessous &middot; compare ta redaction a la solution.</p></div>');
    ptb.item.mcq.forEach(function(q, i){
      var mine = ptb.ans[i];
      var opts = q.choices.map(function(ch, j){
        var cls = 'opt';
        if(j===q.correct) cls += ' right';
        else if(j===mine) cls += ' wrong';
        else cls += ' dim';
        return '<div class="'+cls+'"><span class="k">'+'ABCD'[j]+'</span><span>'+esc(ch)+'</span></div>';
      }).join('');
      var verdict = (mine==null) ? '<span class="pt-badge soft">sans reponse</span>' : (mine===q.correct ? '<span class="pt-done">juste</span>' : '<span class="pt-wrong">faux</span>');
      h += '<div class="qcard" style="margin-bottom:14px"><div class="qmeta"><span>QCM '+(i+1)+' &middot; '+esc(q.session)+'</span><span style="margin-left:auto">'+verdict+'</span></div>'
        + '<div class="qq">'+esc(q.q)+'</div>'+opts
        + '<div class="expl"><b>Corrige :</b> '+esc(q.expl)+'</div></div>';
    });
    ptb.item.open.forEach(function(o, i){
      var txt = (ptb.texts[i]||'').trim();
      h += '<div class="qcard" style="margin-bottom:14px"><div class="qmeta"><span>'+esc(o.title)+'</span></div>'
        + '<div class="md" style="margin-bottom:14px">'+mdLite(o.body)+'</div>'
        + '<div class="pt-your"><b>Ta redaction</b>'+(txt ? esc(txt) : '<i>Non redige</i>')+'</div>'
        + '<div class="expl" style="margin-top:12px"><b>Solution detaillee :</b><div class="md" style="margin-top:8px">'+mdLite(o.solution)+'</div></div></div>';
    });
    h += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:4px"><button class="cta pri" data-act="ptretry">Refaire ce partiel blanc</button><button class="cta line" data-go="#/pt">Retour aux partiels</button></div>';
    return h;
  }
  var total = ptTotal(), isMcq = ptb.idx < it.mcq.length;
  var head = back + '<div class="page-h">'+esc(it.title)+'</div>'
    + '<div class="qmeta" style="max-width:720px"><span>'+(ptb.idx+1)+' / '+total+'</span><div class="bar"><i style="width:'+Math.round(ptb.idx/total*100)+'%"></i></div><span>'+(it.duration||45)+' min</span></div>';
  var foot = '<div class="qfoot">'
    + (ptb.idx>0 ? '<button class="cta line" data-act="ptprev">&larr; Precedente</button>' : '<span></span>')
    + (ptb.idx===total-1 ? '<button class="cta pri" data-act="ptfinish">Terminer et voir le corrige</button>' : '<button class="cta pri" data-act="ptnext">Suivante &rarr;</button>')
    + '</div>';
  if(isMcq){
    var q = it.mcq[ptb.idx], mine = ptb.ans[ptb.idx];
    var opts = q.choices.map(function(ch, j){
      return '<button class="opt'+(j===mine?' sel':'')+'" data-act="ptans" data-i="'+j+'"><span class="k">'+'ABCD'[j]+'</span><span>'+esc(ch)+'</span></button>';
    }).join('');
    return head + '<div class="qcard"><div class="qmeta"><span>QCM '+(ptb.idx+1)+' &middot; '+esc(q.session)+'</span></div><div class="qq">'+esc(q.q)+'</div>'+opts+foot+'</div>';
  }
  var oi = ptb.idx - it.mcq.length, o = it.open[oi];
  return head + '<div class="qcard"><div class="qmeta"><span>'+esc(o.title)+'</span></div>'
    + '<div class="md" style="margin-bottom:14px">'+mdLite(o.body)+'</div>'
    + '<textarea id="ptTa" class="pt-ta" placeholder="Redige ta reponse ici, calculs compris. Le corrigé detaille arrive a la fin.">'+esc(ptb.texts[oi]||'')+'</textarea>'
    + foot + '</div>';
}


/* ---------- TABLEAUX DES EXERCICES (texte aligne -> vrai tableau HTML) ---------- */
function exParseTable(txt){
  var NUM=/^(\(?[-–]?[£$€]?\d[\d,\.]*[kmKM%]?\)?|[£$€]\d*[kmKM]?|[-–]|nil|n\/a)$/i;
  var RULE=/^[\s–—\-=_─]+$/;
  var lines=String(txt).replace(/\t/g,'    ').split('\n'), rows=[], rule=null;
  lines.forEach(function(raw){
    var ln=raw.replace(/\s+$/,''), isSec=false;
    if(ln.charAt(0)==='\u0001'){ ln=ln.slice(1); isSec=true; }
    if(!ln.trim()) return;
    if(RULE.test(ln) && /[–—=_]{2,}|-{3,}/.test(ln)){ rule = /=/.test(ln) ? 'dbl' : 'sgl'; return; }
    var cells=[], re=/\S+(?: \S+)*/g, m;
    while((m=re.exec(ln))){ cells.push({t:m[0], s:m.index, e:m.index+m[0].length}); }
    /* chunks separes par 2 espaces ou plus : decouper les chunks qui sont des suites de nombres */
    var out=[];
    cells.forEach(function(c){
      var toks=c.t.split(' ');
      if(toks.every(function(t){ return NUM.test(t); }) && toks.length>1){
        var pos=c.s; toks.forEach(function(t){ out.push({t:t,s:pos,e:pos+t.length,num:true}); pos+=t.length+1; });
      } else { c.num = NUM.test(c.t); out.push(c); }
    });
    /* libelle suivi d'un seul espace puis d'un nombre : separer le dernier jeton */
    if(out.length===1 && !out[0].num){
      var tk=out[0].t.split(' ');
      if(tk.length>=2){ var last=tk[tk.length-1]; if(NUM.test(last) && /[,\(\.%]/.test(last) && !/^\d{4}$/.test(last)){
        var c0=out[0]; var lab=tk.slice(0,-1).join(' ');
        out=[{t:lab,s:c0.s,e:c0.s+lab.length,num:false},{t:last,s:c0.e-last.length,e:c0.e,num:true}];
      } }
    }
    if(isSec){
      var mm=ln.trim().match(/^([\d,\.\(\)]+)\s+([A-Za-z].*)$/);
      if(mm){ rows.push({cells:[{t:mm[1],s:0,e:0,num:true,guess:true}], rule:null, indent:0, raw:mm[1]}); ln=mm[2]; }
      out=[{t:ln.trim(),s:0,e:ln.trim().length,num:false}];
    }
    rows.push({cells:out, rule:rule, indent:(out[0]?out[0].s:0), raw:ln, sec:isSec}); rule=null;
  });
  if(rule && rows.length) rows[rows.length-1].after=rule;
  return rows;
}
function exTableHtml(txt){
  var rows=exParseTable(txt);
  if(rows.length<2) return null;
  /* centres des colonnes de valeurs = bords droits regroupes */
  var edges=[];
  rows.forEach(function(r){ r.cells.forEach(function(c,i){ if(c.num && !c.guess) edges.push(c.e); }); });
  edges.sort(function(a,b){ return a-b; });
  var cols=[];
  edges.forEach(function(e){ var L=cols[cols.length-1]; if(L && e-L.max<=3){ L.max=e; L.n++; L.sum+=e; } else cols.push({min:e,max:e,n:1,sum:e}); });
  cols=cols.filter(function(c){ return c.n>=1; }).map(function(c){ return c.sum/c.n; });
  if(!cols.length || cols.length>8) return null;
  function colOf(c){ if(c.guess) return Math.min(1,cols.length-1); var ctr=c.num?c.e:(c.s+c.e)/2, best=0, bd=1e9; cols.forEach(function(x,i){ var d=Math.abs(x-ctr); if(d<bd){ bd=d; best=i; } }); return best; }
  var valueRows=0, minInd=1e9;
  rows.forEach(function(r){ var lab=r.cells[0]&&!r.cells[0].num; if(r.cells.some(function(c){return c.num;})) valueRows++; if(lab) minInd=Math.min(minInd,r.indent); });
  if(valueRows<1) return null;
  var h='<div class="extw"><table class="extb" data-cols="'+cols.length+'"><tbody>';
  rows.forEach(function(r,ri){
    var hasNum=r.cells.some(function(c){ return c.num; });
    var first=r.cells[0], hasLab=first && !first.num;
    var isHead=!hasLab && ri<=2 && !r.cells.some(function(c){ return /\d{2},?\d{3}|\d{3,}\./.test(c.t); }) ;
    var cls=(r.rule?' r-'+r.rule:'')+(r.after==='dbl'?' a-dbl':'')+(isHead?' hd':'');
    if(r.sec || (!hasNum && hasLab && r.cells.length===1)){
      var lv=Math.min(3,Math.max(0,Math.round((r.indent-(minInd===1e9?0:minInd))/3)));
      h+='<tr class="'+cls+' sec"><td colspan="'+(cols.length+1)+'" style="padding-left:'+(10+lv*14)+'px">'+esc(first.t)+'</td></tr>'; return;
    }
    var vals=new Array(cols.length), label='';
    r.cells.forEach(function(c,i){
      if(i===0 && hasLab){ label=c.t; return; }
      var k=colOf(c);
      if(vals[k]===undefined) vals[k]={t:c.t,num:c.num}; else vals[k].t+=' '+c.t;
    });
    var lv2=Math.min(3,Math.max(0,Math.round((r.indent-(minInd===1e9?0:minInd))/3)));
    h+='<tr class="'+cls+'"><td class="lb" style="padding-left:'+(10+(hasLab?lv2*14:0))+'px">'+esc(label)+'</td>';
    for(var k=0;k<cols.length;k++){ var v=vals[k]; h+='<td class="nm'+(v&&!v.num?' tx':'')+'">'+(v?esc(v.t):'')+'</td>'; }
    h+='</tr>';
  });
  return h+'</tbody></table></div>';
}
function exTableMaxCols(h){ var m=h&&h.match(/data-cols="(\d+)"/); return m?parseInt(m[1],10):0; }
function exBodyHtml(b){
  var out='', i=0;
  function shortHead(x){ return x && x[0]==='p' && x[1].length<=70 && !/[.;]\s*$/.test(x[1]) && !/^\(?[a-h]\)/.test(x[1]) && !/^(Required|Notes?)\b/i.test(x[1]); }
  while(i<b.length){
    if(b[i][0]==='t'){
      /* run = blocs t, avec des titres courts de section intercales entre deux tableaux */
      var j=i, parts=[], cnt=0;
      while(j<b.length){
        if(b[j][0]==='t'){ parts.push({t:'t',x:b[j][1]}); j++; cnt++; }
        else if(shortHead(b[j]) && b[j+1] && b[j+1][0]==='t'){ parts.push({t:'p',x:b[j][1]}); j++; }
        else break;
      }
      /* regroupement glouton : on agrandit le tableau tant que les colonnes restent coherentes (6 max) */
      var k=0;
      while(k<parts.length){
        var best=null, bestEnd=k;
        for(var e=k;e<parts.length;e++){
          if(parts[e].t!=='t') continue;
          var txt=parts.slice(k,e+1).map(function(q){ return q.t==='p' ? '\u0001'+q.x : q.x; }).join('\n'), th=null;
          try{ th=exTableHtml(txt); }catch(err){ th=null; }
          if(th && exTableMaxCols(th)<=6){ best=th; bestEnd=e; } else if(best) break;
        }
        if(best){ out+=best; k=bestEnd+1; }
        else {
          if(parts[k].t==='p') out+='<p>'+esc(parts[k].x)+'</p>';
          else out+='<pre class="extab">'+esc(parts[k].x)+'</pre>';
          k++;
        }
      }
      i=j;
    } else { out+='<p>'+esc(b[i][1])+'</p>'; i++; }
  }
  return out;
}

/* ---------- EXERCICES DU LIVRE ---------- */
var CR_SUPP={8:[{t:'IFRS 5 supplement',d:'Held for sale and discontinued operations, from the textbook',u:'fiches/cr-ifrs5.pdf'}],10:[{t:'IAS 2 supplement',d:'Inventories, from the textbook',u:'fiches/cr-ias2.pdf'}]};
function exData(){ return D.EXERCISES || null; }
function exDone(n){ return !!(store.exDone||{})[n]; }
function exAns(n){ return (store.exAns||{})[n]; }
function exHas(k){ var a=exAns(k); return a!==undefined&&a!==null; }
function exQs(i){ return i.qs||[]; }
function exKey(i,j){ return j===0 ? i.n : i.n+'#'+i.qs[j].p; }
function exStatus(i){
  var qs=exQs(i);
  if(qs.length){ var all=true, bad=false; qs.forEach(function(q,j){ var k=exKey(i,j); if(!exHas(k)) all=false; else if(exAns(k)!==q.k) bad=true; }); if(all) return bad?'ko':'ok'; return exDone(i.n)?'done':''; }
  return exDone(i.n)?'done':'';
}
function exProgress(c){ var d=0,ok=0; c.items.forEach(function(i){ var st=exStatus(i); if(st) d++; if(st==='ok') ok++; }); return {done:d, total:c.items.length, ok:ok}; }
function exTotals(){ var E=exData(), t=0, d=0; if(!E) return {done:0,total:0}; E.chapters.forEach(function(c){ var p=exProgress(c); t+=p.total; d+=p.done; }); return {done:d,total:t}; }
function exChaptersForSession(n){ var E=exData(); if(!E) return []; var k=parseInt(n,10); return E.chapters.filter(function(c){ return c.s.indexOf(k)>=0; }); }
function exFind(n){ var E=exData(), r=null; E.chapters.forEach(function(c){ c.items.forEach(function(i,j){ if(i.n===n) r={c:c,pos:j,i:i}; }); }); return r; }
function exScore(){ var E=exData(), a=0, ok=0; if(!E) return {a:0,ok:0}; E.chapters.forEach(function(c){ c.items.forEach(function(i){ exQs(i).forEach(function(q,j){ var k=exKey(i,j); if(exHas(k)){ a++; if(exAns(k)===q.k) ok++; } }); }); }); return {a:a,ok:ok}; }
function exSeqNext(c){ var ss=store.exSess; if(!ss) return null; var L=exChaptersForSession(ss), j=-1; L.forEach(function(x,t){ if(x.n===c.n) j=t; }); return j>=0&&j<L.length-1?L[j+1]:null; }
function exSessions(){ var E=exData(), m={}; E.chapters.forEach(function(c){ c.s.forEach(function(k){ m[k]=1; }); }); return Object.keys(m).map(Number).sort(function(a,b){return a-b;}); }
function exSessProg(k){ var d=0,t=0,ok=0; exChaptersForSession(k).forEach(function(c){ var p=exProgress(c); d+=p.done; t+=p.total; ok+=p.ok; }); return {done:d,total:t,ok:ok}; }
function exFirstOpen(c){ for(var j=0;j<c.items.length;j++){ if(!exStatus(c.items[j])) return j; } return c.items.length; }
function exExp(e){
  var L=String(e).split('\n'), h='<span class="exlead">'+esc(L[0])+'</span>';
  if(L.length>1) h+='<div class="exw">'+L.slice(1).map(function(l){
    var m=l.match(/^(Step \d+\.|In plain words\.|Principle(?: \([^)]*\))?\.|Reading\.|Check[^:.]*[:.]|Evidence\.|Reasoning\.|Also useful:|Note:)\s*(.*)$/);
    if(m) return '<div class="exws"><b>'+esc(m[1])+'</b> '+esc(m[2])+'</div>';
    if(/^Wrong /.test(l)) return '<div class="exws exbad">'+esc(l)+'</div>';
    return '<div class="exws">'+esc(l)+'</div>';
  }).join('')+'</div>';
  return h;
}
function exMethHtml(c,i){
  var M=D.EX_METHODS; if(!M || i.k!=='calculation') return '';
  var keys=(M.byEx&&M.byEx[i.n])||(M.byChapter&&M.byChapter[String(c.n)])||[];
  var cards=keys.map(function(k){ return M.cards[k]; }).filter(Boolean);
  if(!cards.length) return '';
  return '<details class="exmeth"><summary>Not sure about the method? Read the plain-English recap ('+cards.map(function(x){ return esc(x.t.replace(/ in plain words$/,'')); }).join(' / ')+')</summary>'
    + cards.map(function(x){ return '<div class="exmcard"><h4>'+esc(x.t)+'</h4>'+x.b.map(function(p){ return '<p>'+esc(p)+'</p>'; }).join('')+'</div>'; }).join('')+'</details>';
}
function exCardHtml(c,pos){
  var i=c.items[pos], qs=exQs(i), last=pos>=c.items.length-1, multi=qs.length>1;
  var sq=last?exSeqNext(c):null, nextHref=sq?'#/ex/'+sq.n:'#/ex/'+c.n+'/'+(pos+2);
  var body=exBodyHtml(i.b||[]);
  var h='<div class="excard"><div class="exmeta"><b>Exercise '+i.n+'</b><span class="exk '+(i.k==='calculation'?'calc':'')+'">'+i.k+'</span><span>PDF p. '+i.p+'</span>'+(multi?'<span>'+qs.length+' parts</span>':'')+'</div><div class="exstmt">'+body+'</div>';
  var allDone=qs.length>0;
  var nextBtn='<button type="button" class="cta pri" id="exnext" data-go="'+nextHref+'">'+(last&&!sq?'Finish':'Next exercise')+' &rarr;</button>';
  if(qs.length){
    if(i.star) h+='<div class="exq nq">The book gives no answer for this exercise (reserved for lecturers). These questions and answers were worked out independently from the statement, so check them against your own working.</div>';
    qs.forEach(function(q,j){
      var key=exKey(i,j), has=exHas(key), a=exAns(key); if(!has) allDone=false;
      h+='<div class="exp'+(has?' answered':'')+'">'+(multi?'<div class="exp-h">Part ('+q.p+')</div>':'')+'<div class="exq-s">'+esc(q.s)+'</div>'+q.c.map(function(t,m){
        var cls='opt'; if(has){ if(m===q.k) cls+=' right'; else if(m===a) cls+=' wrong'; else cls+=' dim'; }
        return '<button type="button" class="'+cls+'" data-act="exans" data-n="'+i.n+'" data-key="'+key+'" data-i="'+m+'"><span class="k">'+'ABCD'[m]+'</span><span>'+esc(t)+'</span></button>';
      }).join('');
      if(has) h+='<div class="exfb '+(a===q.k?'ok':'ko')+'"><b>'+(a===q.k?'Correct.':'Not quite. The correct answer is '+'ABCD'[q.k]+'.')+'</b> '+exExp(q.e)+'<div class="exfb-a"><button type="button" class="exshow" data-act="exreset" data-n="'+i.n+'" data-key="'+key+'">Try again</button></div>'+exMethHtml(c,i)+'</div>';
      h+='</div>';
    });
    if(multi&&qs.some(function(q,j){return exHas(exKey(i,j));})) h+='<div class="exfb-a"><button type="button" class="exshow" data-act="exredo" data-n="'+i.n+'">Redo the whole exercise</button></div>';
    if(i.np&&i.np.length) h+='<div class="exq nq">No multiple choice for part'+(i.np.length>1?'s ':' ')+i.np.map(function(x){return '('+x+')';}).join(', ')+' (calculation or worked solution). Work '+(i.np.length>1?'them':'it')+' on paper, then check the book answer'+(i.a?' on PDF p. '+i.a:'')+'.</div>';
    if(allDone) h+='<div class="exfb-a">'+nextBtn+'</div>';
    else h+='<div class="exhint">Pick A to D. Keys A, B, C, D also work.</div>';
  } else {
    h+='<div class="exq nq">No multiple choice version for this exercise'+(i.star?' (the book gives no answer, it is reserved for lecturers)':' (the book answer is a full worked solution)')+'. Work it out on paper, then check the book answer'+(i.a?' on PDF p. '+i.a:'')+'.</div>'
      +'<div class="exfb-a"><button type="button" class="cta '+(exDone(i.n)?'':'pri')+'" data-act="exdone" data-n="'+i.n+'">'+(exDone(i.n)?'Done (tap to undo)':'Mark as done')+'</button>'+nextBtn+'</div>';
  }
  return h+'</div>';
}
function exPlayerHtml(c,pos){
  var p=exProgress(c);
  var dots=c.items.map(function(it,j){ return '<button type="button" class="exdot '+exStatus(it)+(j===pos?' cur':'')+'" data-go="#/ex/'+c.n+'/'+(j+1)+'" title="Exercise '+it.n+'">'+it.n.split('.')[1]+'</button>'; }).join('');
  var h='<div id="explayer"><div class="exbar"><i style="width:'+Math.round(100*p.done/p.total)+'%"></i></div><div class="exdots">'+dots+'</div>';
  if(pos>=c.items.length){
    var E=exData(), nx=store.exSess?exSeqNext(c):E.chapters.filter(function(x){ return x.n===c.n+1; })[0];
    h+='<div class="excard exend"><div class="exend-t">Chapter '+c.n+' complete</div><p>'+p.ok+' correct out of '+c.items.filter(function(i){return exStatus(i);}).length+' exercises completed.</p><div class="exfb-a">'
      +'<button type="button" class="cta" data-act="exrestart" data-ch="'+c.n+'">Restart chapter</button>'
      +(nx?'<button type="button" class="cta pri" data-go="#/ex/'+nx.n+'">Next chapter ('+nx.n+') &rarr;</button>':'<button type="button" class="cta pri" data-go="#/ex">All chapters</button>')+'</div></div>';
  } else h+=exCardHtml(c,pos);
  var prev=pos>0?'<button type="button" class="cta" id="exprev" data-go="#/ex/'+c.n+'/'+pos+'">&larr; Previous</button>':'<span></span>';
  var skip=pos<c.items.length?'<button type="button" class="cta" data-go="#/ex/'+c.n+'/'+(pos+2)+'">Skip &rarr;</button>':'<span></span>';
  return h+'<div class="exnav">'+prev+skip+'</div></div>';
}
function exChStats(c){ var a=0,w=0; c.items.forEach(function(i){ var bad=false; exQs(i).forEach(function(q,j){ var k=exKey(i,j); if(exHas(k)){ a++; if(exAns(k)!==q.k) bad=true; } }); if(bad) w++; if(exDone(i.n)) a++; }); return {a:a,w:w}; }
function exToolbar(c){
  var st=exChStats(c); if(!st.a) return '';
  return '<div class="extool">'+(st.w?'<button type="button" class="cta pri" data-act="exredowrong" data-ch="'+c.n+'">Redo my '+st.w+' mistake'+(st.w>1?'s':'')+'</button>':'')
    +'<button type="button" class="cta" data-act="exrestart" data-ch="'+c.n+'">Redo the whole chapter</button></div>';
}
function exRefresh(n){
  var f=exFind(n); if(!f) return; var el=document.getElementById('explayer');
  if(el){ var t=document.createElement('div'); t.innerHTML=exPlayerHtml(f.c,f.pos); el.replaceWith(t.firstChild); }
  var sc=document.getElementById('ex-score'); if(sc){ var x=exScore(); sc.textContent=x.ok+' correct out of '+x.a+' answered'; }
  var fbs=document.querySelectorAll('.exfb'); var fb=fbs[fbs.length-1]; if(fb&&fb.scrollIntoView) fb.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function vEx(ch,k){
  var E=exData();
  if(!E) return '<button class="back" data-go="#/c/cr">&larr; Corporate Reporting</button><div class="page-h">Textbook exercises</div><div class="card"><p>Data unavailable.</p></div>';
  var tt=exTotals(), sc=exScore();
  var c=ch?E.chapters.filter(function(x){ return String(x.n)===String(ch); })[0]:null;
  if(c){
    var pos=k?Math.max(0,Math.min(c.items.length,parseInt(k,10)-1)):exFirstOpen(c);
    return '<button class="back" data-go="#/ex">&larr; All chapters</button>'
      + '<div class="page-h">Chapter '+c.n+' &middot; '+esc(c.t)+'</div>'
      + '<div class="page-sub">'+c.items.length+' exercises'+(c.s.length?' &middot; sessions '+c.s.join(', '):'')+' &middot; <span id="ex-score">'+sc.ok+' correct out of '+sc.a+' answered</span></div>'
      + (CR_SUPP[c.n]||[]).map(function(f){ return '<div class="exsupp"><a href="'+f.u+'?v=20261116" target="_blank" rel="noopener"><b>'+f.t+'</b></a> &middot; '+f.d+'</div>'; }).join('')
      + exToolbar(c)
      + exPlayerHtml(c,pos);
  }
  return exIndexHtml(E,tt,sc);
}
/* ---- accueil des exercices : par session du cours, jamais par chapitre du livre en premier ---- */
function crSessionList(){ return sessionsOf('cr').filter(function(x){ return x.n; }); }
function seenSession(cid){
  var v=(store.seen||{})[cid]; if(v) return {n:v, auto:false};
  if(cid==='cr') return {n:10, auto:true};
  var best=0;
  Object.keys(store.fiches||{}).forEach(function(k){ var m=k.match(new RegExp('^'+cid+'-(\\d+)$')); if(m) best=Math.max(best,parseInt(m[1],10)); });
  store.attempts.forEach(function(a){ if(a.course===cid){ var n=parseInt(a.session,10); if(n) best=Math.max(best,n); } });
  if(!best){ var now=Date.now(); sessionsOf(cid).forEach(function(x){ if(x.date && new Date(x.date).getTime()<=now) best=Math.max(best,x.n); }); }
  return {n:best||1, auto:true};
}
function exSeenSession(){ return seenSession('cr'); }
function sessionByN(cid,n){ var L=sessionsOf(cid); for(var i=0;i<L.length;i++){ if(L[i].n===n) return L[i]; } return L[0]||null; }
function mySessionCard(cid){
  var c=courseOf(cid), seen=seenSession(cid), cur=sessionByN(cid,seen.n);
  if(!cur) return '';
  var key=cur.key, seenF=!!store.fiches[cid+'-'+key], fu=ficheUrl(cid,key), nbC=cards(cid,key).length, kn=fcKnown(cid,key);
  var sp=sessionProgress(cid,key), exs=(cid==='cr')?exChaptersForSession(key):[], exD=0, exT=0, exW=0;
  exs.forEach(function(ch){ var q=exProgress(ch); exD+=q.done; exT+=q.total; ch.items.forEach(function(i){ if(exQs(i).some(function(qq,j){ var k=exKey(i,j); return exHas(k)&&exAns(k)!==qq.k; })) exW++; }); });
  var mp=mistakePool(cid).length;
  var seenOpts=''; var done={}; sessionsOf(cid).forEach(function(x){ if(done[x.n]) return; done[x.n]=1; seenOpts+='<option value="'+x.n+'"'+(x.n===seen.n?' selected':'')+'>Session '+x.n+' &middot; '+esc(x.title.length>54?x.title.slice(0,52)+'...':x.title)+'</option>'; });
  function step(i,ok,t,sub,go,extra){ return '<button class="mst'+(ok?' ok':'')+'" '+go+'><span class="mst-n">'+(ok?'&#10003;':i)+'</span><span class="mst-t"><b>'+t+'</b><span>'+sub+'</span></span><span class="mst-g">'+(extra||'Ouvrir')+' &rarr;</span></button>'; }
  var steps='';
  steps+= fu ? '<a class="mst'+(seenF?' ok':'')+'" href="'+esc(fu)+'" target="_blank" rel="noopener" data-act="fiche" data-cid="'+cid+'" data-n="'+key+'"><span class="mst-n">'+(seenF?'&#10003;':1)+'</span><span class="mst-t"><b>Lire la fiche</b><span>'+(seenF?'deja lue':'resume de la session, PDF')+'</span></span><span class="mst-g">Ouvrir &rarr;</span></a>' : '';
  steps+= nbC ? step(2,nbC&&kn>=nbC,'Flashcards',nbC+' cartes &middot; '+kn+' connues','data-go="#/f/'+cid+'/'+key+'"','Reviser') : '';
  steps+= sp.total ? step(3,sp.pct>=100,'QCM de la session',sp.done+'/'+sp.total+' questions &middot; '+sp.acc+'% de reussite','data-go="#/s/'+cid+'/'+key+'"',sp.done?'Reprendre':'Commencer') : '';
  steps+= exT ? step(4,exD>=exT,'Exercices du livre',exD+'/'+exT+' faits'+(exW?' &middot; <span class="exwr">'+exW+' rate'+(exW>1?'s':'')+'</span>':''),'data-act="exsess" data-s="'+key+'"',exD?'Continuer':'Commencer') : '';
  steps+= step(5,!mp,'Mes fautes',mp?mp+' question'+(mp>1?'s':'')+' a revoir (recall de memoire)':'aucune faute en attente',mp?'data-act="rcstart" data-cid="'+cid+'"':'data-go="#/rev"',mp?'Active recall':'Reviser');
  return '<div class="card mysess"><div class="mys-h"><div><div class="mys-e">MA SESSION &middot; '+esc(c.name)+'</div><div class="mys-t">Session '+cur.n+'</div><div class="mys-s">'+esc(cur.title)+'</div></div>'
    + '<div class="mys-sel"><label>Je suis en</label><select class="exsel" id="mySess" data-cid="'+cid+'">'+seenOpts+'</select></div></div>'
    + '<div class="msts">'+steps+'</div></div>';
}
function exGroups(){
  var groups=[];
  exSessions().forEach(function(k){
    var L=exChaptersForSession(k), key=L.map(function(c){return c.n;}).join(',');
    var g=groups[groups.length-1];
    if(g && g.key===key && g.b===k-1) g.b=k; else groups.push({key:key,a:k,b:k,chs:L});
  });
  return groups;
}
function exGroupStats(g){
  var d=0,t=0,ok=0,wrong=0,firstWrong=null;
  g.chs.forEach(function(c){ var p=exProgress(c); d+=p.done; t+=p.total; ok+=p.ok;
    c.items.forEach(function(i,pos){ if(exQs(i).some(function(q,j){ var k=exKey(i,j); return exHas(k) && exAns(k)!==q.k; })){ wrong++; if(!firstWrong) firstWrong={c:c,pos:pos}; } }); });
  return {done:d,total:t,ok:ok,wrong:wrong,firstWrong:firstWrong};
}
function exGroupRow(g, kind){
  var st=exGroupStats(g), pct=st.total?Math.round(100*st.done/st.total):0;
  var lbl=g.a===g.b?'Session '+g.a:'Sessions '+g.a+' to '+g.b;
  var titles=crSessionList().filter(function(x){ return x.n>=g.a && x.n<=g.b; }).map(function(x){ return x.title; });
  var ttl=titles.length===1?titles[0]:g.chs.map(function(c){ return c.t; }).join(' and ');
  var act=st.done===0?'Start':(st.done>=st.total?'Review':'Continue');
  var cls='exchc'+(st.done>=st.total?' full':'')+(kind==='next'?' exnext':'')+(kind==='later'?' exdim':'');
  var wr=st.wrong?' <span class="exwr">'+st.wrong+' wrong</span>':'';
  return '<button type="button" class="'+cls+'" data-act="exsess" data-s="'+g.a+'"><span class="exn ses">'+(g.a===g.b?'S'+g.a:'S'+g.a+'-'+g.b)+'</span><span class="ext"><b>'+lbl+' &middot; '+esc(ttl)+'</b><small>Book chapter'+(g.chs.length>1?'s ':' ')+g.chs.map(function(c){return c.n;}).join(', ')+' &middot; '+st.done+'/'+st.total+' done'+wr+'</small><span class="exbar"><i style="width:'+pct+'%"></i></span></span><span class="exgo">'+(kind==='later'?'Not seen yet':act)+' &rarr;</span></button>';
}
function exIndexHtml(E,tt,sc){
  var seen=exSeenSession(), groups=exGroups();
  var past=groups.filter(function(g){ return g.a<=seen.n; }), later=groups.filter(function(g){ return g.a>seen.n; });
  var nextG=null; past.forEach(function(g){ var st=exGroupStats(g); if(!nextG && st.done<st.total) nextG=g; });
  var opts=crSessionList().map(function(x){ return '<option value="'+x.n+'"'+(x.n===seen.n?' selected':'')+'>Session '+x.n+' &middot; '+esc(x.title.length>58?x.title.slice(0,56)+'...':x.title)+'</option>'; }).join('');
  var mist=exMistakes();
  var h='<button class="back" data-go="#/c/cr">&larr; Corporate Reporting</button>'
    + '<div class="page-h">Textbook exercises, by course session</div>'
    + '<div class="page-sub">'+tt.done+' of '+tt.total+' done &middot; <span id="ex-score">'+sc.ok+' correct out of '+sc.a+' answered</span></div>'
    + '<div class="card exseen"><h2>Where are you in the course?</h2><p style="font-size:13px;color:var(--muted);margin:0 0 10px">Only the sessions you have already followed are open for practice, so you never work on a topic before seeing it. '+(seen.auto?'This is a guess from your activity, set it to where you really are.':'Change it as soon as you catch up.')+'</p>'
    + '<select id="exSeen" class="exsel">'+opts+'</select><div class="exlast">Last session followed</div></div>';
  if(mist.length) h+='<div class="exmistbar"><b>'+mist.length+' exercise'+(mist.length>1?'s':'')+' answered wrongly.</b> Redo them before moving on. <button type="button" class="cta pri" style="padding:8px 14px;font-size:12.5px" data-go="#/ex/'+mist[0].c.n+'/'+(mist[0].pos+1)+'">Redo my mistakes</button></div>';
  h+='<div class="exsh">Sessions you have followed</div><div class="exgrid">';
  if(!past.length) h+='<div class="exnote">No exercises yet for the sessions followed so far.</div>';
  past.forEach(function(g){ h+=exGroupRow(g, g===nextG?'next':''); });
  h+='</div>';
  if(later.length){
    h+='<div class="exsh">Coming up, wait for the lecture</div><div class="exgrid">';
    later.forEach(function(g){ h+=exGroupRow(g,'later'); });
    h+='</div>';
  }
  var loose=E.chapters.filter(function(c){ return !c.s.length; });
  h+='<details class="exdet"><summary>Other chapters, not covered by a lecture session ('+loose.length+')</summary><div class="exgrid">';
  loose.forEach(function(c){ var p=exProgress(c), pct=Math.round(100*p.done/p.total); h+='<button type="button" class="exchc'+(p.done>=p.total?' full':'')+'" data-act="exchap" data-ch="'+c.n+'"><span class="exn">'+c.n+'</span><span class="ext"><b>Chapter '+c.n+' &middot; '+esc(c.t)+'</b><small>'+p.done+'/'+p.total+' done</small><span class="exbar"><i style="width:'+pct+'%"></i></span></span><span class="exgo">'+(p.done===0?'Start':p.done>=p.total?'Review':'Resume')+' &rarr;</span></button>'; });
  h+='</div></details>';
  h+='<details class="exdet"><summary>Browse by book chapter</summary><div class="exnote">Page numbers are PDF pages (printed page = PDF page minus '+E.offset+'). Answers: '+esc(E.ansPart)+'.</div><div class="exgrid">';
  E.chapters.forEach(function(c){ var p=exProgress(c), pct=Math.round(100*p.done/p.total); h+='<button type="button" class="exchc'+(p.done>=p.total?' full':'')+'" data-act="exchap" data-ch="'+c.n+'"><span class="exn">'+c.n+'</span><span class="ext"><b>Chapter '+c.n+' &middot; '+esc(c.t)+'</b><small>'+p.done+'/'+p.total+' done'+(c.s.length?' &middot; sessions '+c.s.join(', '):'')+'</small><span class="exbar"><i style="width:'+pct+'%"></i></span></span><span class="exgo">'+(p.done===0?'Start':p.done>=p.total?'Review':'Resume')+' &rarr;</span></button>'; });
  return h+'</div></details>';
}

document.addEventListener('change',function(e){ var t=e.target; if(t&&t.id==='mySess'){ store.seen=store.seen||{}; store.seen[t.getAttribute('data-cid')]=parseInt(t.value,10); save(); render(); return; } if(t&&t.id==='exSeen'){ store.seen=store.seen||{}; store.seen.cr=parseInt(t.value,10); save(); render(); } });
document.addEventListener('keydown',function(e){
  if(!/^#\/ex\/\d+/.test(location.hash)||e.metaKey||e.ctrlKey||e.altKey) return;
  var t=e.target&&e.target.tagName; if(t==='INPUT'||t==='TEXTAREA') return;
  var k=e.key.toLowerCase(), idx='abcd'.indexOf(k); if(idx<0) idx=['1','2','3','4'].indexOf(k);
  if(idx>=0){ var o=(document.querySelector('.excard .exp:not(.answered)')||document).querySelectorAll('.opt')[idx]; if(o){ o.click(); e.preventDefault(); } return; }
  if(e.key==='ArrowRight'||e.key==='Enter'){ var n=document.getElementById('exnext'); if(n&&e.target===document.body){ n.click(); e.preventDefault(); } }
  if(e.key==='ArrowLeft'){ var p=document.getElementById('exprev'); if(p){ p.click(); e.preventDefault(); } }
});

/* ---------- DEADLINES ---------- */
function allDeadlines(){
  var out = [];
  (D.DEADLINES||[]).forEach(function(dl,i){
    var id = 'base-'+i, ed = store.dlEdits[id];
    if(ed && ed.hidden) return;
    out.push({id:id, course:dl.course, kind:dl.kind||'', label:(ed&&ed.label)||dl.label, date:(ed&&ed.date)||dl.date, custom:false});
  });
  Object.keys(store.dlCustom).forEach(function(id){ var c=store.dlCustom[id]; if(c) out.push({id:id, course:c.course, kind:c.kind||'perso', label:c.label, date:c.date, custom:true}); });
  out.sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); });
  return out;
}
function dlDays(dateStr){   if(!dateStr) return null; var d = new Date(dateStr); if(isNaN(d)) return null;   var now = new Date();   var a = new Date(d.getFullYear(),d.getMonth(),d.getDate()), c = new Date(now.getFullYear(),now.getMonth(),now.getDate());   return Math.round((a-c)/86400000); }
var DL_MONTHS = ['JAN','FEV','MAR','AVR','MAI','JUN','JUL','AOU','SEP','OCT','NOV','DEC'];
function dlWhen(dateStr){
  if(!dateStr) return {b:'?',s:''};
  var d = new Date(dateStr); if(isNaN(d)) return {b:'?',s:''};
  return {b:String(d.getDate()), s:DL_MONTHS[d.getMonth()]};
}


/* ---------- MOYENNES ---------- */
var MOYKEY = 'c40-moy-v1';
function moyCourses(){ return (D.MOYENNES && D.MOYENNES.courses) || []; }
function moyState(){ try{ return JSON.parse(localStorage.getItem(MOYKEY)||'{}'); }catch(e){ return {}; } }
function moySave(st){ try{ localStorage.setItem(MOYKEY, JSON.stringify(st)); }catch(e){} }
function moyGet(cid, eid){ var st = moyState(); var v = st[cid] && st[cid][eid]; return (typeof v === 'number' && isFinite(v)) ? v : null; }
function moySet(cid, eid, val){ var st = moyState(); if(!st[cid]) st[cid] = {}; if(val==null) delete st[cid][eid]; else st[cid][eid] = val; moySave(st); }
function moyFmt(x){ var v = Math.round(x*10)/10; return (v===Math.floor(v)) ? String(v) : v.toFixed(1); }
function moyCompute(c){
  var entered = 0;
  if(c.kind==='weighted'){
    var sw=0, sg=0;
    c.evals.forEach(function(e){ var g=moyGet(c.id,e.id); if(g!=null){ sw+=e.coef; sg+=g*e.coef; entered++; } });
    if(!entered) return null;
    return {main:'Moyenne en cours : '+moyFmt(sg/sw)+' / 30', sub:'sur '+sw+'% du cours saisi (coefficients : '+c.evals.map(function(e){return e.coef+'%';}).join(' + ')+')'};
  }
  if(c.kind==='points'){
    var tot=0, mx=0, full=0;
    c.evals.forEach(function(e){ full+=e.pts; var g=moyGet(c.id,e.id); if(g!=null){ tot+=g; entered++; } });
    if(!entered) return null;
    return {main:'Total en cours : '+moyFmt(tot)+' / '+full, sub:'sur les épreuves saisies'};
  }
  if(c.kind==='da'){
    var S=moyGet(c.id,'da-s'), M=moyGet(c.id,'da-m'), T=moyGet(c.id,'da-t')||0;
    if(S==null && M==null) return null;
    S=S||0; M=M||0;
    var avec=S+M+T, sans=22/18*S+M, v=Math.max(avec,sans);
    return {main:'Note finale estimée : '+moyFmt(v)+' / 31', sub:'avec tests '+moyFmt(avec)+', sans tests '+moyFmt(sans)+', la meilleure des deux compte (T = '+moyFmt(T)+' saisi)'};
  }
  return null;
}
function vMoyennes(){
  var h = '<button class="back" data-go="#/">&larr; Accueil</button><div class="page-h">Mes moyennes</div><div class="page-sub">Tes notes restent sur cet appareil, rien n&#39;est envoyé en ligne.</div>';
  moyCourses().forEach(function(c){
    h += '<div class="card" style="margin-bottom:18px"><h2>'+esc(c.name)+'</h2>';
    if(c.info) h += '<p style="font-size:12.5px;color:var(--muted);margin:0 0 14px;line-height:1.55">'+esc(c.info)+'</p>';
    c.evals.forEach(function(e){
      var g = moyGet(c.id, e.id);
      var right = (c.kind==='weighted') ? ('coef '+e.coef+'% &middot; note / '+e.max) : ('note / '+e.pts);
      var mx = (c.kind==='weighted') ? e.max : e.pts;
      h += '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line,#e5e5e5)">'
        + '<span style="flex:1;font-size:13.5px;font-weight:600">'+esc(e.name)+'<br><small style="font-weight:500;color:var(--muted)">'+right+'</small></span>'
        + '<input class="moy-in" data-c="'+c.id+'" data-e="'+e.id+'" type="number" min="0" max="'+mx+'" step="0.5" inputmode="decimal" placeholder="&ndash;" value="'+(g==null?'':g)+'" style="width:76px;padding:8px 10px;font-size:15px;text-align:center;border-radius:10px;border:1px solid var(--line,#ccc);background:var(--bg,#fff);color:inherit">'
        + '</div>';
    });
    var res = moyCompute(c);
    h += '<div id="moy-res-'+c.id+'" style="margin-top:12px;font-size:14px;font-weight:700">'+(res?res.main:'Aucune note saisie pour l&#39;instant.')+'</div>';
    h += '<div id="moy-sub-'+c.id+'" style="font-size:12px;color:var(--muted);margin-top:2px">'+(res?res.sub:'')+'</div>';
    h += '</div>';
  });
  return h;
}
function moyBind(){
  $$('.moy-in').forEach(function(inp){
    inp.addEventListener('input', function(){
      var cid = inp.getAttribute('data-c'), eid = inp.getAttribute('data-e');
      var raw = inp.value.trim();
      var c = null; moyCourses().forEach(function(x){ if(x.id===cid) c=x; });
      if(!c) return;
      var ev = null; c.evals.forEach(function(x){ if(x.id===eid) ev=x; });
      if(!ev) return;
      if(raw===''){ moySet(cid, eid, null); }
      else {
        var v = parseFloat(raw.replace(',','.'));
        if(isNaN(v)) return;
        var mx = (c.kind==='weighted') ? ev.max : ev.pts;
        if(v<0) v=0; if(v>mx) v=mx;
        moySet(cid, eid, v);
      }
      var res = moyCompute(c);
      var r1 = document.getElementById('moy-res-'+cid), r2 = document.getElementById('moy-sub-'+cid);
      if(r1) r1.textContent = res ? res.main : 'Aucune note saisie pour l\u2019instant.';
      if(r2) r2.textContent = res ? res.sub : '';
    });
  });
}

/* ---------- RENDER SHELL ---------- */
var root = $('#c40root');
var navDef = [
  {page:'home', hash:'#/', label:'Aujourd\'hui', icon:IC.home},
  {page:'course', hash:'#/c/cr', label:'Cours', icon:IC.grid},
  {page:'rev', hash:'#/rev', label:'Reviser', icon:IC.card},
  {page:'exam', hash:'#/exam', label:'Examens', icon:IC.clock}
];
var NAVGROUP = {home:'home', course:'course', session:'course', cheat:'course', ex:'course', rev:'rev', quiz:'rev', qbuilder:'rev', qplay:'rev', flash:'rev', recall:'rev', plan:'home', exam:'exam', partiels:'exam', ptitem:'exam', deadlines:'exam', moyennes:'exam'};
function navHTML(r){
  return navDef.map(function(n){
    var on = NAVGROUP[r.page]===n.page;
    var h = n.page==='course' ? '#/c/'+state.course : n.hash;
    return '<button class="nav'+(on?' on':'')+'" data-go="'+h+'">'+n.icon+'<span>'+n.label+'</span></button>';
  }).join('');
}
function shell(content, r){
  var st = streakDays();
  return '<div class="app">'
    + '<aside class="rail"><div class="logo"><span class="mark">40</span><span><b>Classe 40</b><small>AFM &middot; Bocconi</small></span></div>'
    + navHTML(r)
    + '<div class="sp"></div>'
    + '<div class="streak">Serie en cours<b>'+st+' jour'+(st>1?'s':'')+'</b>Reponds a 10 questions pour la garder.</div>'
    + '</aside>'
    + '<main class="main"><div class="topbar">'
    + '<button class="search" data-act="search">'+IC.search+'<span>Rechercher une session, un theme, une carte...</span><kbd>Cmd K</kbd></button>'
    + '<span class="netdot" id="netdot" title="connexion"></span>'
    + '<span class="avatar">A</span></div>'
    + '<div class="view">'+content+'</div>'
    + '<footer>Classe 40 &middot; AFM Bocconi &middot; donnees 2026-27 &middot; fonctionne hors connexion</footer>'
    + '</main>'
    + '<nav class="tabbar">'+navHTML(r)+'</nav>'
    + '</div>';
}

/* ---------- VIEWS ---------- */
function courseChips(active){
  return '<div class="courses">'+COURSES.map(function(c){
    var p = courseProgress(c.id);
    return '<button class="pill'+(c.id===active?' on':'')+'" data-go="#/c/'+c.id+'"><span class="code">'+c.code+'</span>'+esc(c.name)+' <small>'+p.pct+'%</small></button>';
  }).join('')+'</div>';
}
function chapterRows(cid, limit, pred, dim){
  var ss = sessionsOf(cid).filter(function(s){ return (bank(cid,s.key).length>0 || cards(cid,s.key).length>0 || !!ficheUrl(cid,s.key)) && (!pred || pred(s)); });
  var rows = ss.map(function(s){
    var p = sessionProgress(cid, s.key);
    var cls = p.pct===100 ? 'done' : (p.done>0 ? 'cur' : '');
    var meta = p.total ? (p.done+'/'+p.total+' questions &middot; '+p.acc+'% reussite') : 'QCM a venir';
    var label = s.part ? 'S'+s.n+' &middot; Partie '+s.part : 'Session '+s.n;
    return '<div class="ch '+cls+(dim?' exdim':'')+'" data-go="#/s/'+cid+'/'+s.key+'">'
      + '<span class="num">'+s.n+'</span>'
      + '<div class="tx"><b>'+esc(s.title)+'</b><span>'+label+' &middot; '+meta+'</span><div class="bar"><i class="'+(p.pct===100?'full':'')+'" data-w="'+p.pct+'"></i></div></div>'
      + '<span class="pct">'+p.pct+'%</span>'
      + '<button class="go" data-go="#/s/'+cid+'/'+s.key+'">'+(p.done===0?'Commencer':(p.pct===100?'Revoir':'Reprendre'))+'</button>'
      + '</div>';
  });
  if(limit) rows = rows.slice(0, limit);
  return rows.join('');
}
function coursePills(){
  return '<div class="courses">'+COURSES.map(function(c){ return '<button class="pill'+(c.id===state.course?' on':'')+'" data-act="setcourse" data-cid="'+c.id+'"><span class="code">'+c.code+'</span>'+esc(c.name)+'</button>'; }).join('')+'</div>';
}
function vRevise(){
  var cid=state.course, c=courseOf(cid);
  return '<div class="page-h">Reviser</div><div class="page-sub">Tout ce qui sert a retenir et a corriger, au meme endroit.</div>'
    + coursePills()
    + homeSec('1. Corriger mes fautes','ce que tu as rate, de toutes les matieres')
    + mistakesBlock()
    + homeSec('2. Revision du jour','selon l&#39;espacement, pour '+esc(c.name))
    + srsCard()
    + homeSec('3. S&#39;entrainer librement','pour '+esc(c.name))
    + '<div class="hmgrid">'
    + homeTile('#/qb','QCM a la carte','matiere, difficulte, sessions au choix',IC.qcm)
    + homeTile('#/q/'+cid,'QCM blanc','toutes les sessions, ordre aleatoire',IC.qcm)
    + homeTile('#/f/'+cid,'Flashcards','toutes les cartes de '+esc(c.name),IC.card)
    + (D.CHEATSHEET[cid] ? homeTile('#/cs/'+cid,'Synthese du cours','formules et definitions',IC.sheet) : '')
    + '</div>';
}
function vExams(){
  var up=allDeadlines().filter(function(d){ var n=dlDays(d.date); return n!=null && n>=0; }).slice(0,6);
  return '<div class="page-h">Examens</div><div class="page-sub">Dates, partiels blancs et notes.</div>'
    + '<div class="card" style="margin-bottom:18px"><h2>Prochaines dates <button class="tag" data-go="#/dl">Tout voir</button></h2>'+(up.length?up.map(dlRow).join(''):'<p style="font-size:12.5px;color:var(--muted)">Aucune echeance a venir.</p>')+'</div>'
    + '<div class="hmgrid">'
    + homeTile('#/pt','Partiels et mocks blancs','5 mocks officiels CR, review session, blancs A et B',IC.pdf)
    + homeTile('#/moy','Mes moyennes','tes notes par epreuve et la moyenne par matiere',IC.data)
    + '</div>';
}
function homeSec(title, sub){ return '<div class="hsec"><h2>'+title+'</h2>'+(sub?'<span>'+sub+'</span>':'')+'</div>'; }
function todayPlanCard(){
  var m=planModel(), key=pdKey(new Date()), CLn={cr:'CR',da:'DA',adm:'Admin'};
  var day=m.days.filter(function(d){ return d.d===key; })[0];
  var items=day?day.items.filter(function(x){ return x.k!=='exam'; }):[];
  var left=items.filter(function(x){ return !x.isDone; }), mins=left.reduce(function(a,x){ return a+(x.min||0); },0);
  var rows=items.slice(0,6).map(function(it){
    return '<div class="plitem'+(it.isDone?' pldone':'')+'"><button class="plck'+(it.isDone?' on':'')+'" data-act="plchk" data-k="'+esc(it.id)+'">'+(it.isDone?'&#10003;':'')+'</button><span class="pltx"><b class="plc pl-'+it.c+'">'+esc(CLn[it.c]||it.c)+'</b>'+esc(it.txt)+' <span class="plmin">'+it.min+' min</span>'+(it.ref?' <a class="plgo" href="'+esc(it.ref)+'">ouvrir &rarr;</a>':'')+'</span></div>';
  }).join('');
  var more=items.length>6?'<div style="font-size:12px;color:var(--muted);margin-top:6px">+ '+(items.length-6)+' autre'+(items.length-6>1?'s':'')+' dans le plan</div>':'';
  var head='Plan du jour'+(items.length?' &middot; '+left.length+' restante'+(left.length>1?'s':'')+(mins?' &middot; ~'+(mins>=90?(Math.round(mins/6)/10)+' h':mins+' min'):''):'');
  return '<div class="card" style="margin-bottom:14px"><h2>'+head+'<button class="tag" data-go="#/plan">Plan complet</button></h2>'
    + (rows||'<div class="plitem ploff"><span>Rien de prevu aujourd&#39;hui.</span></div>')+more+'</div>';
}
function homeTile(go, t, sub, ic){ return '<button class="hmt" data-go="'+go+'"><span class="ic">'+(ic||'')+'</span><span class="hmt-t"><b>'+t+'</b><span>'+sub+'</span></span><span class="hmt-go">&rarr;</span></button>'; }
function vHome(){
  var g = globalProgress(), st = streakDays(), m = nextMission();
  var c = courseOf(state.course);
  var missionHTML = m
    ? 'Session '+m.s.n+' de '+esc(courseOf(m.course).name)+' : '+esc(m.s.title)+'. Tu es a '+m.p.pct+'% du QCM de la session.'
    : 'Tout est au vert. Refais un QCM blanc ou revise les flashcards.';
  var circ = 2*Math.PI*48;
  var upcoming = allDeadlines().filter(function(d){ var n=dlDays(d.date); return n!=null && n>=0; }).slice(0,5);
  var exT = exData() ? exTotals() : null;
  return ''
  + (function(){
      var cid=state.course, seen=seenSession(cid), cur=sessionByN(cid,seen.n), sp=cur?sessionProgress(cid,cur.key):{pct:0}, mp=mistakePool(cid).length;
      return '<div class="hero"><div class="ring"><svg width="112" height="112"><circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,.25)" stroke-width="9" fill="none"/><circle id="heroRing" cx="56" cy="56" r="48" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+circ+'"/></svg><div class="val"><div><b>'+g.pct+'%</b><span>GLOBAL</span></div></div></div>'
      + '<div><div class="eyebrow">MA SESSION</div><h1>'+esc(courseOf(cid).name)+' &middot; Session '+seen.n+'</h1><p>'+(cur?esc(cur.title)+'. QCM de la session a '+sp.pct+'%.':'')+(mp?' '+mp+' faute'+(mp>1?'s':'')+' a revoir.':'')+'</p><br>'
      + (cur?'<button class="cta" data-go="#/c/'+cid+'">Ouvrir ma session &rarr;</button> ':'')
      + (mp?'<button class="cta ghost" data-act="rcstart" data-cid="'+cid+'">Revoir mes fautes</button>':'<button class="cta ghost" data-go="#/rev">Reviser</button>')
      + '</div></div>';
    })()

  + homeSec('Aujourd&#39;hui','ce qu&#39;il faut faire maintenant')
  + todayPlanCard()
  + mistakesBlock()
  + srsCard()

  + homeSec('Ma progression','par matiere')
  + '<div class="stats">'
  + '<button class="stat" data-go="#/q/'+state.course+'"><b>'+g.done+'</b><span>questions traitees</span><small>+'+todayDone()+' aujourd\'hui</small></button>'
  + '<button class="stat" data-go="#/f/'+state.course+'"><b>'+st+' jour'+(st>1?'s':'')+'</b><span>serie en cours</span><small>objectif : 10 questions</small></button>'
  + '<button class="stat" data-go="#/q/'+state.course+'"><b>'+accuracy()+'%</b><span>reussite moyenne</span><small>au premier essai</small></button>'
  + '<button class="stat" data-go="#/c/'+state.course+'"><b>'+masteredTopics()+'</b><span>themes maitrises</span><small>&ge;80% de reussite</small></button>'
  + '</div>'
  + courseChips(state.course)
  + '';
}
function dlRow(d){
  var n = dlDays(d.date), w = dlWhen(d.date);
  var soon = n!=null && n<=7 ? ' soon' : '';
  var chip = n==null ? '' : (n===0 ? "aujourd'hui" : (n<0 ? 'passee' : 'J-'+n));
  return '<a class="dl'+soon+'" data-go="#/c/'+(d.course||'cr')+'"><span class="when"><b>'+w.b+'</b><span>'+w.s+'</span></span><span class="tx"><b>'+esc(d.label)+'</b><span>'+esc(courseOf(d.course||'cr').name)+(d.kind?' &middot; '+esc(d.kind):'')+'</span></span><span class="chip2">'+chip+'</span></a>';
}
function vCourse(cid){
  var c = courseOf(cid), p = courseProgress(cid), seen=seenSession(cid), n=seen.n;
  var cur=function(s){ return s.n<=n; }, nxt=function(s){ return s.n>n; };
  var follow=chapterRows(cid, 0, cur, false), later=chapterRows(cid, 0, nxt, true);
  return courseChips(cid)
  + '<div class="page-h">'+esc(c.name)+'</div><div class="page-sub">'+esc(c.sub)+' &middot; '+p.done+'/'+p.total+' questions traitees ('+p.pct+'%)</div>'
  + mySessionCard(cid)
  + (cid==='fm' ? '<div class="card" style="margin-bottom:18px"><h2>Mock exam FM</h2><div class="pt-items"><button class="pt-item" data-go="#/pt/fm-p1-b2"><span class="pt-item-t"><b>Mock FM #2</b><span>4 QCM à 3 options + 2 ouvertes · 45 min</span></span><span class="pt-new">Commencer</span></button><button class="pt-item" data-go="#/pt/fm-p1-official"><span class="pt-item-t"><b>Mock officiel FM et corrigé</b><span>Blackboard · accès Bocconi requis</span></span><span class="pt-new">Ouvrir</span></button></div></div>' : '')
  + '<div class="grid"><section>'
  + '<div class="card" style="margin-bottom:14px"><h2>Sessions suivies, a consolider</h2>'+(follow||'<p style="font-size:12.5px;color:var(--muted)">Aucune session avec du contenu pour le moment.</p>')+'</div>'
  + (later?'<details class="exdet"><summary>A venir, attends le cours</summary><div class="card">'+later+'</div></details>':'')
  + '</section><aside>'
  + '<div class="card" style="margin-bottom:14px"><h2>Echeances '+c.code+'</h2>'
  + (allDeadlines().filter(function(d){ return d.course===cid; }).map(dlRow).join('') || '<p style="font-size:12.5px;color:var(--muted)">Aucune.</p>')
  + '</div>'
  + '<details class="exdet" style="margin-top:0"><summary>Ressources du cours</summary><div class="card" style="margin-top:8px">'
  + '<div class="ch" data-go="#/q/'+cid+'"><span class="num">'+IC.qcm+'</span><div class="tx"><b>QCM blanc</b><span>toutes les sessions, ordre aleatoire</span></div><span class="go">Lancer</span></div>'
  + (cid==='da' ? '<div class="ch" data-go="#/q/da/all/dataset"><span class="num">'+IC.data+'</span><div class="tx"><b>QCM datasets R</b><span>'+(D.QCM_DATA.da||[]).length+' questions sur SUP / TOP / WINE / PSA...</span></div><span class="go">Lancer</span></div>' : '')
  + '<div class="ch" data-go="#/f/'+cid+'"><span class="num">'+IC.card+'</span><div class="tx"><b>Flashcards du cours</b><span>'+(D.FLASHCARDS[cid]||[]).length+' cartes, toutes sessions</span></div><span class="go">Reviser</span></div>'
  + (cid==='cr' ? '<a class="ch" href="https://drive.google.com/file/d/14k3jjXn0V_cVrS0QWJK3YpPhgILYQp5O/view" target="_blank" rel="noopener"><span class="num">'+IC.pdf+'</span><div class="tx"><b>Exercices corrigés du livre</b><span>chapitres 1 à 15, document privé</span></div><span class="go">Ouvrir</span></a>' : '')
  + (cid==='cr' && exData() ? '<div class="ch" data-go="#/ex"><span class="num">'+IC.sheet+'</span><div class="tx"><b>Textbook exercises by chapter</b><span>'+exTotals().total+' exercises as multiple choice questions</span></div><span class="go">Open</span></div>' : '')
  + (cid==='cr' ? [8,10].map(function(n){ return CR_SUPP[n].map(function(f){ return '<div class="ch"><span class="num">'+IC.pdf+'</span><div class="tx"><b>'+f.t+'</b><span>'+f.d+'</span></div><a class="go" href="'+f.u+'?v=20261116" target="_blank" rel="noopener">Open</a></div>'; }).join(''); }).join('') : '')
  + (D.CHEATSHEET[cid] ? '<div class="ch" data-go="#/cs/'+cid+'"><span class="num">'+IC.sheet+'</span><div class="tx"><b>Fiche de synthese</b><span>tout le cours en une page</span></div><span class="go">Lire</span></div>' : '')
  + '</div></details>'
  + '</aside></div>';
}
function supplementTiles(cid,n){
  var groups={}; bank(cid,n).filter(function(q){return q.supplement;}).forEach(function(q){groups[q.set]=q;});
  var tiles=Object.keys(groups).sort(function(a,b){return Number(a)-Number(b);}).map(function(sn){var q=groups[sn],p=setProgress(cid,n,Number(sn));
    return '<div class="tile" data-go="#/q/'+cid+'/'+n+'/set'+sn+'"><span class="ic">'+IC.qcm+'</span><b>Complement '+esc(q.supplement)+' &middot; '+levelLabel(q.level)+'</b><span>'+p.done+'/'+p.total+' questions &middot; '+p.acc+'% reussite</span><div class="bar"><i class="'+(p.pct===100?'full':'')+'" data-w="'+p.pct+'"></i></div><span class="arrow">'+(p.done?'Continuer':'Commencer')+' &rarr;</span></div>';
  }).join('');
  return tiles ? '<div class="card"><h2>Entrainement complementaire</h2><p>Des series distinctes. Vos trois niveaux et leurs reponses restent inchanges.</p><div class="tiles">'+tiles+'</div></div>' : '';
}
function legacyTiles(cid,n){
  return setsOf(cid,n).map(function(sn){
    var bp=setProgress(cid,n,sn),multi=setsOf(cid,n).length>1;
    return '<div class="tile" data-go="#/q/'+cid+'/'+n+'/set'+sn+'"><span class="ic">'+IC.qcm+'</span><b>'+(multi?'QCM '+sn:'QCM')+'</b><span>'+bp.done+'/'+bp.total+' questions &middot; '+bp.acc+'% reussite</span><div class="bar"><i class="'+(bp.pct===100?'full':'')+'" data-w="'+bp.pct+'"></i></div><span class="arrow">'+(bp.done?'Continuer':'Commencer')+' &rarr;</span></div>';
  }).join('');
}
function vSession(cid, n){
  var c = courseOf(cid);
  var ss = sessionsOf(cid), s = null;
  for(var i=0;i<ss.length;i++) if(String(ss[i].key)===String(n)) s = ss[i];
  if(!s) return '<p>Session introuvable.</p>';
  var p = sessionProgress(cid, s.key);
  var fu = ficheUrl(cid, s.key);
  if(cid==='fm' && String(s.key)==='4-5') fu='fiches/fm45-reader.html?v=20261014-fix';
  var nbCards = cards(cid, n).length;
  var seen = store.fiches[cid+'-'+n];
  return '<button class="back" data-go="#/c/'+cid+'">&larr; '+esc(c.name)+'</button>'
  + '<div class="sess-head"><span class="num">'+s.n+'</span><div><div class="page-h">Session '+s.n+(s.part?' &middot; Partie '+s.part:'')+'</div><div class="page-sub">'+esc(s.title)+'</div></div></div>'
  + '<div class="tiles">'
  + (fu
    ? '<a class="tile" href="'+esc(fu)+'" target="_blank" rel="noopener" data-act="fiche" data-cid="'+cid+'" data-n="'+s.key+'"><span class="ic">'+IC.pdf+'</span><b>Fiche de session</b><span>'+(seen?'Vue &middot; ':'')+'PDF, resume complet</span><span class="arrow">Ouvrir la fiche &rarr;</span></a>'
    : '<span class="tile off"><span class="ic">'+IC.pdf+'</span><b>Fiche de session</b><span>Pas encore disponible</span></span>')
  + (levelBank(cid,s.key).length ? levelTiles(cid,s.key) : legacyTiles(cid,s.key))
  + (cid==='cr' ? exChaptersForSession(s.key).map(function(c){ var p=exProgress(c); return '<div class="tile" data-act="exsess" data-s="'+s.key+'"><span class="ic">'+IC.sheet+'</span><b>Textbook exercises &middot; chapter '+c.n+'</b><span>'+esc(c.t)+' &middot; '+p.done+'/'+p.total+' done</span><span class="arrow">Open &rarr;</span></div>'; }).join('') : '')
  + (nbCards ? '<div class="tile" data-go="#/f/'+cid+'/'+s.key+'"><span class="ic">'+IC.card+'</span><b>Flashcards</b><span>'+nbCards+' cartes &middot; '+fcKnown(cid,n)+' connues</span><span class="arrow">Reviser &rarr;</span></div>' : '')
  + '</div>'
  + (levelBank(cid,s.key).length && setsOf(cid,s.key).length ? '<details class="card"><summary style="cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:700">Anciens QCM et progression conservee</summary><p>Les nouveaux niveaux ont leurs propres questions. Vos anciennes reponses restent ici, sans etre attribuees aux nouvelles questions.</p><div class="tiles">'+legacyTiles(cid,s.key)+'</div></details>' : '')
  + supplementTiles(cid,s.key)
  + (D.CHEATSHEET[cid] ? '<div class="card"><h2>Synthese du cours</h2><div class="ch" data-go="#/cs/'+cid+'"><span class="num">'+IC.sheet+'</span><div class="tx"><b>Fiche de synthese '+c.code+'</b><span>toutes les formules et definitions du cours</span></div><span class="go">Lire</span></div></div>' : '');
}
function fcKnown(cid,n){ var cs=cards(cid,n), k=0; cs.forEach(function(c2){ if(store.fc[c2.id]==='known') k++; }); return k; }

/* ---------- QUIZ ---------- */
var quiz = null;
function startQuiz(cid, n, src){
  var b;
  if(src==='dataset'){ b = (D.QCM_DATA[cid]||[]).slice(); }
  else if(n==null || n==='all'){ b = (D.QCM[cid]||[]).slice(); }
  else if(/^level[1-3]$/.test(String(src))){ b = levelBank(cid,n,parseInt(String(src).slice(5),10)).slice(); }
  else if(/^set[0-9]+$/.test(String(src))){ b = bank(cid,n,parseInt(String(src).slice(3),10)).slice(); }
  else { b = bank(cid,n).slice(); }
  for(var i=b.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=b[i]; b[i]=b[j]; b[j]=t; }
  quiz = {cid:cid, n:n, src:src, bank:b, idx:0, answered:{}, sel:null, t0:Date.now(), ok:0};
}
function vQuiz(cid, n, src){
  var isLevel = /^level[1-3]$/.test(String(src||''));
  var isSet = /^set[0-9]+$/.test(String(src||''));
  if(n && n!=='all' && src!=='dataset' && !isSet && !isLevel){
    var bdir=bank(cid,n), hasSupp=bdir.some(function(q){return q.supplement;});
    if(setsOf(cid,n).length>1 || hasSupp || bdir.length>15){ location.replace('#/s/'+cid+'/'+n); return ''; }
  }
  if(!quiz || quiz.cid!==cid || String(quiz.n)!==String(n) || (quiz.src||null)!==src) startQuiz(cid,n,src);
  var c = courseOf(cid);
  var backHash = (n && n!=='all') ? '#/s/'+cid+'/'+n : '#/c/'+cid;
  var title = isLevel ? levelLabel(parseInt(String(src).slice(5),10))+' · Session '+n : src==='dataset' ? 'QCM datasets R' : (isSet ? 'QCM '+String(src).slice(3)+' · Session '+n : (n && n!=='all' ? 'QCM · Session '+n : 'QCM blanc · '+c.name));
  if(isSet && quiz.bank[0] && quiz.bank[0].supplement) title='Complement '+quiz.bank[0].supplement+' · '+levelLabel(quiz.bank[0].level)+' · Session '+n;
  if(!quiz.bank.length) return '<button class="back" data-go="'+backHash+'">&larr; Retour</button><div class="page-h">'+esc(title)+'</div><div class="card"><p style="font-size:13px;color:var(--muted)">Pas encore de questions pour cette session.</p></div>';
  if(quiz.idx >= quiz.bank.length) return vQuizDone(backHash, title);
  var q = quiz.bank[quiz.idx];
  var ans = quiz.answered[q.id];
  var total = quiz.bank.length;
  var opts = q.choices.map(function(ch,i){
    var cls = 'opt', dis = '';
    if(ans){
      if(i===q.correct_index) cls += ' right';
      else if(i===ans.choice) cls += ' wrong';
      else cls += ' dim';
    }
    return '<button class="'+cls+'" data-act="ans" data-i="'+i+'"><span class="k">'+'ABCD'[i]+'</span><span>'+esc(ch)+'</span></button>';
  }).join('');
  var expl = (ans && q.explanation) ? '<div class="expl"><b>Pourquoi :</b> '+esc(q.explanation)+'</div>' : '';
  var foot = ans
    ? '<button class="cta line" data-act="qprev">&larr; Precedente</button><button class="cta pri" data-act="qnext">'+(quiz.idx===total-1?'Voir le score':'Suivante &rarr;')+'</button>'
    : '<span style="font-size:11.5px;color:var(--muted);font-weight:600">Choisis une reponse</span><button class="cta line" data-act="qskip">Passer &rarr;</button>';
  return '<button class="back" data-go="'+backHash+'">&larr; Retour</button>'
  + '<div class="page-h">'+esc(title)+'</div>'
  + '<div class="qcard"><div class="qmeta"><span>'+(quiz.idx+1)+' / '+total+'</span><div class="bar"><i style="width:'+Math.round(quiz.idx/total*100)+'%"></i></div><span>'+quiz.ok+' bonnes</span></div>'
  + '<div class="qq">'+esc(q.question)+'</div>'+opts+expl+'<div class="qfoot">'+foot+'</div></div>';
}
function vQuizDone(backHash, title){
  var total = quiz.bank.length, ok = quiz.ok;
  var pct = Math.round(ok/total*100);
  var msg = pct>=80 ? 'Excellent, tu maitrises ce bloc.' : pct>=50 ? 'Bien, encore quelques themes a consolider.' : 'A retravailler : refais la fiche puis retente.';
  return '<button class="back" data-go="'+backHash+'">&larr; Retour</button>'
  + '<div class="page-h">'+esc(title)+' &middot; termine</div>'
  + '<div class="qcard" style="text-align:center"><div class="score-big">'+ok+' / '+total+'</div><p style="color:var(--muted);font-weight:600;margin:6px 0 4px">'+pct+'% de reussite au premier essai</p><p style="font-size:13px;margin-bottom:18px">'+msg+'</p>'
  + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="cta pri" data-act="qretry">Refaire ce QCM</button><button class="cta line" data-go="'+backHash+'">Retour a la session</button></div></div>';
}
function answerQuiz(i){
  if(!quiz) return;
  var q = quiz.bank[quiz.idx];
  if(quiz.answered[q.id]) return;
  var correct = i===q.correct_index;
  quiz.answered[q.id] = {choice:i, correct:correct};
  if(correct) quiz.ok++;
  var secs = Math.round((Date.now()-quiz.t0)/1000); quiz.t0 = Date.now();
  addAttempt({course:quiz.cid, session:contentSessionKey(quiz.cid,q), questionId:String(q.id), topic:q.topic||'', correct:correct, ts:Date.now(), source:quiz.src==='dataset'?'dataset':(quiz.n==null||quiz.n==='all'?'blanc':'session'), secs:secs});
  render();
}


/* ---------- QCM A LA CARTE (builder) ---------- */
var qb = {course:'fm', session:'all', level:0, count:'15'};
function qbHasLevels(cid){
  var g=(D.QCM_LEVELS||{})[cid]||{};
  return Object.keys(g).some(function(k){ return (g[k]||[]).length>0; });
}
function qbSessions(cid){
  var ss=sessionsOf(cid);
  return ss.filter(function(s){ return bank(cid,s.key).length>0 || levelBank(cid,s.key).length>0; });
}
function qbPool(cid, skey, level){
  var keys = skey==='all' ? qbSessions(cid).map(function(s){return s.key;}) : (Array.isArray(skey) ? skey : [skey]);
  var pool=[], seen={};
  keys.forEach(function(k){
    var items;
    if(level){ items = levelBank(cid,k,level).concat(bank(cid,k).filter(function(q){return q.supplement && q.level===level;})); }
    else { items = bank(cid,k).concat(levelBank(cid,k)); }
    items.forEach(function(q){ if(!seen[q.id]){ seen[q.id]=1; pool.push(q); } });
  });
  return pool;
}
function qbSessionOn(skey){
  return qb.session!=='all' && (Array.isArray(qb.session) ? qb.session.indexOf(skey)>=0 : qb.session===skey);
}
function qbSet(k, v){
  if(k==='course'){ qb.course=v; qb.session='all'; qb.level=0; }
  else if(k==='session'){
    if(v==='all'){ qb.session='all'; }
    else{
      var cur = Array.isArray(qb.session) ? qb.session.slice() : (qb.session==='all' ? [] : [qb.session]);
      var i = cur.indexOf(v);
      if(i>=0) cur.splice(i,1); else cur.push(v);
      cur.sort(function(a,b){ return parseInt(a,10)-parseInt(b,10); });
      qb.session = cur;
    }
  }
  else if(k==='level'){ qb.level=parseInt(v,10)||0; }
  else if(k==='count'){ qb.count=v; }
  render();
}
function qbRow(label, inner){
  return '<div style="margin:14px 0"><div style="font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:7px">'+label+'</div><div style="display:flex;flex-wrap:wrap;gap:8px">'+inner+'</div></div>';
}
function qbBtn(act,k,v,label,on,dis){
  return '<button class="cta '+(on?'pri':'line')+'" style="padding:9px 14px;font-size:12.5px" data-act="'+act+'" data-k="'+k+'" data-v="'+esc(v)+'"'+(dis?' disabled style="padding:9px 14px;font-size:12.5px;opacity:.45"':'')+'>'+esc(label)+'</button>';
}
function vQBuilder(){
  var cid=qb.course, c=courseOf(cid);
  var cBtn=COURSES.map(function(cc){ return qbBtn('qbset','course',cc.id,cc.name,qb.course===cc.id,false); }).join('');
  var sBtns=qbBtn('qbset','session','all','Toutes les sessions',qb.session==='all',false);
  qbSessions(cid).forEach(function(s){ sBtns+=qbBtn('qbset','session',s.key,'Session '+s.n,qbSessionOn(s.key),false); });
  var lvlBtns='', lvlNote='';
  if(qbHasLevels(cid)){
    lvlBtns=qbBtn('qbset','level','0','Toutes',qb.level===0,false)
      +qbBtn('qbset','level','1','Medium',qb.level===1,false)
      +qbBtn('qbset','level','2','Difficile',qb.level===2,false)
      +qbBtn('qbset','level','3','Expert',qb.level===3,false);
  } else {
    lvlNote='<div style="font-size:12px;color:var(--muted)">Pas encore de niveaux calibrés pour cette matière, toutes les questions sont mélangées.</div>';
  }
  var counts=['10','15','20','30','all'];
  var cLabels={'10':'10','15':'15','20':'20','30':'30','all':'Tout'};
  var cntBtns=counts.map(function(x){ return qbBtn('qbset','count',x,cLabels[x],qb.count===x,false); }).join('');
  var pool=qbPool(cid, qb.session, qb.level);
  var avail=pool.length;
  var n = qb.count==='all' ? avail : Math.min(parseInt(qb.count,10), avail);
  var launch = avail>0
    ? '<button class="cta pri" style="margin-top:6px;font-size:14px;padding:13px 22px" data-act="qblaunch">Lancer le QCM · '+n+' question'+(n>1?'s':'')+'</button>'
    : '<div style="font-size:13px;color:var(--muted);margin-top:6px">Aucune question pour ce réglage, élargis la sélection.</div>';
  return '<button class="back" data-go="#/">&larr; Accueil</button>'
    + '<div class="page-h">QCM à la carte</div>'
    + '<div class="page-sub">Choisis la matière, la difficulté et la longueur, et touche plusieurs sessions pour mélanger leurs questions. Le tirage est mélangé à chaque lancement et chaque réponse compte dans ta progression.</div>'
    + '<div class="card">'
    + qbRow('Matière', cBtn)
    + qbRow('Thème', sBtns)
    + qbRow('Difficulté', lvlBtns||'') + lvlNote
    + qbRow('Longueur', cntBtns)
    + '<div style="font-size:12.5px;color:var(--muted);margin-top:4px">'+avail+' question'+(avail>1?'s':'')+' disponible'+(avail>1?'s':'')+' pour ce réglage.</div>'
    + launch
    + '</div>';
}
function startCustomQuiz(retry){
  if(retry && quiz && quiz.custom && quiz.custom.srs){ startSrsQuiz(quiz.custom.course); return; }
  if(retry && quiz && quiz.custom && quiz.custom.mist){ startMistakeQuiz(quiz.custom.course); return; }
  if(!retry || !quiz || quiz.src!=='custom'){ var params={course:qb.course, session:qb.session, level:qb.level, count:qb.count}; }
  else { var params=quiz.custom; qb.course=params.course; qb.session=params.session; qb.level=params.level; qb.count=params.count; }
  var pool=qbPool(params.course, params.session, params.level).slice();
  for(var i=pool.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=pool[i]; pool[i]=pool[j]; pool[j]=t; }
  if(params.count!=='all') pool=pool.slice(0, parseInt(params.count,10));
  if(!pool.length){ go('#/qb'); return; }
  quiz = {cid:params.course, n:'custom', src:'custom', bank:pool, idx:0, answered:{}, sel:null, t0:Date.now(), ok:0, custom:params};
  if(location.hash==='#/qb/play') render(); else go('#/qb/play');
}
function qbTitle(){
  if(quiz.custom && quiz.custom.mist) return 'Mes fautes · '+courseOf(quiz.custom.course).name;
  if(quiz.custom && quiz.custom.srs) return 'Révision du jour · '+courseOf(quiz.custom.course).name;
  var p=quiz.custom, parts=[courseOf(p.course).name];
  if(p.session==='all') parts.push('toutes sessions');
  else if(Array.isArray(p.session)){
    if(p.session.length===1) parts.push('Session '+p.session[0]);
    else parts.push('Sessions '+p.session.join(', '));
  }
  else parts.push('Session '+p.session);
  if(p.level) parts.push(levelLabel(p.level));
  return 'QCM à la carte · '+parts.join(' · ');
}
function vQPlay(){
  if(!quiz || quiz.src!=='custom' || !quiz.bank.length){ location.replace('#/qb'); return ''; }
  var backHash='#/qb', title=qbTitle();
  if(quiz.idx >= quiz.bank.length){
    var total=quiz.bank.length, ok=quiz.ok, pct=Math.round(ok/total*100);
    return '<button class="back" data-go="'+backHash+'">&larr; Réglages</button>'
      + '<div class="page-h">'+esc(title)+' · score</div>'
      + '<div class="qcard" style="text-align:center;padding:34px 20px"><div style="font-size:44px;font-weight:900">'+ok+' / '+total+'</div><div style="color:var(--muted);font-weight:700;margin:6px 0 18px">'+pct+'% de réussite</div>'
      + '<button class="cta pri" data-act="qbretry">Nouveau tirage, mêmes réglages</button> <button class="cta line" data-go="#/qb">Modifier les réglages</button></div>';
  }
  var q = quiz.bank[quiz.idx];
  var ans = quiz.answered[q.id];
  var total = quiz.bank.length;
  var opts = q.choices.map(function(ch,i){
    var cls = 'opt', dis = '';
    if(ans){
      if(i===q.correct_index) cls += ' right';
      else if(i===ans.choice) cls += ' wrong';
      else cls += ' dim';
    }
    return '<button class="'+cls+'" data-act="ans" data-i="'+i+'"><span class="k">'+'ABCD'[i]+'</span><span>'+esc(ch)+'</span></button>';
  }).join('');
  var expl = (ans && q.explanation) ? '<div class="expl"><b>Pourquoi :</b> '+esc(q.explanation)+'</div>' : '';
  var foot = ans
    ? '<button class="cta line" data-act="qprev">&larr; Precedente</button><button class="cta pri" data-act="qnext">'+(quiz.idx===total-1?'Voir le score':'Suivante &rarr;')+'</button>'
    : '<span style="font-size:11.5px;color:var(--muted);font-weight:600">Choisis une reponse</span><button class="cta line" data-act="qskip">Passer &rarr;</button>';
  return '<button class="back" data-go="'+backHash+'">&larr; Réglages</button>'
  + '<div class="page-h">'+esc(title)+'</div>'
  + '<div class="qcard"><div class="qmeta"><span>'+(quiz.idx+1)+' / '+total+'</span><div class="bar"><i style="width:'+Math.round(quiz.idx/total*100)+'%"></i></div><span>'+quiz.ok+' bonnes</span></div>'
  + '<div class="qq">'+esc(q.question)+'</div>'+opts+expl+'<div class="qfoot">'+foot+'</div></div>';
}

/* ---------- FLASHCARDS ---------- */
var fc = null;
/* ---------- REVISION ESPACEE (flashcards et QCM) ---------- */
var DAYMS = 86400000, SRS_INT = [0,1,3,7,14,30], NEW_CAP = 12;
function shuf(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function fcMetaOf(id){ return (store.fcm||{})[id] || null; }
function fcDue(c){ var m=fcMetaOf(c.id); if(m) return m.due<=Date.now(); return store.fc[c.id]==='again'; }
function fcNew(c){ return !store.fc[c.id] && !fcMetaOf(c.id); }
function fcDueCount(cid){ var all=cards(cid,null), d=0, nw=0; all.forEach(function(c){ if(fcDue(c)) d++; else if(fcNew(c)) nw++; }); return {due:d, fresh:Math.min(nw,NEW_CAP)}; }
function qSrsMap(cid){
  var m={};
  store.attempts.filter(function(a){ return a.course===cid; }).sort(function(a,b){ return a.ts-b.ts; }).forEach(function(a){
    var k=progressKey(a.course,a.session,a.questionId), s=m[k]||(m[k]={streak:0,last:0});
    s.last=a.ts; if(a.correct) s.streak++; else s.streak=0;
  });
  return m;
}
function qIsDue(s){ return s.last + SRS_INT[Math.min(s.streak,5)]*DAYMS <= Date.now(); }
function srsSplit(cid){
  var pool=qbPool(cid,'all',0), map=qSrsMap(cid), due=[], fresh=[], rest=[];
  pool.forEach(function(q){ var s=map[questionProgressKey(cid,q)]; if(!s) fresh.push(q); else if(qIsDue(s)) due.push(q); else rest.push(q); });
  due = shuf(due).sort(function(x,y){ return map[questionProgressKey(cid,x)].streak - map[questionProgressKey(cid,y)].streak; });
  return {due:due, fresh:shuf(fresh), rest:shuf(rest)};
}
function startSrsQuiz(cid){
  var p=srsSplit(cid), pool=p.due.concat(p.fresh).concat(p.rest).slice(0,20);
  if(!pool.length) return;
  quiz = {cid:cid, n:'custom', src:'custom', bank:pool, idx:0, answered:{}, sel:null, t0:Date.now(), ok:0, custom:{course:cid, session:'all', level:0, count:'20', srs:true}};
  go('#/qb/play');
}
function srsCard(){
  var cid=state.course, f=fcDueCount(cid), p=srsSplit(cid);
  return '<div class="card" style="margin-bottom:18px"><h2>Révision du jour &middot; '+esc(courseOf(cid).name)+'</h2>'
    + '<p style="font-size:13px;color:var(--muted);margin:0 0 14px">Une carte réussie revient après 1, 3, 7, 14 puis 30 jours, une carte ratée revient tout de suite. Les QCM suivent la même logique : à revoir d&#39;abord, puis jamais vus.</p>'
    + '<div class="pt-items"><button class="pt-item" data-go="#/f/'+cid+'/due"><span class="pt-item-t"><b>Flashcards du jour</b><span>'+f.due+' à revoir &middot; '+f.fresh+' nouvelles</span></span><span class="pt-new">Réviser</span></button>'
    + '<button class="pt-item" data-act="srsquiz" data-cid="'+cid+'"><span class="pt-item-t"><b>QCM de révision</b><span>20 questions &middot; '+p.due.length+' à revoir &middot; '+p.fresh.length+' jamais vues</span></span><span class="pt-new">Commencer</span></button></div></div>';
}
function startFc(cid, n){
  var b;
  if(n==='due'){
    var all=cards(cid,null);
    var due=all.filter(fcDue).sort(function(x,y){ var a=fcMetaOf(x.id), b2=fcMetaOf(y.id); return (a?a.due:0)-(b2?b2.due:0); });
    b = due.concat(shuf(all.filter(fcNew)).slice(0,NEW_CAP));
  } else { b = shuf(cards(cid, n==='all'?null:n)); }
  fc = {cid:cid, n:n, deck:b, idx:0, side:0, known:0};
}
function vFlash(cid, n){
  if(!fc || fc.cid!==cid || String(fc.n)!==String(n)) startFc(cid, n);
  var c = courseOf(cid);
  var backHash = n==='due' ? '#/' : ((n && n!=='all') ? '#/s/'+cid+'/'+n : '#/c/'+cid);
  var title = n==='due' ? 'Flashcards du jour · '+c.name : (n && n!=='all' ? 'Flashcards · Session '+n : 'Flashcards · '+c.name);
  if(!fc.deck.length) return '<button class="back" data-go="'+backHash+'">&larr; Retour</button><div class="page-h">'+esc(title)+'</div><div class="card"><p style="font-size:13px;color:var(--muted)">'+(n==='due' ? 'Rien à réviser aujourd&#39;hui. Reviens demain, ou lance un QCM de révision.' : 'Pas de cartes pour cette session.')+'</p></div>';
  if(fc.idx >= fc.deck.length){
    return '<button class="back" data-go="'+backHash+'">&larr; Retour</button>'
    + '<div class="page-h">'+esc(title)+' &middot; termine</div>'
    + '<div class="qcard" style="text-align:center"><div class="score-big">'+fc.known+' / '+fc.deck.length+'</div><p style="color:var(--muted);font-weight:600;margin:6px 0 18px">cartes marquees comme connues</p>'
    + '<div style="display:flex;gap:10px;justify-content:center"><button class="cta pri" data-act="fcretry">Recommencer</button><button class="cta line" data-go="'+backHash+'">Retour</button></div></div>';
  }
  var card = fc.deck[fc.idx];
  return '<button class="back" data-go="'+backHash+'">&larr; Retour</button>'
  + '<div class="page-h">'+esc(title)+'</div>'
  + '<div class="flash-wrap"><div class="qmeta" style="max-width:560px;margin:0 auto 12px"><span>'+(fc.idx+1)+' / '+fc.deck.length+'</span><div class="bar"><i style="width:'+Math.round(fc.idx/fc.deck.length*100)+'%"></i></div><span>'+fc.known+' connues</span></div>'
  + '<button class="flashcard" data-act="flip"><div>'+(fc.side===0
      ? '<div class="side">QUESTION &middot; toucher pour retourner</div><div class="q">'+esc(card.front)+'</div>'
      : '<div class="side">REPONSE</div><div class="a">'+esc(card.back)+'</div>')+'</div></button>'
  + '<div class="flash-btns">'+(fc.side===1
      ? '<button class="cta line" data-act="fcagain">A revoir</button><button class="cta pri" data-act="fcknown">Je savais</button>'
      : '<button class="cta line" data-act="flip">Retourner la carte</button>')+'</div></div>';
}
function fcMark(status){
  var card = fc.deck[fc.idx];
  store.fc[card.id] = status;
  store.fcm = store.fcm || {};
  var pm = store.fcm[card.id] || {box:0}, bx = status==='known' ? Math.min(5,(pm.box||0)+1) : 0;
  store.fcm[card.id] = {box:bx, due:Date.now()+(status==='known' ? SRS_INT[bx]*DAYMS : 0)};
  save();
  if(status==='known') fc.known++;
  fc.idx++; fc.side=0;
  render();
}

/* ---------- CHEATSHEET ---------- */
function mdLite(src){
  var html = esc(src);
  var pres = [];
  html = html.replace(/```([\s\S]*?)```/g, function(m, c){ pres.push(c.replace(/^\n+|\n+$/g,'')); return '\u0001' + (pres.length-1) + '\u0001'; });
  var lines = html.split('\n'), out = [], inList = false;
  lines.forEach(function(l){
    var line = l;
    if(/^####\s/.test(line)){ if(inList){out.push('</ul>');inList=false;} out.push('<h4>'+line.slice(5)+'</h4>'); return; }
    if(/^###\s/.test(line)){ if(inList){out.push('</ul>');inList=false;} out.push('<h4>'+line.slice(4)+'</h4>'); return; }
    if(/^##\s/.test(line)){ if(inList){out.push('</ul>');inList=false;} out.push('<h3>'+line.slice(3)+'</h3>'); return; }
    if(/^#\s/.test(line)){ if(inList){out.push('</ul>');inList=false;} out.push('<h3>'+line.slice(2)+'</h3>'); return; }
    if(/^\s*-\s/.test(line)){ if(!inList){out.push('<ul>');inList=true;} out.push('<li>'+line.replace(/^\s*-\s/,'')+'</li>'); return; }
    if(inList){ out.push('</ul>'); inList=false; }
    if(line.trim()===''){ out.push(''); return; }
    out.push('<p>'+line+'</p>');
  });
  if(inList) out.push('</ul>');
  return out.join('\n').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\u0001(\d+)\u0001/g, function(m, i){ return '<pre class="mdpre">'+pres[+i]+'</pre>'; });
}
function vCheat(cid){
  var c = courseOf(cid);
  var txt = D.CHEATSHEET[cid] || '';
  return '<button class="back" data-go="#/c/'+cid+'">&larr; '+esc(c.name)+'</button>'
  + '<div class="page-h">Fiche de synthese &middot; '+esc(c.name)+'</div><div class="page-sub">Tout le cours en une page. Disponible hors connexion.</div>'
  + '<div class="card"><div class="md">'+mdLite(txt)+'</div></div>';
}

/* ---------- DEADLINES VIEW ---------- */
function vDeadlines(){
  var list = allDeadlines();
  var past = list.filter(function(d){ var n=dlDays(d.date); return n!=null && n<0; });
  var fut = list.filter(function(d){ var n=dlDays(d.date); return n==null || n>=0; });
  function group(title, arr){
    if(!arr.length) return '';
    return '<div class="card" style="margin-bottom:16px"><h2>'+title+'</h2>'
      + arr.map(function(d){
          var n = dlDays(d.date), w = dlWhen(d.date);
          var soon = n!=null && n>=0 && n<=7 ? ' soon' : '';
          var chip = n==null ? '' : (n<0 ? 'passee' : n===0 ? "aujourd'hui" : 'J-'+n);
          var del = d.custom ? ' <button class="chip2" data-act="dldel" data-id="'+esc(d.id)+'">suppr.</button>' : '';
          return '<div class="dl'+soon+'"><span class="when"><b>'+w.b+'</b><span>'+w.s+'</span></span><span class="tx"><b>'+esc(d.label)+'</b><span>'+esc(courseOf(d.course||'cr').name)+(d.kind?' &middot; '+esc(d.kind):'')+(d.custom?' &middot; perso':'')+'</span></span><span class="chip2">'+chip+'</span>'+del+'</div>';
        }).join('')+'</div>';
  }
  return '<div class="page-h">Echeances</div><div class="page-sub">Examens, etudes de cas et dates cles du semestre.</div>'
  + '<div class="grid"><section>'+group('A venir', fut)+group('Passees', past)+'</section>'
  + '<aside class="card"><h2>Ajouter une echeance</h2>'
  + '<div style="display:flex;flex-direction:column;gap:10px">'
  + '<select id="dlCourse" style="padding:10px;border:1.5px solid var(--line);border-radius:10px">'+COURSES.map(function(c){ return '<option value="'+c.id+'">'+esc(c.name)+'</option>'; }).join('')+'</select>'
  + '<input id="dlLabel" placeholder="Intitule (ex. remise du projet)" style="padding:10px;border:1.5px solid var(--line);border-radius:10px;font:inherit">'
  + '<input id="dlDate" type="datetime-local" style="padding:10px;border:1.5px solid var(--line);border-radius:10px;font:inherit">'
  + '<button class="cta pri" data-act="dladd">Ajouter</button>'
  + '<p style="font-size:11px;color:var(--muted)">Les echeances officielles sont mises a jour automatiquement a partir des annonces Blackboard.</p>'
  + '</div></aside></div>';
}

/* ---------- FAUTES A REVOIR (QCM, exercices, flashcards) ---------- */
function recallLog(){ return store.recall || (store.recall=[]); }
function mistakeStates(cid){
  var ev={};
  store.attempts.forEach(function(a){ if(a.course!==cid) return; var k=progressKey(a.course,a.session,a.questionId); (ev[k]=ev[k]||[]).push({ok:a.correct, ts:a.ts}); });
  recallLog().forEach(function(r){ if(r.cid!==cid) return; (ev[r.k]=ev[r.k]||[]).push({ok:r.ok, ts:r.ts}); });
  var m={};
  Object.keys(ev).forEach(function(k){
    var wrong=0, streak=0;
    ev[k].sort(function(a,b){ return a.ts-b.ts; }).forEach(function(e){ if(e.ok) streak++; else { wrong++; streak=0; } });
    m[k]={wrong:wrong, streak:streak};
  });
  return m;
}
/* une faute reste dans la liste tant qu'elle n'a pas ete reussie 2 fois de suite (QCM ou active recall) */
function mistakePool(cid){
  var st=mistakeStates(cid), out=[];
  qbPool(cid,'all',0).forEach(function(q){ var s=st[questionProgressKey(cid,q)]; if(s && s.wrong>0 && s.streak<2) out.push({q:q, streak:s.streak, r:Math.random()}); });
  out.sort(function(a,b){ return a.streak-b.streak || a.r-b.r; });
  return out.map(function(o){ return o.q; });
}
function exMistakes(){
  var E=exData(), r=[]; if(!E) return r;
  E.chapters.forEach(function(c){ c.items.forEach(function(i,pos){
    if(exQs(i).some(function(q,j){ var k=exKey(i,j); return exHas(k) && exAns(k)!==q.k; })) r.push({c:c,pos:pos,i:i});
  }); });
  return r;
}
function mistakeTotals(){
  var t=0; COURSES.forEach(function(c){ t+=mistakePool(c.id).length; }); return t+exMistakes().length;
}
function startMistakeQuiz(cid){
  var pool=mistakePool(cid).slice(0,20);
  if(!pool.length) return;
  quiz = {cid:cid, n:'custom', src:'custom', bank:shuf(pool), idx:0, answered:{}, sel:null, t0:Date.now(), ok:0, custom:{course:cid, session:'all', level:0, count:'20', mist:true}};
  if(location.hash==='#/qb/play') render(); else go('#/qb/play');
}
var rcs = null;
function startRecall(cid, silent){
  var p=mistakePool(cid).slice(0,20);
  rcs = {cid:cid, bank:p, idx:0, rev:false, ok:0, ko:[]};
  if(silent || !p.length) return;
  if(location.hash==='#/rc/'+cid) render(); else go('#/rc/'+cid);
}
function rcAnswer(ok){
  var q=rcs.bank[rcs.idx];
  recallLog().push({cid:rcs.cid, k:questionProgressKey(rcs.cid,q), ok:!!ok, ts:Date.now()});
  save();
  if(ok) rcs.ok++; else rcs.ko.push(q);
  rcs.idx++; rcs.rev=false; render();
}
function vRecall(cid){
  if(!rcs || rcs.cid!==cid){ startRecall(cid,true); }
  if(!rcs.bank.length){ location.replace('#/plan'); return ''; }
  var total=rcs.bank.length, c=courseOf(cid);
  var head='<button class="back" data-go="#/plan">&larr; Plan de revision</button><div class="page-h">Active recall &middot; mes fautes &middot; '+esc(c.name)+'</div>';
  if(rcs.idx>=total){
    var left=mistakePool(cid).length;
    return head+'<div class="qcard" style="text-align:center;padding:30px 20px"><div class="score-big">'+rcs.ok+' / '+total+'</div>'
      + '<p style="color:var(--muted);font-weight:600;margin:6px 0 4px">retrouvees de memoire</p>'
      + '<p style="font-size:13px;margin-bottom:18px">'+(left ? left+' faute'+(left>1?'s':'')+' encore a consolider. Une faute disparait de la liste quand tu la reussis 2 fois de suite, en recall ou en QCM, donc elle reviendra.' : 'Plus aucune faute en attente pour cette matiere.')+'</p>'
      + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
      + (rcs.ko.length ? '<button class="cta pri" data-act="rcretry">Refaire les '+rcs.ko.length+' rat&eacute;e'+(rcs.ko.length>1?'s':'')+'</button>' : '')
      + (left ? '<button class="cta line" data-act="mqstart" data-cid="'+cid+'">Me tester en QCM</button>' : '')
      + '<button class="cta line" data-go="#/plan">Retour au plan</button></div></div>';
  }
  var q=rcs.bank[rcs.idx], fu=ficheUrl(cid,q.session);
  var body;
  if(!rcs.rev){
    body='<div class="qq">'+esc(q.question)+'</div>'
      + '<div class="expl" style="margin:14px 0"><b>Avant de regarder :</b> donne la reponse a voix haute ou sur papier, avec le raisonnement, puis r&eacute;v&egrave;le.</div>'
      + '<div class="qfoot"><span style="font-size:11.5px;color:var(--muted);font-weight:600">Tu t&#39;etais tromp&eacute;(e) sur celle-ci</span><button class="cta pri" data-act="rcreveal">R&eacute;v&eacute;ler la r&eacute;ponse</button></div>';
  } else {
    var opts=q.choices.map(function(ch,i){ return '<div class="opt '+(i===q.correct_index?'right':'dim')+'" style="cursor:default"><span class="k">'+'ABCD'[i]+'</span><span>'+esc(ch)+'</span></div>'; }).join('');
    body='<div class="qq">'+esc(q.question)+'</div>'+opts
      + (q.explanation ? '<div class="expl"><b>Pourquoi :</b> '+esc(q.explanation)+'</div>' : '')
      + (fu ? '<p style="font-size:12.5px;margin:10px 0 0"><a href="'+esc(fu)+'" target="_blank" rel="noopener">Relire la fiche de la session &rarr;</a></p>' : '')
      + '<div class="qfoot"><button class="cta line" data-act="rcmiss">Je ne l&#39;avais pas</button><button class="cta pri" data-act="rcknow">Je l&#39;avais</button></div>';
  }
  return head+'<div class="qcard"><div class="qmeta"><span>'+(rcs.idx+1)+' / '+total+'</span><div class="bar"><i style="width:'+Math.round(rcs.idx/total*100)+'%"></i></div><span>'+rcs.ok+' retrouv&eacute;es</span></div>'+body+'</div>';
}
function mistakesBlock(){
  var rows='', total=0;
  COURSES.forEach(function(c){
    var p=mistakePool(c.id); if(!p.length) return;
    total+=p.length;
    var tc={}; p.forEach(function(q){ if(q.topic) tc[q.topic]=(tc[q.topic]||0)+1; });
    var top=Object.keys(tc).sort(function(a,b){ return tc[b]-tc[a]; }).slice(0,3).join(' &middot; ');
    rows+='<div class="pt-item" style="cursor:default;flex-wrap:wrap"><span class="pt-item-t"><b>'+esc(c.name)+' &middot; '+p.length+' question'+(p.length>1?'s':'')+' rat&eacute;e'+(p.length>1?'s':'')+'</b>'+(top?'<span>'+top+'</span>':'')+'</span>'
      + '<button class="cta pri" style="padding:9px 14px;font-size:12.5px" data-act="rcstart" data-cid="'+c.id+'">Active recall</button>'
      + '<button class="cta line" style="padding:9px 14px;font-size:12.5px" data-act="mqstart" data-cid="'+c.id+'">QCM</button></div>';
  });
  var ex=exMistakes();
  if(ex.length){
    total+=ex.length;
    rows+='<div class="pt-item" style="cursor:default;flex-wrap:wrap"><span class="pt-item-t"><b>CR &middot; '+ex.length+' exercice'+(ex.length>1?'s':'')+' du livre rat&eacute;'+(ex.length>1?'s':'')+'</b><span>'+ex.slice(0,6).map(function(x){ return 'Ex. '+esc(x.i.n); }).join(' &middot; ')+(ex.length>6?' ...':'')+'</span></span>'
      + '<button class="cta pri" style="padding:9px 14px;font-size:12.5px" data-go="#/ex/'+ex[0].c.n+'/'+(ex[0].pos+1)+'">Refaire</button></div>';
  }
  COURSES.forEach(function(c){
    var d=fcDueCount(c.id).due; if(!d) return;
    total+=d;
    rows+='<div class="pt-item" style="cursor:default;flex-wrap:wrap"><span class="pt-item-t"><b>'+esc(c.name)+' &middot; '+d+' flashcard'+(d>1?'s':'')+' &agrave; revoir</b><span>rat&eacute;es ou arriv&eacute;es &agrave; &eacute;ch&eacute;ance</span></span>'
      + '<button class="cta line" style="padding:9px 14px;font-size:12.5px" data-go="#/f/'+c.id+'/due">Reviser</button></div>';
  });
  if(!total) return '<div class="card" style="margin-bottom:18px"><h2>Mes fautes &agrave; revoir</h2><p style="font-size:13px;color:var(--muted);margin:0">Aucune faute en attente. Chaque question rat&eacute;e en QCM ou en exercice appara&icirc;tra ici jusqu&#39;&agrave; ce que tu la r&eacute;ussisses deux fois de suite.</p></div>';
  return '<div class="card plmist" style="margin-bottom:18px;border:1.5px solid var(--warn)"><h2>Mes fautes &agrave; revoir &middot; '+total+'</h2>'
    + '<p style="font-size:13px;color:var(--muted);margin:0 0 14px">Tout ce que tu as rat&eacute; revient ici tant que ce n&#39;est pas ma&icirc;tris&eacute;. Commence par l&#39;active recall (r&eacute;pondre de m&eacute;moire avant de voir la solution), puis v&eacute;rifie en QCM. Une faute sort de la liste apr&egrave;s deux r&eacute;ussites de suite.</p>'
    + '<div class="pt-items">'+rows+'</div></div>';
}

/* ---------- PLAN DE REVISION (calcule a chaque affichage, jamais en retard) ---------- */
function pdKey(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function pdAdd(ds,n){ var p=ds.split('-'), d=new Date(+p[0],+p[1]-1,+p[2]+n); return pdKey(d); }
function planDoneMap(){ return store.planDone || (store.planDone={}); }
function planGen(cid, seenN){
  var NEW=[], CONS=[], chSeen={}, L=(cid==='cr'?crSessionList():sessionsOf(cid).filter(function(x){ return typeof x.n==='number' && x.n<=12; }));
  L.forEach(function(x){
    var key=x.key, isNew=x.n>seenN, bk=bank(cid,key).concat(levelBank(cid,key)), rev=/^Review/i.test(x.title);
    var T=isNew?NEW:CONS;
    if(isNew){
      if(rev) T.push({id:cid+'-rev-'+x.n, c:cid, k:'revue', min:30, txt:'Session '+x.n+' ('+x.title+') : fiche et flashcards', ref:'#/s/'+cid+'/'+x.n, auto:function(){ return !!store.fiches[cid+'-'+key]; }});
      else{
        T.push({id:cid+'-learn-'+x.n, c:cid, k:'revue', min:45, txt:'Session '+x.n+' ('+x.title+') : fiche + flashcards', ref:'#/s/'+cid+'/'+x.n,
          auto:(function(key){ return function(){ var nb=cards(cid,key).length; return !!store.fiches[cid+'-'+key] && (!nb || fcKnown(cid,key)>=nb*0.5); }; })(key)});
      }
    }
    if(bk.length && !rev) T.push({id:cid+'-qcm-'+x.n, c:cid, k:'qcm', min:20, txt:(isNew?'QCM session ':'Consolider : QCM session ')+x.n+', objectif >= 70 %', ref:'#/q/'+cid+'/'+key,
      auto:(function(key){ return function(){ var q=sessionProgress(cid,key); return q.done>=Math.min(q.total,15) && q.acc>=70; }; })(key)});
    if(cid==='cr'){
      exChaptersForSession(x.n).forEach(function(ch){
        if(chSeen[ch.n]) return; chSeen[ch.n]=1;
        T.push({id:'cr-ex-'+ch.n, c:'cr', k:'revue', min:40, txt:'Exercices du livre, chapitre '+ch.n+' ('+ch.t+')', ref:'#/ex/'+ch.n, auto:function(){ var q=exProgress(ch); return q.done>=Math.ceil(q.total*0.8); }});
      });
    }
  });
  /* 2 nouvelles pour 1 de consolidation */
  var out=[], i=0, j=0; while(i<NEW.length||j<CONS.length){ for(var t=0;t<2&&i<NEW.length;t++) out.push(NEW[i++]); if(j<CONS.length) out.push(CONS[j++]); }
  return out;
}
function planModel(){
  var P=D.PLAN||{exams:[]}, done=planDoneMap(), today=pdKey(new Date());
  var exD={}; P.exams.forEach(function(e){ exD[e.c]=String(e.date).slice(0,10); });
  var last={cr:pdAdd(exD.cr||'2026-12-11',-1), da:pdAdd(exD.da||'2026-12-16',-1)};
  var seenCR=seenSession('cr').n, seenDA=seenSession('da').n;
  var fixed={}; function fx(d,it){ (fixed[d]=fixed[d]||[]).push(it); }
  var cr=(exD.cr||'2026-12-11'), da=(exD.da||'2026-12-16');
  fx(pdAdd(cr,-5),{id:'cr-blanc1',c:'cr',k:'qcm',min:45,txt:'BLANC Partie A : QCM 45 min en conditions reelles, sans support',ref:'#/pt'});
  fx(pdAdd(cr,-5),{id:'cr-blanc1c',c:'cr',k:'revue',min:45,txt:'Correction du blanc : noter les themes sous le seuil'});
  fx(pdAdd(cr,-2),{id:'cr-blanc2',c:'cr',k:'qcm',min:35,txt:'Mock officiel CR #1 (18 QCM, 35 min) puis correction',ref:'#/pt/cr-gen-mock1'});
  fx(pdAdd(cr,-1),{id:'cr-final',c:'cr',k:'revue',min:90,txt:'Revision finale : mes fautes en active recall + flashcards des sessions faibles',ref:'#/rev'});
  fx(pdAdd(da,-4),{id:'da-mock1',c:'da',k:'qcm',min:60,txt:'Mock DA officiel en conditions reelles, puis correction',ref:'#/pt'});
  fx(pdAdd(da,-1),{id:'da-final',c:'da',k:'revue',min:90,txt:'Revision finale DA : mes fautes + flashcards des sessions faibles',ref:'#/rev'});
  var allT={cr:planGen('cr',seenCR), da:planGen('da',seenDA)};
  /* passe 2 (espacement) : en fin de file, pour remplir les jours restants avec de la repetition utile */
  [['cr',32],['da',12]].forEach(function(cfg){ var c=cfg[0]; for(var b0=1;b0<=cfg[1];b0+=4){ var b1=Math.min(cfg[1],b0+3);
    allT[c].push({id:c+'-p2-'+b0, c:c, k:'qcm', min:40, txt:'Passe 2 : QCM melange des sessions '+b0+' a '+b1+', puis mes fautes', ref:'#/qb'}); } });
  var total=0, doneMin=0, perC={cr:{t:0,d:0},da:{t:0,d:0}};
  var queue={cr:[],da:[]};
  ['cr','da'].forEach(function(c){
    allT[c].concat(Object.keys(fixed).reduce(function(a,d){ return a.concat(fixed[d].filter(function(x){ return x.c===c; })); },[])).forEach(function(t){
      var isDone = !!done[t.id] || (t.auto && t.auto());
      total+=t.min; perC[c].t+=t.min; if(isDone){ doneMin+=t.min; perC[c].d+=t.min; }
      t.isDone=isDone; t.doneToday = !!done[t.id] && pdKey(new Date(done[t.id]))===today;
    });
    queue[c]=allT[c].filter(function(t){ return !t.isDone; });
  });
  /* calendrier */
  var days=[], capFor=function(ds){ var p=ds.split('-'), wd=new Date(+p[0],+p[1]-1,+p[2]).getDay(); return ds===today?180:(wd===0?120:(wd===6?150:240)); };
  var endAll=pdAdd(da,-1), over=[];
  for(var ds=today; ds<=endAll; ds=pdAdd(ds,1)){
    var items=[], capCR=0, capDA=0, cap=capFor(ds);
    var fixedHere=(fixed[ds]||[]).filter(function(t){ return !t.isDone; });
    var used=fixedHere.reduce(function(a,t){ return a+t.min; },0);
    items=items.concat(fixedHere);
    var free=Math.max(0,cap-used);
    var crOpen = ds<=last.cr && queue.cr.length, daOpen = ds<=last.da && queue.da.length;
    var shareCR = crOpen&&daOpen ? Math.round(free*0.62) : (crOpen?free:0), shareDA = crOpen&&daOpen ? free-shareCR : (daOpen?free:0);
    function fill(c,room){ var q=queue[c], lastDay=(ds===last[c]); while(q.length && (room>0 || lastDay)){ var t=q[0]; if(t.min>room && !lastDay && items.length && room<t.min*0.5) break; q.shift(); items.push(t); room-=t.min; if(room<=0 && !lastDay) break; } return room; }
    var rCR=fill('cr',shareCR), rDA=fill('da',shareDA+(rCR>0?rCR:0));
    if(rDA>0 && queue.cr.length && ds<=last.cr) fill('cr',rDA);
    if(ds===exD.cr) items.push({k:'exam',txt:'EXAMEN CR Comprehensive A+B a 9h00, allege, rien de nouveau'});
    days.push({d:ds, items:items});
  }
  [fixed].forEach(function(){});
  var leftover=queue.cr.concat(queue.da); 
  /* taches terminees aujourd'hui, pour pouvoir decocher */
  var doneToday=[]; ['cr','da'].forEach(function(c){ allT[c].concat(Object.keys(fixed).reduce(function(a,d){ return a.concat(fixed[d].filter(function(x){ return x.c===c; })); },[])).forEach(function(t){ if(t.doneToday) doneToday.push(t); }); });
  if(days.length) days[0].items=doneToday.concat(days[0].items);
  /* jour d'examen DA */
  if(!days.some(function(d){ return d.d===exD.da; })) days.push({d:exD.da,items:[{k:'exam',txt:'EXAMEN DA a 14h00, allege, rien de nouveau'}]});
  return {exams:P.exams, days:days, total:total, done:doneMin, perC:perC, leftover:leftover, seen:{cr:seenCR,da:seenDA}};
}
function vPlan(){
  var m=planModel(), today=pdKey(new Date());
  var WD=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  var MO=['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
  var CL={cr:'CR',da:'DA',adm:'Admin'};
  function fdate(ds){ var p=ds.split('-'), d=new Date(+p[0],+p[1]-1,+p[2]); return WD[d.getDay()]+' '+d.getDate()+' '+MO[d.getMonth()]; }
  function fmin(x){ return x>=90 ? (Math.round(x/6)/10)+' h' : x+' min'; }
  var pct=m.total?Math.round(m.done*100/m.total):0;
  var chips=m.exams.filter(function(e){ return e.c==='cr'||e.c==='da'; }).map(function(e){
    var dd=ptDays(e.date), dt=new Date(e.date);
    return '<div class="plchip pl-'+e.c+'"><b>'+esc(e.label)+'</b><span>'+dt.getDate()+' '+MO[dt.getMonth()].slice(0,3)+' &middot; '+('0'+dt.getHours()).slice(-2)+'h'+('0'+dt.getMinutes()).slice(-2)+(dd!=null&&dd>=0?' &middot; J-'+dd:'')+'</span></div>';
  }).join('');
  var rows=['cr','da'].map(function(c){ var t=m.perC[c].t, d=m.perC[c].d, p=t?Math.round(d*100/t):0;
    return '<div class="plcours"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700"><span><b class="plc pl-'+c+'">'+CL[c]+'</b>'+esc(courseOf(c).name)+' &middot; session '+m.seen[c]+'</span><span>'+fmin(d)+' / '+fmin(t)+'</span></div><div class="bar"><i data-w="'+p+'"></i></div></div>'; }).join('');
  function item(dyD,it){
    if(it.k==='exam') return '<div class="plitem plexam"><span class="pltag">EXAMEN</span><span>'+esc(it.txt)+'</span></div>';
    var on=it.isDone?1:0;
    return '<div class="plitem'+(on?' pldone':'')+'"><button class="plck'+(on?' on':'')+'" data-act="plchk" data-k="'+esc(it.id)+'">'+(on?'&#10003;':'')+'</button><span class="pltx"><b class="plc pl-'+it.c+'">'+esc(CL[it.c]||it.c)+'</b>'+esc(it.txt)+' <span class="plmin">'+it.min+' min</span>'+(it.ref?' <a class="plgo" href="'+esc(it.ref)+'">ouvrir &rarr;</a>':'')+'</span></div>';
  }
  function dayBlock(dy){
    var load=dy.items.reduce(function(a,it){ return a+(it.k==='exam'||it.isDone?0:it.min); },0);
    return '<div class="plday'+(dy.d===today?' pltoday':'')+'"><div class="pldate">'+fdate(dy.d)+(dy.d===today?' &middot; aujourd\'hui':'')+(load?' &middot; ~'+fmin(load):'')+'</div>'+(dy.items.length?dy.items.map(function(it){ return item(dy.d,it); }).join(''):'<div class="plitem ploff"><span>Journee libre.</span></div>')+'</div>';
  }
  var over=m.leftover.length ? '<div class="hwarn">'+m.leftover.length+' tache'+(m.leftover.length>1?'s':'')+' ('+fmin(m.leftover.reduce(function(a,t){ return a+t.min; },0))+') ne tiennent pas avant les examens au rythme actuel. Elles sont classees par priorite : saute d\'abord les exercices du livre des chapitres les moins importants.</div>' : '';
  var today0=m.days.filter(function(d){ return d.d===today; })[0], rest=m.days.filter(function(d){ return d.d>today; });
  return '<div class="page-h">Plan de revision</div>'
    + '<div class="page-sub">Recale sur ta position : CR session '+m.seen.cr+', DA session '+m.seen.da+'. Le plan se recalcule tout seul quand tu avances, il n\'y a jamais de retard.</div>'
    + '<div class="plchips">'+chips+'</div>'
    + '<div class="card" style="margin-bottom:18px"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:4px"><span>Progression du plan</span><span>'+fmin(m.done)+' / '+fmin(m.total)+' &middot; '+pct+'%</span></div><div class="bar"><i data-w="'+pct+'"></i></div><div style="margin-top:12px;display:flex;flex-direction:column;gap:10px">'+rows+'</div></div>'
    + over + mistakesBlock()
    + (today0?dayBlock(today0):'')
    + '<div class="pldate" style="margin-top:20px">A venir</div>'
    + rest.map(dayBlock).join('');
}

/* ---------- SEARCH ---------- */
var searchIdx = null, searchSel = 0;
function buildIndex(){
  if(searchIdx) return searchIdx;
  var idx = [];
  COURSES.forEach(function(c){
    sessionsOf(c.id).forEach(function(s){ if(!(bank(c.id,s.key).length||cards(c.id,s.key).length||ficheUrl(c.id,s.key))) return; idx.push({k:'Session', label:c.code+' S'+s.n+' - '+s.title, hash:'#/s/'+c.id+'/'+s.key, hay:(c.name+' '+s.title+' session '+s.n+' '+(s.part||'')).toLowerCase()}); });
    (D.FLASHCARDS[c.id]||[]).forEach(function(f){ idx.push({k:'Carte', label:f.front, hash:'#/f/'+c.id+'/'+f.session, hay:f.front.toLowerCase()}); });
    var topics = {};
    (D.QCM[c.id]||[]).forEach(function(q){ if(q.topic && !topics[q.topic]){ topics[q.topic]=q; } });
    Object.keys(topics).forEach(function(t){ idx.push({k:'Theme', label:t, hash:'#/q/'+c.id+'/'+topics[t].session, hay:t.toLowerCase()}); });
  });
  searchIdx = idx; return idx;
}
function openSearch(){
  closeSearch();
  var ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'c40search';
  ov.innerHTML = '<div class="omni"><input id="omniIn" placeholder="Rechercher une session, un theme, une carte..." autocomplete="off"><div class="res" id="omniRes"><div class="hint">Tape pour rechercher parmi '+(buildIndex().length)+' elements. Entree pour ouvrir, Echap pour fermer.</div></div></div>';
  document.body.appendChild(ov);
  var inp = $('#omniIn');
  inp.focus();
  ov.addEventListener('click', function(e){ if(e.target===ov) closeSearch(); });
  inp.addEventListener('input', function(){ searchSel=0; renderSearch(inp.value); });
  inp.addEventListener('keydown', function(e){
    var hits = $$('.hit', ov);
    if(e.key==='Escape'){ closeSearch(); }
    else if(e.key==='ArrowDown'){ searchSel=Math.min(hits.length-1, searchSel+1); markSel(hits); e.preventDefault(); }
    else if(e.key==='ArrowUp'){ searchSel=Math.max(0, searchSel-1); markSel(hits); e.preventDefault(); }
    else if(e.key==='Enter'){ var h = hits[searchSel]; if(h){ var hh=h.getAttribute('data-go'); closeSearch(); go(hh); } }
  });
}
function markSel(hits){ hits.forEach(function(h,i){ h.classList.toggle('sel', i===searchSel); if(i===searchSel) h.scrollIntoView({block:'nearest'}); }); }
function renderSearch(q){
  var res = $('#omniRes'); if(!res) return;
  q = q.trim().toLowerCase();
  if(!q){ res.innerHTML = '<div class="hint">Tape pour rechercher. Ex : "regression", "session 3", "Nash".</div>'; return; }
  var words = q.split(/\s+/);
  var hits = buildIndex().filter(function(it){ return words.every(function(w){ return it.hay.indexOf(w)>=0; }); }).slice(0,12);
  if(!hits.length){ res.innerHTML = '<div class="hint">Aucun resultat pour &laquo; '+esc(q)+' &raquo;.</div>'; return; }
  res.innerHTML = hits.map(function(h,i){ return '<div class="hit'+(i===0?' sel':'')+'" data-go="'+esc(h.hash)+'"><span class="k">'+h.k+'</span><span>'+esc(h.label)+'</span></div>'; }).join('');
  $$('.hit', res).forEach(function(h,i){ h.addEventListener('click', function(){ var hh=h.getAttribute('data-go'); closeSearch(); go(hh); }); h.addEventListener('mousemove', function(){ searchSel=i; markSel($$('.hit',res)); }); });
}
function closeSearch(){ var ov = $('#c40search'); if(ov) ov.remove(); }

/* ---------- RENDER ---------- */
function render(){
  var r = parseHash(), content;
  if(r.course && COURSES.some(function(c){ return c.id===r.course; }) && state.course!==r.course){ state.course=r.course; store.focus=r.course; save(); }
  switch(r.page){
    case 'home': content = vHome(); break;
    case 'course': content = vCourse(r.course); break;
    case 'session': content = vSession(r.course, r.n); break;
    case 'quiz': content = vQuiz(r.course, r.n, r.src); break;
    case 'qbuilder': content = vQBuilder(); break;
    case 'qplay': content = vQPlay(); break;
    case 'flash': content = vFlash(r.course, r.n); break;
    case 'cheat': content = vCheat(r.course); break;
    case 'deadlines': content = vDeadlines(); break;
    case 'plan': content = vPlan(); break;
    case 'rev': content = vRevise(); break;
    case 'exam': content = vExams(); break;
    case 'recall': content = vRecall(r.course); break;
    case 'partiels': content = vPartiels(); break;
    case 'ptitem': content = vPtItem(r.item); break;
    case 'moyennes': content = vMoyennes(); break;
    case 'ex': content = vEx(r.ch, r.k); break;
    default: content = vHome();
  }
  root.innerHTML = shell(content, r);
  requestAnimationFrame(function(){
    $$('.bar i[data-w]').forEach(function(i){ i.style.width = i.getAttribute('data-w')+'%'; });
    var ring = $('#heroRing');
    if(ring){ var g = globalProgress(), circ = 2*Math.PI*48; ring.style.transition = 'stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)'; ring.style.strokeDashoffset = String(circ*(1-g.pct/100)); }
    updateNet();
    if(r.page==='moyennes') moyBind();
  });
}
function updateNet(){ var d = $('#netdot'); if(d) d.classList.toggle('off', !navigator.onLine); }
window.addEventListener('online', updateNet);
window.addEventListener('offline', updateNet);

/* ---------- GLOBAL EVENTS ---------- */
document.addEventListener('click', function(e){
  var a = e.target.closest ? e.target.closest('[data-act]') : null;
  if(a){
    var act = a.getAttribute('data-act');
    if(act==='search'){ openSearch(); return; }
    if(act==='plchk'){ var pk=a.getAttribute('data-k'), pdm=planDoneMap(); if(pdm[pk]) delete pdm[pk]; else pdm[pk]=Date.now(); save(); render(); return; }
    if(act==='fiche'){ store.fiches[a.getAttribute('data-cid')+'-'+a.getAttribute('data-n')] = true; save(); return; /* laisse le lien s'ouvrir */ }
    if(act==='ans'){ answerQuiz(parseInt(a.getAttribute('data-i'),10)); return; }
    if(act==='qbset'){ qbSet(a.getAttribute('data-k'), a.getAttribute('data-v')); return; }
    if(act==='qblaunch'){ startCustomQuiz(); return; }
    if(act==='qbretry'){ startCustomQuiz(true); return; }
    if(act==='setcourse'){ state.course=a.getAttribute('data-cid'); store.focus=state.course; save(); render(); return; }
    if(act==='rcstart'){ startRecall(a.getAttribute('data-cid')); return; }
    if(act==='rcreveal'){ rcs.rev=true; render(); return; }
    if(act==='rcknow'){ rcAnswer(true); return; }
    if(act==='rcmiss'){ rcAnswer(false); return; }
    if(act==='rcretry'){ rcs.bank=rcs.ko.slice(); rcs.idx=0; rcs.rev=false; rcs.ok=0; rcs.ko=[]; render(); return; }
    if(act==='mqstart'){ startMistakeQuiz(a.getAttribute('data-cid')); return; }
    if(act==='srsquiz'){ startSrsQuiz(a.getAttribute('data-cid')); return; }
        if(act==='exans'){ var xn=a.getAttribute('data-n'), xk=a.getAttribute('data-key'); store.exAns=store.exAns||{}; if(store.exAns[xk]===undefined){ store.exAns[xk]=parseInt(a.getAttribute('data-i'),10); save(); exRefresh(xn); } e.preventDefault(); return; }
    if(act==='exreset'){ var rn=a.getAttribute('data-n'), rk=a.getAttribute('data-key'); if(store.exAns) delete store.exAns[rk]; save(); exRefresh(rn); e.preventDefault(); return; }
    if(act==='exsess'){ var sk=parseInt(a.getAttribute('data-s'),10); store.exSess=sk; save(); var L=exChaptersForSession(sk), tg=L[0]; for(var q=0;q<L.length;q++){ if(exFirstOpen(L[q])<L[q].items.length){ tg=L[q]; break; } } if(tg) location.hash='#/ex/'+tg.n; e.preventDefault(); return; }
    if(act==='exchap'){ store.exSess=null; save(); location.hash='#/ex/'+a.getAttribute('data-ch'); e.preventDefault(); return; }
    if(act==='exdone'){ var dn=a.getAttribute('data-n'); store.exDone=store.exDone||{}; if(store.exDone[dn]) delete store.exDone[dn]; else store.exDone[dn]=1; save(); exRefresh(dn); e.preventDefault(); return; }
    if(act==='exredo'){ var on=a.getAttribute('data-n'), of=exFind(on); if(of){ exQs(of.c.items[of.pos]).forEach(function(q,j){ if(store.exAns) delete store.exAns[exKey(of.c.items[of.pos],j)]; }); save(); exRefresh(on); } e.preventDefault(); return; }
    if(act==='exredowrong'){ var wc=exData().chapters.filter(function(x){return String(x.n)===a.getAttribute('data-ch');})[0]; if(wc){ var fp=-1; wc.items.forEach(function(i,pos){ var bad=false; exQs(i).forEach(function(q,j){ var k=exKey(i,j); if(exHas(k)&&exAns(k)!==q.k) bad=true; }); if(bad){ exQs(i).forEach(function(q,j){ if(store.exAns) delete store.exAns[exKey(i,j)]; }); if(store.exDone) delete store.exDone[i.n]; if(fp<0) fp=pos; } }); save(); location.hash='#/ex/'+wc.n+'/'+(fp+1); render(); } e.preventDefault(); return; }
    if(act==='exrestart'){ if(!confirm('Erase all your answers for this chapter and start again?')){ e.preventDefault(); return; } var rc=exData().chapters.filter(function(x){return String(x.n)===a.getAttribute('data-ch');})[0]; if(rc){ rc.items.forEach(function(i){ exQs(i).forEach(function(q,j){ if(store.exAns) delete store.exAns[exKey(i,j)]; }); if(store.exDone) delete store.exDone[i.n]; }); save(); location.hash='#/ex/'+rc.n+'/1'; render(); } e.preventDefault(); return; }
    if(act==='qnext'){ quiz.idx++; render(); return; }
    if(act==='qprev'){ quiz.idx=Math.max(0,quiz.idx-1); render(); return; }
    if(act==='qskip'){ quiz.idx++; render(); return; }
    if(act==='qretry'){ startQuiz(quiz.cid, quiz.n, quiz.src); render(); return; }
    if(act==='flip'){ fc.side = 1-fc.side; render(); return; }
    if(act==='fcknown'){ fcMark('known'); return; }
    if(act==='fcagain'){ fcMark('again'); return; }
    if(act==='fcretry'){ startFc(fc.cid, fc.n); render(); return; }
    if(act==='ptstart'){ ptStart(a.getAttribute('data-id')); return; }
    if(act==='ptans'){ ptAnswer(parseInt(a.getAttribute('data-i'),10)); return; }
    if(act==='ptnext'){ if(ptb&&ptb.idx<ptTotal()-1){ptb.idx++;render();} return; }
    if(act==='ptprev'){ if(ptb&&ptb.idx>0){ptb.idx--;render();} return; }
    if(act==='ptfinish'){ ptFinish(); return; }
    if(act==='ptretry'){ ptStart(ptb.itemId); return; }
    if(act==='dladd'){
      var lbl = ($('#dlLabel')||{}).value, dt = ($('#dlDate')||{}).value, crs = ($('#dlCourse')||{}).value;
      if(lbl && dt){ var id = 'c'+Date.now(); store.dlCustom[id] = {course:crs, label:lbl, date:dt, kind:'perso'}; save(); render(); }
      return;
    }
    if(act==='dldel'){ var id2 = a.getAttribute('data-id'); delete store.dlCustom[id2]; save(); render(); return; }
  }
  var g = e.target.closest ? e.target.closest('[data-go]') : null;
  if(g){ var h = g.getAttribute('data-go'); if(h && h.charAt(0)==='#'){ go(h); e.preventDefault(); } }
});
document.addEventListener('keydown', function(e){
  if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openSearch(); }
  if(e.key==='Escape') closeSearch();
});

/* ---------- PWA ---------- */
if('serviceWorker' in navigator){
  var reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', function(){
    if(reloaded) return; reloaded = true;
    window.location.reload();
  });
  window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
}

render();
})();
