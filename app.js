const dialog=document.querySelector('#lightbox');
if(dialog){document.querySelectorAll('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{const source=button.querySelector('img');const target=dialog.querySelector('img');target.src=source.src;target.alt=source.alt;dialog.showModal()}));dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()})}
const chart=document.querySelector('#force-chart');
if(chart){
const series={
pneunet:{name:'PneuNet',color:'#9b3e29',v:[15,20,25,30,35,40],f:[.164,.376,.644,.870,.991,.975],sd:[.020,.020,.015,.046,.029,.154]},
fibre:{name:'Fibre-reinforced',color:'#50684b',v:[35,40,45,50,55,60],f:[.144,.294,.428,.549,.795,.952],sd:[.020,.035,.015,.035,.026,.125]}};
function draw(mode){const x=v=>65+(v-10)/55*590,y=f=>290-f/1.2*235;let out='<title id="chart-title">Measured peak blocked force against injected air volume</title><desc id="chart-desc">Mean measurements from the undergraduate dissertation. PneuNet: 15 to 40 millilitres. Fibre-reinforced: 35 to 60 millilitres. Error bars show one standard deviation.</desc>';
for(let f=0;f<=1.21;f+=.3){out+='<line x1="65" y1="'+y(f)+'" x2="655" y2="'+y(f)+'" stroke="#dedfd5"/><text x="52" y="'+(y(f)+4)+'" text-anchor="end">'+f.toFixed(1)+'</text>'}
for(let v=10;v<=65;v+=10)out+='<text x="'+x(v)+'" y="315" text-anchor="middle">'+v+'</text>';
out+='<text x="355" y="345" text-anchor="middle">Injected air volume (mL)</text><text transform="translate(16 170) rotate(-90)" text-anchor="middle">Mean peak blocked force (N)</text>';
for(const [key,s]of Object.entries(series)){if(mode!=='both'&&mode!==key)continue;out+='<polyline points="'+s.v.map((v,i)=>x(v)+','+y(s.f[i])).join(' ')+'" fill="none" stroke="'+s.color+'" stroke-width="2.5"/>';s.v.forEach((v,i)=>{const xx=x(v),lo=y(s.f[i]-s.sd[i]),hi=y(s.f[i]+s.sd[i]);out+='<path d="M'+xx+' '+lo+'V'+hi+'M'+(xx-4)+' '+lo+'h8M'+(xx-4)+' '+hi+'h8" stroke="'+s.color+'" fill="none"/><circle cx="'+xx+'" cy="'+y(s.f[i])+'" r="4.5" fill="'+s.color+'"><title>'+s.name+': '+v+' mL, '+s.f[i].toFixed(3)+' N, SD '+s.sd[i].toFixed(3)+' N</title></circle>'})}
out+='<circle cx="90" cy="22" r="4" fill="#9b3e29"/><text x="102" y="27">PneuNet</text><circle cx="208" cy="22" r="4" fill="#50684b"/><text x="220" y="27">Fibre-reinforced</text>';chart.innerHTML=out;}
document.querySelectorAll('[data-series]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-series]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));draw(button.dataset.series)}));draw('both');
}

// Keep the visitor's chosen portfolio colour style across pages.
const portfolioThemeNames = ['ocean', 'forest', 'ink'];
let portfolioTheme = 'ocean';
try { const savedTheme = localStorage.getItem('yuzhou-portfolio-theme'); if (portfolioThemeNames.includes(savedTheme)) portfolioTheme = savedTheme; } catch {}
function applyPortfolioTheme(name) {
  document.documentElement.dataset.theme = name;
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === name)));
}
applyPortfolioTheme(portfolioTheme);
document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => {
  const name = button.dataset.themeChoice;
  if (!portfolioThemeNames.includes(name)) return;
  applyPortfolioTheme(name);
  try { localStorage.setItem('yuzhou-portfolio-theme', name); } catch {}
}));
