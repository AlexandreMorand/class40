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
function ficheUrl(cid,n){ var k=String(n); var f=D.FICHE_URLS[cid]; var u=f ? f[k] : null; if(!u) return null; return u + (u.indexOf('?')>=0 ? '&' : '?') + 'v=20261029-f5'; }

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
  pdf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  sheet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
  data:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>'
};

/* ---------- ROUTER ---------- */
var state = {course:'cr'};
function parseHash(){
  var h = location.hash.replace(/^#\/?/, '');
  var p = h.split('/').filter(Boolean);
  if(!p.length) return {page:'home'};
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
      var det = it.type==='blanc' ? (it.mcq.length+' QCM'+(it.open.length?(' + '+it.open.length+' ouvertes'):'')+' &middot; '+it.duration+' min') : (it.type==='official' ? 'Énoncé et corrigé sur Blackboard · connexion Bocconi' : (it.det ? esc(it.det) : 'Synthese des Must Know, session par session'));
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
  if(it.type==='official') return '<button class="back" data-go="#/pt">&larr; Partiels</button><div class="page-h">'+esc(it.title)+'</div><div class="page-sub">'+esc(it.sub)+'</div><div class="card"><p style="font-size:14px;line-height:1.7;margin-bottom:20px">'+esc(it.body)+'</p><div style="display:flex;flex-wrap:wrap;gap:12px">'+it.links.map(function(l){return '<a class="cta pri" href="'+esc(l.url)+'" target="_blank" rel="noopener">'+esc(l.label)+'</a>';}).join('')+'</div><p style="font-size:12px;color:var(--muted);margin-top:16px">Si Blackboard demande une connexion, utilise ton compte Bocconi. Dossier du cours : Course Material, Module 1, Extra Exercises.</p></div>';
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
  {page:'home', hash:'#/', label:'Accueil', icon:IC.home},
  {page:'course', hash:'#/c/cr', label:'Parcours', icon:IC.grid},
  {page:'quiz', hash:'#/qb', label:'QCM', icon:IC.qcm},
  {page:'flash', hash:'#/f/cr', label:'Flashcards', icon:IC.card},
  {page:'partiels', hash:'#/pt', label:'Partiels', icon:IC.clock},
  {page:'deadlines', hash:'#/dl', label:'Echeances', icon:IC.cal}
];
function navHTML(r){
  return navDef.map(function(n){
    var on = (n.page==='course' && (r.page==='course'||r.page==='session'||r.page==='cheat')) || (n.page==='quiz' && (r.page==='quiz'||r.page==='qbuilder'||r.page==='qplay')) || (n.page==='flash' && r.page==='flash') || (n.page===r.page && n.page!=='course' && n.page!=='quiz' && n.page!=='flash');
    if(n.page==='partiels' && (r.page==='partiels'||r.page==='ptitem')) on = true;
    if(n.page==='home' && r.page==='home') on = true;
    if(n.page==='deadlines' && r.page==='deadlines') on = true;
    return '<button class="nav'+(on?' on':'')+'" data-go="'+n.hash+'">'+n.icon+'<span>'+n.label+'</span></button>';
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
function chapterRows(cid, limit){
  var ss = sessionsOf(cid).filter(function(s){ return bank(cid,s.key).length>0 || cards(cid,s.key).length>0 || !!ficheUrl(cid,s.key); });
  var rows = ss.map(function(s){
    var p = sessionProgress(cid, s.key);
    var cls = p.pct===100 ? 'done' : (p.done>0 ? 'cur' : '');
    var meta = p.total ? (p.done+'/'+p.total+' questions &middot; '+p.acc+'% reussite') : 'QCM a venir';
    var label = s.part ? 'S'+s.n+' &middot; Partie '+s.part : 'Session '+s.n;
    return '<div class="ch '+cls+'" data-go="#/s/'+cid+'/'+s.key+'">'
      + '<span class="num">'+s.n+'</span>'
      + '<div class="tx"><b>'+esc(s.title)+'</b><span>'+label+' &middot; '+meta+'</span><div class="bar"><i class="'+(p.pct===100?'full':'')+'" data-w="'+p.pct+'"></i></div></div>'
      + '<span class="pct">'+p.pct+'%</span>'
      + '<button class="go" data-go="#/s/'+cid+'/'+s.key+'">'+(p.done===0?'Commencer':(p.pct===100?'Revoir':'Reprendre'))+'</button>'
      + '</div>';
  });
  if(limit) rows = rows.slice(0, limit);
  return rows.join('');
}
function vHome(){
  var g = globalProgress(), st = streakDays(), m = nextMission();
  var c = courseOf(state.course);
  var missionHTML = m
    ? 'Session '+m.s.n+' de '+esc(courseOf(m.course).name)+' : '+esc(m.s.title)+'. Tu es a '+m.p.pct+'% du QCM de la session.'
    : 'Tout est au vert. Refais un QCM blanc ou revise les flashcards.';
  var circ = 2*Math.PI*48;
  var upcoming = allDeadlines().filter(function(d){ var n=dlDays(d.date); return n!=null && n>=0; }).slice(0,5);
  return ''
  + '<div class="hero"><div class="ring"><svg width="112" height="112"><circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,.25)" stroke-width="9" fill="none"/><circle id="heroRing" cx="56" cy="56" r="48" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+circ+'"/></svg><div class="val"><div><b>'+g.pct+'%</b><span>GLOBAL</span></div></div></div>'
  + '<div><div class="eyebrow">MISSION DU JOUR</div><h1>'+(m ? esc(courseOf(m.course).name)+' &middot; Session '+m.s.n : 'Tout est fait')+'</h1><p>'+esc(missionHTML)+'</p><br>'
  + (m ? '<button class="cta" data-go="#/q/'+m.course+'/'+m.s.key+'">Commencer le QCM &rarr;</button> <button class="cta ghost" data-go="#/f/'+(m?m.course:'cr')+'/'+(m?m.s.key:'')+'">Flashcards</button>' : '<button class="cta" data-go="#/q/cr">QCM blanc</button>')
  + '</div></div>'
  + '<div class="stats">'
  + '<button class="stat" data-go="#/q/'+state.course+'"><b>'+g.done+'</b><span>questions traitees</span><small>+'+todayDone()+' aujourd\'hui</small></button>'
  + '<button class="stat" data-go="#/f/'+state.course+'"><b>'+st+' jour'+(st>1?'s':'')+'</b><span>serie en cours</span><small>objectif : 10 questions</small></button>'
  + '<button class="stat" data-go="#/q/'+state.course+'"><b>'+accuracy()+'%</b><span>reussite moyenne</span><small>au premier essai</small></button>'
  + '<button class="stat" data-go="#/c/'+state.course+'"><b>'+masteredTopics()+'</b><span>themes maitrises</span><small>&ge;80% de reussite</small></button>'
  + '</div>'
  + '<div class="card" style="margin-bottom:18px"><h2>Préparer le partial de FM</h2><div class="pt-items"><button class="pt-item" data-go="#/pt/fm-p1-b2"><span class="pt-item-t"><b>Mock FM #2</b><span>4 QCM + 2 ouvertes · 45 min</span></span><span class="pt-new">Commencer</span></button><button class="pt-item" data-go="#/pt/fm-p1-official"><span class="pt-item-t"><b>Mock officiel FM et corrigé</b><span>Accès Blackboard</span></span><span class="pt-new">Ouvrir</span></button></div></div>'
  + '<div class="card" style="margin-bottom:18px"><h2>Mes moyennes</h2><p style="font-size:13px;color:var(--muted);margin:0 0 14px">Saisis ta note pour chaque épreuve et suis ta moyenne par matière. Les coefficients viennent des consignes officielles des cours.</p><button class="cta pri" data-go="#/moy">Ouvrir mes moyennes &rarr;</button></div>'
  + courseChips(state.course)
  + '<div class="grid"><section class="card"><h2>'+esc(c.name)+' &middot; progression par session <button class="tag" data-go="#/c/'+c.id+'">Tout voir</button></h2>'
  + chapterRows(c.id, 5)
  + '</section><aside class="card"><h2>Echeances a venir <button class="tag" data-go="#/dl">Tout</button></h2>'
  + (upcoming.length ? upcoming.map(dlRow).join('') : '<p style="font-size:12.5px;color:var(--muted)">Aucune echeance a venir.</p>')
  + '</aside></div>';
}
function dlRow(d){
  var n = dlDays(d.date), w = dlWhen(d.date);
  var soon = n!=null && n<=7 ? ' soon' : '';
  var chip = n==null ? '' : (n===0 ? "aujourd'hui" : 'J-'+n);
  return '<a class="dl'+soon+'" data-go="#/c/'+(d.course||'cr')+'"><span class="when"><b>'+w.b+'</b><span>'+w.s+'</span></span><span class="tx"><b>'+esc(d.label)+'</b><span>'+esc(courseOf(d.course||'cr').name)+(d.kind?' &middot; '+esc(d.kind):'')+'</span></span><span class="chip2">'+chip+'</span></a>';
}
function vCourse(cid){
  var c = courseOf(cid), p = courseProgress(cid);
  var rows = chapterRows(cid);
  return courseChips(cid)
  + '<div class="page-h">'+esc(c.name)+'</div><div class="page-sub">'+esc(c.sub)+' &middot; '+p.done+'/'+p.total+' questions traitees ('+p.pct+'%)</div>'
  + (cid==='fm' ? '<div class="card" style="margin-bottom:18px"><h2>Mock exam FM</h2><div class="pt-items"><button class="pt-item" data-go="#/pt/fm-p1-b2"><span class="pt-item-t"><b>Mock FM #2</b><span>4 QCM à 3 options + 2 ouvertes · 45 min</span></span><span class="pt-new">Commencer</span></button><button class="pt-item" data-go="#/pt/fm-p1-official"><span class="pt-item-t"><b>Mock officiel FM et corrigé</b><span>Blackboard · accès Bocconi requis</span></span><span class="pt-new">Ouvrir</span></button></div></div>' : '')
  + '<div class="grid"><section class="card"><h2>Sessions</h2>'+rows+'</section>'
  + '<aside><div class="card" style="margin-bottom:14px"><h2>Outils transverses</h2>'
  + '<div class="ch" data-go="#/q/'+cid+'"><span class="num">'+IC.qcm+'</span><div class="tx"><b>QCM blanc</b><span>toutes les sessions, ordre aleatoire</span></div><span class="go">Lancer</span></div>'
  + (cid==='da' ? '<div class="ch" data-go="#/q/da/all/dataset"><span class="num">'+IC.data+'</span><div class="tx"><b>QCM datasets R</b><span>'+(D.QCM_DATA.da||[]).length+' questions sur SUP / TOP / WINE / PSA...</span></div><span class="go">Lancer</span></div>' : '')
  + '<div class="ch" data-go="#/f/'+cid+'"><span class="num">'+IC.card+'</span><div class="tx"><b>Flashcards du cours</b><span>'+(D.FLASHCARDS[cid]||[]).length+' cartes, toutes sessions</span></div><span class="go">Reviser</span></div>'
  + (cid==='cr' ? '<a class="ch" href="https://drive.google.com/file/d/14k3jjXn0V_cVrS0QWJK3YpPhgILYQp5O/view" target="_blank" rel="noopener"><span class="num">'+IC.pdf+'</span><div class="tx"><b>Exercices corrigés du livre</b><span>chapitres 1 à 15, document privé</span></div><span class="go">Ouvrir</span></a>' : '')
  + (D.CHEATSHEET[cid] ? '<div class="ch" data-go="#/cs/'+cid+'"><span class="num">'+IC.sheet+'</span><div class="tx"><b>Fiche de synthese</b><span>tout le cours en une page</span></div><span class="go">Lire</span></div>' : '')
  + '</div>'
  + '<div class="card"><h2>Echeances '+c.code+'</h2>'
  + (allDeadlines().filter(function(d){ return d.course===cid; }).map(dlRow).join('') || '<p style="font-size:12.5px;color:var(--muted)">Aucune.</p>')
  + '</div></aside></div>';
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
  + '<div class="tile" data-go="#/f/'+cid+'/'+s.key+'"><span class="ic">'+IC.card+'</span><b>Flashcards</b><span>'+nbCards+' cartes &middot; '+fcKnown(cid,n)+' connues</span><span class="arrow">Reviser &rarr;</span></div>'
  + '</div>'
  + (levelBank(cid,s.key).length ? '<details class="card"><summary style="cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:700">Anciens QCM et progression conservee</summary><p>Les nouveaux niveaux ont leurs propres questions. Vos anciennes reponses restent ici, sans etre attribuees aux nouvelles questions.</p><div class="tiles">'+legacyTiles(cid,s.key)+'</div></details>' : '')
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
function startFc(cid, n){
  var b = cards(cid, n==='all'?null:n).slice();
  for(var i=b.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=b[i]; b[i]=b[j]; b[j]=t; }
  fc = {cid:cid, n:n, deck:b, idx:0, side:0, known:0};
}
function vFlash(cid, n){
  if(!fc || fc.cid!==cid || String(fc.n)!==String(n)) startFc(cid, n);
  var c = courseOf(cid);
  var backHash = (n && n!=='all') ? '#/s/'+cid+'/'+n : '#/c/'+cid;
  var title = n && n!=='all' ? 'Flashcards · Session '+n : 'Flashcards · '+c.name;
  if(!fc.deck.length) return '<button class="back" data-go="'+backHash+'">&larr; Retour</button><div class="page-h">'+esc(title)+'</div><div class="card"><p style="font-size:13px;color:var(--muted)">Pas de cartes pour cette session.</p></div>';
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
  store.fc[card.id] = status; save();
  if(status==='known') fc.known++;
  fc.idx++; fc.side=0;
  render();
}

/* ---------- CHEATSHEET ---------- */
function mdLite(src){
  var html = esc(src);
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
  return out.join('\n').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>');
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
    case 'partiels': content = vPartiels(); break;
    case 'ptitem': content = vPtItem(r.item); break;
    case 'moyennes': content = vMoyennes(); break;
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
    if(act==='fiche'){ store.fiches[a.getAttribute('data-cid')+'-'+a.getAttribute('data-n')] = true; save(); return; /* laisse le lien s'ouvrir */ }
    if(act==='ans'){ answerQuiz(parseInt(a.getAttribute('data-i'),10)); return; }
    if(act==='qbset'){ qbSet(a.getAttribute('data-k'), a.getAttribute('data-v')); return; }
    if(act==='qblaunch'){ startCustomQuiz(); return; }
    if(act==='qbretry'){ startCustomQuiz(true); return; }
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
