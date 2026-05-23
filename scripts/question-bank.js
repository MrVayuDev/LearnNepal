/**
 * LearnNepal — QB Engine v5
 */
(function(){
'use strict';
var I={
  filter:'<svg viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
  cal:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  tag:'<svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  layers:'<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  edit:'<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  list:'<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  file:'<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  zap:'<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  award:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
  book:'<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
  monitor:'<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  searchX:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="8" x2="14" y2="14"/><line x1="14" y1="8" x2="8" y2="14"/></svg>'
};
function ic(n,c){return '<span class="qi '+(c||'')+'">'+(I[n]||'')+'</span>';}

var S={data:null,all:[],f:{year:'all',exam:'all',qtype:'all',sec:'all',q:''}};
function $(s,c){return(c||document).querySelector(s)}
function $$(s,c){return Array.from((c||document).querySelectorAll(s))}

function load(subj,cb){
  var b=basePath();
  fetch(b+'data/question-bank/'+subj+'.json')
    .then(function(r){if(!r.ok)throw new Error('fail');return r.json()})
    .then(function(d){S.data=d;cb(d)})
    .catch(function(e){console.error('QB:',e)});
}
function basePath(){
  var p=window.location.pathname;
  var parts=p.split('/');
  var pagesPos=parts.indexOf('pages');
  if(pagesPos===-1)return'';
  var depth=parts.length-pagesPos-1;
  return'../'.repeat(depth);
}
function collect(d){
  var a=[];
  if(d.structureType==='section'&&d.sections)d.sections.forEach(function(s){s.questions.forEach(function(q){q._sid=s.sectionId;q._sn=s.sectionName;q._sc=s.color;a.push(q)})});
  else if(d.chapters)d.chapters.forEach(function(c){c.questions.forEach(function(q){q._cid=c.chapterId;q._cn=c.chapterName;q._sid=c.chapterId;q._sn=c.chapterName;a.push(q)})});
  return a;
}

function filt(qs){
  var f=S.f;
  return qs.filter(function(q){
    if(f.year!=='all'&&String(q.year)!==f.year)return false;
    if(f.exam!=='all'&&q.examType!==f.exam)return false;
    if(f.qtype!=='all'&&q.questionType!==f.qtype)return false;
    if(f.sec!=='all'&&q.section!==f.sec&&q._sid!==f.sec)return false;
    if(f.q){var s=f.q.toLowerCase();if((q.questionText+' '+(q.subCategory||'')+' '+(q.literatureWork||'')).toLowerCase().indexOf(s)===-1)return false;}
    return true;
  });
}

var _seqNum=0;
function resetSeq(){_seqNum=0}

function rQ(q,i){
  _seqNum++;
  var d=Math.min(i*.04,.4);
  var tag='['+q.year+(q.examType&&q.examType!=='regular'?' '+q.examType.toUpperCase():'')+' Q.No. '+q.questionNo+']';
  var txt=q.questionText||'';
  // Detect MCQ options pattern: lines starting with a. b. c. d. (with optional indentation)
  var mcq=null,mainTxt=txt;
  var mcgMatch=txt.match(/\n\s*(a[\.\)]\s)/);
  if(mcgMatch){
    var idx=txt.indexOf(mcgMatch[0]);
    mainTxt=txt.substring(0,idx);
    var optStr=txt.substring(idx).trim();
    // Parse options
    var opts=[];
    var optLines=optStr.split('\n');
    for(var j=0;j<optLines.length;j++){
      var line=optLines[j].trim();
      if(line)opts.push(line);
    }
    if(opts.length>=2)mcq=opts;
  }

  var h='<div class="qb-q" id="q-'+q.id+'" style="animation-delay:'+d+'s">';
  h+='<div class="qb-q-head"><span class="qb-num">'+_seqNum+'.</span> <span class="qb-tag">'+tag+'</span> '+escHtml(mainTxt.trim())+'</div>';
  if(mcq){
    h+='<div class="qb-mcq">';
    for(var k=0;k<mcq.length;k++) h+='<span>'+escHtml(mcq[k])+'</span>';
    h+='</div>';
  }
  if(q.tableHtml)h+=q.tableHtml;
  if(q.answer){
    h+='<button class="qb-ans-toggle" onclick="QB.toggleAns(\''+q.id+'\')">'+ic('edit','qi-14')+' View Solution <span class="arrow">'+ic('chev','qi-12')+'</span></button>';
    h+='<div class="qb-ans-body" id="ans-'+q.id+'"><div class="qb-ans-inner">'+q.answer+'</div></div>';
  }
  h+='</div>';
  return h;
}

function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function renderSec(d,el){
  resetSeq();
  var fl=filt(S.all),h='',idx=0;
  if(!fl.length){h='<div class="qb-empty">'+ic('searchX','qi-48')+'<h3>No questions found</h3><p>Try adjusting your filters or search.</p></div>';}
  else{
    if(d.structureType==='chapter'||d.chapters){
      var ord=d.chapters.map(function(c){return c.chapterId}),g={};
      fl.forEach(function(q){var c=q._cid||'x';if(!g[c])g[c]=[];g[c].push(q)});
      ord.forEach(function(cid){
        if(!g[cid]||!g[cid].length)return;
        var ch=d.chapters.find(function(c){return c.chapterId===cid});if(!ch)return;
        h+='<div class="qb-sh"><span class="qb-sl" style="background:var(--color-primary,#6366F1)">Ch.'+ch.chapterId+'</span>';
        h+='<h2>'+ch.chapterName+'</h2></div>';
        var by={};g[cid].forEach(function(q){if(!by[q.year])by[q.year]=[];by[q.year].push(q)});
        Object.keys(by).sort(function(a,b){return b-a}).forEach(function(yr){
          h+='<div class="qb-yd"><span class="qb-yl">'+ic('clock','qi-14')+' '+yr+' BS</span></div>';
          by[yr].sort(function(a,b){return(a.questionNo||'').localeCompare(b.questionNo||'')}).forEach(function(q){h+=rQ(q,idx++)});
        });
      });
    }else{
      var ord=d.sections.map(function(s){return s.sectionId}),g={};
      fl.forEach(function(q){var s=q.section||q._sid||'x';if(!g[s])g[s]=[];g[s].push(q)});
      ord.forEach(function(sid){
        if(!g[sid]||!g[sid].length)return;
        var sec=d.sections.find(function(s){return s.sectionId===sid});if(!sec)return;
        h+='<div class="qb-sh"><span class="qb-sl" style="background:'+sec.color+'">'+sec.sectionId+'</span>';
        h+='<h2>Section '+sec.sectionId+': '+sec.sectionName+'</h2><span class="qb-sm">'+sec.marks+' Marks</span></div>';
        var by={};g[sid].forEach(function(q){if(!by[q.year])by[q.year]=[];by[q.year].push(q)});
        Object.keys(by).sort(function(a,b){return b-a}).forEach(function(yr){
          h+='<div class="qb-yd"><span class="qb-yl">'+ic('clock','qi-14')+' '+yr+' BS</span></div>';
          by[yr].sort(function(a,b){return(a.questionNo||'').localeCompare(b.questionNo||'')}).forEach(function(q){h+=rQ(q,idx++)});
        });
      });
    }
  }
  el.innerHTML=h;cnt(fl.length,S.all.length);
}

function renderFlat(d,el){
  resetSeq();
  var fl=filt(S.all),h='',idx=0;
  if(!fl.length){h='<div class="qb-empty">'+ic('searchX','qi-48')+'<h3>No questions found</h3><p>Try adjusting your filters.</p></div>';}
  else{
    var by={};fl.forEach(function(q){if(!by[q.year])by[q.year]=[];by[q.year].push(q)});
    Object.keys(by).sort(function(a,b){return b-a}).forEach(function(yr){
      h+='<div class="qb-yd"><span class="qb-yl">'+ic('clock','qi-14')+' '+yr+' BS</span></div>';
      by[yr].sort(function(a,b){return(a.questionNo||'').localeCompare(b.questionNo||'')}).forEach(function(q){h+=rQ(q,idx++)});
    });
  }
  el.innerHTML=h;cnt(fl.length,S.all.length);
}

function cnt(s,t){var e=$('#qb-rc');if(e)e.innerHTML='Showing <strong>'+s+'</strong> of '+t+' questions'}

function renderTOC(d,el){
  if(!d.toc||!d.toc.length){el.style.display='none';return}
  var h='<h3>'+ic('list','qi-16')+' Table of Contents</h3><ol>';
  d.toc.forEach(function(t){
    h+='<li><a href="#q-'+t.id+'"><span class="tq">Q.'+t.qno+'</span> <span>'+t.title+'</span>';
    if(t.keywords)h+=' <span class="td">— '+t.keywords+'</span>';
    h+='</a></li>';
  });
  h+='</ol>';el.innerHTML=h;
}

function animNum(el,n){var c=0,s=Math.ceil(n/30);(function t(){c=Math.min(c+s,n);el.textContent=c;if(c<n)requestAnimationFrame(t)})()}

function initF(fn){
  var tog=$('#qb-ft'),bod=$('#qb-fb');
  if(tog&&bod)tog.addEventListener('click',function(){tog.classList.toggle('open');bod.classList.toggle('open')});
  $$('.qb-pill').forEach(function(p){
    p.addEventListener('click',function(){
      var ft=p.dataset.ft,v=p.dataset.value,row=p.closest('.qb-frow');
      if(row)$$('.qb-pill',row).forEach(function(x){x.classList.remove('on')});
      p.classList.add('on');
      if(ft==='year')S.f.year=v;if(ft==='exam')S.f.exam=v;
      if(ft==='qtype')S.f.qtype=v;if(ft==='sec')S.f.sec=v;
      fn();chips(fn);fcnt();
    });
  });
  var si=$('#qb-si'),st;
  if(si)si.addEventListener('input',function(){clearTimeout(st);st=setTimeout(function(){S.f.q=si.value.trim();fn();chips(fn);fcnt()},280)});
}

function fcnt(){
  var c=0;if(S.f.year!=='all')c++;if(S.f.exam!=='all')c++;if(S.f.qtype!=='all')c++;if(S.f.sec!=='all')c++;if(S.f.q)c++;
  var e=$('.qb-fcount');if(e){e.textContent=c;e.classList.toggle('show',c>0)}
}

var em={regular:'Regular',partial:'Partial',technical:'Technical'},qm={mcq:'MCQ',short:'Short',long:'Long'};
function chips(fn){
  var e=$('#qb-chips');if(!e)return;var h='',has=false;
  if(S.f.year!=='all'){has=true;h+=chip('Year: '+S.f.year,'year')}
  if(S.f.exam!=='all'){has=true;h+=chip(em[S.f.exam]||S.f.exam,'exam')}
  if(S.f.qtype!=='all'){has=true;h+=chip(qm[S.f.qtype]||S.f.qtype,'qtype')}
  if(S.f.sec!=='all'){has=true;var isCh=S.data&&(S.data.structureType==='chapter'||S.data.chapters);h+=chip((isCh?'Chapter ':'Section ')+S.f.sec,'sec')}
  if(S.f.q){has=true;h+=chip('"'+S.f.q+'"','q')}
  if(has)h+='<button class="qb-clr" onclick="QB.clrAll()">Clear all</button>';
  e.innerHTML=h;
}
function chip(l,t){return '<span class="qb-achip" onclick="QB.clr(\''+t+'\')">'+l+' <span class="x">×</span></span>'}

function clr(t){
  if(t==='q'){S.f.q='';var s=$('#qb-si');if(s)s.value=''}else S.f[t]='all';
  var m={year:'year',exam:'exam',qtype:'qtype',sec:'sec'},a=m[t]||t;
  $$('.qb-pill[data-ft="'+a+'"]').forEach(function(p){p.classList.remove('on')});
  var ap=$('.qb-pill[data-ft="'+a+'"][data-value="all"]');if(ap)ap.classList.add('on');
  if(_r)_r();chips(_r);fcnt();
}
function clrAll(){
  S.f={year:'all',exam:'all',qtype:'all',sec:'all',q:''};
  var s=$('#qb-si');if(s)s.value='';
  $$('.qb-pill').forEach(function(p){p.classList.remove('on')});
  $$('.qb-pill[data-value="all"]').forEach(function(p){p.classList.add('on')});
  if(_r)_r();chips(_r);fcnt();
}
var _r=null;

window.QB={
  ic:ic,I:I,S:S,clr:clr,clrAll:clrAll,
  toggleAns:function(id){
    var el=document.getElementById('ans-'+id);
    var btn=el.previousElementSibling;
    if(el&&btn){
      var active=el.classList.toggle('active');
      btn.classList.toggle('active');
      if(active){
        el.style.maxHeight=el.scrollHeight+'px';
        el.style.opacity='1';
      }else{
        el.style.maxHeight='0px';
        el.style.opacity='0';
      }
    }
  },
  initSection:function(subj){
    load(subj,function(d){
      S.all=collect(d);var el=$('#qb-qc');if(!el)return;
      _r=function(){renderSec(d,el)};_r();initF(_r);
      var toc=$('#qb-toc');if(toc)renderTOC(d,toc);
      var tn=$('#s-total');if(tn)animNum(tn,S.all.length);
      var yr=$('#s-years');if(yr){var y={};S.all.forEach(function(q){y[q.year]=true});animNum(yr,Object.keys(y).length)}
    });
  },
  initChapter:function(subj,cid){
    load(subj,function(d){
      var ch=d.chapters.find(function(c){return c.chapterId===cid});if(!ch)return;
      S.all=ch.questions;var el=$('#qb-qc');if(!el)return;
      _r=function(){renderFlat(d,el)};_r();initF(_r);
    });
  }
};
})();
