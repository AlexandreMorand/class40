/* Classe 40 - app.js (VF) */
(function(){
"use strict";
var D = window.C40DATA || {};
var $ = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

/* ---------- COURSES / SESSIONS ---------- */
var COURSES = [
  {id:'cr', code:'CR', name:'Competitive Reasoning', sub:'Raisonnement competitif'},
  {id:'da', code:'DA', name:'Data Analysis', sub:'Analyse de donnees'},
  {id:'fm', code:'FM', name:'Financial Management', sub:'Gestion financiere'},
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
function bank(cid, n){
  var all = D.QCM[cid]||[], key = String(n).replace(/^II-/,'');
  var b = all.filter(function(q){ var s=String(q.session); return s===key || s.indexOf(key+'-')===0; });
  return b;
}
function cards(cid, n){
  var all = D.FLASHCARDS[cid]||[], key = String(n).replace(/^II-/,'');
  if(n==null) return all;
  return all.filter(function(q){ var s=String(q.session); return s===key || s.indexOf(key+'-')===0; });
}
function ficheUrl(cid,n){ var k=String(n); if(k.indexOf('II-')===0) return null; var f=D.FICHE_URLS[cid]; return f ? f[k] : null; }

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
  store.attempts.forEach(function(a){ if(!m[a.questionId]) m[a.questionId]={correct:a.correct, n:0}; m[a.questionId].n++; if(a.correct) m[a.questionId].correct=true; });
  return m;
}
function sessionProgress(cid, n){
  var b = bank(cid,n); if(!b.length) return {done:0,total:0,pct:0,acc:0};
  var m = bestByQuestion(), done=0, corr=0;
  b.forEach(function(q){ if(m[q.id]){ done++; if(m[q.id].correct) corr++; } });
  return {done:done, total:b.length, pct:Math.round(done/b.length*100), acc:done?Math.round(corr/done*100):0};
}
function courseProgress(cid){
  var all = D.QCM[cid]||[]; if(!all.length) return {pct:0, done:0, total:0};
  var m = bestByQuestion(), done=0;
  all.forEach(function(q){ if(m[q.id]) done++; });
  return {pct:Math.round(done/all.length*100), done:done, total:all.length};
}
function globalProgress(){
  var tot=0, done=0; var m = bestByQuestion();
  COURSES.forEach(function(c){ (D.QCM[c.id]||[]).forEach(function(q){ tot++; if(m[q.id]) done++; }); });
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
  if(p[0]==='q'&&p[1]) return {page:'quiz', course:p[1], n:p[2]||null, src:p[3]||null};
  if(p[0]==='f'&&p[1]) return {page:'flash', course:p[1], n:p[2]||null};
  if(p[0]==='cs'&&p[1]) return {page:'cheat', course:p[1]};
  if(p[0]==='dl') return {page:'deadlines'};
  return {page:'home'};
}
function go(h){ location.hash = h; }
window.addEventListener('hashchange', render);

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
function dlDays(dateStr){
  var d = new Date(dateStr); if(isNaN(d)) return null;
  return Math.ceil((d.getTime() - Date.now())/86400000);
}
var DL_MONTHS = ['JAN','FEV','MAR','AVR','MAI','JUN','JUL','AOU','SEP','OCT','NOV','DEC'];
function dlWhen(dateStr){
  var d = new Date(dateStr); if(isNaN(d)) return {b:'?',s:''};
  return {b:String(d.getDate()), s:DL_MONTHS[d.getMonth()]};
}

/* ---------- RENDER SHELL ---------- */
var root = $('#c40root');
var navDef = [
  {page:'home', hash:'#/', label:'Accueil', icon:IC.home},
  {page:'course', hash:'#/c/cr', label:'Parcours', icon:IC.grid},
  {page:'quiz', hash:'#/q/cr', label:'QCM', icon:IC.qcm},
  {page:'flash', hash:'#/f/cr', label:'Flashcards', icon:IC.card},
  {page:'deadlines', hash:'#/dl', label:'Echeances', icon:IC.cal}
];
function navHTML(r){
  return navDef.map(function(n){
    var on = (n.page==='course' && (r.page==='course'||r.page==='session'||r.page==='cheat')) || (n.page==='quiz' && r.page==='quiz') || (n.page==='flash' && r.page==='flash') || (n.page===r.page && n.page!=='course' && n.page!=='quiz' && n.page!=='flash');
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
  var ss = sessionsOf(cid);
  var rows = ss.map(function(s){
    var p = sessionProgress(cid, s.key);
    var cls = p.pct===100 ? 'done' : (p.done>0 ? 'cur' : '');
    var meta = p.total ? (p.done+'/'+p.total+' questions &middot; '+p.acc+'% reussite') : 'QCM a venir';
    var label = s.part ? 'S'+s.n+' &middot; Partie '+s.part : 'Session '+s.n;
    return '<div class="ch '+cls+'" data-go="#/s/'+cid+'/'+s.key+'">'
      + '<span class="num">'+s.n+'</span>'
      + '<div class="tx"><b>'+esc(s.title)+'</b><span>'+label+' &middot; '+meta+'</span><div class="bar"><i class="'+(p.pct===100?'full':'')+'" data-w="'+p.pct+'"></i></div></div>'
      + '<span class="pct">'+p.pct+'%</span>'
      + '<button class="go" data-go="#/q/'+cid+'/'+s.key+'">'+(p.done===0?'Commencer':(p.pct===100?'Revoir':'Reprendre'))+'</button>'
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
  + '<div class="grid"><section class="card"><h2>Sessions</h2>'+rows+'</section>'
  + '<aside><div class="card" style="margin-bottom:14px"><h2>Outils transverses</h2>'
  + '<div class="ch" data-go="#/q/'+cid+'"><span class="num">'+IC.qcm+'</span><div class="tx"><b>QCM blanc</b><span>toutes les sessions, ordre aleatoire</span></div><span class="go">Lancer</span></div>'
  + (cid==='da' ? '<div class="ch" data-go="#/q/da/all/dataset"><span class="num">'+IC.data+'</span><div class="tx"><b>QCM datasets R</b><span>'+(D.QCM_DATA.da||[]).length+' questions sur SUP / TOP / WINE / PSA...</span></div><span class="go">Lancer</span></div>' : '')
  + '<div class="ch" data-go="#/f/'+cid+'"><span class="num">'+IC.card+'</span><div class="tx"><b>Flashcards du cours</b><span>'+(D.FLASHCARDS[cid]||[]).length+' cartes, toutes sessions</span></div><span class="go">Reviser</span></div>'
  + (D.CHEATSHEET[cid] ? '<div class="ch" data-go="#/cs/'+cid+'"><span class="num">'+IC.sheet+'</span><div class="tx"><b>Fiche de synthese</b><span>tout le cours en une page</span></div><span class="go">Lire</span></div>' : '')
  + '</div>'
  + '<div class="card"><h2>Echeances '+c.code+'</h2>'
  + (allDeadlines().filter(function(d){ return d.course===cid; }).map(dlRow).join('') || '<p style="font-size:12.5px;color:var(--muted)">Aucune.</p>')
  + '</div></aside></div>';
}
function vSession(cid, n){
  var c = courseOf(cid);
  var ss = sessionsOf(cid), s = null;
  for(var i=0;i<ss.length;i++) if(String(ss[i].key)===String(n)) s = ss[i];
  if(!s) return '<p>Session introuvable.</p>';
  var p = sessionProgress(cid, s.key);
  var fu = ficheUrl(cid, s.key);
  var nbCards = cards(cid, n).length;
  var seen = store.fiches[cid+'-'+n];
  return '<button class="back" data-go="#/c/'+cid+'">&larr; '+esc(c.name)+'</button>'
  + '<div class="sess-head"><span class="num">'+s.n+'</span><div><div class="page-h">Session '+s.n+(s.part?' &middot; Partie '+s.part:'')+'</div><div class="page-sub">'+esc(s.title)+'</div></div></div>'
  + '<div class="tiles">'
  + (fu
    ? '<a class="tile" href="'+esc(fu)+'" target="_blank" rel="noopener" data-act="fiche" data-cid="'+cid+'" data-n="'+s.key+'"><span class="ic">'+IC.pdf+'</span><b>Fiche de session</b><span>'+(seen?'Vue &middot; ':'')+'PDF, resume complet</span><span class="arrow">Ouvrir le PDF &rarr;</span></a>'
    : '<span class="tile off"><span class="ic">'+IC.pdf+'</span><b>Fiche de session</b><span>Pas encore disponible</span></span>')
  + '<div class="tile" data-go="#/q/'+cid+'/'+s.key+'"><span class="ic">'+IC.qcm+'</span><b>QCM</b><span>'+p.done+'/'+p.total+' questions &middot; '+p.acc+'% reussite</span><div class="bar"><i class="'+(p.pct===100?'full':'')+'" data-w="'+p.pct+'"></i></div><span class="arrow">'+(p.done?'Continuer':'Commencer')+' &rarr;</span></div>'
  + '<div class="tile" data-go="#/f/'+cid+'/'+s.key+'"><span class="ic">'+IC.card+'</span><b>Flashcards</b><span>'+nbCards+' cartes &middot; '+fcKnown(cid,n)+' connues</span><span class="arrow">Reviser &rarr;</span></div>'
  + '</div>'
  + (D.CHEATSHEET[cid] ? '<div class="card"><h2>Synthese du cours</h2><div class="ch" data-go="#/cs/'+cid+'"><span class="num">'+IC.sheet+'</span><div class="tx"><b>Fiche de synthese '+c.code+'</b><span>toutes les formules et definitions du cours</span></div><span class="go">Lire</span></div></div>' : '');
}
function fcKnown(cid,n){ var cs=cards(cid,n), k=0; cs.forEach(function(c2){ if(store.fc[c2.id]==='known') k++; }); return k; }

/* ---------- QUIZ ---------- */
var quiz = null;
function startQuiz(cid, n, src){
  var b;
  if(src==='dataset'){ b = (D.QCM_DATA[cid]||[]).slice(); }
  else if(n==null || n==='all'){ b = (D.QCM[cid]||[]).slice(); }
  else { b = bank(cid,n).slice(); }
  for(var i=b.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=b[i]; b[i]=b[j]; b[j]=t; }
  quiz = {cid:cid, n:n, src:src, bank:b, idx:0, answered:{}, sel:null, t0:Date.now(), ok:0};
}
function vQuiz(cid, n, src){
  if(!quiz || quiz.cid!==cid || String(quiz.n)!==String(n) || (quiz.src||null)!==src) startQuiz(cid,n,src);
  var c = courseOf(cid);
  var backHash = (n && n!=='all') ? '#/s/'+cid+'/'+n : '#/c/'+cid;
  var title = src==='dataset' ? 'QCM datasets R' : (n && n!=='all' ? 'QCM · Session '+n : 'QCM blanc · '+c.name);
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
  addAttempt({course:quiz.cid, session:String(q.session), questionId:String(q.id), topic:q.topic||'', correct:correct, ts:Date.now(), source:quiz.src==='dataset'?'dataset':(quiz.n==null||quiz.n==='all'?'blanc':'session'), secs:secs});
  render();
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
    sessionsOf(c.id).forEach(function(s){ idx.push({k:'Session', label:c.code+' S'+s.n+' - '+s.title, hash:'#/s/'+c.id+'/'+s.key, hay:(c.name+' '+s.title+' session '+s.n+' '+(s.part||'')).toLowerCase()}); });
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
    case 'flash': content = vFlash(r.course, r.n); break;
    case 'cheat': content = vCheat(r.course); break;
    case 'deadlines': content = vDeadlines(); break;
    default: content = vHome();
  }
  root.innerHTML = shell(content, r);
  requestAnimationFrame(function(){
    $$('.bar i[data-w]').forEach(function(i){ i.style.width = i.getAttribute('data-w')+'%'; });
    var ring = $('#heroRing');
    if(ring){ var g = globalProgress(), circ = 2*Math.PI*48; ring.style.transition = 'stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)'; ring.style.strokeDashoffset = String(circ*(1-g.pct/100)); }
    updateNet();
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
    if(act==='qnext'){ quiz.idx++; render(); return; }
    if(act==='qprev'){ quiz.idx=Math.max(0,quiz.idx-1); render(); return; }
    if(act==='qskip'){ quiz.idx++; render(); return; }
    if(act==='qretry'){ startQuiz(quiz.cid, quiz.n, quiz.src); render(); return; }
    if(act==='flip'){ fc.side = 1-fc.side; render(); return; }
    if(act==='fcknown'){ fcMark('known'); return; }
    if(act==='fcagain'){ fcMark('again'); return; }
    if(act==='fcretry'){ startFc(fc.cid, fc.n); render(); return; }
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
