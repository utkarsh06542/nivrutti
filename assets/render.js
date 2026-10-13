/* Nivrutti renderers: each draws into its container if present on the page */
let PLAN=null;
function niceTop(mx){const raw=mx/4,e=Math.pow(10,Math.floor(Math.log10(raw||1)));const st=[1,2,2.5,5,10].map(x=>x*e).find(x=>x>=raw)||10*e;return st*4}
function renderVerdict(plan,sim,sust){
  const s=sim.success, cls=s>=0.85?"ok":s>=0.65?"amber":"red";
  $("#verdictCard").className="panel card verdict "+(cls==="ok"?"":cls);
  const mon=Math.round(plan.exp0/12);
  let msg;
  if(plan.G===0&&plan.need<=0) msg=`Your regular income already covers your spending. Savings are free to protect you from rising prices and to pass on.`;
  else if(cls==="ok") msg=`Your savings can pay for your life until age ${S.planAge} in ${pct(s)} of the futures we tested. You are on firm ground.`;
  else if(cls==="amber") msg=`Your money lasts to age ${S.planAge} in ${pct(s)} of the futures we tested. A few changes would make this much safer.`;
  else msg=`At ${fmt(mon)} a month, savings run out before age ${S.planAge} in ${pct(1-s)} of the futures we tested. Here is what would fix it.`;
  $("#verdictText").textContent=msg;
  const wrCls=plan.wr<=(plan.fire?0.033:0.035)?"ok":plan.wr<=0.05?"amber":"red";
  $("#kpis").innerHTML=`
    <div class="kpi"><div class="v num">${fmt(plan.G/12)}</div><div class="l">needed from savings each month</div></div>
    <div class="kpi"><div class="v num">${pct(plan.wr,1)} <span class="pill ${wrCls}">${wrCls==="ok"?"comfortable":wrCls==="amber"?"stretched":"too high"}</span></div><div class="l">of savings withdrawn this year</div></div>
    <div class="kpi"><div class="v num">${fmt(sust)}</div><div class="l">monthly spending you can afford with 85% confidence</div></div>
    <div class="kpi"><div class="v num">${pct(plan.eqPct)}</div><div class="l">of savings in shares, including inside hybrid funds</div></div>`;
  const f=[];
  if(plan.short) f.push(`<div class="note bad"><b>Savings don't cover the next ten years of withdrawals.</b> In order of impact: bring monthly spending towards ${fmt(sust)}; ${S.annuity!=="no"?"use part of savings for a joint-life annuity; ":""}${+S.home?"later, consider a reverse mortgage or renting out part of your home; ":""}keep some part-time income for a few more years.</div>`);
  else if(s<0.85&&sust<mon) f.push(`<div class="note warn">Bringing spending to about <b>${fmt(sust)}</b> a month, or ${S.guard?"working a few more years":"turning on spending trims in the Choices step"}, would put you on firm ground.</div>`);
  if(S.cover<10) f.push(`<div class="note warn"><b>Health cover of ${fmt(S.cover*1e5)} is low.</b> One hospital stay in a city can cost ₹5–15 L. Add a super top-up; until then the plan keeps an extra ₹5 L in emergency money.</div>`);
  if(plan.annAmt>0) f.push(`<div class="note"><b>Suggested: a joint-life annuity of ${fmt(plan.annAmt)}.</b> It pays about ${fmt(plan.annInc/12)} a month for as long as either of you lives. It doesn't grow with inflation, so we keep it under 30% of savings.</div>`);
  else if(plan.annRec&&S.annuity==="no") f.push(`<div class="note">Your withdrawals are high relative to savings. A lifelong pension for part of the money would lower the risk of running out.</div>`);
  if(plan.scssPeople===0&&!plan.nri) f.push(`<div class="note">SCSS opens at 60 (55 after voluntary or superannuation retirement; 50 for defence veterans). The plan uses regular FDs and RBI bonds until then.</div>`);
  if(S.incomeOnly){const real=Math.pow(1+S.infl/100,15);f.push(`<div class="note warn"><b>Living only on interest keeps your capital intact, but not its value.</b> In 15 years, ${fmt(100000)} of interest will buy what ${fmt(100000/real)} buys today. The plan keeps a small growth portion for this reason.</div>`)}
  $("#flags").innerHTML=f.join("");
}

function scaleBars(n,on){return `<div class="scale" style="grid-template-columns:repeat(${n},1fr)">${Array.from({length:n},(_,k)=>`<i class="${k<=on?"on":""}"></i>`).join("")}</div>`}
function renderRisk(plan){
  const nreal=(1+plan.need)/(1+plan.i)-1;
  const needLv=plan.need<=-0.09?0:nreal<=0.005?0:nreal<=0.02?1:nreal<=0.04?2:3;
  const needTxt=plan.need<=-0.09?"Very low: your income covers almost everything":plan.need>=0.18?"More than any portfolio can reliably earn":`${pct(plan.need,1)} a year (${pct(nreal,1)} above inflation)`;
  $("#meters").innerHTML=`
   <div class="meter"><div class="top-row"><b>Comfort with losses</b><span>${WILL_NAMES[plan.wl]}</span></div>${scaleBars(5,plan.wl)}<span class="hint">From your answers in the Risk step</span></div>
   <div class="meter"><div class="top-row"><b>Ability to absorb losses</b><span>${CAP_NAMES[plan.cl]}</span></div>${scaleBars(3,plan.cl)}<span class="hint">From your pension cover, withdrawals, health cover and home</span></div>
   <div class="meter"><div class="top-row"><b>Return your plan needs</b><span>${needTxt}</span></div>${scaleBars(4,needLv)}<span class="hint">The yearly return that makes savings last exactly to age ${S.planAge}; your plan is expected to earn ${pct(plan.expRet,1)}</span></div>`;
  const m=[];
  m.push(`<div class="note good">Recommended: <b>${plan.eqRec}% in shares</b>${+S.eqAdj?`; you chose ${plan.eqCap}%`:""}${S.incomeOnly?" (limited to 10% because you prefer to live on interest)":""}. We follow the more careful of your comfort and your ability.</div>`);
  if(plan.willCap>plan.capCap+5) m.push(`<div class="note">You are comfortable with more risk than your finances can absorb, so the plan holds less in shares than your answers alone would suggest.</div>`);
  if(plan.need>plan.expRet+0.005&&plan.need<0.4) m.push(`<div class="note warn"><b>Your plan needs more return than your comfort allows.</b> You can spend a little less, keep some income for longer, or accept more shares. The "A bit more" button below shows the effect.</div>`);
  else if(plan.need<plan.expRet-0.025) m.push(`<div class="note">You need less return than your plan earns. You could hold more in safe options, spend more, or plan a larger gift to family.</div>`);
  $("#riskMsg").innerHTML=m.join("");
  $$("[data-eq]").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.eq===+S.eqAdj)));
}

function renderForYou(){
  const p=PERSONAS.find(x=>x.id===S.persona)||PERSONAS[2];
  $("#forYouTitle").textContent="Things that matter for a "+p.t.toLowerCase().replace("nri","NRI").replace("(fire)","(FIRE)");
  $("#forYou").innerHTML=(TIPS[p.id]||[]).map(t=>`<li>${t}</li>`).join("");
}

function renderJars(plan){
  const W=680,Hh=320,jw=150,top=46,jh=180,xs=[40,265,490];
  const vals=[plan.b1,plan.b2,plan.b3], mx=Math.max(...vals,1);
  const a=S.age, ages=[`Ages ${a}–${a+2}`,`Ages ${a+3}–${a+9}`,`Age ${a+10} onward`];
  const names=["Safety","Income","Growth"], sub=["Next 3 years of bills, plus emergencies","Refills Safety, years 4 to 10","Beats inflation for later years"];
  const cols=["--b1","--b2","--b3"].map(css), soft=["--b1-soft","--b2-soft","--b3-soft"].map(css), ink=css("--ink"),mut=css("--muted"),ln=css("--line");
  let g=`<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Safety ${fmt(vals[0])}, Income ${fmt(vals[1])}, Growth ${fmt(vals[2])}"><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${mut}"/></marker></defs>`;
  xs.forEach((x,k)=>{const h=Math.max(4,vals[k]/mx*(jh-12));
    g+=`<path d="M${x},${top} L${x},${top+jh-14} Q${x},${top+jh} ${x+14},${top+jh} L${x+jw-14},${top+jh} Q${x+jw},${top+jh} ${x+jw},${top+jh-14} L${x+jw},${top}" fill="${soft[k]}" stroke="${ln}" stroke-width="2"/>`;
    g+=`<rect x="${x+6}" y="${top+jh-6-h}" width="${jw-12}" height="${h}" rx="8" fill="${cols[k]}" opacity=".92"/>`;
    g+=`<text x="${x+jw/2}" y="${top-14}" text-anchor="middle" font-family="Atkinson Hyperlegible,sans-serif" font-size="20" font-weight="700" fill="${ink}">${fmt(vals[k])}</text>`;
    g+=`<text x="${x+jw/2}" y="${top+jh+28}" text-anchor="middle" font-family="Literata,serif" font-size="19" font-weight="600" fill="${ink}">${names[k]}</text>`;
    g+=`<text x="${x+jw/2}" y="${top+jh+48}" text-anchor="middle" font-family="Atkinson Hyperlegible,sans-serif" font-size="13.5" fill="${mut}">${ages[k]}</text>`;
    g+=`<text x="${x+jw/2}" y="${top+jh+66}" text-anchor="middle" font-family="Atkinson Hyperlegible,sans-serif" font-size="12.5" fill="${mut}">${sub[k]}</text>`});
  [[xs[2]-6,xs[1]+jw+8],[xs[1]-6,xs[0]+jw+8]].forEach(([p,q])=>{g+=`<path d="M${p},${top+60} L${q},${top+60}" stroke="${mut}" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#ah)"/><text x="${(p+q)/2}" y="${top+50}" text-anchor="middle" font-family="Atkinson Hyperlegible,sans-serif" font-size="12.5" fill="${mut}">refill yearly</text>`});
  $("#jars").innerHTML=g+"</svg>";
  const yrs=plan.G>0?(plan.b1+plan.b2-plan.reserve)/plan.G:0;
  $("#narr").innerHTML=plan.G>0
   ?`You need about <b>${fmt(plan.G/12)}</b> a month from savings. Safety and Income together hold roughly <b>${Math.max(0,Math.round(yrs))} years</b> of that, so a market fall never forces you to sell shares at a loss. Each April, move one year's spending from Growth to Income, and from Income to Safety. After a year when markets fell, skip the Growth step and let Income carry you.`
   :`Your regular income covers your spending today. Keep the Safety bucket for emergencies and planned expenses, and let the rest grow for later years, medical costs and your family.`;
}

function renderAlloc(plan){
  const rows=[]; let bar="";
  const shade=(b,k)=>`color-mix(in srgb, var(${BUCKET[b].col}) ${100-k*13}%, var(--surface))`;
  [0,1,2,3].forEach(b=>{const items=plan.A.filter(a=>a.b===b);if(!items.length)return;
    const tot=items.reduce((s,a)=>s+a.amt,0);
    rows.push(`<tr class="grp"><td>${BUCKET[b].name}</td><td class="r num">${fmt(tot)}</td><td class="r num">${pct(tot/plan.c)}</td><td></td><td></td></tr>`);
    items.forEach((a,k)=>{const p=P[a.k],col=shade(b,k),r=rateOf(a.k),fixed=["fixed","ann"].includes(p.c);
      bar+=`<div style="width:${a.amt/plan.c*100}%;background:${col}" title="${p.n}: ${fmt(a.amt)}"></div>`;
      rows.push(`<tr><td><span class="sw" style="background:${col}"></span><b>${p.n}</b><span class="why">${p.why}</span></td><td class="r num">${fmt(a.amt)}</td><td class="r num">${pct(a.amt/plan.c,1)}</td><td class="r num">${Number(r.toFixed(2))}%${fixed?"":"<span class='why'>expected</span>"}</td><td>${p.pay}</td></tr>`)})});
  $("#allocbar").innerHTML=bar; $("#allocTable tbody").innerHTML=rows.join("");
  $("#eqLine").textContent=`${pct(plan.eqPct)} in shares overall. Rates for SCSS, POMIS and RBI bonds are fixed by the government for this quarter.`;
}

function renderCalendar(plan){
  const now=new Date(); const months=[]; for(let k=1;k<=12;k++)months.push(new Date(now.getFullYear(),now.getMonth()+k,1));
  const amt=k=>plan.A.filter(a=>a.k===k).reduce((s,a)=>s+a.amt,0);
  const scss=amt("scss")*0.082/4,pomis=amt("pomis")*0.074/12,fd=(amt("fd")*S.fdRate+amt("fdr")*(S.fdRate-0.5))/100/12,frsb=amt("frsb")*0.0805/2,bonds=amt("bonds")*0.074/2,reit=amt("reit")*0.065/4;
  const guar=(plan.inc0+plan.annInc)/12, need=plan.exp0/12;
  const data=months.map(d=>{const m=d.getMonth();const intr=pomis+fd+([0,3,6,9].includes(m)?scss:0)+([0,6].includes(m)?frsb:0)+([3,9].includes(m)?bonds:0)+([1,4,7,10].includes(m)?reit:0);
    return {d,guar,intr,swp:Math.max(0,need-guar-intr)}});
  const W=680,H=260,L=64,B=36,T=16,mx=niceTop(Math.max(need*1.15,...data.map(x=>x.guar+x.intr+x.swp))*1.02),bw=(W-L-10)/12,y=v=>H-B-(v/mx)*(H-B-T);
  const cG=css("--b1"),cI=css("--b2"),cS=css("--b3"),mut=css("--muted"),ink=css("--ink"),ln=css("--line");
  let g=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly income for the next 12 months">`;
  for(let k=0;k<=4;k++){const v=mx*k/4;g+=`<line x1="${L}" x2="${W-6}" y1="${y(v)}" y2="${y(v)}" stroke="${ln}"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end" font-size="12" fill="${mut}" font-family="Atkinson Hyperlegible,sans-serif">${fmt(v)}</text>`}
  data.forEach((x,k)=>{const x0=L+k*bw+6,w=bw-12;let b=0;[[x.guar,cG],[x.intr,cI],[x.swp,cS]].forEach(([v,c])=>{if(v>0){g+=`<rect x="${x0}" y="${y(b+v)}" width="${w}" height="${y(b)-y(b+v)}" fill="${c}"/>`;b+=v}});
    g+=`<text x="${x0+w/2}" y="${H-B+18}" text-anchor="middle" font-size="12" fill="${mut}" font-family="Atkinson Hyperlegible,sans-serif">${x.d.toLocaleString("en-IN",{month:"short"})}</text>`});
  g+=`<line x1="${L}" x2="${W-6}" y1="${y(need)}" y2="${y(need)}" stroke="${ink}" stroke-width="2" stroke-dasharray="6 4"/><text x="${W-8}" y="${y(need)-6}" text-anchor="end" font-size="12.5" font-weight="700" fill="${ink}" font-family="Atkinson Hyperlegible,sans-serif">your expenses</text></svg>`;
  $("#cal").innerHTML=g+`<div class="legend"><span><span class="sw" style="background:${cG}"></span>Pension, rent, work, annuity</span><span><span class="sw" style="background:${cI}"></span>Interest and distributions</span><span><span class="sw" style="background:${cS}"></span>Monthly SWP from liquid fund</span></div>`;
  const avg=data.reduce((s,x)=>s+x.swp,0)/12, surplus=data.filter(x=>x.guar+x.intr>need).length;
  $("#calNote").innerHTML=`<div class="note">Set an SWP of about <b>${fmt(avg)}</b> a month from the liquid fund, and choose monthly interest payout on FDs. ${surplus?`In ${surplus} month${surplus>1?"s":""} income alone exceeds spending; sweep the extra back into the liquid fund. `:""}SCSS pays in April, July, October and January; RBI bonds on 1 January and 1 July.</div>`;
}

function renderFlow(plan){
  const n=plan.T, i=S.infl/100; const sp=[],inc=[];
  for(let t=0;t<=n;t++){const PI=Math.pow(1+i,t);sp.push(spendAt(t,PI)/PI/12);inc.push((incomeAt(t,PI)+plan.annInc)/PI/12)}
  const W=680,H=250,L=64,B=36,T=14,R=12,mx=niceTop(Math.max(...sp,...inc)*1.05||1);
  const x=t=>L+t/n*(W-L-R), y=v=>H-B-(v/mx)*(H-B-T);
  const ln=a=>a.map((v,t)=>(t?"L":"M")+x(t).toFixed(1)+","+y(v).toFixed(1)).join(" ");
  let area=`M${x(0)},${y(sp[0])}`;for(let t=1;t<=n;t++)area+=` L${x(t)},${y(sp[t])}`;for(let t=n;t>=0;t--)area+=` L${x(t)},${y(Math.min(inc[t],sp[t]))}`;
  const c1=css("--b3"),c2=css("--b1"),mut=css("--muted"),lnc=css("--line");
  let g=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Spending and income over the years in today's rupees">`;
  for(let k=0;k<=4;k++){const v=mx*k/4;g+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="${lnc}"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end" font-size="12" fill="${mut}" font-family="Atkinson Hyperlegible,sans-serif">${fmt(v)}</text>`}
  for(let t=0;t<=n;t+=5)g+=`<text x="${x(t)}" y="${H-B+20}" text-anchor="middle" font-size="12" fill="${mut}" font-family="Atkinson Hyperlegible,sans-serif">${S.age+t}</text>`;
  g+=`<path d="${area}Z" fill="${c1}" opacity=".18"/><path d="${ln(sp)}" fill="none" stroke="${c1}" stroke-width="3"/><path d="${ln(inc)}" fill="none" stroke="${c2}" stroke-width="3"/></svg>`;
  $("#flow").innerHTML=g+`<div class="legend"><span><span class="sw" style="background:${c1}"></span>Monthly spending</span><span><span class="sw" style="background:${c2}"></span>Regular income</span><span><span class="sw" style="background:${c1};opacity:.3"></span>Paid from savings</span></div>`;
  const notes=[];
  if(!S.pensionDA&&S.pension>0) notes.push("Your pension doesn't rise with prices, so in today's money it shrinks each year — that's why the income line falls.");
  if(S.mode==="detail"&&S.careOn) notes.push(`Care costs from age ${S.careFrom} cause the jump in spending.`);
  if(S.mode==="quick") notes.push("Switch to the detailed plan to see how travel spending eases after 75 and care costs rise later.");
  $("#flowNote").innerHTML=notes.length?`<div class="note">${notes.join(" ")}</div>`:"";
}

function renderFan(plan,sim){
  const W=680,H=300,L=64,B=40,T=14,R=12,n=sim.pcts.p50.length,mx=niceTop(Math.max(...sim.pcts.p90)*1.02||1);
  const x=t=>L+t/(n-1)*(W-L-R), y=v=>H-B-(Math.min(v,mx)/mx)*(H-B-T);
  const band=(lo,hi)=>{let d=`M${x(0)},${y(hi[0])}`;for(let t=1;t<n;t++)d+=` L${x(t)},${y(hi[t])}`;for(let t=n-1;t>=0;t--)d+=` L${x(t)},${y(lo[t])}`;return d+"Z"};
  const line=a=>a.map((v,t)=>(t?"L":"M")+x(t).toFixed(1)+","+y(v).toFixed(1)).join(" ");
  const c=css("--b2"),mut=css("--muted"),ink=css("--ink"),ln=css("--line"),bad=css("--bad");
  let g=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Range of savings over time in today's rupees">`;
  for(let k=0;k<=4;k++){const v=mx*k/4;g+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="${ln}"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end" font-size="12" fill="${mut}" font-family="Atkinson Hyperlegible,sans-serif">${fmt(v)}</text>`}
  for(let t=0;t<n;t+=5)g+=`<text x="${x(t)}" y="${H-B+20}" text-anchor="middle" font-size="12" fill="${mut}" font-family="Atkinson Hyperlegible,sans-serif">${S.age+t}</text>`;
  g+=`<text x="${W-R}" y="${H-6}" text-anchor="end" font-size="12" fill="${mut}" font-family="Atkinson Hyperlegible,sans-serif">your age</text>`;
  g+=`<path d="${band(sim.pcts.p10,sim.pcts.p90)}" fill="${c}" opacity=".16"/><path d="${band(sim.pcts.p25,sim.pcts.p75)}" fill="${c}" opacity=".28"/><path d="${line(sim.pcts.p50)}" fill="none" stroke="${c}" stroke-width="3"/><path d="${line(sim.pcts.p10)}" fill="none" stroke="${bad}" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  const tx=x(sim.T); g+=`<line x1="${tx}" x2="${tx}" y1="${T}" y2="${H-B}" stroke="${ink}" stroke-dasharray="3 4"/><text x="${tx-6}" y="${T+14}" text-anchor="end" font-size="12.5" font-weight="700" fill="${ink}" font-family="Atkinson Hyperlegible,sans-serif">plan ends</text></svg>`;
  $("#fan").innerHTML=g+`<div class="legend"><span><span class="sw" style="background:${c}"></span>Typical future</span><span><span class="sw" style="background:${c};opacity:.4"></span>8 in 10 futures</span><span><span class="sw" style="background:${bad}"></span>Poor markets (1 in 10)</span></div>`;
  const s=sim.success, sl={none:"normal times",crash:"a 35% crash in the first year",infl:"inflation 2% higher than expected",rates:"interest rates 1.5% lower after year five",medical:"a ₹15 L hospital bill in year three"}[S.stress];
  const end=sim.pcts.p50[Math.min(sim.T,n-1)];
  $("#lastNote").innerHTML=`<div class="note ${s<0.65?"bad":s<0.85?"warn":""}">Under ${sl}, money lasts to the end of the plan in <b>${pct(s)}</b> of futures. In a typical future about <b>${fmt(end)}</b> in today's money is left — a cushion for late-life care or your family.${sim.failMedian!=null&&sim.failShare>0.02?` When it does run out, it is typically at your age ${S.age+sim.failMedian}.`:""}${S.guard?"":" Turning on spending trims in the Choices step usually adds several points of safety."}</div>`;
  $$("[data-stress]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.stress===S.stress)));
}

function renderSurvivor(plan,base){
  const box=$("#survCard");
  if(!+S.spouse){
    box.innerHTML=`<div class="card-h"><h2>Planning on your own</h2><p>No survivor scenario is needed, but someone should be able to act for you.</p></div>
    <ul class="tips"><li>Make one trusted person a joint holder ("either or survivor") on your main bank account.</li><li>Register a power of attorney, so money can be managed if illness makes it hard for you.</li><li>Write a will and name nominees everywhere. See the <a href="guide-will.html">will guide</a>.</li><li>Tell one person where your money map is kept.</li></ul>`;return}
  const so=survObj(), r=simulate(plan,{surv:so}), sus=sustainable(plan,so);
  const youDie=S.survWho==="you", t=so.t, PI=Math.pow(1+S.infl/100,t);
  const before=(incomeAt(t,PI,null)+plan.annInc)/PI/12, after=(incomeAt(t,PI,so)+plan.annInc)/PI/12;
  const spB=spendAt(t,PI,false)/PI/12, spA=spendAt(t,PI,true)/PI/12;
  const cls=r.success>=0.85?"good":r.success>=0.65?"warn":"bad";
  box.innerHTML=`<div class="card-h"><h2>If one of you dies</h2><p>Pension often falls by half or more, while most costs stay. Test the years your spouse may live alone.</p></div>
   <div class="row2" style="max-width:560px">
     <div class="field"><span class="lbl">Who dies first</span><div class="seg"><label><input type="radio" name="survWho" value="you" data-k="survWho" ${youDie?"checked":""}><span>You</span></label><label><input type="radio" name="survWho" value="spouse" data-k="survWho" ${youDie?"":"checked"}><span>Spouse</span></label></div></div>
     <div class="field"><label for="survAge">At age</label><input type="number" id="survAge" data-k="survAge" value="${S.survAge}" min="40" max="105"></div>
   </div>
   <div class="field" style="max-width:270px"><label for="survExp">Household spending afterwards, % of now</label><input type="number" id="survExp" data-k="survExp" value="${S.survExp}" min="40" max="100"></div>
   <div class="kpis" style="margin-top:6px">
     <div class="kpi"><div class="v num">${fmt(before)} → ${fmt(after)}</div><div class="l">regular income per month, today's ₹</div></div>
     <div class="kpi"><div class="v num">${fmt(spB)} → ${fmt(spA)}</div><div class="l">spending per month, today's ₹</div></div>
     <div class="kpi"><div class="v num">${pct(r.success)}</div><div class="l">chance money lasts (both alive: ${pct(base.success)})</div></div>
     <div class="kpi"><div class="v num">${fmt(sus)}</div><div class="l">affordable spending now, if you plan for this</div></div>
   </div>
   <div class="note ${cls}">${r.success>=base.success-0.03?`If ${youDie?"you die":"your spouse dies"} at ${S.survAge}, the plan is no weaker than it is for the two of you together.`:`The plan is weaker in this case. ${youDie&&S.survPct<50&&S.pension>0?"Your pension mostly stops at your death; a joint-life annuity or term insurance (if you are under 65) would protect your spouse.":"Keep the annuity joint-life, keep SCSS in both names, and keep some extra in the Income bucket."}`}</div>
   <h3 style="margin:22px 0 8px">What the surviving spouse needs to know now</h3>
   <ul class="tips"><li>Where every account, policy and locker is — keep a one-page money map in a known place.</li><li>How to claim family pension: ${S.persona==="govt"||S.persona==="defence"?"the spouse's name must be in the PPO; apply to the pension bank with the death certificate":S.persona==="private"?"EPS widow pension is claimed on Form 10D":"check whether any pension continues"}.</li><li>Accounts held as "either or survivor" continue without any claim; others need a nominee claim. See the guide <a href="guide-death.html">When a spouse dies</a>.</li><li>Which SWP, interest dates and Form 15H submissions keep the income running.</li><li>Practise together: let the spouse who manages less handle the April review this year.</li></ul>`;
}

function renderTax(plan){
  const t=taxCalc(plan), choose=S.regime==="best"?(t.nT<=t.oT?"new":"old"):S.regime, tax=choose==="new"?t.nT:t.oT, other=choose==="new"?t.oT:t.nT;
  $("#taxBox").innerHTML=`<div class="kpis" style="margin-bottom:14px">
    <div class="kpi"><div class="v num">${fmt(t.intr)}</div><div class="l">interest income a year</div></div>
    <div class="kpi"><div class="v num">${fmt(tax)}</div><div class="l">estimated tax, ${choose} regime${t.sp?", both of you":""}</div></div>
    <div class="kpi"><div class="v num">${fmt(other)}</div><div class="l">under the ${choose==="new"?"old":"new"} regime</div></div></div>
  <p>${S.regime==="best"?`The <b>${choose} regime</b> looks better this year. `:""}Withdrawals from equity and hybrid funds are mostly your own money coming back; only the gain is taxed, and up to ₹1.25 L of equity gains a year is tax-free.</p>
  ${t.sp?`<div class="note"><b>Whose name the money is in matters.</b> If you give money to your spouse to invest, the interest is still taxed as your income (the clubbing rule). We counted ${pct(t.f)} of interest as your spouse's — the share of savings that is their own money. ${t.f<0.2&&t.intr>3e5?"Interest earned on your spouse's own money, such as their PF or inheritance, is the only way to split tax legally. Gifts to adult children are not clubbed.":""}</div>`:""}
  <div class="note">If your total tax is nil, submit <b>Form ${S.age>=60?"15H":"15G"}</b> to every bank and post office each April so they don't deduct TDS. ${S.age>=60?"For seniors, banks deduct TDS only when interest from one bank crosses ₹1 L a year.":""} ${t.scss>0&&choose==="old"?"Under the old regime, the year you open SCSS you can also claim up to ₹1.5 L of the deposit as a deduction.":""}</div>
  ${plan.fire?`<div class="note">Early retirees: sell and rebuy equity funds each year to use the ₹1.25 L tax-free gain, and keep part-time income small enough to stay in a low slab.</div>`:""}`;
}

function renderActions(plan){
  const amt=k=>plan.A.filter(a=>a.k===k).reduce((s,a)=>s+a.amt,0), A=[];
  const g=id=>` <a href="guide-${id.slice(2)}.html">How to do it</a>`;
  if(S.cover<10||plan.fire) A.push([`Fix health insurance first`,`Get a base policy plus a super top-up${S.cover<10?`; you have ${fmt(S.cover*1e5)}`:""}. Do this before investing, while you can still get cover.`+g("g-health")]);
  A.push([`Name nominees and write a will`,`On every account and policy. A registered will takes one visit to the sub-registrar.`+g("g-will")]);
  A.push([`Keep ${fmt(amt("sav"))} in savings and ${fmt(amt("liquid"))} in a liquid fund`,`This is your emergency money and the source of your monthly withdrawal.`+g("g-mf")]);
  if(amt("scss")){const you=Math.min(30e5,amt("scss")),spo=amt("scss")-you;A.push([`Open SCSS: ${fmt(you)} in your name${spo>0?`, ${fmt(spo)} in your spouse's`:""}`,`At a post office or bank. Interest is paid every quarter.`+g("g-scss")])}
  if(amt("pomis")) A.push([`Open POMIS for ${fmt(amt("pomis"))}`,`${+S.spouse?"Joint account, up to ₹15 L, plus individual accounts if needed. ":""}Interest arrives monthly.`+g("g-pomis")]);
  const fdT=amt("fd")+amt("fdr"); if(fdT) A.push([`Build an FD ladder of ${fmt(fdT)} across ${Math.max(1,Math.ceil(fdT/5e5))} banks`,`No more than ₹5 L per bank, maturing in 1 to 5 years.`+g("g-fd")]);
  if(amt("bigfd")) A.push([`Book ${fmt(amt("bigfd"))} in FDs for ${goals().filter(x=>x[2]<=3).map(x=>x[0]||"your planned expense").join(" and ")}`,`Make them mature a month before the money is needed.`+g("g-fd")]);
  if(amt("frsb")) A.push([`Buy RBI Floating Rate Savings Bonds for ${fmt(amt("frsb"))}`,`Through your bank. Interest on 1 January and 1 July.`+g("g-rbi")]);
  const debt=amt("tmf")+amt("chyb")+amt("baf")+amt("bonds"); if(debt) A.push([`Invest ${fmt(debt)} in the Income bucket funds`,`Target-maturity, conservative hybrid and balanced advantage funds — direct plans only.`+g("g-mf")]);
  const gr=plan.b3; if(gr>0) A.push([`Move ${fmt(gr)} into Growth over the next 12 months`,`Park it in a liquid fund and transfer about ${fmt(gr/12)} a month with an STP. This avoids putting everything in just before a fall.`+g("g-mf")]);
  if(plan.annAmt) A.push([`Buy a joint-life annuity of ${fmt(plan.annAmt)}`,`Compare quotes from LIC and two private insurers.`+g("g-annuity")]);
  if(plan.G>0) A.push([`Start a monthly SWP of about ${fmt(Math.max(0,plan.G/12-(amt("scss")*0.082+amt("pomis")*0.074+fdT*S.fdRate/100+amt("frsb")*0.0805)/12))}`,`From the liquid fund to your bank, on a fixed date.`+g("g-mf")]);
  A.push([`Submit Form ${S.age>=60?"15H":"15G"} in April if your tax is nil`,`At every bank and the post office.`+g("g-15h")]);
  if(S.persona==="govt"||S.persona==="defence") A.push([`Decide on pension commutation`,`Use the commutation calculator before you sign.`+` <a href="calc-commutation.html">Open calculator</a>`]);
  if(S.persona==="private"||S.persona==="fire") A.push([`Check your EPF and EPS`,`See what they will pay and when.`+` <a href="calc-eps.html">Open calculator</a>`]);
  if(S.pension>0) A.push([`Submit your life certificate every November`,`Jeevan Pramaan app, bank, or doorstep service.`+g("g-life")]);
  A.push([`Review every April`,`Refill the buckets, check maturities, and come back to this page with updated numbers.`]);
  $("#actions").innerHTML=A.map(([b,s])=>`<li><div><b>${b}</b><span>${s}</span></div></li>`).join("");
}

function renderLife(){
  const one=(g,age,self)=>{let b=g==="f"?91:88;if(self&&S.mode==="detail"){if(S.health==="good")b+=2;if(S.health==="poor")b-=5;if(S.smoker)b-=5;if(S.parents85)b+=3}return Math.max(b,age+8)};
  let yrs=one(S.gender,S.age,true)-S.age; if(+S.spouse) yrs=Math.max(yrs,one(S.sGender,S.sAge,false)-S.sAge);
  const young=+S.spouse?Math.min(S.age,S.sAge):S.age, sug=clamp(Math.round(young+yrs),85,105);
  $("#lifeSuggest").innerHTML=sug<=+S.planAge?`Planning to ${S.planAge} covers a long life: about 1 in 4 people like ${+S.spouse?"you two":"you"} live to ${sug}.`:sug===+S.planAge?`About 1 in 4 people like ${+S.spouse?"you two":"you"} live this long. Planning for it is safer than planning for the average.`:`Suggested: <b>${sug}</b>. About 1 in 4 people like ${+S.spouse?"you two":"you"} live this long. <button type="button" class="linkbtn" id="useLife" data-v="${sug}">Use ${sug}</button>`;
}
