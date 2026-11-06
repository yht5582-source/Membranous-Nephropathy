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
console.log(`${pass} passed, ${fail} failed`);process.exit(fail?1:0);
