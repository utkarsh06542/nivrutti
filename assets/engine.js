"use strict";
/* Nivrutti planning engine: state, products, cash flows, simulation, tax */
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const fmt=n=>{if(!isFinite(n))return "—";const a=Math.abs(n);if(a>=1e7)return (n<0?"−":"")+"₹"+(a/1e7).toFixed(2).replace(/\.?0+$/,"")+" Cr";if(a>=1e5)return (n<0?"−":"")+"₹"+(a/1e5).toFixed(1).replace(/\.0$/,"")+" L";return (n<0?"−":"")+"₹"+Math.round(a).toLocaleString("en-IN");};
const pct=(x,d)=>(x*100).toFixed(d==null?0:d)+"%";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("show"),2600)}

/* ---------------- retiree types ---------------- */
const PERSONAS=[
 {id:"govt",t:"Government pensioner",d:"Central or state government, PSU or bank pension",set:{age:61,spouse:1,sAge:57,pension:45000,pensionDA:true,survPct:60,sPension:0,rent:0,work:0,laterInc:0,laterL:0,exp:60000,corpusL:90,cover:10,premium:15000,planAge:95}},
 {id:"defence",t:"Defence veteran",d:"Armed forces or paramilitary pensioner",set:{age:57,spouse:1,sAge:53,pension:55000,pensionDA:true,survPct:60,sPension:0,rent:0,work:0,laterInc:0,laterL:0,exp:60000,corpusL:80,cover:10,premium:15000,planAge:95}},
 {id:"private",t:"Private-sector retiree",d:"EPF, gratuity, maybe a small EPS pension",set:{age:60,spouse:1,sAge:56,pension:3500,pensionDA:false,survPct:50,sPension:0,rent:0,work:0,laterInc:0,laterL:0,exp:70000,corpusL:220,cover:10,premium:45000,planAge:95}},
 {id:"business",t:"Business owner or professional",d:"No pension; savings, property, maybe rent",set:{age:63,spouse:1,sAge:59,pension:0,pensionDA:false,survPct:0,sPension:0,rent:40000,work:0,laterInc:0,laterL:0,exp:100000,corpusL:300,cover:20,premium:80000,planAge:95}},
 {id:"fire",t:"Early retiree (FIRE)",d:"Stopped working before 55 by choice",set:{age:42,spouse:1,sAge:40,pension:0,pensionDA:false,survPct:0,sPension:0,rent:0,work:30000,workUntil:50,laterInc:0,laterIncAge:60,laterL:60,laterAge:58,exp:110000,corpusL:500,cover:25,premium:35000,planAge:100,r1:2,r2:2,r3:2,r4:2,r5:2,r6:2}},
 {id:"nri",t:"NRI or returning NRI",d:"Worked abroad, retiring in India",set:{age:60,spouse:1,sAge:57,pension:40000,pensionDA:false,survPct:50,sPension:0,rent:0,work:0,laterInc:0,laterL:0,exp:90000,corpusL:250,cover:5,premium:30000,planAge:95}},
 {id:"single",t:"Single, widow or widower",d:"Planning for one person",set:{age:66,spouse:0,gender:"f",pension:20000,pensionDA:false,survPct:0,sPension:0,rent:0,work:0,laterInc:0,laterL:0,exp:45000,corpusL:100,cover:10,premium:35000,planAge:100}},
 {id:"modest",t:"Small savings",d:"Under ₹40 lakh and little or no pension",set:{age:62,spouse:1,sAge:58,pension:0,pensionDA:false,survPct:0,sPension:0,rent:0,work:0,laterInc:0,laterL:0,exp:25000,corpusL:30,cover:5,premium:0,planAge:95}}
];
const TIPS={
 govt:["Decide on commuting your pension with the calculator below. It is worth it only if you can safely earn more on the lump sum than the rate it implies.","Dearness relief is paid on your full pension even after commutation, so your inflation protection stays.","Family pension is usually 30% of last pay — often about 60% of your pension. Check that your PPO names your spouse.","CGHS covers most hospital costs, but add a super top-up for hospitals outside its panel.","If you were under NPS, compare the Unified Pension Scheme (50% of average basic pay after 25 years' service) before you exit.","The plan doesn't count on 8th Pay Commission increases; treat them as a bonus."],
 defence:["Retired defence personnel can open SCSS from age 50, if they invest within one month of receiving retirement benefits.","Use SPARSH for pension issues and to check that OROP revisions are paid.","ECHS covers treatment; add a super top-up for private hospitals outside its panel.","Disability pension is tax-free.","Family pension is often about 60% of your pension; check your spouse is named in the PPO."],
 private:["EPS pension is small and has no dearness relief, so the plan treats it as fixed.","EPF keeps earning interest until 58 even if you stop working; there's no hurry to withdraw it.","Gratuity is tax-free up to ₹20 L and leave encashment up to ₹25 L.","Company health cover ends when you retire. Buy individual cover and a super top-up now.","If you have corporate NPS, you can now take up to 80% as a lump sum. Try the NPS calculator below."],
 business:["With no pension, build an income floor from SCSS, POMIS and perhaps an annuity that covers essential expenses.","Keep 12 months of expenses as emergency money; business income can stop suddenly.","Keep business and personal money separate. Don't let the business borrow from retirement savings.","Plan who will run or buy the business. Capital gains on a sale can be reduced with 54EC bonds or by buying a home (54F).","If most wealth is in property, consider selling one to spread risk; rent is income, but the property itself is hard to sell quickly."],
 fire:["Under 60 you can't use SCSS, senior FD rates or senior tax benefits. The plan uses regular rates until you reach 60.","Your money must last 50 years or more. Keep 60–75% in equity, and spend 3–3.3% of savings a year, not 4%.","Buy individual health cover and a super top-up now, while healthy, so waiting periods expire before you need them.","EPF earns interest until 58. Leaving NPS before 60 forces 80% into an annuity, so wait. Keep extending PPF in five-year blocks.","Harvest up to ₹1.25 L of equity gains tax-free each year, for each family member.","For children's education abroad, invest that money in international funds to hedge a falling rupee.","A small side income in the first ten years sharply lowers the risk of running out."],
 nri:["NRIs can't open new SCSS, POMIS or PPF accounts. Once you return and become resident, they are all open to you.","After returning, you may be 'resident but not ordinarily resident' for up to three years, keeping foreign income untaxed in India. Time foreign withdrawals within this window.","NRE deposit interest stops being tax-free once you become resident. FCNR deposits can run to maturity.","US citizens and green-card holders should avoid Indian mutual funds because of US PFIC tax rules.","Tax on foreign pensions follows the tax treaty between the two countries; claim credit for tax already paid abroad.","You can repatriate up to US$1 million a year from an NRO account."],
 single:["Plan to age 100. Women in India often live into their nineties.","Name a trusted person: a joint holder on one account, a registered power of attorney, and someone for medical decisions.","If you receive family pension, check that dearness relief is being added.","Be careful with requests for loans or offers to 'manage' your money, even from relatives.","Most banks offer doorstep banking for customers over 70."],
 modest:["Use government schemes first. SCSS and POMIS give the best safe return available.","Everyone over 70 can get the Ayushman Vay Vandana card: ₹5 L of free hospital cover a year.","If income is very low, check the Indira Gandhi National Old Age Pension and your state's old-age pension.","If you own your home, a reverse mortgage can add monthly income without moving out.","Stay away from anything promising high returns. There is no safe 12%.","The District Legal Services Authority gives free legal help to senior citizens."]
};

/* ---------------- state ---------------- */
const DEF={persona:"private",mode:"quick",age:60,gender:"m",spouse:1,sAge:56,sGender:"f",health:"avg",smoker:false,parents85:false,planAge:95,vrs:false,
 pension:3500,pensionDA:false,survPct:50,sPension:0,rent:0,work:0,workUntil:65,laterInc:0,laterIncAge:60,laterL:0,laterAge:60,
 exp:70000,ess:38500,life:14000,med:8500,help:9000,careOn:true,careFrom:85,careCost:25000,
 g1n:"Child's wedding",g1L:15,g1Yr:3,g2n:"",g2L:0,g2Yr:6,g3n:"",g3L:0,g3Yr:10,
 corpusL:220,spouseOwnL:0,home:1,cover:10,premium:45000,snDep:false,
 r1:1,r2:2,r3:1,r4:1,r5:1,r6:1,incomeOnly:false,eqAdj:0,
 annuity:"auto",regime:"best",guard:true,infl:6,medInfl:8.5,eqRet:11,fdRate:7.0,annRate:7.4,
 survWho:"you",survAge:80,survExp:70,stress:"none"};
let S=Object.assign({},DEF,store.get("nivrutti2",{}));
const save=()=>store.set("nivrutti2",S);
function splitExp(){const tot=S.exp;S.ess=Math.round(tot*.55/500)*500;S.life=Math.round(tot*.2/500)*500;S.med=Math.round(tot*.12/500)*500;S.help=tot-S.ess-S.life-S.med;}
const isFire=()=>S.persona==="fire"||S.age<55;

/* ---------------- products ---------------- */
const P={
 sav:{n:"Savings account with auto-sweep FD",r:3.5,pay:"Any time",c:"fixed",why:"Cash for emergencies, reachable the same day"},
 liquid:{n:"Liquid or arbitrage fund",r:6.8,pay:"Monthly SWP",c:"debt",why:"Your monthly top-up comes from here; arbitrage funds are taxed like equity"},
 scss:{n:"Senior Citizens Savings Scheme (SCSS)",r:8.2,pay:"Quarterly",c:"fixed",why:"Highest government-backed rate; ₹30 L limit per person"},
 pomis:{n:"Post Office Monthly Income Scheme",r:7.4,pay:"Monthly",c:"fixed",why:"Government-backed monthly interest; ₹9 L single, ₹15 L joint"},
 fd:{n:"Senior citizen FD ladder",r:7,pay:"Monthly",c:"fixed",why:"At most ₹5 L per bank so deposit insurance covers all of it"},
 fdr:{n:"Bank FD ladder",r:6.5,pay:"Quarterly",c:"fixed",why:"At most ₹5 L per bank; senior rates start at 60"},
 bigfd:{n:"FD timed to your big expense",r:6.8,pay:"At maturity",c:"fixed",why:"Matures in the year you need it, so markets can't touch it"},
 frsb:{n:"RBI Floating Rate Savings Bonds",r:8.05,pay:"Jan and Jul",c:"fixed",why:"Sovereign; rate resets with NSC every six months"},
 bonds:{n:"AAA PSU and corporate bonds",r:7.4,pay:"Half-yearly",c:"fixed",why:"Hold to maturity; buy only AAA or PSU issuers"},
 tmf:{n:"Target-maturity or gilt debt fund",r:7,pay:"On withdrawal",c:"debt",why:"Locks today's bond yields for a known period; refills bucket one"},
 chyb:{n:"Conservative hybrid or equity savings fund",r:8.5,pay:"On withdrawal",c:"hyb",eq:.25,why:"Mostly debt with a little equity"},
 baf:{n:"Balanced advantage fund",r:9.5,pay:"On withdrawal",c:"hyb",eq:.5,why:"Shifts between equity and debt by valuation, smoothing falls"},
 index:{n:"Nifty 50 or Nifty 100 index fund",r:11,pay:"On withdrawal",c:"eq",eq:1,why:"Low-cost core of growth"},
 flexi:{n:"Flexi-cap fund",r:11.5,pay:"On withdrawal",c:"eq",eq:1,why:"Adds mid-sized companies"},
 intl:{n:"International index fund",r:10,pay:"On withdrawal",c:"eq",eq:1,why:"Global shares; hedges a weaker rupee"},
 multi:{n:"Multi-asset allocation fund",r:10,pay:"On withdrawal",c:"hyb",eq:.5,gold:.2,why:"Equity, debt and gold in one fund"},
 gold:{n:"Gold ETF or SGBs bought on exchange",r:9,pay:"On withdrawal",c:"gold",why:"Often rises when markets fall"},
 reit:{n:"REITs and InvITs",r:8.5,pay:"Quarterly",c:"reit",why:"Rent and toll income from listed assets"},
 annuity:{n:"Joint-life immediate annuity",r:7.4,pay:"Monthly",c:"ann",why:"Pays as long as either of you lives; fixed, not linked to inflation"}
};
const rateOf=k=>k==="fd"?S.fdRate:k==="fdr"?S.fdRate-0.5:k==="annuity"?S.annRate:P[k].r;
const BUCKET={1:{name:"Safety",col:"--b1"},2:{name:"Income",col:"--b2"},3:{name:"Growth",col:"--b3"},0:{name:"Lifetime pension",col:"--muted"}};

/* ---------------- cash flows ---------------- */
function spendAt(t,PI,dead,sf){
  const age=S.age+t, MI=PI*Math.pow((1+S.medInfl/100)/(1+S.infl/100),t);
  let s;
  if(S.mode==="quick") s=S.exp*12*(0.9*PI+0.1*MI);
  else{const smile=age<=75?1:Math.max(0.5,1-0.03*(age-75));
    s=12*(S.ess*PI+S.life*PI*smile+S.med*MI+S.help*PI*Math.pow(1.01,t));
    if(S.careOn&&age>=S.careFrom) s+=S.careCost*12*PI;}
  if(dead) s*=S.survExp/100;
  return s*(sf||1);
}
function incomeAt(t,PI,surv){
  const age=S.age+t, dead=!!(surv&&t>=surv.t), who=surv&&surv.who;
  const da=S.pensionDA?PI:1;
  let pen=S.pension*12*da, spn=(+S.spouse?S.sPension*12*da:0);
  if(dead){if(who==="you")pen*=S.survPct/100;else spn=0;}
  let inc=pen+spn+S.rent*12*Math.pow(1.05,t);
  if(age<S.workUntil&&!(dead&&who==="you")) inc+=S.work*12*PI;
  if(S.laterInc>0&&age>=S.laterIncAge) inc+=S.laterInc*12;
  return inc;
}
const goals=()=>[[S.g1n,S.g1L,S.g1Yr],[S.g2n,S.g2L,S.g2Yr],[S.g3n,S.g3L,S.g3Yr]].filter((g,k)=>g[1]>0&&g[2]>0&&(k===0||S.mode==="detail"));
const goalsAt=(t,PI)=>goals().reduce((s,g)=>s+(g[2]-1===t?g[1]*1e5*PI:0),0);
const lumpAt=t=>(S.laterL>0&&S.laterAge>S.age&&t===S.laterAge-S.age)?S.laterL*1e5:0;

/* ---------------- risk profile ---------------- */
const WILL_NAMES=["Very cautious","Cautious","Balanced","Growth-seeking","Adventurous"];
const CAP_NAMES=["Limited","Moderate","Strong"];

/* ---------------- planning engine ---------------- */
function buildPlan(){
  const c=S.corpusL*1e5, i=S.infl/100, sp=!!+S.spouse;
  const youngest=sp?Math.min(S.age,S.sAge):S.age;
  const T=Math.max(5,S.planAge-youngest);
  const fire=isFire(), nri=S.persona==="nri";
  const selfElig=S.age>=60||(S.vrs&&(S.age>=55||(S.persona==="defence"&&S.age>=50)));
  const scssPeople=nri?0:(selfElig?1:0)+(sp&&S.sAge>=60?1:0);
  const scssCap=30e5*scssPeople, pomisCap=nri?0:(sp?18e5:9e5);
  const senior=S.age>=60;
  const PIt=t=>Math.pow(1+i,t);
  const gross=t=>spendAt(t,PIt(t))-incomeAt(t,PIt(t));
  const exp0=spendAt(0,1), inc0=incomeAt(0,1), gap0=Math.max(0,exp0-inc0);
  const wr0=c>0?gap0/c:1, coverage=exp0>0?inc0/exp0:1;
  const annRec=!fire&&((wr0>0.045&&S.age>=65)||(coverage<0.3&&S.age>=70&&wr0>0.035));
  let annAmt=0;
  if(S.annuity==="yes"||(S.annuity==="auto"&&annRec)) annAmt=Math.round(Math.min(0.3*c,gap0*0.5/(S.annRate/100))/1e5)*1e5;
  if(S.annuity==="yes"&&annAmt===0) annAmt=Math.round(0.15*c/1e5)*1e5;
  const annInc=annAmt*S.annRate/100, inv=c-annAmt;
  const G=Math.max(0,gross(0)-annInc), wr=inv>0?G/inv:1;

  // willingness
  const will=(+S.r1)+(+S.r2)+(+S.r3)+(+S.r4)+(+S.r5)+(+S.r6);
  const wl=will<=3?0:will<=6?1:will<=9?2:will<=12?3:4;
  // capacity
  let cs=0; if(coverage>=0.6)cs+=2;else if(coverage>=0.3)cs+=1;
  if(wr<0.03)cs+=2;else if(wr<0.045)cs+=1;
  if(S.cover>=10)cs+=1; if(+S.home)cs+=1; if(S.snDep)cs-=1; if(S.health==="poor")cs-=1;
  const cl=cs>=5?2:cs>=3?1:0;
  const willCap=[10,20,35,50,65][wl]+(fire?10:0), capCap=[25,45,70][cl]+(fire?10:0);
  let eqRec=Math.min(willCap,capCap);
  if(S.age>=75)eqRec-=10; if(S.age>=80)eqRec-=5; if(T<10)eqRec=Math.min(eqRec,20);
  eqRec=clamp(eqRec,5,80);
  let eqCap=clamp(eqRec+(+S.eqAdj),5,85);
  if(S.incomeOnly) eqCap=Math.min(eqCap,10);
  const level=S.incomeOnly?-1:eqCap<=20?0:eqCap<=40?1:2;

  // buckets
  const reserve=(fire?9:6)*exp0/12+(S.cover<10?5e5:S.cover<25?2e5:0)+(S.snDep?3e5:0);
  let b1Spend=0,b2Spend=0,goal1=0,goal2=0;
  for(let t=0;t<3;t++){b1Spend+=Math.max(0,gross(t)-annInc)/Math.pow(1.07,t);goal1+=goalsAt(t,PIt(t))/Math.pow(1.068,t)}
  for(let t=3;t<10;t++){b2Spend+=Math.max(0,gross(t)-annInc)/Math.pow(1.075,t);goal2+=goalsAt(t,PIt(t))/Math.pow(1.07,t)}
  let b1=reserve+goal1+b1Spend, b2=b2Spend+goal2, short=false;
  if(b1>inv){b1=inv;b2=0;short=true}else if(b1+b2>inv){b2=inv-b1;short=true}
  let b3=Math.max(0,inv-b1-b2);
  const split2=level<0?{frsb:.5,bonds:.5}:[{frsb:.45,tmf:.35,chyb:.2},{frsb:.35,tmf:.25,chyb:.2,baf:.2},{frsb:.25,tmf:.2,chyb:.2,baf:.35}][level];
  const split3=level<0?{index:.5,gold:.2,reit:.3}:[{index:.55,gold:.2,multi:.25},{index:.45,flexi:.15,gold:.15,multi:.15,reit:.05,intl:.05},{index:.42,flexi:.2,intl:.12,gold:.1,multi:.06,reit:.1}][level];
  const eqf=sp=>Object.keys(sp).reduce((s,k)=>s+sp[k]*(P[k].eq||0),0);
  const f2=eqf(split2), f3=eqf(split3)||0.5;
  for(let k=0;k<3;k++){const max3=Math.max(0,(inv*eqCap/100-b2*f2)/f3);if(b3>max3){b2+=b3-max3;b3=max3}}

  const A=[]; const add=(k,b,amt)=>{if(amt>=1000)A.push({k,b,amt})};
  let r1=b1; const res=Math.min(r1,reserve);
  add("sav",1,res*0.35); let liq=res*0.65; r1-=res;
  const bf=Math.min(r1,goal1); add("bigfd",1,bf); r1-=bf;
  const flt=Math.min(r1,G*0.5); liq+=flt; r1-=flt; add("liquid",1,liq);
  const s1=Math.min(scssCap,r1); add("scss",1,s1); r1-=s1;
  const p1=Math.min(pomisCap,r1); add("pomis",1,p1); r1-=p1;
  add(senior?"fd":"fdr",1,r1);
  let r2=b2; const s2=Math.min(scssCap-s1,r2*0.5); r2-=s2; add("scss",2,s2);
  const g2=Math.min(r2,goal2); r2-=g2;
  const t2={}; Object.keys(split2).forEach(k=>t2[k]=r2*split2[k]); if(g2>0)t2.tmf=(t2.tmf||0)+g2;
  Object.keys(t2).forEach(k=>add(k,2,t2[k]));
  Object.keys(split3).forEach(k=>add(k,3,b3*split3[k]));
  if(annAmt>0) add("annuity",0,annAmt);

  let eqAmt=0,expRet=0; A.forEach(a=>{if(a.k==="annuity")return;eqAmt+=a.amt*(P[a.k].eq||0);
    const p=P[a.k]; let r=rateOf(a.k)/100; if(p.c==="eq")r=S.eqRet/100+(a.k==="flexi"?0.005:a.k==="intl"?-0.01:0); if(p.c==="hyb")r=(p.eq||0)*S.eqRet/100+(p.gold||0)*0.09+(1-(p.eq||0)-(p.gold||0))*0.07; expRet+=a.amt*r});
  expRet=inv>0?expRet/inv:0;
  const plan={c,inv,exp0,inc0,G,gap0,wr,wr0,annAmt,annInc,annRec,b1,b2,b3,reserve,short,eqRec,eqCap,eqPct:inv>0?eqAmt/inv:0,level,wl,cl,willCap,capCap,coverage,T,youngest,scssCap,scssPeople,s1,s2,A,i,fire,senior,expRet,nri};
  plan.need=requiredReturn(plan);
  return plan;
}
function requiredReturn(plan){
  const i=S.infl/100;
  const f=r=>{let pv=0;for(let t=0;t<plan.T;t++){const PI=Math.pow(1+i,t);const net=spendAt(t,PI)-incomeAt(t,PI)-plan.annInc+goalsAt(t,PI)-lumpAt(t);pv+=net/Math.pow(1+r,t)}return pv-plan.inv};
  if(f(-0.1)<=0) return -0.1; if(f(0.4)>0) return 0.4;
  let lo=-0.1,hi=0.4; for(let k=0;k<40;k++){const m=(lo+hi)/2; if(f(m)>0)lo=m;else hi=m}
  return (lo+hi)/2;
}

/* ---------------- simulation ---------------- */
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function weights(plan){
  const w={F:0,D:0,E:0,G:0,R:0}; let yF=0,fA=0;
  plan.A.forEach(a=>{const p=P[a.k];if(a.k==="annuity")return;const x=a.amt/plan.inv;
    if(p.c==="fixed"){w.F+=x;yF+=a.amt*rateOf(a.k);fA+=a.amt}
    else if(p.c==="debt")w.D+=x;else if(p.c==="eq")w.E+=x;else if(p.c==="gold")w.G+=x;else if(p.c==="reit")w.R+=x;
    else if(p.c==="hyb"){const e=p.eq||0,g=p.gold||0;w.E+=x*e;w.G+=x*g;w.D+=x*(1-e-g)}});
  return {w,yF:fA>0?yF/fA/100:0.075};
}
function simulate(plan,o){
  o=o||{}; const n=o.n||1000, rand=rng(o.seed||7), stress=o.stress||"none", sf=o.sf||1, surv=o.surv||null;
  const gauss=()=>{let u=0;while(u===0)u=rand();const v=rand();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  const {w,yF}=weights(plan), T=plan.T, H=T+3;
  const mu=S.eqRet/100, inflM=S.infl/100+(stress==="infl"?0.02:0), wrRef=Math.max(plan.wr,0.02);
  const cols=Array.from({length:H+1},()=>new Float64Array(n)); let ok=0; const fails=[];
  for(let p=0;p<n;p++){
    let V=plan.inv,PI=1,failed=-1; cols[0][p]=V;
    for(let t=0;t<H;t++){
      const inf=Math.max(-0.01,inflM+0.012*gauss()), dead=!!(surv&&t>=surv.t);
      let need=spendAt(t,PI,dead,sf)-incomeAt(t,PI,surv)-plan.annInc+goalsAt(t,PI);
      if(stress==="medical"&&t===2) need+=15e5*PI*1.08;
      if(S.guard&&V>0&&need>0&&need/V>wrRef*1.25) need*=0.9;
      need-=lumpAt(t);
      V-=need; if(V<=0){V=0;if(failed<0)failed=t}
      let rE=mu+0.17*gauss(),rD=0.07+0.025*gauss(),rG=0.09+0.14*gauss(),rR=0.09+0.13*gauss();
      if(stress==="crash"&&t===0){rE=-0.35;rG=0.10;rR=-0.20;rD=0.05}
      const fs=(stress==="rates"&&t>=5)?-0.015:0;
      V*=1+(w.F*(yF+fs)+w.D*rD+w.E*rE+w.G*rG+w.R*rR); PI*=1+inf; cols[t+1][p]=V/PI;
    }
    if(failed<0||failed>=T)ok++;else fails.push(failed);
  }
  const pc={p10:[],p25:[],p50:[],p75:[],p90:[]};
  cols.forEach(col=>{const s=Array.from(col).sort((a,b)=>a-b);pc.p10.push(s[Math.floor(n*.1)]);pc.p25.push(s[Math.floor(n*.25)]);pc.p50.push(s[Math.floor(n*.5)]);pc.p75.push(s[Math.floor(n*.75)]);pc.p90.push(s[Math.floor(n*.9)])});
  fails.sort((a,b)=>a-b);
  return {success:ok/n,pcts:pc,T,H,failMedian:fails.length?fails[Math.floor(fails.length/2)]:null,failShare:fails.length/n};
}
function sustainable(plan,surv){
  let lo=0.05,hi=3;
  for(let k=0;k<11;k++){const m=(lo+hi)/2;if(simulate(plan,{n:300,seed:11,sf:m,surv}).success>=0.85)lo=m;else hi=m}
  return spendAt(0,1)/12*lo;
}
function survObj(){if(!+S.spouse)return null;const who=S.survWho;const base=who==="you"?S.age:S.sAge;return {who,t:Math.max(0,S.survAge-base)}}

/* ---------------- tax ---------------- */
function slabTax(x,sl){let t=0,prev=0;for(const [lim,r] of sl){if(x>prev)t+=(Math.min(x,lim)-prev)*r;prev=lim}return t}
function newR(g,hasPen){const ti=Math.max(0,g-(hasPen?75000:0));let t=slabTax(ti,[[4e5,0],[8e5,.05],[12e5,.10],[16e5,.15],[20e5,.20],[24e5,.25],[1e13,.30]]);if(ti<=12e5)t=0;return t*1.04}
function oldR(g,hasPen,age,intr,prem){const ded=(hasPen?50000:0)+(age>=60?Math.min(50000,intr):Math.min(10000,intr))+Math.min(prem,age>=60?50000:25000);const ti=Math.max(0,g-ded);const ex=age>=80?5e5:age>=60?3e5:2.5e5;let t=slabTax(ti,[[ex,0],[5e5,.05],[10e5,.20],[1e13,.30]]);if(ti<=5e5)t=0;return t*1.04}
function taxCalc(plan){
  let intr=0,scss=0; plan.A.forEach(a=>{if(P[a.k].c==="fixed")intr+=a.amt*rateOf(a.k)/100;if(a.k==="scss")scss+=a.amt});
  const sp=!!+S.spouse, f=sp?clamp((S.spouseOwnL||0)/Math.max(1,S.corpusL),0,1):0;
  const work=S.age<S.workUntil?S.work*12:0;
  const main=S.pension*12+plan.annInc+S.rent*12*0.7+work+intr*(1-f);
  const spo=sp?S.sPension*12+intr*f:0;
  const nT=newR(main,S.pension>0)+(sp?newR(spo,S.sPension>0):0);
  const oT=oldR(main,S.pension>0,S.age,intr*(1-f),S.premium)+(sp?oldR(spo,S.sPension>0,S.sAge,intr*f,0):0);
  return {intr,scss,f,main,spo,nT,oT,sp};
}
