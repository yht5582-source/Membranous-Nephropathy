// node tests.cjs — MN navigator engine + teaching data checks
const fs=require('fs');const h=fs.readFileSync(__dirname+'/index.html','utf8');
const eng=h.slice(h.indexOf('/*ENGINE-START*/'),h.indexOf('/*ENGINE-END*/'));
const m={exports:{}};new Function('module',eng)(m);const E=m.exports;
let pass=0,fail=0;const t=(name,c)=>{if(c)pass++;else{fail++;console.log('FAIL',name)}};
const R=o=>E.risk(Object.assign({egfr:90,prot:2,alb:3.6,pla:null,months:null,drop:'unknown',decline:'stable',severe:'no',method:'bcg'},o));
// KDIGO Figure 30
t('low: non-nephrotic + alb>3.0',R({}).key==='low');
t('low: 6 mo, drop >50%',R({prot:5,alb:2.8,months:6,drop:'yes'}).key==='low');
t('low: 6 mo, prot <3.5',R({prot:3,alb:2.9,months:7,drop:'no'}).key==='low');
t('pending: nephrotic <6 mo',R({prot:5,alb:2.8,months:3}).key==='pending');
t('pending: alb<2.5 at baseline is NOT high (needs 6-mo non-response)',R({prot:6,alb:2.2,months:2}).key==='pending');
t('pending: PLA2R 75 at baseline is NOT high',R({prot:6,alb:2.8,pla:75,months:1}).key==='pending');
t('pending early re-eval note',R({prot:9,alb:2.8,months:2}).notes.length===1);
t('moderate: 6 mo no drop, no markers',R({prot:5,alb:2.8,pla:30,months:6,drop:'no'}).key==='moderate');
t('high: 6 mo no drop + alb<2.5',R({prot:5,alb:2.4,months:6,drop:'no'}).key==='high');
t('high: 6 mo no drop + PLA2R>50',R({prot:5,alb:2.8,pla:51,months:6,drop:'no'}).key==='high');
t('moderate: PLA2R exactly 50',R({prot:5,alb:2.8,pla:50,months:6,drop:'no'}).key==='moderate');
t('high: eGFR<60',R({egfr:55}).key==='high');
t('high: prot>8 for >=6 mo',R({prot:9,alb:2.8,months:6,drop:'yes'}).key==='high');
t('not high: prot>8 at 2 mo',R({prot:9,alb:2.8,months:2}).key==='pending');
t('high: persistent decline',R({decline:'fall'}).key==='high');
t('very: rapid',R({decline:'rapid'}).key==='very');
t('very: severe',R({severe:'yes',egfr:30}).key==='very');
t('error: alb 0',!!R({alb:0}).error);t('error: negative',!!R({prot:-1}).error);t('error: missing',!!R({egfr:null}).error);
// Figure 38
t('thrombo bcg 2.4 vte',E.thrombo(2.4,'bcg').level==='vte');t('thrombo bcp 2.4 ate',E.thrombo(2.4,'bcp').level==='ate');
t('thrombo bcp 1.9 vte',E.thrombo(1.9,'bcp').level==='vte');t('thrombo bcg 3.1 ate',E.thrombo(3.1,'bcg').level==='ate');
t('thrombo bcg 3.3 none',E.thrombo(3.3,'bcg')===null);t('thrombo bcp 3.0 none',E.thrombo(3.0,'bcp')===null);
// response
const S=o=>E.response(Object.assign({base:8,now:2,alb:null,baseAb:null,nowAb:null,months:null,kidney:'stable'},o));
t('PR',S({}).key==='PR');t('CR',S({now:0.2,alb:3.8}).key==='CR');t('CR? without alb',S({now:0.2}).key==='CR?');
t('NR <50%',S({now:5}).key==='NR');t('NA kidney unknown',S({now:2,kidney:'unknown'}).key==='NA');t('NR falling',S({kidney:'fall'}).key==='NR');
t('increase reported as rise',S({now:10}).cut<0);
t('immuno remission <2',S({baseAb:180,nowAb:1}).immuno.remission);
t('immuno rising text',S({baseAb:20,nowAb:60}).immuno.rising&&/上升/.test(S({baseAb:20,nowAb:60}).immuno.text));
t('immuno base 0',/無法計算/.test(S({baseAb:0,nowAb:0}).immuno.text));
t('response error',!!S({base:0}).error);
// v1.6: KDIGO Figure 33/34/35
t('fig33 none without nowAb',S({}).fig33===null);
t('fig33 rtx absent',/不需追加/.test(S({baseAb:180,nowAb:1,regimen:'rituximab',months:6}).fig33.text));
t('fig33 rtx low',S({baseAb:180,nowAb:30,regimen:'rituximab',months:6}).fig33.state==='low');
t('fig33 not low if not decreased',S({baseAb:20,nowAb:30,regimen:'rituximab'}).fig33.state==='present');
t('fig33 cyc present adds rtx',/改加 rituximab/.test(S({baseAb:180,nowAb:120,regimen:'cyc',months:6}).fig33.text));
t('fig33 cni low continue',/續用 6 個月/.test(S({baseAb:100,nowAb:40,regimen:'cni',months:6}).fig33.text));
t('fig33 <6 mo conditional',/尚未滿 6 個月/.test(S({baseAb:100,nowAb:40,regimen:'cni',months:3}).fig33.text));
t('fig33 no regimen prompt',/選擇初始治療/.test(S({baseAb:100,nowAb:40}).fig33.text));
t('fig33 boundary 2 is not absent',S({baseAb:100,nowAb:2}).fig33.state==='low');
t('fig34 resistant note',S({now:3,alb:2.8}).notes.some(n=>/Figure 34/.test(n)));
t('fig34 no note when alb normal',S({now:3,alb:3.8}).notes.length===0);
t('fig34 no note when prot <2',S({now:1.5,alb:2.8}).notes.length===0);
t('fig35 FSGS note',S({now:5,alb:3.4,baseAb:100,nowAb:1}).notes.some(n=>/Figure 35/.test(n)));
t('PR text alb normal',/白蛋白已正常化/.test(S({alb:3.8}).clinical));
t('no unverified 3-week claim',!h.includes('≥3 週'));
t('id regimen',h.includes('id="regimen"'));
// NHI wording (115/10/22 rules: MN not listed; 9.20 is oncology)
t('nhi no 9.20 listing claim',!h.includes('9.20 節列舉'));
t('nhi states MN not listed',h.includes('MN 未列入給付規定'));
t('version v1.6',h.includes('v1.6 · 9 CASES'));
// teaching data
const CASES=JSON.parse(h.match(/^const CASES=(\[.*\]);$/m)[1]);const EX=JSON.parse(h.match(/^const EXAMS=(\{.*\});$/m)[1]);
t('9 cases',CASES.length===9);t('10+10 questions',EX.resident.length===10&&EX.attending.length===10);
CASES.forEach((c,i)=>t('case '+i+' answer in range',c.correct>=0&&c.correct<c.options.length));
[...EX.resident,...EX.attending].forEach((q,i)=>t('q'+i+' valid',q[2]>=0&&q[2]<q[1].length&&q[3]));
const dist=a=>{const d=[0,0,0];a.forEach(x=>d[x]++);return Math.max(...d)-Math.min(...d)};
t('case answers balanced',dist(CASES.map(c=>c.correct))<=1);t('resident balanced',dist(EX.resident.map(q=>q[2]))<=1);t('attending balanced',dist(EX.attending.map(q=>q[2]))<=1);
// UI wiring ids exist
['egfr','protein','albumin','pla','months','drop','albmethod','decline','severe','to-therapy','trisk','basep','newp','newalb','baseab','newab','time','kidney'].forEach(id=>t('id '+id,h.includes('id="'+id+'"')));
t('no stale persistent id',!h.includes('id="persistent"'));
// ---- plan(): KDIGO Fig 31/32/33/34/35 + Fig 14
const P=o=>E.plan(Object.assign({egfr:90,prot:6,alb:2.8,pla:30,months:6,drop:'no',decline:'stable',severe:'no',method:'bcg',phase:'naive',prior:'rituximab',etiology:'primary',weight:70,hbv:'neg',fertility:'no',cycPrior:0,pregnant:'no',infection:'no',diabetes:'no',leukopenia:'no'},o));
const ids=r=>r.options.map(o=>o.id);const top=r=>r.options[0].id;
t('plan error passthrough',!!P({alb:0}).error);
t('plan pending -> watch only',ids(P({months:2,drop:'unknown'})).join()==='watch');
t('plan low -> watch only',ids(P({prot:2,alb:3.6})).join()==='watch');
t('plan low: no IS pre-checks',!P({prot:2,alb:3.6}).pre.some(x=>/TMP-SMX/.test(x)));
t('plan moderate: rtx, cni, watch',ids(P({})).sort().join()==='cni,rtx,watch');
t('plan moderate top rtx',top(P({}))==='rtx');
t('plan high normal eGFR top rtx',top(P({alb:2.2}))==='rtx');
t('plan high has cyc + cnirtx',['cyc','cnirtx'].every(i=>ids(P({alb:2.2})).includes(i)));
t('plan high low eGFR top cyc',top(P({egfr:45}))==='cyc');
t('plan high falling top cyc',top(P({decline:'fall'}))==='cyc');
t('plan high low eGFR cnirtx cautious',P({egfr:45}).options.find(o=>o.id==='cnirtx').rank===3);
t('plan very top cyc',top(P({decline:'rapid'}))==='cyc');
t('plan very stop alert',P({decline:'rapid'}).alerts.some(a=>a.k==='stop'));
// Fig 32 doses
const cyc=P({egfr:90,weight:80,decline:'rapid'}).options.find(o=>o.id==='cyc');
t('cyc 80kg cyclical cum 18 g (KDIGO example)',cyc.cum===18);t('cyc 80kg continuous cum 21.6 g',cyc.cumC===21.6);
t('cyc dose 200 mg/d at 80 kg',cyc.dose.some(d=>/200 mg\/d/.test(d)));
const cycH=P({egfr:40,weight:80,decline:'rapid'}).options.find(o=>o.id==='cyc');
t('cyc halved eGFR<50',cycH.cum===9&&cycH.dose.some(d=>/100 mg\/d/.test(d)));
t('cyc no weight -> mg/kg only',P({weight:null,decline:'rapid'}).options.find(o=>o.id==='cyc').cum===null);
const tac=P({weight:60}).options.find(o=>o.id==='cni');
t('tac 60 kg 3-6 mg/d',tac.dose.some(d=>/約 3–6 mg\/d/.test(d)));t('csa 60 kg 210 mg/d',tac.dose.some(d=>/約 210 mg\/d/.test(d)));
t('tac trough 3-8',tac.dose.some(d=>/3–8 ng\/mL/.test(d)));t('csa trough 125-225',tac.dose.some(d=>/125–225/.test(d)));
t('cni 4-month withdrawal rule',tac.taper.some(d=>/第 4 個月無反應/.test(d)));
t('rtx 1 g x2',P({}).options.find(o=>o.id==='rtx').dose[0].includes('1 g IV'));
// cumulative caps
t('fertility 80kg cyc 18 g >10 -> avoid',P({weight:80,fertility:'yes',decline:'rapid'}).options.find(o=>o.id==='cyc').rank===9);
t('fertility excluded cyc promotes rtx',top(P({weight:80,fertility:'yes',decline:'rapid'}))==='rtx');
t('prior 20 g + 18 g >36 -> avoid',P({weight:80,cycPrior:20,decline:'rapid'}).options.find(o=>o.id==='cyc').rank===9);
t('prior 10 g + 18 g >25 caution',P({weight:80,cycPrior:10,decline:'rapid'}).options.find(o=>o.id==='cyc').cautions.some(c=>/25 g/.test(c)));
t('fertility small dose allowed',P({weight:40,fertility:'yes',decline:'rapid'}).options.find(o=>o.id==='cyc').rank===1);
t('pregnant cyc avoid',P({pregnant:'yes',decline:'rapid'}).options.find(o=>o.id==='cyc').rank===9);
t('last rank 9 sorted last',(r=>r.options[r.options.length-1].rank===9)(P({pregnant:'yes',egfr:45})));
// safety alerts
t('HBsAg+ warn',P({hbv:'chronic'}).alerts.some(a=>/entecavir/.test(a.t)));
t('anti-HBc+ rtx caution',P({hbv:'past'}).options.find(o=>o.id==='rtx').cautions.length>0);
t('HBV unknown warn',P({hbv:'unknown'}).alerts.some(a=>/HBV 篩檢/.test(a.t)));
t('infection stop',P({infection:'yes'}).alerts.some(a=>a.k==='stop'));
t('secondary -> watch only + stop',ids(P({etiology:'secondary',alb:2.2})).join()==='watch'&&P({etiology:'secondary'}).alerts[0].k==='stop');
t('diabetes cni caution',P({diabetes:'yes'}).options.find(o=>o.id==='cni').cautions.some(c=>/cyclosporine/.test(c)));
// Fig 34 relapse
t('relapse after rtx -> rtx',ids(P({phase:'relapse',prior:'rituximab'})).join()==='rtx');
t('relapse after cni -> rtx first',top(P({phase:'relapse',prior:'cni'}))==='rtx'&&ids(P({phase:'relapse',prior:'cni'})).includes('cnirtx'));
t('relapse after cyc -> rtx, cyc, cnirtx',ids(P({phase:'relapse',prior:'cyc'})).sort().join()==='cnirtx,cyc,rtx');
// Fig 35 resistant
t('resistant rtx stable -> cnirtx first',top(P({phase:'resistant',prior:'rituximab'}))==='cnirtx');
t('resistant rtx falling -> cyc',top(P({phase:'resistant',prior:'rituximab',decline:'fall'}))==='cyc');
t('resistant cni stable -> rtx',top(P({phase:'resistant',prior:'cni'}))==='rtx');
t('resistant cyc stable -> rtx',top(P({phase:'resistant',prior:'cyc'}))==='rtx');
t('resistant both -> expert',top(P({phase:'resistant',prior:'both'}))==='expert');
// Fig 14 / follow-up
const pm=P({});t('pre has PJP',pm.pre.some(x=>/TMP-SMX/.test(x)));t('pre has Shingrix',pm.pre.some(x=>/Shingrix/.test(x)));t('pre has TB',pm.pre.some(x=>/結核/.test(x)));
t('follow-up 6 month PLA2R step',pm.followup.some(f=>f[0]==='第 6 個月'&&/Fig 33/.test(f[1])));
t('supportive thrombo when alb low',P({alb:2.2}).supportive.some(x=>/預防性抗凝/.test(x)));
t('every option has dose/taper/monitor',[P({}),P({decline:'rapid'}),P({phase:'resistant',prior:'both'})].every(r=>r.options.every(o=>o.dose.length&&o.taper.length&&o.monitor.length&&o.rankText)));
['plan','p-run','p-print','p-import','p-phase','p-prior','p-weight','p-hbv','p-cycprior','planout'].forEach(id=>t('plan id '+id,h.includes('id="'+id+'"')));
t('plan tab button',h.includes('data-tab="plan"'));
console.log(`${pass} passed, ${fail} failed`);process.exit(fail?1:0);
