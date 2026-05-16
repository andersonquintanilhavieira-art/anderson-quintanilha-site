'use strict';

const TOTAL_SECTIONS = 8;
let current = 0;
const answers = {};

const sections   = document.querySelectorAll('.quiz-section');
const btnPrev    = document.getElementById('btn-prev');
const btnNext    = document.getElementById('btn-next');
const dotsWrap   = document.getElementById('step-dots');
const progressEl = document.getElementById('progress-fill');
const quizWrapper = document.querySelector('.quiz-wrapper');

(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const GOLD = { r:230,g:172,b:0 }, COUNT = 35;
  function resize() { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
  function rand(a,b) { return Math.random()*(b-a)+a; }
  function mk() { return {x:rand(0,W),y:rand(0,H),vx:rand(-0.15,0.15),vy:rand(-0.15,0.15),r:rand(0.7,1.8),alpha:rand(0.1,0.4),aDir:Math.random()>.5?1:-1,aSpd:rand(.002,.005)}; }
  function init() { particles=Array.from({length:COUNT},mk); }
  function frame() {
    ctx.clearRect(0,0,W,H);
    for (const p of particles) {
      p.x+=p.vx; p.y+=p.vy; p.alpha+=p.aSpd*p.aDir;
      if (p.alpha>.4||p.alpha<.08) p.aDir*=-1;
      if (p.x<-5) p.x=W+5; if (p.x>W+5) p.x=-5;
      if (p.y<-5) p.y=H+5; if (p.y>H+5) p.y=-5;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${GOLD.r},${GOLD.g},${GOLD.b},${p.alpha})`; ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    resize(); init(); frame();
    window.addEventListener('resize',()=>{resize();init();},{passive:true});
  }
})();

function buildDots() {
  dotsWrap.innerHTML='';
  for (let i=0;i<TOTAL_SECTIONS;i++) {
    const d=document.createElement('div');
    d.className='step-dot';
    if (i<current) d.classList.add('done');
    if (i===current) d.classList.add('active');
    dotsWrap.appendChild(d);
  }
}

function updateProgress() {
  const pct=current>=TOTAL_SECTIONS?100:Math.round((current/TOTAL_SECTIONS)*100);
  progressEl.style.width=pct+'%';
  progressEl.closest('[role="progressbar"]').setAttribute('aria-valuenow',pct);
}

function updateNav() {
  btnPrev.disabled=current===0;
  const isDone=current>=TOTAL_SECTIONS;
  if (isDone) { btnNext.style.display='none'; btnPrev.style.display='none'; }
  else if (current===TOTAL_SECTIONS-1) {
    btnNext.innerHTML='Concluir <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    btnNext.classList.add('is-submit');
  } else {
    btnNext.innerHTML='Próximo <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    btnNext.classList.remove('is-submit');
    btnNext.style.display=''; btnPrev.style.display='';
  }
}

function collectSection(idx) {
  const sec=sections[idx];
  if (!sec) return;
  sec.querySelectorAll('input,textarea').forEach(el=>{ if(el.name) answers[el.name]=el.value.trim(); });
  sec.querySelectorAll('.chips-wrap').forEach(wrap=>{
    const field=wrap.dataset.field, multiple=wrap.dataset.multiple==='true';
    const selected=[...wrap.querySelectorAll('.chip.selected')].map(c=>c.textContent.trim());
    if (field) answers[field]=multiple?selected:(selected[0]||'');
  });
}

function goTo(next,direction='forward') {
  collectSection(current);
  const leaving=sections[current], entering=sections[next];
  const leaveClass=direction==='forward'?'leaving':'leaving-forward';
  const enterClass=direction==='forward'?'entering':'entering-back';
  leaving.classList.add(leaveClass);
  leaving.addEventListener('animationend',()=>{
    leaving.classList.remove('active',leaveClass);
    leaving.style.display='';
    quizWrapper.scrollTo({top:0,behavior:'instant'});
    entering.style.display='flex';
    requestAnimationFrame(()=>{
      entering.classList.add('active',enterClass);
      entering.addEventListener('animationend',()=>entering.classList.remove(enterClass),{once:true});
    });
  },{once:true});
  current=next; buildDots(); updateProgress(); updateNav();
}

document.querySelectorAll('.chips-wrap').forEach(wrap=>{
  const multiple=wrap.dataset.multiple==='true';
  wrap.querySelectorAll('.chip').forEach(chip=>{
    chip.addEventListener('click',()=>{
      if (!multiple) wrap.querySelectorAll('.chip.selected').forEach(c=>c.classList.remove('selected'));
      chip.classList.toggle('selected');
    });
  });
});

btnNext.addEventListener('click',()=>{
  if (current<TOTAL_SECTIONS-1) goTo(current+1,'forward');
  else if (current===TOTAL_SECTIONS-1) { collectSection(current); goTo(TOTAL_SECTIONS,'forward'); sendToWebhook(); }
});

btnPrev.addEventListener('click',()=>{ if (current>0) goTo(current-1,'back'); });

document.addEventListener('keydown',(e)=>{
  if (e.target.tagName==='TEXTAREA') return;
  if ((e.key==='Enter'||e.key==='ArrowRight')&&current<TOTAL_SECTIONS) btnNext.click();
  if (e.key==='ArrowLeft'&&current>0) btnPrev.click();
});

const WEBHOOK_URL='https://n8n-n8n.4wnalj.easypanel.host/webhook/Leads';

function showDoneState(id) {
  ['state-sending','state-success','state-error'].forEach(s=>{
    const el=document.getElementById(s);
    if (el) el.style.display=s===id?'flex':'none';
  });
}

async function sendToWebhook() {
  showDoneState('state-sending');
  const payload={ timestamp:new Date().toISOString(), origem:'andersonquintanilha.com.br', ...answers };
  try {
    const res=await fetch(WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showDoneState('state-success');
  } catch(err) {
    console.error('[Webhook] Falha ao enviar:',err);
    showDoneState('state-error');
  }
}

document.getElementById('btn-retry').addEventListener('click',sendToWebhook);

buildDots(); updateProgress(); updateNav();
