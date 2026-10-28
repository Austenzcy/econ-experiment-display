'use strict';
const D=window.TRUST_DATA;
const C={E:'#087f8c',M:'#ce7255',ink:'#173348',muted:'#657681',paper:'#faf8f3',grid:'#e2e5e3'};
const fmt=(v,n=2)=>Number(v).toFixed(n);
const sign=(v,n=2)=>(v>=0?'+':'−')+fmt(Math.abs(v),n);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const txt=(x,y,s,cls='',fill='',anchor='start',extra='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}" ${fill?`style="fill:${fill}"`:''} ${extra}>${esc(s)}</text>`;
const line=(x1,y1,x2,y2,cls='',extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" ${extra}/>`;
const svg=(w,h,s,label)=>`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}">${s}</svg>`;
const at=(x,y,w,h,html,cls='')=>`<div class="at ${cls}" style="left:${x}px;top:${y}px;width:${w}px;${h?`height:${h}px;`:''}">${html}</div>`;
const fig=(x,y,w,h,html)=>at(x,y,w,h,html,'figure');
const legend=()=>'<div class="legend"><span><i class="e"></i>E 提前交流</span><span><i class="m"></i>M 中途交流</span></div>';
const commonLegend=(x=1350,y=252)=>at(x,y,480,30,legend());
const note=(s,small=false,y=917)=>`<div class="note ${small?'small':''}" style="top:${y}px">${s}</div>`;
let slideList=[];
function slide(title,sub,body,chapter='研究结果',cls=''){
 const n=slideList.length+1;
 slideList.push(`<section class="slide ${cls}" id="slide-${n}" data-slide="${n}" data-title="${esc(title)}" aria-label="第${n}页 ${esc(title)}"><div class="eyebrow">信任博弈实验　 /　 ${chapter}</div><h1>${title}</h1>${sub?`<p class="subtitle">${sub}</p>`:''}<div class="fade">${body}</div><div class="footer"><span>实验经济学课程 · 2026.10　　${n===1?'十轮匿名固定搭档实验':'数据：2026-10-26导出 · 主样本E 10对 / M 9对（另注明除外）'}</span><span class="no">${String(n).padStart(2,'0')} / 16</span></div></section>`);
}
function mark(x,y,g,r=6,extra=''){
 return g==='E'?`<circle cx="${x}" cy="${y}" r="${r}" fill="${C[g]}" ${extra}/>`:`<path d="M ${x} ${y-r-1} L ${x+r+1} ${y} L ${x} ${y+r+1} L ${x-r-1} ${y} Z" fill="${C[g]}" ${extra}/>`;
}
function lineChart({w=840,h=590,metric='x',title='',ymax=6.3,yticks=[0,1,2,3,4,5,6],unit='点',percent=false,source=D.rounds,endpoint=false,compact=false}){
 const p={l:compact?65:85,r:endpoint?110:35,t:80,b:78};
 const X=n=>p.l+(n-1)/9*(w-p.l-p.r),Y=v=>h-p.b-v/ymax*(h-p.t-p.b);
 let s=txt(0,28,title,'chart-title')+txt(p.l-10,62,unit,'axis-label','', 'end');
 s+=`<rect x="${X(5.5)}" y="${p.t}" width="${X(10)-X(5.5)}" height="${h-p.b-p.t}" fill="#edf0eb" opacity=".48"/>`;
 yticks.forEach(v=>{s+=line(p.l,Y(v),w-p.r,Y(v),'grid')+txt(p.l-17,Y(v)+8,percent?Math.round(v*100)+'%':v,'tick','','end');});
 s+=line(p.l,h-p.b,w-p.r,h-p.b,'axis');
 for(let r=1;r<=10;r++){s+=txt(X(r),h-p.b+36,'R'+r,'tick','','middle');}
 s+=line(X(5.5),p.t,X(5.5),h-p.b,'boundary')+txt(X(5.5)+12,p.t+27,'R5后','chart-note');
 for(const g of ['E','M']){
  const f=source.filter(z=>z.group===g).sort((a,b)=>a.round-b.round);
  const path=f.map((z,i)=>(i?'L':'M')+X(z.round)+','+Y(z[metric])).join(' ');
  s+=`<g class="line-reveal"><path class="plot-line" d="${path}" stroke="${C[g]}" ${g==='M'?'stroke-dasharray="11 5"':''}/></g>`;
  for(const z of f){s+=`<g class="round-point" style="--delay:${(z.round-1)*95}ms">`+mark(X(z.round),Y(z[metric]),g,6,`class="dot points" data-tip="${esc(g+'组 R'+z.round+'\n'+title+'：'+(percent?fmt(z[metric]*100,2)+'%':fmt(z[metric],3)+' '+unit))}"`)+`</g>`;}
  if(endpoint){let z=f[9],other=source.find(z=>z.group!==g&&z.round===10),high=z[metric]>=other[metric],close=Math.abs(Y(z[metric])-Y(other[metric]))<32;s+=`<g class="round-point" style="--delay:855ms">`+txt(X(10)+14,Y(z[metric])+(close?(high?-12:24):8),percent?fmt(z[metric]*100,1)+'%':fmt(z[metric],2),'data-label',C[g])+`</g>`;}
 }
 s+=txt(w-p.r,h-8,'轮次','axis-label','','end');
 return svg(w,h,s,title+'，E与M各十轮均值');
}
function histogram(){
 const w=930,h=540,p={l:80,r:30,t:70,b:90}; const X=x=>p.l+x/6*(w-p.l-p.r-50)+25,Y=v=>h-p.b-v/100*(h-p.t-p.b);
 let s=txt(0,28,'十轮转出分布','chart-title')+txt(p.l,60,'组内记录占比','axis-label');
 for(const t of [0,20,40,60,80,100])s+=line(p.l,Y(t),w-p.r,Y(t),'grid')+txt(p.l-15,Y(t)+8,t+'%','tick','','end');
 for(const x of [0,1,2,3,4,5,6]){
  for(const [i,g] of ['E','M'].entries()){
   const d=D.distribution.find(v=>v.group===g&&v.x===x);const xx=X(x)+(i===0?-26:3);
   s+=`<rect x="${xx}" y="${Y(d.pct)}" width="24" height="${Y(0)-Y(d.pct)}" fill="${C[g]}" opacity=".88" class="dot" data-tip="${g}组 x=${x}：${d.n}条（${fmt(d.pct,1)}%）"/>`;
   if(x===6)s+=txt(xx+12,Y(d.pct)-13,fmt(d.pct,1)+'%','data-label',C[g],'middle');
  }s+=txt(X(x),h-p.b+36,x,'tick','','middle');
 }s+=line(p.l,Y(0),w-p.r,Y(0),'axis')+txt(w-p.r,h-17,'A转出 x（点）','axis-label','','end');
 return svg(w,h,s,'A转出点数的组内频数分布，E100条、M90条');
}
function pairStrip({w=720,h=390,title='每对搭档后五轮平均转出',data=D.post_pairs}){
 const p={l:80,r:42,t:90,b:65};const X=v=>p.l+v/6*(w-p.l-p.r);let s=txt(0,28,title,'chart-title');
 for(const [j,g] of ['E','M'].entries()){
  let y=p.t+65+j*140; s+=line(p.l,y,w-p.r,y,'grid')+txt(2,y+8,g+'组','metric',C[g]);
  const f=data.filter(z=>z.group===g);const sorted=[...f].sort((a,b)=>a.mean_x-b.mean_x);let counts={};
  for(const z of sorted){let key=z.mean_x.toFixed(5);counts[key]=(counts[key]||0)+1;let total=f.filter(v=>Math.abs(v.mean_x-z.mean_x)<1e-8).length;let yy=y+(counts[key]-1-(total-1)/2)*16;
   s+=mark(X(z.mean_x),yy,g,7,`class="dot" data-tip="${z.pair}：${fmt(z.mean_x,2)}点"`);
  }
  const mean=f.reduce((sum,z)=>sum+z.mean_x,0)/f.length;
  s+=txt(p.l,y-56,`n=${f.length}对 · 均值 ${fmt(mean,2)}点`,'chart-note',C[g]);
 }
 const y=h-p.b;s+=line(p.l,y,w-p.r,y,'axis');for(let t=0;t<=6;t++)s+=txt(X(t),y+34,t,'tick','','middle');
 s+=txt(w-p.r,h-2,'点 / 搭档（R6—R10均值）','axis-label','','end');
 return svg(w,h,s,title+'，一个点是一对搭档');
}
function ciChart({w=770,h=380,items=[D.primary],labels=false}){
 const p={l:labels?350:60,r:70,t:70,b:70};const min=-1.7,max=2.05;
 const X=v=>p.l+(v-min)/(max-min)*(w-p.l-p.r);let s='';
 const height=h-p.t-p.b;
 for(const t of [-1.5,-1,-.5,0,.5,1,1.5,2]){
  s+=line(X(t),p.t-20,X(t),h-p.b,'grid',t===0?'style="stroke:#728692;stroke-width:1.7"':'');
  s+=txt(X(t),h-p.b+37,t===0?'0':t.toFixed(1),'tick','','middle');
 }
 items.forEach((z,i)=>{const y=p.t+(i+.5)*height/items.length;
  s+=line(X(z.ci[0]),y,X(z.ci[1]),y,'',`stroke="${i===1?C.M:C.E}" stroke-width="4"`);
  for(const a of z.ci)s+=line(X(a),y-10,X(a),y+10,'',`stroke="${i===1?C.M:C.E}" stroke-width="3"`);
  s+=`<circle cx="${X(z.delta)}" cy="${y}" r="9" fill="${i===1?C.M:C.E}" stroke="${C.paper}" stroke-width="2"/>`;
  s+=txt(X(z.delta),y-22,sign(z.delta,3),'data-label',C.ink,'middle');
  if(labels){s+=txt(0,y-8,z.label,'axis-label',C.ink)+txt(0,y+26,`E ${z.E_n}对 / M ${z.M_n}对`,'chart-note');}
 });
 s+=txt(w-p.r,h-5,'E − M（点）','axis-label','','end');
 return svg(w,h,s,'搭档层面均值差与95% Welch参考区间');
}
function heatmap(metric,title,max){
 const w=854,h=610,left=88,top=60,cw=62,rh=26.5,groupgap=12,heatw=620;
 const pairs=[...new Set(D.observations.map(v=>v.pair))].sort();let s=txt(0,27,title,'chart-title');
 const Y=i=>top+i*rh+(i>=10?groupgap:0);
 const hh=19*rh+groupgap;
 s+=`<defs><linearGradient id="grad-${metric}" x1="0" x2="0" y1="1" y2="0">${D.blues.filter((c,i)=>i%17===0).map((c,i)=>`<stop offset="${i/15*100}%" stop-color="${c}"/>`).join('')}</linearGradient></defs>`;
 for(let r=1;r<=10;r++){
  s+=`<g class="heat-column" style="--delay:${(r-1)*90}ms">`;
  pairs.forEach((pair,i)=>{
   const z=D.observations.find(z=>z.pair===pair&&z.round===r),v=z[metric],col=v===null?'#d1d5db':D.blues[Math.min(255,Math.max(0,Math.round(v/max*255)))];
   s+=`<rect class="heat-cell" x="${left+(r-1)*cw}" y="${Y(i)}" width="${cw+.2}" height="${rh+.2}" fill="${col}" data-tip="${pair} · R${r}\n${metric==='x'?'转出 x：'+v+'点':v===null?'x=0，返还比例无定义':'实际返还比例：'+fmt(v*100,2)+'%'}"/>`;
  });s+='</g>';
  s+=txt(left+(r-.5)*cw,top+hh+33,'R'+r,'tick','','middle');
 }
 pairs.forEach((pair,i)=>s+=txt(left-14,Y(i)+rh/2+8,pair,'heat-label',pair[0]==='E'?C.E:C.M,'end'));
 s+=line(left,Y(10)-groupgap/2,left+heatw,Y(10)-groupgap/2,'',`stroke="#8da1a7" stroke-width="1.4"`);
 s+=line(left+5*cw,top,left+5*cw,top+hh,'',`stroke="#d29451" stroke-width="2.5" stroke-dasharray="7 6"`);
 s+=line(left,top,left,top+hh,'axis')+line(left,top+hh,left+heatw,top+hh,'axis');
 const barX=left+heatw+37,barY=top+45,barH=360;
 s+=`<rect x="${barX}" y="${barY}" width="22" height="${barH}" fill="url(#grad-${metric})" stroke="#b8c1c5" stroke-width=".7"/>`;
 for(let i=0;i<=max;i+=(max===6?1:.2)){const y=barY+barH*(1-i/max);s+=line(barX+22,y,barX+29,y,'axis')+txt(barX+34,y+8,max===6?i:Math.round(i*100)+'%','tick');}
 s+=txt(left+heatw,top+hh+64,'轮次','axis-label','','end');
 return svg(w,h,s,title+'；19对搭档逐轮热力图，行序为E01至E10、M02至M09和M11');
}
function slopeReturn(){
 const w=910,h=560,top=70,bottom=480,Y=v=>bottom-v/10*(bottom-top),slopeX={E:[150,360],M:[590,800]};let s=txt(0,28,'每对搭档的实际返还','chart-title');
 for(const t of [0,3,6,9])s+=line(75,Y(t),880,Y(t),'grid')+txt(58,Y(t)+7,t,'tick','','end');
 s+=txt(62,59,'点','axis-label','','end');
 for(const g of ['E','M']){
  const [x0,x1]=slopeX[g];const f=D.last.filter(z=>z.group===g);
  for(const z of f){let stroke=z.dr<0?'3':'2';s+=line(x0,Y(z.r9),x1,Y(z.r10),'',`stroke="${C[g]}" stroke-width="${stroke}" opacity=".32"`);for(const [x,v] of [[x0,z.r9],[x1,z.r10]])s+=mark(x,Y(v),g,4,`opacity=".65" class="dot" data-tip="${z.pair}：${z.r9} → ${z.r10}点"`);}
  const a=f.reduce((s,z)=>s+z.r9,0)/f.length,b=f.reduce((s,z)=>s+z.r10,0)/f.length;
  s+=line(x0,Y(a),x1,Y(b),'',`stroke="${C[g]}" stroke-width="6"`)+mark(x0,Y(a),g,9)+mark(x1,Y(b),g,9);
  s+=txt(x0-13,Y(a)-18,fmt(a,2),'data-label',C[g],'end')+txt(x1+15,Y(b)+9,fmt(b,2),'data-label',C[g]);
  s+=txt(x0,bottom+35,'R9','tick','','middle')+txt(x1,bottom+35,'R10','tick','','middle')+txt((x0+x1)/2,bottom+77,g+'组','metric',C[g],'middle');
 }
 return svg(w,h,s,'细线为单对实际返还、粗线为组均值的R9至R10变化');
}
function payoffBars(){
 const w=740,h=540,left=115,right=35,top=110;const X=v=>left+v/20*(w-left-right);let s=txt(0,28,'E组：每轮平均收益的分配','chart-title');
 s+=`<rect x="0" y="55" width="23" height="16" fill="${C.E}"/>`+txt(33,72,'A收益','chart-note',C.E)+`<rect x="155" y="55" width="23" height="16" fill="${C.E}" opacity=".26"/>`+txt(188,72,'B收益','chart-note');
 for(const [i,r] of [9,10].entries()){
  let z=D.rounds.find(z=>z.group==='E'&&z.round===r),y=top+i*145;
  s+=txt(0,y+45,'R'+r,'metric',C.ink)+`<rect x="${left}" y="${y}" width="${X(z.A)-left}" height="70" fill="${C.E}"/><rect x="${X(z.A)}" y="${y}" width="${X(z.B)-left}" height="70" fill="${C.E}" opacity=".26"/>`;
  s+=txt((left+X(z.A))/2,y+45,fmt(z.A,1),'metric','#ffffff','middle')+txt(X(z.A)+(X(z.B)-left)/2,y+45,fmt(z.B,1),'metric',C.E,'middle')+txt(X(z.A+z.B)+14,y+46,fmt(z.A+z.B,1),'metric',C.ink);
 }
 for(const v of [0,5,10,15,20])s+=txt(X(v),365,v,'tick','','middle');
 s+=line(left,332,w-right,332,'axis')+txt(w-right,405,'点 / 搭档','axis-label','','end');
 s+=txt(0,461,'A转出均值保持5.30点','metric')+txt(0,506,'总收益16.60点不变，B份额上升','axis-label');
 return svg(w,h,s,'E组A与B的平均收益：R9为8.7和7.9，R10为5.2和11.4');
}
function historyChart(){
 const w=1030,h=570,p={l:100,r:80,t:75,b:85};const X=v=>p.l+v/6*(w-p.l-p.r),Y=v=>h-p.b-(v+60)/70*(h-p.t-p.b);let s=txt(0,28,'前五轮转出与末轮返还比例变化','chart-title');
 for(const t of [-50,-25,0])s+=line(p.l,Y(t),w-p.r,Y(t),'grid',t===0?'style="stroke:#95a8ae;stroke-dasharray:6 5"':'')+txt(p.l-18,Y(t)+8,t+'','tick','','end');
 s+=txt(p.l,61,'R9→R10返还比例变化（百分点）','axis-label');
 for(let t=0;t<=6;t++)s+=txt(X(t),h-p.b+35,t,'tick','','middle');
 s+=line(p.l,h-p.b,w-p.r,h-p.b,'axis')+txt(w-p.r,h-10,'每对R1—R5平均转出 x（点）','axis-label','','end');
 const seen={};D.last.filter(z=>z.both_positive).forEach(z=>{let key=z.early_x+':'+z.drr;seen[key]=(seen[key]||0)+1;let offset=seen[key]===1?0:(seen[key]-1)*6;
  const y=Y(z.drr*100);s+=mark(X(z.early_x)-offset,y-offset*.3,z.group,8,`opacity=".75" class="dot" data-tip="${z.pair}\n前五轮平均x=${fmt(z.early_x,2)}\n末轮返还比例变化=${sign(z.drr*100,2)}个百分点"`);
 });
 s+=txt(X(6)-25,Y(-50)+33,'E01 / E04 / E10','chart-note',C.E,'end')+txt(X(6)-25,Y(0)-20,'E03 / E05 / E06 / E09','chart-note',C.E,'end');
 return svg(w,h,s,'17对两轮均正转出的搭档，前期投入与末轮返还比例变化');
}
function casesChart(){
 const w=665,h=570;const left=155,right=45,X=v=>left+v/100*(w-left-right);let s=txt(0,28,'三名B的终局提交与返还','chart-title')+txt(0,70,'空心：R9　实心：R10','chart-note');
 for(const t of [0,30,60,90])s+=line(X(t),100,X(t),480,'grid')+txt(X(t),517,t,'tick','','middle');
 D.cases.forEach((z,i)=>{const y=145+i*145;s+=txt(0,y,z.account,'metric',C.E)+txt(0,y+36,`${z.r9} → ${z.r10}点`,'axis-label');s+=line(X(z.delay9),y,X(z.delay10),y,'',`stroke="${C.E}" stroke-width="3"`)+`<circle cx="${X(z.delay9)}" cy="${y}" r="8" fill="${C.paper}" stroke="${C.E}" stroke-width="3"/><circle cx="${X(z.delay10)}" cy="${y}" r="8" fill="${C.E}"/>`;
 s+=txt(left,y-25,`${fmt(z.delay9,1)} → ${fmt(z.delay10,1)}秒`,'data-label',C.ink);});
 s+=txt(w-right,559,'提交耗时（秒）','axis-label','','end');return svg(w,h,s,'B101、B104、B102的R9与R10提交耗时和返还点数');
}
function scatter(key,w=835,h=330){
 const c=D.correlations[key];const ratio=key==='rates';const xmax=c.x==='x'?6:ratio?1:10,ymax=ratio?1:10;
 const names={x:'A转出 x（点）',e:'A预期返还 e（点）',r:'B实际返还 r（点）',er:'预期返还比例 e/(3x)',rr:'实际返还比例 r/(3x)'};
 const titles={xe:'转出与预期',xr:'转出与实际返还',er:'预期与实际返还',rates:'预期比例与实际比例'};
 const p={l:88,r:38,t:70,b:55};const X=v=>p.l+v/xmax*(w-p.l-p.r),Y=v=>h-p.b-v/ymax*(h-p.t-p.b);
 let s=txt(0,25,titles[key],'chart-title')+txt(w,25,`Pearson ${fmt(c.pearson,3)} · n=${c.n}`,'chart-note',C.ink,'end');
 const yt=ratio?[0,.5,1]:[0,5,10],xt=ratio?[0,.5,1]:c.x==='x'?[0,1,2,3,4,5,6]:[0,2,4,6,8,10];
 yt.forEach(t=>s+=line(p.l,Y(t),w-p.r,Y(t),'grid')+txt(p.l-17,Y(t)+8,ratio?Math.round(t*100)+'%':t,'tick','','end'));
 xt.forEach(t=>s+=txt(X(t),h-p.b+31,ratio?Math.round(t*100)+'%':t,'tick','','middle'));
 s+=txt(p.l,56,names[c.y],'axis-label');
 s+=line(p.l,h-p.b,w-p.r,h-p.b,'axis')+txt(w-p.r,h-1,names[c.x],'axis-label','','end');
 const obs=D.observations.filter(z=>z[c.x]!==null&&z[c.y]!==null).sort((a,b)=>a.round-b.round||a.pair.slice(1)-b.pair.slice(1)||a.group.localeCompare(b.group));
 if(key==='rates'||key==='er')s+=line(X(0),Y(0),X(xmax),Y(ymax),'boundary');
 if(key==='xe'||key==='xr')s+=line(X(0),Y(0),X(ymax/3),Y(ymax),'boundary');
 const count={};
 for(const z of obs){
  const k=z[c.x]+','+z[c.y];const n=count[k]||0;count[k]=n+1;
  // Deterministic sub-pixel-to-7px jitter separates coincident observations for display only.
  const angle=n*2.399963229728653,rad=n===0?0:Math.min(7,1.1*Math.sqrt(n));
  const xx=X(z[c.x])+Math.cos(angle)*rad,yy=Y(z[c.y])+Math.sin(angle)*rad;
  s+=mark(xx,yy,z.group,4.3,`class="dot scatter-point" opacity=".48" data-x="${z[c.x]}" data-y="${z[c.y]}" data-tip="${esc(z.pair+' · R'+z.round+'\n'+names[c.x]+'：'+fmt(z[c.x],3)+'\n'+names[c.y]+'：'+fmt(z[c.y],3))}"`);
 }
 return svg(w,h,s,`${titles[key]}，${c.n}条真实观测，Pearson相关${fmt(c.pearson,3)}`);
}

// Slide 1
slide('交流时点与<br>信任博弈中的合作行为','匿名固定搭档实验 · 数据分析汇报',
 at(98,590,820,90,'10轮博弈，合作如何形成与延续？','takeaway')+
 at(98,745,780,160,'<span class="num mid">19</span> <span class="body">对主要研究搭档</span><br><span class="body muted">提前交流 E · 中途交流 M</span>')+
 fig(1050,310,780,500,lineChart({w:780,h:500,metric:'x',title:'A平均转出',ymax:6.4,yticks:[0,2,4,6],compact:true}))+commonLegend(1110,842)+
 at(1065,902,720,55,'实验日期：2026年10月26日','research-label'),'研究汇报','cover');

// Slide 2: linear timelines, aligned on the round break, no conceptual cards.
let timeline='';
for(const [i,g] of ['E','M'].entries()){
 const y=110+i*210;timeline+=txt(0,y+6,g==='E'?'409 · E组':'407 · M组','chart-title',C[g]);
 timeline+=txt(0,y+47,g==='E'?'提前交流':'中途交流','axis-label',C[g]);
 const xs=[370,460,550,640,730,1160,1250,1340,1430,1520];timeline+=line(280,y,1600,y,'',`stroke="${C[g]}" stroke-width="3" opacity=".35"`);
 xs.forEach((x,j)=>{timeline+=mark(x,y,g,8)+txt(x,y+40,'R'+(j+1),'tick','','middle');});
 timeline+=txt(250,y-43,g==='E'?'聊天10分钟':'直接开始','metric',C[g],'middle');
 timeline+=txt(945,y-35,g==='E'?'安静休息3分钟':'聊天10分钟','metric',C[g],'middle');
 timeline+=txt(945,y+43,'R5反馈后','chart-note','','middle');
 timeline+=txt(1650,y+7,'问卷','metric');
}
slide('实验设计：5＋5结构与单轮规则','十轮固定搭档、每轮即时反馈；管理员统一推进阶段',
 fig(98,262,1728,450,svg(1728,450,timeline,'E先交流、R5后休息；M在R5后交流，两组R10后问卷'))+
 at(98,746,1700,1,'','rule')+
 at(98,785,510,100,'<div class="figure-title">A先决策</div><div class="body">初始6点，转出 <i>x</i>，另报预期 <i>e</i></div>')+
 at(678,785,460,100,'<div class="figure-title">B再返还</div><div class="body">收到3<i>x</i>，决定返还 <i>r</i></div>')+
 at(1220,785,605,100,'<div class="figure-title">当轮收益</div><div class="math">A = 6 − x + r　 B = 3x − r</div>')+
 note('x为整数0—6；e、r按0.5点递增，范围0—3x。e不向B公开，也不计入收益。',true),'实验设计');

// Slide 3
let sampleDots='';for(const [j,g] of ['E','M'].entries()){
 const n=g==='E'?10:11;sampleDots+=txt(0,50+j*230,g==='E'?'E组 10对':'M组 11对','chart-title',C[g]);
 for(let i=0;i<n;i++){let x=35+(i%6)*98,y=106+j*230+Math.floor(i/6)*76,excluded=g==='M'&&[0,9].includes(i);
  sampleDots+=`<circle cx="${x}" cy="${y}" r="23" fill="${excluded?C.paper:C[g]}" stroke="${C[g]}" stroke-width="2.5"/>`;
  sampleDots+=txt(x,y+8,(i+1).toString().padStart(2,'0'),'tick',excluded?C[g]:'#fff','middle');
  if(excluded)sampleDots+=line(x-16,y+16,x+16,y-16,'',`stroke="${C[g]}" stroke-width="2"`);
 }
}
slide('主要研究样本：E组10对，M组9对','42名参与者包含2名工作人员补位；工作人员所在的两对从主分析中整对排除',
 at(98,310,580,180,'<div class="num big">42 <span style="font-size:35px;letter-spacing:0">人</span></div><div class="body muted">21对固定搭档 · 10轮</div>')+
 at(98,548,700,205,'<div class="num big E">19 <span style="font-size:35px;letter-spacing:0">对</span></div><div class="body">E 10对 / M 9对 · 190条搭档—轮次记录</div>')+
 at(98,815,750,75,'<strong>分析单位是搭档。</strong><br>十轮数据是同一搭档的重复观察。','body')+
 fig(1000,282,680,500,svg(680,500,sampleDots,'21对中M01和M10为工作人员配对，主样本保留19对'))+
 at(1000,816,750,86,'420次正式决策　305条聊天消息<br>42份问卷　38份进入主样本','body muted')+
 note('工作人员账号A001、A010对应M01、M10。空心划线为排除配对，全部21对作为敏感性对照。',true),'样本与口径');

// Slide 4
slide('整体合作水平高，后期存在明显天花板','按搭档—轮次等权统计；点数分布与后五轮搭档均值共同呈现',
 commonLegend()+fig(98,300,930,540,histogram())+
 fig(1110,302,710,420,pairStrip({w:710,h:420}))+
 at(1110,770,710,110,`<span class="num mid">15 / 19</span><div class="body muted">对搭档在后五轮每轮均转出6点</div>`)+
 note(`<strong>${fmt(D.summary.full_x_pct,1)}%</strong> 的主样本记录为满额转出（140/190条）；后期满额搭档：E组8/10对，M组7/9对。`));

// Slide 5
slide('合作路径：E组起点较高，M组在交流后追近','R5后同时发生：M组交流10分钟，E组安静休息3分钟',
 commonLegend()+fig(98,295,1250,585,lineChart({w:1250,h:585,metric:'x',title:'A平均转出 x',endpoint:true}))+
 at(1430,349,390,100,'<div class="smallcap M">M组 R5 → R6</div><div class="num big M" style="margin-top:22px">+2.00</div><div class="body muted" style="margin-top:15px">点 / 搭档</div>')+
 at(1430,622,390,210,'<div class="body">5对增加，4对不变</div><div class="body muted" style="margin-top:22px">三对原本零转出的搭档，贡献了总增幅的77.8%。</div>')+
 note('这是交流节点附近的<strong>描述性跃升</strong>。处理条件与教室、前期历史、休息长度同时变化，不能单独归因于交流。',true));

// Slide 6
slide('预期与实际返还随合作规模同步变化','原始点数同时受转出规模影响，下一页进一步查看比例',
 commonLegend()+fig(98,304,820,560,lineChart({w:820,h:560,metric:'e',title:'A平均预期返还 e',ymax:10,yticks:[0,2,4,6,8,10],endpoint:true}))+
 fig(1000,304,820,560,lineChart({w:820,h:560,metric:'r',title:'B平均实际返还 r',ymax:10,yticks:[0,2,4,6,8,10],endpoint:true}))+
 note('M组R5→R6：预期返还增加<strong>3.17点</strong>，实际返还增加<strong>3.11点</strong>。末轮两组预期与实际返还均下降。'));

// Slide 7
const counts=g=>D.rounds.filter(z=>z.group===g).map(z=>z.ratio_n).join(' / ');
slide('返还比例：点数上升与单位资源互惠不同','每轮先计算各对的e/(3x)、r/(3x)，再取组内均值；x=0时不定义比例',
 commonLegend()+fig(98,302,820,545,lineChart({w:820,h:545,metric:'er',title:'A平均预期返还比例',ymax:1,yticks:[0,.25,.5,.75,1],unit:'比例',percent:true,endpoint:true}))+
 fig(1000,302,820,545,lineChart({w:820,h:545,metric:'rr',title:'B平均实际返还比例',ymax:1,yticks:[0,.25,.5,.75,1],unit:'比例',percent:true,endpoint:true}))+
 at(98,865,1725,35,`R1—R10有效对数　E：${counts('E')}　　M：${counts('M')}`,'smallcap muted')+
 note('M组R5→R6实际返还比例仅从<strong>48.5%升至49.1%</strong>。比例样本的构成也随零转出变化，不能把两种均值混同。',true));

// Slide 8
slide('主要比较：后五轮均值接近，区间仍然较宽','主指标：先求每对搭档R6—R10的A平均转出，再比较E与M',
 fig(98,317,850,440,pairStrip({w:850,h:440,title:'每对搭档的后五轮平均转出'}))+
 at(1080,308,740,125,`<div class="smallcap muted">E − M</div><div class="num big E" style="margin-top:10px">${sign(D.primary.delta,3)}<span style="font-size:34px;letter-spacing:0"> 点</span></div>`)+
 fig(1055,493,770,300,ciChart({w:770,h:300}))+
 at(1080,822,740,70,`95%参考区间 [${fmt(D.primary.ci[0],3)}, ${fmt(D.primary.ci[1],3)}]<br>Welch p = ${fmt(D.primary.p,3)}`,'body muted')+
 at(98,813,850,88,'样本中未发现清晰的后期组间差异。<br>较宽区间也不能证明两种安排完全等效。','takeaway')+
 note('区间以搭档为单位计算。每种处理仅一间教室，无法可靠估计教室层面的不确定性；不作随机处理效应解释。',true));

// Slide 9
slide('个体轨迹：高投入、恢复与终局下降并存','搭档为行、R1—R10为列；转出与返还比例并列展示，两组共用同一色阶',
 fig(98,288,854,610,heatmap('x','A转出点数 x',6))+
 fig(974,288,854,610,heatmap('rr','B实际返还比例 r/(3x)',1))+
 note('行序保留真实配对编号：E01—E10，M02—M09、M11。橙色虚线为R5后；<strong>灰色表示x=0，比例无定义</strong>。',true,930));

// Slide 10
slide('终局：E组投入不变，实际返还与收益分配变化','R9→R10，E组平均转出均为5.30点；实际返还从8.00降至4.50点',
 fig(98,302,910,560,slopeReturn())+
 fig(1090,308,740,540,payoffBars())+
 note('细线为单对、粗线为组均值。M组返还均值7.06→5.78点，同时转出5.44→4.78点，其中一对降至零转出。',true));

// Slide 11
slide('合作历史与终局：可见差异，解释仍有竞争','两轮均有正转出的17对中，7对返还比例下降；其中3名A下调预期，4名A未下调',
 commonLegend()+fig(98,310,1030,570,historyChart())+
 at(1220,317,590,120,'<div class="figure-title">同样的高合作起点</div><div class="body muted" style="margin-top:16px">E01与E03等搭档前五轮均转出6点，终局返还却并不相同。</div>')+
 at(1220,529,590,220,'<div class="figure-title">承诺与反馈提供解释线索</div><div class="body muted" style="margin-top:16px">主样本34/38人自报达成明确约定。聊天约定的适用轮次不同，不能将所有末轮下降都称为违约。</div>')+
 at(1220,797,590,85,'已知终局、互动历史、承诺范围和个体差异均可能参与解释。','body')+
 note('图中每点一对搭档，重叠点仅作少量显示位移。早期合作历史不是随机形成的，不能据此确认其因果作用。',true));

// Slide 12
slide('提交总体加快，部分B在终局明显放慢','耗时定义为“该轮B阶段开放”至“B提交成功”，包含阅读、操作与网络时间',
 commonLegend()+fig(98,311,1000,570,lineChart({w:1000,h:570,metric:'median',title:'B提交耗时中位数',ymax:50,yticks:[0,10,20,30,40,50],unit:'秒',source:D.timing,endpoint:true}))+
 fig(1160,311,665,570,casesChart())+
 note('E组中位数R9为6.68秒，R10为16.00秒。三个案例均伴随返还减少，但延迟<strong>不能直接证明心理犹豫或违约动机</strong>。',true));

// Slide 13
slide('真实散点：原始点数的强相关包含共同规模约束','每个点对应一条搭档—轮次记录；只展示描述性相关，不把重复观测视为独立实验样本',
 commonLegend(1350,235)+fig(98,272,835,330,scatter('xe'))+fig(994,272,835,330,scatter('xr'))+
 fig(98,612,835,330,scatter('er'))+fig(994,612,835,330,scatter('rates'))+
 note('灰虚线：前两图为3x上限，后两图为预期=实际。e、r≤3x使点数共同受限；比例仅保留x>0。轻微抖动仅用于显示。',true,950));

// Slide 14
slide('样本对照：后期均值差在不同口径下仍较小','保留19对为主分析；线索相关排除仅作敏感性检查，避免事后选择样本',
 fig(98,285,1180,605,ciChart({w:1180,h:605,items:D.robustness,labels:true}))+
 at(1370,323,450,500,'<div class="quiet-list"><div class="item"><h3>420 / 420</h3><p>正式决策均为被试提交，<br>没有系统随机补值。</p></div><div class="item"><h3>42 / 42</h3><p>问卷完成；自报未识别搭档，<br>不能替代实际匿名性核查。</p></div><div class="item"><h3>305条消息</h3><p>配对、序号和聊天时段核验通过。原始数据保持不变。</p></div></div>')+
 note('线为95% Welch参考区间。M09为邻座信息线索；E01的错误已在R1前纠正，E02为一般公式误解线索，均不等同于持续不理解。',true));

// Slide 15
let limitations=[
 ['01','处理与教室混杂','每种处理仅一间教室，主持、环境与同期冲击难以分离。','增加独立场次，交叉安排教室与处理。'],
 ['02','样本小且高合作','主样本19对，后五轮15对满额转出，估计精度与上升空间有限。','扩大被试来源，增加对初始差异的测量。'],
 ['03','交流节点包含多种变化','M组聊天10分钟、E组休息3分钟，前期经历和疲劳状态也不同。','未来设置等长非交流对照，区分时点与暂停。'],
 ['04','主观变量与时间的边界','e随x一同提交且无激励；问卷为事后报告，耗时包含操作和网络。','优化预期测量顺序，补充理解度和过程测量。']
];
let limHTML='';limitations.forEach((z,i)=>{let x=i%2?1015:98,y=i<2?310:610;limHTML+=at(x,y,790,235,`<div class="smallcap E">${z[0]}</div><div class="figure-title" style="margin-top:11px">${z[1]}</div><div class="body muted" style="margin-top:18px">${z[2]}</div><div class="body" style="margin-top:14px">${z[3]}</div>`);});
slide('研究局限与未来改进','观察到的合作路径有解释价值，因果结论与外推范围需要更多设计支持',limHTML+note('本次汇报将行为事实、统计不确定性与可能机制分开呈现。探索性分析用于提出后续可检验的问题。',true),'解释边界');

// Slide 16
slide('核心结论','合作如何形成、维持，又如何在已知终局发生调整？',
 at(98,320,240,520,'<div class="num big E">01</div><div class="num big E" style="margin-top:76px">02</div><div class="num big E" style="margin-top:76px">03</div>')+
 at(330,320,1380,530,'<div style="height:185px"><div class="figure-title" style="font-size:39px">形成路径不同，后期平均转出趋近</div><div class="body muted" style="margin-top:17px">E组初期即高投入；M组部分低投入搭档在交流节点后提高转出。后五轮差0.20点，区间较宽。</div></div><div style="height:185px"><div class="figure-title" style="font-size:39px">高投入没有保证终局继续返还</div><div class="body muted" style="margin-top:17px">E组末轮投入不变，B返还下降，收益分配向B移动。部分A的数值预期没有反映这一变化。</div></div><div><div class="figure-title" style="font-size:39px">过程数据补充解释，尚不能确认唯一机制</div><div class="body muted" style="margin-top:17px">聊天、问卷、真实散点与提交时间揭示异质性；交流时点、历史和终局动机仍需进一步区分。</div></div>')+
 at(330,938,1350,50,'谢谢。','body muted'),'研究结论');

document.getElementById('stage').innerHTML=slideList.join('');
const slides=[...document.querySelectorAll('.slide')];let current=-1;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled=!reduced.matches;
function setMotion(on){motionEnabled=on;document.body.classList.toggle('no-motion',!on);document.body.classList.toggle('motion-override',on&&reduced.matches);document.getElementById('motion').textContent='动画 '+(on?'开':'关');document.getElementById('motion').setAttribute('aria-pressed',String(on));if(!on)document.getAnimations().forEach(a=>{try{a.finish();}catch{}});}
function resize(){const s=Math.min(innerWidth/1920,innerHeight/1080);document.documentElement.style.setProperty('--scale',s);}
function go(n){n=Math.max(0,Math.min(slides.length-1,n));if(n===current)return;
 slides.forEach((s,i)=>{s.classList.remove('active');s.setAttribute('aria-hidden',String(i!==n));});
 // Force layout so re-entering a slide always replays its short animation.
 void document.getElementById('stage').offsetWidth;
 slides[n].classList.add('active');current=n;
 history.replaceState(null,'','#'+(n+1));
 document.getElementById('counter').textContent=String(n+1).padStart(2,'0')+' / 16';
 document.getElementById('progress').style.width=((n+1)/16*100)+'%';
 document.getElementById('previous').disabled=n===0;document.getElementById('next').disabled=n===15;
 document.getElementById('announcer').textContent=`第${n+1}页，${slides[n].dataset.title.replaceAll('<br>','')}`;
 document.getElementById('tooltip').style.display='none';
}
async function toggleFull(){try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{document.body.classList.add('controls-visible');}}
document.getElementById('previous').onclick=()=>go(current-1);
document.getElementById('next').onclick=()=>go(current+1);
document.getElementById('motion').onclick=()=>setMotion(!motionEnabled);
document.getElementById('fullscreen').onclick=toggleFull;
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select'))return;
 if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(current+1);}
 else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1);}
 else if(e.key==='Home'){e.preventDefault();go(0);}else if(e.key==='End'){e.preventDefault();go(15);}
 else if(e.key.toLowerCase()==='f'){e.preventDefault();toggleFull();}
 else if(e.key.toLowerCase()==='a'){e.preventDefault();setMotion(!motionEnabled);}
 else if(e.key==='Escape')document.getElementById('tooltip').style.display='none';
});
window.addEventListener('resize',resize);window.addEventListener('hashchange',()=>go((Number(location.hash.slice(1))||1)-1));
reduced.addEventListener('change',e=>setMotion(!e.matches));
const tip=document.getElementById('tooltip');document.addEventListener('pointermove',e=>{const el=e.target.closest('[data-tip]');if(!el){tip.style.display='none';return;}tip.textContent=el.dataset.tip;tip.style.display='block';const rect=tip.getBoundingClientRect();tip.style.left=Math.min(e.clientX+16,innerWidth-rect.width-12)+'px';tip.style.top=Math.min(e.clientY+16,innerHeight-rect.height-12)+'px';});
let touchX=0;document.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;},{passive:true});document.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>70)go(current+(dx<0?1:-1));},{passive:true});
window.deck={go:(page)=>go(page-1),setMotion,get current(){return current+1},get count(){return slides.length},data:D};
setMotion(motionEnabled);resize();go((Number(location.hash.slice(1))||1)-1);
