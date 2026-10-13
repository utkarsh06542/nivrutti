/* Nivrutti page wiring: shared header tools, answer saving, and per-page setup */

/* ---- carry answers between pages even where browser storage is blocked ---- */
const STORAGE_OK=(()=>{try{localStorage.setItem("__t","1");localStorage.removeItem("__t");return true}catch(e){return false}})();
function encodeState(){try{return btoa(unescape(encodeURIComponent(JSON.stringify(S))))}catch(e){return ""}}
(function readHash(){const h=location.hash;if(h.startsWith("#s=")){try{Object.assign(S,JSON.parse(decodeURIComponent(escape(atob(h.slice(3))))));save()}catch(e){}history.replaceState(null,"",location.pathname+location.search)}})();
document.addEventListener("click",e=>{if(STORAGE_OK)return;const a=e.target.closest("a[href]");if(!a)return;const href=a.getAttribute("href");if(/^[\w-]+\.html$/.test(href)){e.preventDefault();location.href=href+"#s="+encodeState()}});

/* ---- header ---- */
const menuBtn=$(".menu-btn");
if(menuBtn)menuBtn.addEventListener("click",()=>{const n=$("#nav"),open=!n.classList.contains("open");n.classList.toggle("open",open);menuBtn.setAttribute("aria-expanded",open)});
let fs=store.get("nivrutti-fs","100");
function setFs(val){fs=val;document.documentElement.style.fontSize=val+"%";$$("[data-fs]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.fs===val)));store.set("nivrutti-fs",val)}
$$("[data-fs]").forEach(b=>b.addEventListener("click",()=>setFs(b.dataset.fs)));
setFs(fs);
$$("[data-print]").forEach(b=>b.addEventListener("click",()=>window.print()));

const PAGE=document.body.dataset.page;
const PLAN_PAGES=["results","risk","income","last","survivor","tax","next"];

/* ---- shared form handling ---- */
function applyVis(){
  const tok={detail:S.mode==="detail",spouse:!!+S.spouse,care:!!S.careOn,vrs:S.age<60&&(S.age>=55||(S.persona==="defence"&&S.age>=50))};
  PERSONAS.forEach(p=>tok[p.id]=S.persona===p.id); tok.fire=tok.fire||S.age<55;
  $$("[data-show]").forEach(el=>{el.hidden=!el.dataset.show.split(" ").some(k=>tok[k])});
  $$("[data-need]").forEach(el=>{const ok=el.dataset.need.split(" ").every(k=>tok[k]);if(!ok)el.hidden=true;else if(!el.dataset.show)el.hidden=false});
  $$("[data-hide]").forEach(el=>{el.hidden=el.dataset.hide.split(" ").some(k=>tok[k])});
  const ph=$("#pensionHint");
  if(ph)ph.textContent={govt:"Basic pension plus dearness relief, after any commutation",defence:"Including OROP revisions",private:"EPS pension and any company pension",fire:"Usually zero for now; add later pensions below",nri:"Foreign pension converted to rupees"}[S.persona]||"Include EPS, government or company pension, or an annuity you already have";
}
function fillForm(){$$("[data-k]").forEach(el=>{const k=el.dataset.k;if(el.type==="radio")el.checked=String(S[k])===el.value;else if(el.type==="checkbox")el.checked=!!S[k];else el.value=S[k]})}
function renderPersonas(){const box=$("#personas");if(!box)return;const mark=PAGE!=="home"||S.done;box.innerHTML=PERSONAS.map(p=>`<button type="button" class="persona" data-persona="${p.id}" aria-pressed="${mark&&S.persona===p.id}"><b>${p.t}</b><span>${p.d}</span></button>`).join("")}
function choosePersona(id){const p=PERSONAS.find(x=>x.id===id);S.persona=p.id;Object.assign(S,p.set);splitExp();S.eqAdj=0;save();return p}

const STR=["mode","gender","sGender","health","annuity","regime","survWho","g1n","g2n","g3n"];
let timer=null;
document.addEventListener("input",e=>{const el=e.target,k=el.dataset&&el.dataset.k;if(!k)return;
  if(el.type==="radio")S[k]=STR.includes(k)?el.value:+el.value;
  else if(el.type==="checkbox")S[k]=el.checked;
  else if(el.type==="text")S[k]=el.value;
  else{const n=parseFloat(el.value);if(isNaN(n))return;S[k]=n}
  if(["ess","life","med","help"].includes(k))S.exp=S.ess+S.life+S.med+S.help;
  if(k==="exp"){const tot=S.ess+S.life+S.med+S.help;if(tot>0){const f=S.exp/tot;["ess","life","med","help"].forEach(x=>S[x]=Math.round(S[x]*f))}else splitExp()}
  if(k==="mode"&&S.mode==="detail"&&S.ess+S.life+S.med+S.help===0)splitExp();
  if(["mode","spouse","careOn","age"].includes(k))applyVis();
  if(k==="mode"||k==="spouse")fillForm();
  clearTimeout(timer);
  timer=setTimeout(()=>{save();
    if(PAGE==="survivor"){const id=el.id;render();const f=id&&document.getElementById(id);if(f&&el.type==="number"){f.focus();const L=f.value.length;try{f.setSelectionRange(L,L)}catch(_){}}}
    else render()},PAGE==="survivor"?400:200);
});

/* ---- page renderer ---- */
function render(){
  const plan=buildPlan(); PLAN=plan;
  if(PAGE==="plan"){
    const h=$("#corpusHint");if(h)h.textContent="= "+fmt(S.corpusL*1e5);
    const r6=$("#r6label");if(r6)r6.textContent=`Your ${fmt(S.corpusL*1e5)} falls to ${fmt(S.corpusL*1e5*0.75)} and stays there for two years. You would…`;
    renderLife(); return;
  }
  if(PAGE==="results"){const base=simulate(plan,{});renderVerdict(plan,base,sustainable(plan,null));renderJars(plan);renderAlloc(plan)}
  if(PAGE==="risk")renderRisk(plan);
  if(PAGE==="income"){renderCalendar(plan);renderFlow(plan)}
  if(PAGE==="last")renderFan(plan,simulate(plan,{stress:S.stress}));
  if(PAGE==="survivor")renderSurvivor(plan,simulate(plan,{}));
  if(PAGE==="tax")renderTax(plan);
  if(PAGE==="next"){renderActions(plan);renderForYou()}
}

/* ---- clicks ---- */
document.addEventListener("click",e=>{
  const per=e.target.closest("[data-persona]");
  if(per){const p=choosePersona(per.dataset.persona);
    if(PAGE==="home"){location.href="plan.html?step=2"+(STORAGE_OK?"":"#s="+encodeState());return}
    renderPersonas();fillForm();applyVis();render();goStep(2);toast(`Filled in typical numbers for: ${p.t}. Check each step.`);return}
  const st=e.target.closest("[data-stress]");if(st){S.stress=st.dataset.stress;save();render();return}
  const eq=e.target.closest("[data-eq]");if(eq){S.eqAdj=+eq.dataset.eq;save();render();return}
  const tg=e.target.closest("[data-tag]");if(tg){libTag=tg.dataset.tag;renderLib();return}
  const ul=e.target.closest("#useLife");if(ul){S.planAge=+ul.dataset.v;fillForm();save();render();return}
  const ap=e.target.closest("[data-apply]");if(ap){const c=CALC[ap.dataset.apply];if(c._apply){c._apply();if(S.ess+S.life+S.med+S.help===0)splitExp();save();const n=$("#applied");if(n)n.hidden=false;toast("Added to your plan.")}return}
});

/* ---- planner wizard ---- */
const STEPS=["Who you are","About you","Income","Spending","Savings","Risk","Choices"];
let step=1;
function goStep(n){step=clamp(n,1,STEPS.length);$$(".wstep").forEach(f=>f.hidden=+f.dataset.step!==step);
  $("#stepcount").textContent=`Step ${step} of ${STEPS.length}: ${STEPS[step-1]}`;
  $("#progress").style.width=(step/STEPS.length*100)+"%";
  $("#backBtn").style.visibility=step===1?"hidden":"visible";$("#nextBtn").textContent=step===STEPS.length?"See my plan":"Next";
  const u=new URL(location.href);u.searchParams.set("step",step);try{history.replaceState(null,"",u.pathname.split("/").pop()+u.search)}catch(_){}
  window.scrollTo(0,0)}
if(PAGE==="plan"){
  renderPersonas();fillForm();applyVis();
  $("#backBtn").addEventListener("click",()=>goStep(step-1));
  $("#nextBtn").addEventListener("click",()=>{if(step<STEPS.length)goStep(step+1);else{S.done=true;save();location.href="results.html"+(STORAGE_OK?"":"#s="+encodeState())}});
  $("#resetBtn").addEventListener("click",()=>{S=Object.assign({},DEF);fillForm();applyVis();renderPersonas();save();render();goStep(1);toast("Answers cleared.")});
  goStep(+(new URLSearchParams(location.search).get("step"))||1);
  render();
}

/* ---- plan result pages ---- */
if(PLAN_PAGES.includes(PAGE)){
  const b=$("#banner");if(b)b.hidden=!!S.done;
  const who=$("#whoLine");if(who){const p=PERSONAS.find(x=>x.id===S.persona);who.textContent=`${p?p.t:""}, age ${S.age}${+S.spouse?`, spouse ${S.sAge}`:""}, savings ${fmt(S.corpusL*1e5)}, spending ${fmt(S.exp)} a month.`}
  render();
  if(window.matchMedia)window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",render);
}
if(PAGE==="home")renderPersonas();
if(PAGE==="checklist"){renderChk();document.addEventListener("change",e=>{const id=e.target.dataset&&e.target.dataset.c;if(!id)return;ticks[id]=e.target.checked;store.set("nivrutti-ticks",ticks);updChk()})}
if(PAGE==="products")renderLib();
if(PAGE==="glossary"){renderGloss("");$("#gq").addEventListener("input",e=>renderGloss(e.target.value))}
if(PAGE==="calc"){const name=document.body.dataset.calc;runCalc(name);$$("[data-calc]").forEach(el=>el.addEventListener("input",()=>runCalc(name)))}
