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
 slideList.push(`<section class="slide ${cls}" id="slide-${n}" data-slide="${n}" data-title="${esc(title)}" aria-label="第${n}页 ${esc(title)}"><div class="eyebrow">信任博弈实验　 /　 ${chapter}</div><h1>${title}</h1>${sub?`<p class="subtitle">${sub}</p>`:''}<div class="fade">${body}</div><div class="footer"><span>实验经济学课程 · 2026.10　　${n===1?'十轮匿名固定搭档实验':'数据：2026-10-26导出 · 主样本E 10对 / M 9对（另注明除外）'}</span><span class="no">${String(n).padStart(2,'0')} / __TOTAL__</span></div></section>`);
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
let heatId=0;
function heatmap(metric,title,max){
 const gradientId='heat-gradient-'+(++heatId);
 const w=854,h=610,left=88,top=60,cw=62,rh=26.5,groupgap=12,heatw=620;
 const pairs=[...new Set(D.observations.map(v=>v.pair))].sort();let s=txt(0,27,title,'chart-title');
 const Y=i=>top+i*rh+(i>=10?groupgap:0);
 const hh=19*rh+groupgap;
 s+=`<defs><linearGradient id="${gradientId}" x1="0" x2="0" y1="1" y2="0">${D.blues.filter((c,i)=>i%17===0).map((c,i)=>`<stop offset="${i/15*100}%" stop-color="${c}"/>`).join('')}</linearGradient></defs>`;
 for(let r=1;r<=10;r++){
  s+=`<g class="heat-column" style="--delay:${(r-1)*90}ms">`;
  pairs.forEach((pair,i)=>{
   const z=D.observations.find(z=>z.pair===pair&&z.round===r),v=z[metric],col=v===null?'#d1d5db':D.blues[Math.min(255,Math.max(0,Math.round(v/max*255)))];
   s+=`<rect class="heat-cell" data-pair="${pair}" data-round="${r}" data-metric="${metric}" data-value="${v}" x="${left+(r-1)*cw}" y="${Y(i)}" width="${cw+.2}" height="${rh+.2}" fill="${col}" data-tip="${pair} · R${r}\n${metric==='x'?'转出 x：'+v+'点':metric==='r'?'实际返还 r：'+v+'点':v===null?'x=0，返还比例无定义':'实际返还比例：'+fmt(v*100,2)+'%'}"/>`;
  });s+='</g>';
  s+=txt(left+(r-.5)*cw,top+hh+33,'R'+r,'tick','','middle');
 }
 pairs.forEach((pair,i)=>s+=txt(left-14,Y(i)+rh/2+8,pair,'heat-label',pair[0]==='E'?C.E:C.M,'end'));
 s+=line(left,Y(10)-groupgap/2,left+heatw,Y(10)-groupgap/2,'',`stroke="#8da1a7" stroke-width="1.4"`);
 s+=line(left+5*cw,top,left+5*cw,top+hh,'',`stroke="#d29451" stroke-width="2.5" stroke-dasharray="7 6"`);
 s+=line(left,top,left,top+hh,'axis')+line(left,top+hh,left+heatw,top+hh,'axis');
 const barX=left+heatw+37,barY=top+45,barH=360;
 s+=`<rect x="${barX}" y="${barY}" width="22" height="${barH}" fill="url(#${gradientId})" stroke="#b8c1c5" stroke-width=".7"/>`;
 for(let i=0;i<=max;i+=(max===1?.2:max===6?1:3)){const y=barY+barH*(1-i/max);s+=line(barX+22,y,barX+29,y,'axis')+txt(barX+34,y+8,max===1?Math.round(i*100)+'%':i,'tick');}
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
function casesChart(){
 const w=665,h=570;const left=155,right=45,X=v=>left+v/100*(w-left-right);let s=txt(0,28,'三名B的终局提交与返还','chart-title')+txt(0,70,'空心：R9　实心：R10','chart-note');
 for(const t of [0,30,60,90])s+=line(X(t),100,X(t),480,'grid')+txt(X(t),517,t,'tick','','middle');
 D.cases.forEach((z,i)=>{const y=145+i*145;s+=txt(0,y,z.account,'metric',C.E)+txt(0,y+36,`${z.r9} → ${z.r10}点`,'axis-label');s+=line(X(z.delay9),y,X(z.delay10),y,'',`stroke="${C.E}" stroke-width="3"`)+`<circle cx="${X(z.delay9)}" cy="${y}" r="8" fill="${C.paper}" stroke="${C.E}" stroke-width="3"/><circle cx="${X(z.delay10)}" cy="${y}" r="8" fill="${C.E}"/>`;
 s+=txt(left,y-25,`${fmt(z.delay9,1)} → ${fmt(z.delay10,1)}秒`,'data-label',C.ink);});
 s+=txt(w-right,559,'提交耗时（秒）','axis-label','','end');return svg(w,h,s,'B101、B104、B102的R9与R10提交耗时和返还点数');
}
// Additional SVG charts reuse the original palette, typography and reveal animation.
function recoverySlopes(){
 const w=1090,h=500,top=75,bot=420,Y=v=>bot-v/6*(bot-top);let s=txt(0,28,'A转出：三对搭档的R5 → R6','chart-title');
 for(const v of [0,2,4,6])s+=line(65,Y(v),1065,Y(v),'grid')+txt(48,Y(v)+8,v,'tick','','end');
 s+=txt(45,60,'点','axis-label','','end');
 for(const [i,pair] of ['M06','M07','M08'].entries()){
  const z=D.jumps.find(z=>z.pair===pair),x0=120+i*330,x1=x0+205;
  s+=`<g class="line-reveal">`+line(x0,Y(z.x5),x1,Y(z.x6),'',`stroke="${C.M}" stroke-width="5"`)+`</g>`;
  s+=mark(x0,Y(z.x5),'M',7)+`<g class="round-point" style="--delay:800ms">`+mark(x1,Y(z.x6),'M',8)+txt(x1,Y(z.x6)-18,'+'+z.delta,'metric',C.M,'middle')+'</g>';
  s+=txt(x0,bot+34,'R5','tick','','middle')+txt(x1,bot+34,'R6','tick','','middle');
  s+=txt((x0+x1)/2,bot+73,pair,'metric',C.M,'middle');
 }
 return svg(w,h,s,'M06转出0至2，M07与M08均0至6');
}
function contribution(){
 const w=1080,h=122,left=0,width=1010;let s=txt(0,26,'M组总转出增量：18点','chart-title');
 s+=`<rect x="${left}" y="50" width="${width*14/18}" height="38" fill="${C.M}"/><rect x="${width*14/18}" y="50" width="${width*4/18}" height="38" fill="#e2d9d0"/>`;
 s+=txt(16,78,'M06、M07、M08：14点','data-label','#fff')+txt(width-12,78,'其余6对：4点','data-label',C.ink,'end');
 return svg(w,h,s,'三对搭档贡献14点，其余六对贡献4点，14除18等于77.8%');
}
function payoffBoth(){
 const w=770,h=575,left=116,right=44,X=v=>left+v/20*(w-left-right);let s=txt(0,28,'两组平均收益的分配','chart-title');
 s+=`<rect x="0" y="55" width="22" height="16" fill="${C.ink}"/>`+txt(32,71,'A收益：深色','chart-note')+`<rect x="220" y="55" width="22" height="16" fill="${C.ink}" opacity=".25"/>`+txt(252,71,'B收益：浅色','chart-note');
 for(const [gi,g] of ['E','M'].entries()){
  s+=txt(0,111+gi*202,g+'组','metric',C[g]);
  for(const [j,r] of [9,10].entries()){
   const z=D.rounds.find(z=>z.group===g&&z.round===r),y=129+gi*202+j*70;
   s+=txt(24,y+32,'R'+r,'tick')+`<rect x="${left}" y="${y}" width="${X(z.A)-left}" height="48" fill="${C[g]}"/><rect x="${X(z.A)}" y="${y}" width="${X(z.B)-left}" height="48" fill="${C[g]}" opacity=".23"/>`;
   s+=txt((left+X(z.A))/2,y+32,fmt(z.A,2),'data-label','#fff','middle')+txt((X(z.A)+X(z.A+z.B))/2,y+32,fmt(z.B,2),'data-label',C.ink,'middle');
  }
 }
 s+=line(left,492,w-right,492,'axis');for(const v of [0,5,10,15,20])s+=txt(X(v),525,v,'tick','','middle');
 s+=txt(w-right,565,'点 / 搭档（A+B合计）','axis-label','','end');
 return svg(w,h,s,'E与M组R9、R10的A和B平均收益堆叠条形图');
}
function terminalCases(){
 const w=1728,h=535,left=540,right=110,X=v=>left+v/9*(w-left-right);let s=txt(0,28,'具体搭档','chart-title')+txt(165,28,'前五轮平均x','chart-title')+txt(540,28,'B实际返还：空心R9　实心R10','chart-title');
 for(const v of [0,3,6,9])s+=line(X(v),70,X(v),450,'grid')+txt(X(v),490,v,'tick','','middle');
 for(const [i,pair] of ['E01','E03','E06','M07'].entries()){
  const z=D.last.find(z=>z.pair===pair),y=117+i*100;
  s+=txt(0,y,pair,'metric',C[z.group])+txt(230,y,fmt(z.early_x,1)+'点','metric',C[z.group],'middle');
  s+=txt(0,y+32,'x：6 → 6','chart-note');
  s+=line(X(z.r9),y-6,X(z.r10),y-6,'',`stroke="${C[z.group]}" stroke-width="4"`);
  s+=`<circle cx="${X(z.r9)}" cy="${y-6}" r="13" stroke="${C[z.group]}" stroke-width="3" fill="${C.paper}"/><circle cx="${X(z.r10)}" cy="${y-6}" r="7" fill="${C[z.group]}"/>`;
  s+=txt(X(9)+28,y+1,`${z.r9} → ${z.r10}`,'data-label',C[z.group]);
 }
 s+=txt(w-right,530,'实际返还 r（点）','axis-label','','end');
 return svg(w,h,s,'E01返还9到0；E03、E06、M07返还9到9，四对转出均保持6点');
}
function promiseBars(byGroup=false){
 const w=byGroup?745:900,h=425,p={l:82,r:30,t:66,b:65},Y=v=>h-p.b-v*(h-p.t-p.b);let s=txt(0,28,byGroup?'分组对照':'非末轮与末轮：可判定约定的兑现比例','chart-title');
 for(const v of [0,.25,.5,.75,1])s+=line(p.l,Y(v),w-p.r,Y(v),'grid')+txt(p.l-16,Y(v)+8,Math.round(v*100)+'%','tick','','end');
 const windows=['非末轮','R10'];
 windows.forEach((window,j)=>{
  const cx=p.l+(j+.5)*(w-p.l-p.r)/2;
  for(const [i,g] of (byGroup?['E','M']:['全部']).entries()){
   const z=D.promise.rates.find(z=>z.group===g&&z.window===window),bw=byGroup?73:150,xx=byGroup?cx-80+i*85:cx-bw/2,fill=byGroup?C[g]:C.ink;
   s+=`<rect x="${xx}" y="${Y(z.rate)}" width="${bw}" height="${Y(0)-Y(z.rate)}" fill="${fill}" opacity=".9" class="dot" data-tip="${g} ${window}：${z.success}/${z.total}，${fmt(z.rate*100,1)}%"/>`;
   s+=txt(xx+bw/2,Y(z.rate)-15,fmt(z.rate*100,1)+'%','data-label',fill,'middle');
   s+=txt(xx+bw/2,Y(z.rate)+32,`${z.success}/${z.total}`,'data-label','#fff','middle');
  }
  s+=txt(cx,h-p.b+37,j===0?'非末轮（R1—R9）':'末轮（R10）','tick','','middle');
 });
 return svg(w,h,s,byGroup?'E非末轮70/74，末轮3/7；M非末轮28/29，末轮4/6':'非末轮98/103，95.1%；R10为7/13，53.8%');
}
function singlePairTrack(metric,title,ymax,yticks){
 const w=1110,h=282,p={l:70,r:40,t:64,b:48},X=r=>p.l+(r-1)/9*(w-p.l-p.r),Y=v=>h-p.b-v/ymax*(h-p.t-p.b);let s=txt(0,26,title,'chart-title');
 s+=`<rect x="${X(5.5)}" y="${p.t}" width="${X(10)-X(5.5)}" height="${h-p.t-p.b}" fill="#f2e6db" opacity=".5"/>`;
 yticks.forEach(v=>s+=line(p.l,Y(v),w-p.r,Y(v),'grid')+txt(p.l-15,Y(v)+8,v,'tick','','end'));
 s+=line(X(5.5),45,X(5.5),h-p.b,'boundary')+txt(X(5.5)-14,51,'匿名交流','chart-note',C.M,'end');
 const f=D.observations.filter(z=>z.pair==='M07');const path=f.map((z,i)=>(i?'L':'M')+X(z.round)+','+Y(z[metric])).join(' ');
 s+=`<g class="line-reveal"><path d="${path}" class="plot-line" stroke="${C.M}"/></g>`;
 for(const z of f){s+=`<g class="round-point" style="--delay:${(z.round-1)*95}ms">`+mark(X(z.round),Y(z[metric]),'M',5)+txt(X(z.round),Y(z[metric])-12,z[metric],'data-label',C.M,'middle')+'</g>'+txt(X(z.round),h-12,'R'+z.round,'tick','','middle');}
 return svg(w,h,s,'M07 '+title+'十轮数据');
}
function phasesText(metric){
 const rate=metric==='ratio',v=z=>rate?`${fmt(z.er*100,1)}% / ${fmt(z.rr*100,1)}%`:`${fmt(z.e,2)} / ${fmt(z.r,2)} 点`;
 const get=(g,p)=>D.phases.find(z=>z.group===g&&z.period===p);
 return at(98,802,820,100,`<div class="summary-row"><b class="E">E 全十轮</b><span>${v(get('E','全部十轮'))}</span></div><div class="summary-caption">${rate?'预期比例 / 实际比例 · 有效记录98条':'预期返还 / 实际返还 · 100条记录'}</div>`)+
 at(1000,802,820,106,['R1—R5','R6—R10','全部十轮'].map(p=>`<div class="summary-row"><b class="M">M ${p}</b><span>${v(get('M',p))}</span></div>`).join(''));
}
function detailButton(kind,label){return `<button class="detail-button" data-detail="${kind}">${label} ↗</button>`;}

function visibleTable(headers,rows,{kind='',widths=[],rowClass=()=>'',cellClass=()=>''}={}){
 return `<table class="slide-table ${kind}">${widths.length?'<colgroup>'+widths.map(v=>`<col style="width:${v}%">`).join('')+'</colgroup>':''}<thead><tr>${headers.map(v=>`<th scope="col">${esc(v)}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr class="${rowClass(r,i)}">${r.map((v,j)=>`<${j?'td':'th scope="row"'} class="${cellClass(r,i,j)}">${esc(v)}</${j?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table>`;
}
const numberText=v=>Number.isInteger(Number(v))?String(v):Number(v).toFixed(1);
const allPairs=[...new Set(D.observations.map(z=>z.pair))].sort();
function fullPairTable(){return visibleTable(['搭档',...Array.from({length:10},(_,i)=>'R'+(i+1))],allPairs.map(pair=>[pair,...D.observations.filter(z=>z.pair===pair).map(z=>numberText(z.x)+' / '+numberText(z.r))]),{kind:'complete-table',widths:[8,...Array(10).fill(9.2)],rowClass:r=>(r[0][0]==='E'?'group-e':'group-m')+(r[0]==='M02'?' group-break':''),cellClass:(r,i,j)=>j===6?'round-break':''});}
function phaseTable(g,ratio=false){
 const windows=g==='E'?['全部十轮']:['R1—R5','R6—R10','全部十轮'];
 return visibleTable(['阶段','预期均值','实际均值'],windows.map(p=>{const z=D.phases.find(z=>z.group===g&&z.period===p);return[p==='全部十轮'?'全部10轮':(p==='R1—R5'?'交流前R1—5':'交流后R6—10'),ratio?fmt(z.er*100,1)+'%':fmt(z.e)+'点',ratio?fmt(z.rr*100,1)+'%':fmt(z.r)+'点'];}),{kind:'phase-table group-'+g.toLowerCase(),widths:[40,30,30]});
}
function expectationActualChart(g,ratio=false){
 const w=840,h=447,p={l:73,r:28,t:104,b:60},max=ratio?1:10,xt=n=>p.l+(n-1)/9*(w-p.l-p.r),yt=v=>h-p.b-v/max*(h-p.t-p.b);
 let s=txt(0,30,g==='E'?'E组 · 提前交流':'M组 · 中途交流','chart-title',C[g]);
 const metrics=ratio?['er','rr']:['e','r'];
 s+=line(365,23,410,23,'',`stroke="${C[g]}" stroke-width="3"`)+`<circle cx="388" cy="23" r="5" stroke="${C[g]}" stroke-width="2" fill="${C.paper}"/>`+txt(422,31,'预期','axis-label');
 s+=line(555,23,600,23,'',`stroke="${C[g]}" stroke-width="3" stroke-dasharray="7 5"`)+`<rect x="573" y="18" width="10" height="10" fill="${C[g]}"/>`+txt(612,31,'实际','axis-label');
 s+=txt(p.l-14,86,ratio?'比例':'点','axis-label','','end');
 s+=`<rect x="${xt(5.5)}" y="${p.t}" width="${xt(10)-xt(5.5)}" height="${h-p.b-p.t}" fill="#edf0eb" opacity=".5"/>`;
 (ratio?[0,.25,.5,.75,1]:[0,2,4,6,8,10]).forEach(v=>s+=line(p.l,yt(v),w-p.r,yt(v),'grid')+txt(p.l-13,yt(v)+7,ratio?Math.round(v*100)+'%':v,'tick','','end'));
 s+=line(xt(5.5),p.t,xt(5.5),h-p.b,'boundary')+txt(xt(5.5)+10,p.t+25,'R5后','chart-note');
 const f=D.rounds.filter(z=>z.group===g);
 for(const [i,metric] of metrics.entries()){
  s+=`<g class="line-reveal"><path d="${f.map((z,j)=>(j?'L':'M')+xt(z.round)+','+yt(z[metric])).join(' ')}" class="plot-line" stroke="${C[g]}" stroke-width="3.8" ${i?'stroke-dasharray="9 6" opacity=".85"':''}/></g>`;
  for(const z of f){const x=xt(z.round),y=yt(z[metric]);s+=`<g class="round-point" style="--delay:${(z.round-1)*95}ms" data-metric="${metric}" data-group="${g}" data-round="${z.round}" data-value="${z[metric]}">`;
   const tip=`class="dot" data-tip="${g} R${z.round} · ${i?'实际':'预期'}：${ratio?fmt(z[metric]*100,2)+'%':fmt(z[metric],3)+'点'}"`;
   s+=i?`<rect x="${x-4.5}" y="${y-4.5}" width="9" height="9" fill="${C[g]}" ${tip}/>`:`<circle cx="${x}" cy="${y}" r="7" fill="${C.paper}" stroke="${C[g]}" stroke-width="2.5" ${tip}/>`;
   s+='</g>';
  }
 }
 for(let r=1;r<=10;r++)s+=txt(xt(r),h-p.b+33,'R'+r,'tick','','middle');
 s+=line(p.l,h-p.b,w-p.r,h-p.b,'axis')+txt(w-p.r,h-1,'轮次','axis-label','','end');
 return svg(w,h,s,`${g}组十轮${ratio?'预期与实际返还比例':'预期与实际返还点数'}，实线空心为预期，虚线实心为实际`);
}
function recoveryContribution(){
 const w=1740,h=150,barY=67,barH=43,barW=1720;
 let s=txt(0,28,'M组R5 → R6转出增量的来源','chart-title')+txt(1720,28,'三对贡献 14 / 18 = 77.8%','chart-title',C.M,'end');
 let x=0;for(const z of [{name:'M06',v:2,fill:'#ce7255'},{name:'M07',v:6,fill:'#c15e43'},{name:'M08',v:6,fill:'#db927b'},{name:'其余6对',v:4,fill:'#dfd9d1'}]){const ww=barW*z.v/18;s+=`<rect x="${x}" y="${barY}" width="${ww}" height="${barH}" fill="${z.fill}"/>`+txt(x+ww/2,barY+30,`${z.name} +${z.v}点`,'data-label',z.name==='其余6对'?C.ink:'#fff','middle');x+=ww;}
 s+=txt(0,143,'总增量18点；百分比描述增量来自哪里，不是交流的因果效应占比。','chart-note');return svg(w,h,s,'三对贡献14点，其余六对贡献4点');
}
function promiseCompact(){
 const w=1740,h=133,left=360,right=160,X=v=>left+v*(w-left-right);let s='';
 for(const [i,win] of ['非末轮','R10'].entries()){
  const z=D.promise.rates.find(z=>z.group==='全部'&&z.window===win),y=12+i*47;
  s+=txt(0,y+27,i?'R10兑现比例':'非末轮兑现比例','metric');
  s+=`<rect x="${left}" y="${y}" width="${X(1)-left}" height="31" fill="#e4e9e6"/><rect x="${left}" y="${y}" width="${X(z.rate)-left}" height="31" fill="${C.ink}" opacity="${i?1:.72}"/>`+txt(X(z.rate)+14,y+25,fmt(z.rate*100,1)+'%','data-label',C.ink);
 }
 for(const v of [0,.5,1])s+=txt(X(v),124,Math.round(v*100)+'%','tick','','middle');
 return svg(w,h,s,'新增辅助图：非末轮兑现95.1%，末轮53.8%，统一百分比标尺');
}
function compactM07(metric,title,max){
 const w=1100,h=186,p={l:74,r:32,t:49,b:37},X=r=>p.l+(r-1)/9*(w-p.l-p.r),Y=v=>h-p.b-v/max*(h-p.t-p.b);
 let s=txt(0,24,title,'chart-title');
 const ticks=metric==='x'?[0,3,6]:[0,3,6,9];
 ticks.forEach(v=>s+=line(p.l,Y(v),w-p.r,Y(v),'grid')+txt(p.l-16,Y(v)+7,v,'tick','','end'));
 s+=line(X(5.5),35,X(5.5),h-p.b,'boundary')+txt(X(5.5)-12,28,'匿名交流','chart-note',C.M,'end');
 const f=D.observations.filter(z=>z.pair==='M07');
 s+=`<g class="line-reveal"><path d="${f.map((z,i)=>(i?'L':'M')+X(z.round)+','+Y(z[metric])).join(' ')}" class="plot-line" stroke="${C.M}"/></g>`;
 for(const z of f)s+=`<g class="round-point" style="--delay:${(z.round-1)*95}ms">`+mark(X(z.round),Y(z[metric]),'M',5,`class="dot" data-tip="M07 R${z.round} · ${metric}=${z[metric]}点"`)+'</g>'+txt(X(z.round),h-8,'R'+z.round,'tick','','middle');
 return svg(w,h,s,'M07 '+title+'，完整数值见上方表格');
}
function groupedTerminal(g){
 const w=840,h=416,top=62,bottom=350,Y=v=>bottom-v/10*(bottom-top),x0=150,x1=675;let s=txt(0,27,g+'组 · 实际返还 r（点）','chart-title',C[g]);
 for(const v of [0,3,6,9])s+=line(75,Y(v),800,Y(v),'grid')+txt(58,Y(v)+7,v,'tick','','end');
 const f=D.last.filter(z=>z.group===g);for(const z of f){s+=line(x0,Y(z.r9),x1,Y(z.r10),'',`stroke="${C[g]}" stroke-width="2.5" opacity=".28"`);for(const [x,v] of [[x0,z.r9],[x1,z.r10]])s+=mark(x,Y(v),g,4,`opacity=".6" class="dot" data-tip="${z.pair}：${z.r9}→${z.r10}点"`);}
 const a=D.rounds.find(z=>z.group===g&&z.round===9).r,b=D.rounds.find(z=>z.group===g&&z.round===10).r;
 s+=line(x0,Y(a),x1,Y(b),'',`stroke="${C[g]}" stroke-width="6"`)+mark(x0,Y(a),g,8)+mark(x1,Y(b),g,8)+txt(x0-15,Y(a)-14,fmt(a),'data-label',C[g],'end')+txt(x1+17,Y(b)+8,fmt(b),'data-label',C[g]);
 s+=txt(x0,bottom+36,'R9','tick','','middle')+txt(x1,bottom+36,'R10','tick','','middle');
 return svg(w,h,s,g+'组逐对终局返还，细线为搭档，粗线为组均值');
}
function terminalTable(g){const a=D.rounds.find(z=>z.group===g&&z.round===9),b=D.rounds.find(z=>z.group===g&&z.round===10);return visibleTable(['均值','R9','R10'],[['A转出',fmt(a.x),fmt(b.x)],['A收益',fmt(a.A),fmt(b.A)],['B收益',fmt(a.B),fmt(b.B)]],{kind:'group-'+g.toLowerCase(),widths:[40,30,30]});}

// Slide 1
slide('交流时点与<br>信任博弈中的合作行为','匿名固定搭档实验 · 第三组数据分析汇报',
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
 at(1000,790,750,114,'420次正式决策　305条聊天消息<br>42份问卷　38份进入主样本<br>41条身份登记（不作为参试人数）','body muted')+
 note('工作人员账号A001、A010对应M01、M10。空心划线为排除配对，全部21对作为敏感性对照。',true),'样本与口径');

// V3 page4: original distribution, new summary; no right-hand scatter.
slide('整体合作水平高，后期多数搭档满额转出','140 / 190条主样本记录为满额转出，占73.7%',
 commonLegend()+fig(98,318,1000,560,histogram())+
 at(1250,344,560,180,'<div class="num big E">15 / 19</div><div class="body" style="margin-top:28px">对搭档在后五轮<br>每轮均转出6点</div>')+
 at(1250,635,560,180,'<div class="figure-title E">E组 8 / 10对</div><div class="figure-title M" style="margin-top:26px">M组 7 / 9对</div>')+
 note('后期多数搭档已达到6点上限，进一步增加投入的空间较小。',false,935));
// Slide 5
slide('合作路径：E组起点较高，M组在交流后追近','R5后同时发生：M组交流10分钟，E组安静休息3分钟',
 commonLegend()+fig(98,295,1250,585,lineChart({w:1250,h:585,metric:'x',title:'A平均转出 x',endpoint:true}))+
 at(1430,349,390,100,'<div class="smallcap M">M组 R5 → R6</div><div class="num big M" style="margin-top:22px">+2.00</div><div class="body muted" style="margin-top:15px">点 / 搭档</div>')+
 at(1430,622,390,210,'<div class="body">5对增加，4对不变</div><div class="body muted" style="margin-top:22px">三对原本零转出的搭档，贡献了总增幅的77.8%。</div>')+
 note('这是交流节点附近的<strong>描述性跃升</strong>。处理条件与教室、前期历史、休息长度同时变化，不能单独归因于交流。',true));

// V3 page6: full visible table from new PPT, no substitution by heatmaps.
slide('全体搭档逐轮数据：先看整体，再解释变化','每格为A转出 / B实际返还（点）；浅青为E组，浅橙为M组',
 at(90,277,1740,620,fullPairTable(),'table-frame')+
 note('M06、M07、M08的R5转出均为0，R6合计增加14点，占M组总增量18点的77.8%。主样本19对完整列出。',true,929)+
 at(98,974,1720,28,detailButton('rounds','查看包含预期、收益及比例的明细')));
// V3 page7: keep new table at full size; add contribution graphic below.
const recoveryRows=D.jumps.filter(z=>['M06','M07','M08'].includes(z.pair)).map(z=>[z.pair,`${numberText(z.x5)} / ${numberText(z.r5)}`,`${numberText(z.x6)} / ${numberText(z.r6)}`,'+'+z.delta]);
recoveryRows.push(['三对合计','0 / 0','14 / 20.5','+14']);
slide('三对原先零转出的搭档，交流后重新投入','先看逐对数据：M组R5至R6的转出总增量为18点',
 at(90,285,1740,428,visibleTable(['搭档','R5转出 / 返还','R6转出 / 返还','转出增量'],recoveryRows,{kind:'recovery-table',widths:[22,28,28,22],rowClass:(r,i)=>i===3?'total-row':''}),'table-frame')+
 fig(90,766,1740,150,recoveryContribution()));
// V3 page8: new E/M comparison structure, real animated lines and visible tables.
slide('交流后的预期提高，实际返还也随之增加','按E、M分组对照预期与实际；横轴为轮次，纵轴为点数',
 fig(90,281,840,447,expectationActualChart('E'))+fig(990,281,840,447,expectationActualChart('M'))+
 at(90,757,840,100,phaseTable('E'),'table-frame')+at(990,757,840,174,phaseTable('M'),'table-frame')+
 at(98,884,800,38,'实线空心圆：预期 e　　虚线实心方块：实际 r','smallcap muted')+
 note('M组交流后，预期与实际返还的阶段均值均提高且较接近；点数同时受转出规模影响，下一页进一步查看比例。',true,956));
// V3 page9: same new group panels, ratio lines and original visible summary tables.
slide('返还份额相对稳定，合作规模的变化更突出','横轴为轮次，纵轴为返还比例；预期 e/(3x)，实际 r/(3x)',
 fig(90,281,840,447,expectationActualChart('E',true))+fig(990,281,840,447,expectationActualChart('M',true))+
 at(90,757,840,100,phaseTable('E',true),'table-frame')+at(990,757,840,174,phaseTable('M',true),'table-frame')+
 at(98,885,800,35,detailButton('phases','查看各阶段及各轮有效样本数'))+
 note('均值对有效搭档—轮次等权；x=0不计入比例。阶段样本构成会变化，比例均值不等于总返还 / 总投入。',true,956));
// V3 page10: keep new numerical summary, add only point estimate and CI.
slide('后五轮，两组平均转出相差0.20点','每对先汇总第6—10轮平均转出，再比较E组与M组',
 at(98,325,760,95,'<span class="figure-title E">E组</span>　<span class="num mid E">5.58</span> <span class="body">点</span>')+
 at(98,464,760,95,'<span class="figure-title M">M组</span>　<span class="num mid M">5.38</span> <span class="body">点</span>')+
 at(98,630,780,180,'<div class="figure-title">差值：+0.202点</div><div class="body muted" style="margin-top:22px">95%参考区间：[-1.114, 1.518]<br>Welch p = 0.748</div>')+
 at(1000,311,825,48,'E − M：点估计与95%参考区间','figure-title')+
 fig(995,410,835,380,ciChart({w:835,h:380}))+
 note('<strong>两组后期投入接近，未发现清晰组间差异。</strong>本次观察显示合作建立路径不同，但不显著不等于两种安排等效。',false,901)+
 at(98,975,1700,28,'区间以搭档为单位；每种处理仅一间教室，不能据此识别交流时点的因果效应。','smallcap muted'));
// Slide 9
slide('个体轨迹：高投入、恢复与终局下降并存','搭档为行、R1—R10为列；转出与返还比例并列展示，两组共用同一色阶',
 fig(98,288,854,610,heatmap('x','A转出点数 x',6))+
 fig(974,288,854,610,heatmap('rr','B实际返还比例 r/(3x)',1))+
 at(98,906,800,35,detailButton('rounds','查看190条完整数值'))+
 note('行序保留真实配对编号：E01—E10，M02—M09、M11。橙色虚线为R5后；<strong>灰色表示x=0，比例无定义</strong>。',true,954));

// V3 page12: new two-panel terminal plots and original two visible payoff tables.
slide('最后一轮：两组都出现返还下降，但路径不同','逐对展示R9与R10实际返还；细线为搭档，粗线为组均值',
 fig(90,285,840,416,groupedTerminal('E'))+fig(990,285,840,416,groupedTerminal('M'))+
 at(90,742,840,174,terminalTable('E'),'table-frame')+at(990,742,840,174,terminalTable('M'),'table-frame')+
 note('E组投入不变而返还下降；M组投入和返还同时下降。已知结束时间可能影响选择，现实应用需考虑关系能否持续。',true,954));
// V3 page13: retain all four rows as the new PPT table.
const terminalRows=['E01','E03','E06','M07'].map(pair=>{let z=D.last.find(z=>z.pair===pair);return[pair,fmt(z.early_x,1),`${z.x9} / ${z.r9}`,`${z.x10} / ${z.r10}`];});
slide('同样是满额合作，最后的回应仍可能不同','用具体搭档对照终局行为；前五轮均值与最后两轮记录如下',
 at(90,312,1740,390,visibleTable(['搭档','前五轮平均转出','R9：转出 / 返还','R10：转出 / 返还'],terminalRows,{kind:'case-table',widths:[16,28,28,28],rowClass:r=>r[0][0]==='E'?'group-e':'group-m'}),'table-frame')+
 at(98,770,1728,88,'E01末轮返还从9降为0；E03、E06、M07仍返还9点。','takeaway')+
 note('既往高投入不能单独判断下一轮是否兑现。还要看双方具体约定、实际履行，以及关系持续预期；这些仍是可能解释。',false,903));
// V3 page14: new table of the three B cases, retaining timing line chart.
slide('提交总体加快，部分B在末轮明显放慢','耗时为B阶段开放至成功提交，包含阅读、决策、操作和网络时间',
 commonLegend(1030,259)+fig(98,315,1020,550,lineChart({w:1020,h:550,metric:'median',title:'B提交耗时中位数',ymax:50,yticks:[0,10,20,30,40,50],unit:'秒',source:D.timing,endpoint:true}))+
 at(1185,330,645,50,'三名B：R9 → R10','figure-title')+
 at(1185,401,645,375,visibleTable(['账号','耗时（秒）','返还点数'],D.cases.map(z=>[z.account,`${fmt(z.delay9,1)} → ${fmt(z.delay10,1)}`,`${z.r9} → ${z.r10}`]),{kind:'time-table',widths:[24,46,30]}),'table-frame')+
 at(1185,804,645,76,'E组中位数：6.68 → 16.00秒','body')+
 note('三个案例均伴随返还减少。末轮可能引发更慎重的考虑，但耗时还包含操作与网络因素，不能直接证明心理犹豫。',true,944));
// V3 page15: preserve full-sized 9-row table, visualization only below it.
const promiseRows=D.promise.rates.map(z=>[z.group,z.window==='全部可判定'?'含末轮':z.window==='非末轮'?'剔除R10':'仅R10',z.success,z.total,fmt(z.rate*100,1)+'%']);
slide('约定兑现：非末轮较高，末轮明显降低','逐组核对全部19对聊天；17对具有可判定的数值返还约定',
 at(90,280,1740,510,visibleTable(['范围','统计窗口','兑现次数','可判定轮次','兑现比例'],promiseRows,{kind:'promise-table',widths:[14,26,20,20,20],rowClass:(r,i)=>(i===3||i===6?'group-break ':'')+(r[0]==='E'?'group-e':r[0]==='M'?'group-m':'')}),'table-frame')+
 fig(90,812,1740,133,promiseCompact())+
 note('仅统计满足数值规则与适用条件的B返还。E07、M09不计；E03仅R1—8、E10仅R1—3、M11仅R6。按新版口径，属探索性统计。',true,957));
// V3 page16: retain full original table area, add dual-track chart below.
const m07=D.observations.filter(z=>z.pair==='M07');
slide('从合作停滞到持续履行：M07的行为转变','M07提供了一个完整过程：低返还经历、协商规则、连续兑现',
 at(90,280,1740,225,visibleTable(['轮次',...Array.from({length:10},(_,i)=>'R'+(i+1))],[['A转出',...m07.map(z=>z.x)],['B返还',...m07.map(z=>z.r)]],{kind:'m07-table',widths:[12,...Array(10).fill(8.8)],cellClass:(r,i,j)=>j===6?'round-break':''}),'table-frame')+
 fig(98,540,1100,186,compactM07('x','A转出 x（点）',6.5))+
 fig(98,746,1100,186,compactM07('r','B实际返还 r（点）',9.8))+
 at(1290,557,530,170,'<div class="smallcap M">交流中的具体约定</div><div class="quote">“我给6，你反9，<br>最双赢”</div>')+
 at(1290,778,530,135,'<div class="figure-title">连续5轮按规则行动</div><div class="body muted" style="margin-top:16px">双方每轮各得9点</div>')+
 note('现实启示：合作遇阻时，可讨论明确的交换规则，再通过连续履行更新信任。这是个案证据，不能证明普遍因果作用。',true,957));
// Slide 14
slide('样本对照：后期均值差在不同口径下仍较小','保留19对为主分析；线索相关排除仅作敏感性检查，避免事后选择样本',
 fig(98,285,1180,605,ciChart({w:1180,h:605,items:D.robustness,labels:true}))+
 at(1370,323,450,500,'<div class="quiet-list"><div class="item"><h3>420 / 420</h3><p>正式决策均为被试提交，<br>没有系统随机补值。</p></div><div class="item"><h3>42 / 42</h3><p>问卷完成；自报未识别搭档，<br>不能替代实际匿名性核查。</p></div><div class="item"><h3>305条消息</h3><p>配对、序号和聊天时段核验通过。原始数据保持不变。</p></div></div>')+
 at(98,899,1000,34,detailButton('robustness','查看五组估计值、区间与样本口径'))+
 note('线为95% Welch参考区间。M09为邻座信息线索；E01的错误已在R1前纠正，E02为一般公式误解线索，均不等同于持续不理解。',true,950));

// V3 final two pages: new PPT19 content, without adding a fifth section.
const newLimits=[
 ['教室与交流时点重合','每种安排只有一间教室。增加独立场次，让两种安排在不同教室交叉进行。'],
 ['交流和休息时长不同','M组交流10分钟，E组休息3分钟。统一暂停时长，更清楚地比较交流作用。'],
 ['样本小，后期投入接近上限','19对中15对后五轮每轮投入6点。扩大样本与来源，观察更多合作差异。'],
 ['约定的表达与适用范围不一致','未来记录双方确认的规则和有效轮次，由两名编码者独立核对，减少解释分歧。']
];
let newLimitBody='';newLimits.forEach((z,i)=>{const x=i%2?1020:98,y=i<2?340:646;newLimitBody+=at(x,y,790,235,`<div class="smallcap E">0${i+1}</div><div class="figure-title" style="margin-top:16px">${z[0]}</div><div class="body muted" style="margin-top:22px">${z[1]}</div>`);});
slide('其他局限与改进方向','在保留此次发现的基础上，让后续实验更容易解释、也更贴近现实',
 newLimitBody+note('此次履约统计针对可明确判定的B返还承诺，不等同于所有参与者的整体诚信评价。',true,947),'解释边界');
// V3 final page: new PPT20's three conclusions and practical implications.
slide('结论与现实意义','把交流中的期待变成具体规则，再以持续兑现为信任提供依据',
 at(98,318,170,580,'<div class="num mid E">01</div><div class="num mid E" style="margin-top:148px">02</div><div class="num mid E" style="margin-top:148px">03</div>')+
 at(280,312,1545,180,'<div class="figure-title conclusion-title">直接沟通，为合作找到共同起点</div><div class="body muted" style="margin-top:18px">Lev-On等（2010）的研究为直接与合作对象交流提供背景；本实验中M组交流后，<br>原先零投入的三对重新投入。现实合作遇阻时，可先把双方要求和回报说清楚。</div>')+
 at(280,528,1545,180,'<div class="figure-title conclusion-title">约定需要落实，信任才有持续依据</div><div class="body muted" style="margin-top:18px">可判定返还承诺总体兑现率90.5%，非末轮95.1%。将交付内容、回报方式和适用期限<br>具体化，并根据实际兑现记录调整投入，比一次口头保证更有依据。</div>')+
 at(280,744,1545,175,'<div class="figure-title conclusion-title">重视关系的延续，也明确合作退出的安排</div><div class="body muted" style="margin-top:18px">两组后期投入接近，观察到的差别更多体现在合作建立路径。末轮返还下降提示：<br>交接、结算和后续声誉值得纳入合作安排。这些是现实启示，尚非已识别的因果效果。</div>')+
 at(98,954,1728,35,detailButton('literature','相关文献：Lev-On、Chavez与Bicchieri（2010）')),'研究结论');
slide('探索性补充：背景差异未达显著','5项代表性点估计与逐项95%参考区间；全部23项比较均保留在分析报告',at(100,280,1720,520,'<img src="assets/heterogeneity-ci.svg" style="width:100%;height:100%">')+at(100,830,1700,70,'五项区间均跨0；其他背景比较亦未达显著。样本较小，不显著不等于不存在差异。','body')+note('HC3稳健标准误、t参考区间；性别A18人/B15人，年级A19人，专业A12人。非因果效应。',false,954));
slide('小组分工','实验设计、现场实施与数据分析',at(90,280,1740,620,visibleTable(['成员','主要分工','具体工作'],[["张宸奕", "组长、实验设计、线上平台搭建", "研究问题、实验规则核对；线上平台搭建"], ["丁玥菡", "实验设计；实验补位", "设计方案与组织核对；参与407教室实验补位"], ["冯辰荟", "指导PPT、现场管理员", "指导材料制作、后台推进、提交检查与异常记录"], ["曾紫嫣", "指导PPT、现场管理员", "指导材料制作、后台推进、提交检查与异常记录"], ["张徛翔", "后勤、纸质材料", "登录卡、记录单、备用传票与纸笔、设备和资料收发"], ["牛光泽", "数据分析", "数据核验整理、清洗、描述统计、组间比较与可视化"], ["王依冉", "数据分析；实验补位", "数据分析与结果整理；参与407教室实验补位"], ["赵翌涵", "实验汇报", "整合设计、执行与结果，制作汇报材料并汇报"]],{widths:[14,29,57]}),'table-frame')+note('丁玥菡、王依冉参与407教室实验补位；主分析排除工作人员所在两对搭档。',false,954));
document.getElementById('stage').innerHTML=slideList.join('').replaceAll('__TOTAL__',String(slideList.length));
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
 slides[n].querySelectorAll('svg text').forEach(el=>el.getBBox());
 history.replaceState(null,'','#'+(n+1));
 document.getElementById('counter').textContent=String(n+1).padStart(2,'0')+' / '+slides.length;
 document.getElementById('progress').style.width=((n+1)/slides.length*100)+'%';
 document.getElementById('previous').disabled=n===0;document.getElementById('next').disabled=n===slides.length-1;
 document.getElementById('announcer').textContent=`第${n+1}页，${slides[n].dataset.title.replaceAll('<br>','')}`;
 document.getElementById('tooltip').style.display='none';
}
async function toggleFull(){try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{document.body.classList.add('controls-visible');}}
document.getElementById('previous').onclick=()=>go(current-1);
document.getElementById('next').onclick=()=>go(current+1);
document.getElementById('motion').onclick=()=>setMotion(!motionEnabled);
document.getElementById('fullscreen').onclick=toggleFull;
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.target.closest('input,textarea,select')||(e.key===' '&&e.target.closest('button,a')))return;
 if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(current+1);}
 else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1);}
 else if(e.key==='Home'){e.preventDefault();go(0);}else if(e.key==='End'){e.preventDefault();go(slides.length-1);}
 else if(e.key.toLowerCase()==='f'){e.preventDefault();toggleFull();}
 else if(e.key.toLowerCase()==='a'){e.preventDefault();setMotion(!motionEnabled);}
 else if(e.key==='Escape')document.getElementById('tooltip').style.display='none';
});
window.addEventListener('resize',resize);window.addEventListener('hashchange',()=>go((Number(location.hash.slice(1))||1)-1));
reduced.addEventListener('change',e=>setMotion(!e.matches));
const tip=document.getElementById('tooltip');document.addEventListener('pointermove',e=>{const el=e.target.closest('[data-tip]');if(!el){tip.style.display='none';return;}tip.textContent=el.dataset.tip;tip.style.display='block';const rect=tip.getBoundingClientRect();tip.style.left=Math.min(e.clientX+16,innerWidth-rect.width-12)+'px';tip.style.top=Math.min(e.clientY+16,innerHeight-rect.height-12)+'px';});
let touchX=0;document.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;},{passive:true});document.addEventListener('touchend',e=>{if(document.querySelector('dialog[open]'))return;const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>70)go(current+(dx<0?1:-1));},{passive:true});
window.deck={go:(page)=>go(page-1),setMotion,get current(){return current+1},get count(){return slides.length},data:D};
setMotion(motionEnabled);resize();go((Number(location.hash.slice(1))||1)-1);
