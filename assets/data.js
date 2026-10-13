/* Nivrutti content: checklist, products, glossary, calculators */
/* ================= checklist ================= */
const CHK=[
 ["health","Health insurance with a super top-up","Base cover plus a ₹25–50 L super top-up. Never let a policy lapse."],
 ["nom","Nominee on every account","Bank, post office, demat, mutual funds, SCSS, insurance. Banks now allow up to four nominees."],
 ["will","A registered will","Simple and witnessed. It saves your family months in court."],
 ["joint","Joint accounts as 'either or survivor'","So your spouse can use the account at once, without a succession certificate."],
 ["map","A one-page money map","Every account, policy number and contact, kept where family can find it."],
 ["spouse","Your spouse can run the money alone","They know the SWP, interest dates, passwords to share safely, and whom to call."],
 ["ppo","Spouse named in the pension order","For family pension. Check the PPO or EPS records."],
 ["life","Life certificate every November","Jeevan Pramaan app, bank or doorstep service."],
 ["15h","Form 15H or 15G in April","At each bank and post office, if your tax is nil."],
 ["dicgc","No more than ₹5 L in any one bank","Deposit insurance covers up to ₹5 L per bank, per person."],
 ["kyc","KYC, mobile and email up to date","Old details cause frozen accounts and missed fraud alerts."],
 ["scam","Scam rules agreed with family","No agency arrests anyone on a video call. Never share an OTP. Call 1930 at once if money is lost."],
 ["poa","Someone can act if you can't","A registered power of attorney and a medical decision-maker."],
 ["vay","Ayushman Vay Vandana card at 70","₹5 L of free hospital cover a year for everyone over 70."],
 ["review","Calendar reminder: review every April","Refill buckets, renew deposits, revisit this plan."]
];
let ticks=store.get("nivrutti-ticks",{});
function renderChk(){$("#chkList").innerHTML=CHK.map(([id,b,s])=>`<label class="chk"><input type="checkbox" data-c="${id}" ${ticks[id]?"checked":""}><div><b>${b}</b><span>${s}</span></div></label>`).join("");updChk()}
function updChk(){const d=CHK.filter(c=>ticks[c[0]]).length;$("#chkCount").textContent=`${d} of ${CHK.length} done`;$("#chkBar").style.width=(d/CHK.length*100)+"%"}

/* ================= products library ================= */
const LIB=[
 {t:"income",n:"Senior Citizens Savings Scheme",r:"8.2% fixed for 5 years",s:5,a:"5 years; early exit with penalty after 1 year",x:"Interest taxable; deposit counts for 80C in old regime",u:"The backbone of retirement income. ₹30 L per person. From 60 (55 after VRS, 50 for defence)."},
 {t:"income",n:"Post Office Monthly Income Scheme",r:"7.4%",s:5,a:"5 years; penalty if withdrawn early",x:"Interest taxable; no TDS",u:"Monthly income after SCSS is full. ₹9 L single, ₹15 L joint. Residents only."},
 {t:"income",n:"RBI Floating Rate Savings Bonds",r:"8.05%, resets every 6 months",s:5,a:"7 years; seniors can exit after 4–6 years",x:"Interest taxable; TDS applies",u:"Sovereign income that rises if rates rise. No upper limit. Open to all ages."},
 {t:"income",n:"Bank FDs (senior rates from 60)",r:"About 6.5–7.5%",s:4,a:"Breakable with a small penalty",x:"Interest taxable",u:"Ladders and planned expenses. Stay within ₹5 L per bank."},
 {t:"income",n:"Annuity (LIC, private insurers, NPS annuity)",r:"About 6.5–8% by age and option",s:4,a:"None — money exchanged for lifelong income",x:"Fully taxable",u:"Insuring against a very long life. Use for part of savings, joint-life, ideally after 65."},
 {t:"income",n:"NPS (if you hold it)",r:"Market-linked",s:3,a:"At 60: up to 80% lump sum (private) or 60% (government); defer to 85",x:"60% of corpus tax-free as lump sum",u:"Stay invested if you don't need it yet. Leaving before 60 forces 80% into an annuity."},
 {t:"income",n:"Unified Pension Scheme (government)",r:"50% of average basic pay after 25 years",s:5,a:"Pension for life, with dearness relief",x:"Taxable as pension",u:"Central government employees who were under NPS can choose it."},
 {t:"income",n:"RBI Retail Direct G-secs and T-bills",r:"Market yield, about 6–7%",s:5,a:"Sell on exchange or hold to maturity",x:"Interest taxable",u:"Locking long rates without fund expenses."},
 {t:"safety",n:"Liquid and overnight funds",r:"About 6–7%",s:4,a:"Next working day",x:"Gains taxed at your slab",u:"Emergency money and your monthly SWP."},
 {t:"safety",n:"Arbitrage funds",r:"About 6.5–7.5%",s:4,a:"2–3 working days",x:"Taxed as equity",u:"A liquid-fund alternative that is kinder on tax in higher slabs."},
 {t:"steady",n:"Target-maturity and gilt funds",r:"Close to the yield when bought",s:4,a:"Few days; value moves with rates",x:"Gains taxed at slab",u:"Income bucket: known return for a known period."},
 {t:"steady",n:"Conservative hybrid and equity savings funds",r:"About 7.5–9% expected",s:3,a:"Few days",x:"Depends on equity share",u:"A gentle step beyond FDs."},
 {t:"steady",n:"Balanced advantage funds",r:"About 9–10% expected",s:3,a:"Few days",x:"Usually taxed as equity",u:"Equity with automatic brakes; good for first-time investors."},
 {t:"steady",n:"AAA PSU and corporate bonds",r:"About 7–8%",s:4,a:"Sell on exchange; can be hard to sell",x:"Interest taxable",u:"Extra yield over government bonds. AAA and PSU issuers only."},
 {t:"steady",n:"Tax-free bonds (bought on exchange)",r:"About 5.5–6% tax-free",s:5,a:"Sell on exchange",x:"Interest tax-free",u:"Those in the 30% slab. No new issues."},
 {t:"steady",n:"PPF (if already open)",r:"7.1% tax-free",s:5,a:"One withdrawal a year after extension",x:"Fully tax-free",u:"Keep extending in five-year blocks."},
 {t:"growth",n:"Nifty 50 / Nifty 100 index funds",r:"10–12% long-run",s:2,a:"Few days; can fall 30–40%",x:"12.5% on gains above ₹1.25 L after 1 year",u:"The core of the Growth bucket. Lowest cost."},
 {t:"growth",n:"Flexi-cap and large & mid-cap funds",r:"11–12% long-run",s:2,a:"Few days",x:"As equity",u:"A smaller addition next to the index fund."},
 {t:"growth",n:"Multi-asset allocation funds",r:"9–11% expected",s:3,a:"Few days",x:"Depends on structure",u:"Equity, debt and gold in one fund."},
 {t:"growth",n:"Gold ETFs and SGBs on exchange",r:"8–10% long-run, very uneven",s:3,a:"Few days",x:"12.5% after 1 year; SGBs tax-free at maturity",u:"10–15% of Growth as a hedge. New SGBs aren't issued."},
 {t:"growth",n:"REITs and InvITs",r:"6–8% payouts plus growth",s:3,a:"Sell on exchange",x:"Mixed",u:"Small slice for quarterly rent-like income."},
 {t:"fire",n:"International index funds",r:"9–11% in rupees, long-run",s:2,a:"Few days; limits on new money at times",x:"Gains taxed at slab for most fund-of-funds",u:"Children's education abroad and protection from a weaker rupee."},
 {t:"fire",n:"PPF and EPF (while under 58)",r:"7.1% and 8.25%, tax-free",s:5,a:"EPF on leaving work; PPF yearly withdrawals",x:"Tax-free within limits",u:"A tax-free debt base for early retirees."},
 {t:"fire",n:"Specialised investment funds (SIFs)",r:"Varies",s:2,a:"Depends on strategy",x:"Depends on structure",u:"Minimum ₹10 L. Only if you understand the strategy; most retirees don't need them."},
 {t:"other",n:"Reverse mortgage",r:"Monthly payments against your home",s:3,a:"You keep living in the home",x:"Payments tax-free",u:"When savings fall short and you own your home."},
 {t:"other",n:"54EC capital gains bonds",r:"About 5.25%",s:5,a:"5-year lock-in",x:"Saves capital gains tax on property, up to ₹50 L",u:"Only after selling property."},
 {t:"other",n:"NRE and FCNR deposits",r:"Bank rates; FCNR in foreign currency",s:4,a:"As FDs",x:"NRE interest tax-free only while NRI",u:"For NRIs; convert after returning."},
 {t:"avoid",n:"Endowment, money-back and ULIP policies",r:"Often 4–6% after costs",s:4,a:"Heavy exit penalties",x:"",u:"Mixing insurance and investing rarely suits retirees."},
 {t:"avoid",n:"Unrated NBFC FDs and unlisted bonds",r:"10–12% advertised",s:1,a:"May freeze if the company fails",x:"",u:"High rates pay for high risk; no deposit insurance."},
 {t:"avoid",n:"P2P lending, crypto, chit funds, 'guaranteed' schemes",r:"Promised, not delivered",s:0,a:"Often locked or lost",x:"",u:"Not for money you live on."},
 {t:"avoid",n:"PMS and AIFs sold by relationship managers",r:"Varies; high fees",s:2,a:"Lock-ins and exit loads",x:"",u:"Minimum ₹50 L to ₹1 Cr; fees often eat the extra return."},
 {t:"avoid",n:"Lending to relatives without paperwork",r:"—",s:1,a:"Often never returned",x:"",u:"If you must, give only what you can afford to lose."}
];
const TAGS=[["all","All"],["income","Regular income"],["safety","Emergency money"],["steady","Steady growth"],["growth","Beating inflation"],["fire","For early retirees"],["other","Special situations"],["avoid","Stay away"]];
let libTag="all";
function renderLib(){
  $("#libChips").innerHTML=TAGS.map(([k,l])=>`<button class="chip" data-tag="${k}" aria-pressed="${k===libTag}">${l}</button>`).join("");
  $("#libTable tbody").innerHTML=LIB.filter(p=>libTag==="all"||p.t===libTag).map(p=>`<tr class="${p.t==="avoid"?"avoid":""}"><td><b>${p.n}</b></td><td>${p.r}</td><td><span class="safety" aria-label="Safety ${p.s} of 5">${[1,2,3,4,5].map(k=>`<i class="${k<=p.s?"on":""}"></i>`).join("")}</span></td><td>${p.a}</td><td>${p.x||"—"}</td><td>${p.u}</td></tr>`).join("");
}

/* ================= glossary ================= */
const GLOSS=[
 ["Annuity","You pay an insurer a lump sum; it pays you a fixed income for life. 'Joint life' continues for your spouse."],
 ["Arbitrage fund","A low-risk fund that earns from small price differences; taxed like equity."],
 ["Balanced advantage fund","A fund that moves between shares and bonds depending on how expensive shares are."],
 ["Bucket strategy","Dividing savings by when you'll need the money: soon (safe), middle years (steady), later (growth)."],
 ["Clubbing","Income from money you give your spouse is taxed as your income."],
 ["Coast FIRE","Having enough saved that, without adding more, it will grow to your retirement need by 60."],
 ["Commutation","Taking part of a government pension as a lump sum; that part is restored after 15 years."],
 ["DA / dearness relief","Pension increases to match inflation, paid to government and defence pensioners."],
 ["DICGC","The deposit insurer. It covers up to ₹5 L per person per bank if the bank fails."],
 ["Direct plan","The version of a mutual fund with no distributor commission. Same fund, lower cost."],
 ["EPS","Employees' Pension Scheme: the pension part of EPF for private-sector employees."],
 ["Expense ratio","The yearly fee a fund charges, taken from your returns."],
 ["Family pension","Pension paid to a spouse after the pensioner dies."],
 ["FIRE","Financial independence, retire early: saving enough to stop working well before 60."],
 ["Form 15H / 15G","A declaration that stops the bank deducting tax on interest when your total tax is nil."],
 ["Guardrails","A rule to trim spending a little after bad market years, so money lasts longer."],
 ["Index fund","A fund that simply buys every share in an index like the Nifty 50. Low cost."],
 ["Inflation","The rise in prices each year. At 6%, prices double in about 12 years."],
 ["Liquid fund","A very safe fund for short-term money; you can withdraw by the next working day."],
 ["LTCG","Long-term capital gains: profit on investments held more than a year. Up to ₹1.25 L of equity gains is tax-free yearly."],
 ["Monte Carlo","Testing a plan against thousands of possible futures to see how often it works."],
 ["Nominee","The person who receives an account's money after death, on behalf of legal heirs."],
 ["POMIS","Post Office Monthly Income Scheme: government-backed, pays interest every month."],
 ["PPO","Pension Payment Order: the document that sets your pension and names who gets family pension."],
 ["Rebalancing","Moving money between buckets once a year to get back to your plan."],
 ["Reverse mortgage","A bank pays you monthly against your home; repaid by selling it after both of you die."],
 ["RNOR","Resident but not ordinarily resident: a tax status for returning NRIs that keeps foreign income untaxed for a few years."],
 ["SCSS","Senior Citizens Savings Scheme: government-backed, 8.2% now, interest every quarter."],
 ["Sequence risk","The danger of a market fall early in retirement, when withdrawals do the most damage."],
 ["STP","Systematic transfer plan: moving money from one fund to another in monthly steps."],
 ["Super top-up","Cheap extra health cover that pays only after a set amount has been spent in the year."],
 ["SWP","Systematic withdrawal plan: a fixed amount paid from a fund to your bank each month."],
 ["Target-maturity fund","A bond fund that ends on a set date, so its return is roughly known when you buy."],
 ["UPS","Unified Pension Scheme: an assured pension option for central government employees under NPS."],
 ["Withdrawal rate","How much of your savings you take out in a year, as a percentage."]
];
function renderGloss(q){q=(q||"").toLowerCase();$("#gloss").innerHTML=GLOSS.filter(g=>!q||(g[0]+" "+g[1]).toLowerCase().includes(q)).map(g=>`<div><dt>${g[0]}</dt><dd>${g[1]}</dd></div>`).join("")||`<p>No match. Try a shorter word.</p>`}

/* ================= calculators ================= */
const v=id=>parseFloat($("#"+id).value)||0;
const rv=name=>{const el=document.querySelector(`input[name="${name}"]:checked`);return el?el.value:null};
function applyBtn(id,label){return `<button type="button" class="btn small" data-apply="${id}" style="margin-top:12px">${label}</button>`}
const CALC={
 comm(){const basic=v("c_basic"),p=clamp(v("c_pct"),0,40)/100,f=v("c_factor"),ret=v("c_ret")/100;
   const cut=basic*p, lump=cut*12*f;
   let lo=0,hi=0.05;const pv=r=>cut*(1-Math.pow(1+r,-180))/r;for(let k=0;k<50;k++){const m=(lo+hi)/2;if(pv(m)>lump)lo=m;else hi=m}
   const irr=Math.pow(1+(lo+hi)/2,12)-1, good=ret>irr+0.003;
   this._apply=()=>{S.corpusL=Math.round(S.corpusL+lump/1e5);S.pension=Math.max(0,Math.round(S.pension-cut))};
   return `<p class="big">You get ${fmt(lump)} now, and your pension falls by ${fmt(cut)} a month for 15 years.</p>
   <p>Giving up that pension is like borrowing at <b>${pct(irr,1)}</b> a year. ${good?`You expect to earn ${pct(ret,1)} safely, which is more, so commuting is reasonable — if you will invest the money and not spend it.`:`You expect to earn ${pct(ret,1)}, which is less. Keeping the full pension is the better deal.`}</p>
   <div class="note">The lump sum is tax-free for government pensioners; the pension you give up would have been taxed. Dearness relief stays on the full pension. If you die within 15 years, the family pension is not reduced by commutation.</div>${applyBtn("comm",good?"Add to my plan":"Add to my plan anyway")}`},
 eps(){const sal=v("e_sal"),yrs=v("e_yrs"),age=clamp(v("e_age"),50,60);
   if(yrs<10)return `<p class="big">With less than 10 years of service there is no monthly pension.</p><p>You can take a one-time withdrawal benefit instead, based on your service and salary.</p>`;
   const svc=Math.min(yrs,35)+(yrs>=20?2:0);let pen=sal*svc/70;
   if(age<58)pen*=1-0.04*(58-age);else if(age>58)pen*=1+0.04*(age-58);pen=Math.max(1000,pen);
   this._apply=()=>{if(age<=S.age)S.pension=Math.round(S.pension+pen);else{S.laterInc=Math.round(pen);S.laterIncAge=age}};
   return `<p class="big">About ${fmt(pen)} a month from age ${age}.</p>
   <p>It doesn't rise with inflation. Your spouse gets about ${fmt(pen/2)} a month after your death.${yrs>=20?" Your 20+ years of service add two bonus years.":""}</p>
   <div class="note">If you applied for the higher pension option, your pensionable salary is your actual salary, not ₹15,000. Enter that instead.</div>${applyBtn("eps","Add to my plan")}`},
 epf(){const bal=v("f_bal")*1e5,mon=v("f_mon"),age=v("f_age"),wd=Math.min(58,Math.max(age,v("f_wd"))),r=v("f_rate")/100,y=wd-age;
   const fv=bal*Math.pow(1+r,y)+(r>0?mon*12*(Math.pow(1+r,y)-1)/r:mon*12*y);
   this._apply=()=>{if(wd<=S.age)S.corpusL=Math.round(S.corpusL+fv/1e5);else{S.laterL=Math.round(fv/1e5);S.laterAge=wd}};
   return `<p class="big">About ${fmt(fv)} at age ${wd}.</p>
   <p>EPF is a good place to keep money until then: ${pct(r,2)} a year, government-backed, and tax-free when withdrawn after five years of continuous service.</p>
   <div class="note">Interest on your own contributions above ₹2.5 L a year is taxable. An account stops earning interest once it becomes inoperative — usually three years after you leave work after age 55 — so withdraw it by then.</div>${applyBtn("epf","Add to my plan")}`},
 nps(){const c=v("n_corp")*1e5,gov=rv("n_type")==="gov",early=rv("n_when")==="early",ar=v("n_ann")/100;let lump,ann,txt;
   if(early){if(c<=5e5){lump=c;ann=0;txt="Your balance is ₹5 L or less, so you can take it all."}else{lump=c*.2;ann=c*.8;txt="Leaving before 60, at least 80% must buy an annuity. Waiting until 60 gives far more freedom."}}
   else if(c<=8e5){lump=c;ann=0;txt="Your balance is ₹8 L or less, so you can take it all."}
   else if(c<=12e5){lump=6e5;ann=c-6e5;txt="You can take up to ₹6 L; the rest is paid through systematic withdrawals or an annuity."}
   else{lump=c*(gov?.6:.8);ann=c-lump;txt=gov?"Government subscribers take up to 60% and use at least 40% for an annuity.":"Private subscribers can take up to 80% and must use at least 20% for an annuity."}
   const monthly=ann*ar/12;
   this._apply=()=>{if(S.age>=60||early){S.corpusL=Math.round(S.corpusL+lump/1e5);S.pension=Math.round(S.pension+monthly)}else{S.laterL=Math.round(lump/1e5);S.laterAge=60;S.laterInc=Math.round(monthly);S.laterIncAge=60}};
   return `<p class="big">${fmt(lump)} as a lump sum${ann?` and an annuity of about ${fmt(monthly)} a month`:""}.</p><p>${txt}</p>
   <div class="note">60% of the corpus taken as a lump sum is tax-free; check the tax on any amount above that. You can also stay invested and decide any time up to 85, or take the lump sum in instalments.</div>${applyBtn("nps","Add to my plan")}`},
 fire(){const e=v("x_exp")*12,age=v("x_age"),have=v("x_have")*1e5,sip=v("x_sip"),r=v("x_ret")/100,wr=parseFloat($("#x_wr").value)/100,inf=0.06;
   const target0=e/wr; let bal=have,m=0,need=target0;
   while(m<600){need=target0*Math.pow(1+inf,m/12);if(bal>=need)break;bal=bal*(1+r/12)+sip;m++}
   const yrs=m/12, toSixty=Math.max(1,60-age), coast=e*Math.pow(1+inf,toSixty)/wr/Math.pow(1+r,toSixty);
   return `<p class="big">Your FIRE number is ${fmt(target0)} in today's money — ${Math.round(1/wr)} times a year's expenses.</p>
   <p>${m>=600?"At this saving rate you won't get there; save more or plan a lower spend.":m===0?"You have reached it already.":`You could get there in about <b>${yrs.toFixed(1)} years</b>, at age ${Math.round(age+yrs)}, when it will be ${fmt(need)} in future rupees.`}</p>
   <p>Lean FIRE (30% less spending): ${fmt(target0*.7)}. Fat FIRE (50% more): ${fmt(target0*1.5)}.</p>
   <div class="note">${have>=coast?`<b>You have reached Coast FIRE.</b> Without saving another rupee, ${fmt(have)} should grow enough to retire at 60.`:`Coast FIRE (enough to stop saving and still retire at 60) needs ${fmt(coast)} today; you have ${fmt(have)}.`}</div>`},
 hc(){const metro=rv("h_city")==="metro",age=v("h_age"),have=v("h_have"),ped=$("#h_ped").checked,cg=$("#h_cghs").checked;
   const base=cg?0:metro?10:5, top=metro?50:25, total=base+top, gap=Math.max(0,total-have);
   this._apply=()=>{S.cover=Math.max(S.cover,total)};
   return `<p class="big">Aim for ${cg?"your CGHS/ECHS cover plus":`a ₹${base} L base policy and`} a ₹${top} L super top-up.</p>
   <p>${gap>0?`You are about ₹${gap} L short.`:"Your cover looks adequate."} A super top-up pays only after the base is used, so it costs much less than the same cover as a base policy.</p>
   <div class="note">${ped?"With existing illness, prefer policies with the shortest waiting period and no disease-wise limits; disclose everything honestly so claims aren't rejected. ":""}${age>=70?"At 70 or over, also get the free Ayushman Vay Vandana card (₹5 L a year). ":""}Check co-payment and room-rent limits before buying.</div>${applyBtn("hc","Use this cover in my plan")}`}
};
function runCalc(name){const out=$("#o_"+name);if(out)out.innerHTML=CALC[name].call(CALC[name])}
