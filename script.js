/* L.C.DESIGN / cinematic edition. No dependencies, no scroll interception. */
(() => {
  'use strict';
  document.getElementById('year').textContent = new Date().getFullYear();
  const root = document.documentElement;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  const intro = document.querySelector('.intro');
  const input = document.querySelector('.inputs');
  const pm = document.querySelector('.pm-cinema');
  const network = document.querySelector('.network-cinema');
  const manifesto = document.querySelector('.manifesto');
  const question = document.querySelector('.intro-question');
  const heroMessage = document.querySelector('.hero-message');
  const brand = document.querySelector('.brand-scene');
  const words = [...document.querySelectorAll('.input-scene')];
  const opening = document.querySelector('.pm-opening');
  const steps = [...document.querySelectorAll('.pm-scene')];
  const markers = [...document.querySelectorAll('.pm-timeline span')];
  const networkStatement = document.querySelector('.network-statement');
  const manifestoLines = [...document.querySelectorAll('.manifesto-line')];
  const scenes = [question,heroMessage,brand,...words,opening,...steps,networkStatement];
  const canvasData = [...document.querySelectorAll('.universe')].map(canvas=>({canvas,context:canvas.getContext('2d')}));
  const networkCanvas = document.querySelector('.network-universe');
  const networkData = {canvas:networkCanvas,context:networkCanvas.getContext('2d')};
  const clamp = (x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const ease = x=>{x=clamp(x);return x*x*(3-2*x)};
  let frame=0,observer,enabled=false,paused=false;
  function progress(element){const r=element.getBoundingClientRect();return {p:clamp(-r.top/Math.max(1,r.height-innerHeight)),visible:r.bottom>0&&r.top<innerHeight};}
  function scene(element,opacity,transform){element.style.opacity=clamp(opacity);element.style.transform=transform;element.style.visibility=opacity>.001?'visible':'hidden';}
  function resize(){[...canvasData,networkData].forEach(({canvas})=>{const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);});schedule();}
  function field(data,p,isInput){
    const ctx=data.context;if(!ctx)return;
    const {width:w,height:h}=data.canvas;ctx.clearRect(0,0,w,h);
    const zoom=isInput?1:1+ease(p/.48)*2.4;
    const radius=Math.min(w,h)*.31*zoom;
    const cx=w*.5,cy=h*.5;
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,radius*1.8);glow.addColorStop(0,'rgba(101,182,209,.14)');glow.addColorStop(.5,'rgba(42,98,126,.06)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    const points=[];const turn=p*Math.PI*2.3;
    for(let i=0;i<120;i++){
      const y=1-(i/119)*2;const rr=Math.sqrt(1-y*y);const theta=i*2.39996+turn;
      let x=Math.cos(theta)*rr,z=Math.sin(theta)*rr;
      const tilt=.4+p*.7;const yy=y*Math.cos(tilt)-z*Math.sin(tilt);z=y*Math.sin(tilt)+z*Math.cos(tilt);
      const perspective=2.8/(2.8-z);points.push({x:cx+x*radius*perspective,y:cy+yy*radius*perspective,z});
    }
    ctx.lineWidth=.65*(w/1440+1);
    points.forEach((a,i)=>{
      for(let j=i+1;j<points.length;j++){
        const b=points[j],distance=Math.hypot(a.x-b.x,a.y-b.y);
        if(distance<radius*.29&&distance>radius*.08){ctx.strokeStyle=`rgba(153,219,240,${(.035+.10*(a.z+1)/2)*(1-distance/(radius*.4))})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      }
      ctx.fillStyle=`rgba(198,238,250,${.15+(a.z+1)*.3})`;ctx.beginPath();ctx.arc(a.x,a.y,Math.max(.6,(a.z+1)*1.4),0,Math.PI*2);ctx.fill();
    });
    ctx.strokeStyle='rgba(145,215,239,.25)';
    for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,cy,radius*1.15,radius*(.22+i*.18),turn+i*.85,0,Math.PI*2);ctx.stroke();}
  }
  function networkField(p){
    const ctx=networkData.context;if(!ctx)return;
    const {width:w,height:h}=networkCanvas;
    ctx.clearRect(0,0,w,h);
    const spread=.16+ease(p/.7)*1.15;
    const points=[];
    for(let i=0;i<156;i++){
      const x=Math.sin(i*127.1)*43758.5;
      const y=Math.sin(i*311.7+12)*52314.7;
      const px=(x-Math.floor(x)-.5)*w*spread+w*.5;
      const py=(y-Math.floor(y)-.5)*h*spread+h*.5;
      points.push({x:px,y:py});
    }
    const reach=Math.min(w,h)*.18;
    for(let i=0;i<points.length;i++){
      const a=points[i];
      for(let j=i+1;j<points.length;j++){
        const b=points[j],distance=Math.hypot(a.x-b.x,a.y-b.y);
        if(distance<reach){
          ctx.strokeStyle=`rgba(155,220,235,${(1-distance/reach)*(.12+.1*p)})`;
          ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
      ctx.fillStyle=`rgba(198,238,250,${.3+.26*Math.sin(i+p*7)**2})`;
      ctx.beginPath();ctx.arc(a.x,a.y,1.1+(i%9===0?1.1:0),0,Math.PI*2);ctx.fill();
    }
  }
  function deck(element,t,index,kind){
    const phase=t-index;
    const incoming=1-ease(phase/(kind==='business'?.62:.24)),outgoing=ease((phase-.81)/.19);
    const opacity=(1-incoming)*(1-outgoing);
    const direction=index%2?1:-1;
    let transform;
    if(kind==='word'){
      const x=index%3===1?direction*incoming*45:0;
      const angle=index%3===2?incoming*-65:incoming*direction*24;
      transform=`translate3d(${x}vw,${incoming*90-outgoing*70}px,0) rotateY(${angle}deg) rotateX(${incoming*25}deg) scale(${.55+(.45*(1-incoming))+outgoing*1.7})`;
    }else if(kind==='business'){
      transform=`translate3d(0,${(1-ease(phase/.62))*78-outgoing*32}px,0)`;
    }else{transform=`translate3d(${direction*incoming*55-outgoing*direction*45}vw,0,0) rotateY(${incoming*direction*25}deg) scale(${.8+.2*(1-incoming)})`;}
    scene(element,opacity,transform);
  }
  function update(){
    frame=0;if(!enabled)return;
    const a=progress(intro),b=progress(input),c=progress(pm),d=progress(network),e=progress(manifesto);
    if(a.visible){
      const leave=ease((a.p-.06)/.22);scene(question,1-leave,`translateY(${-leave*110}px) scale(${1+leave*.55})`);
      const messageIn=ease((a.p-.24)/.16),messageOut=ease((a.p-.48)/.16);
      scene(heroMessage,messageIn*(1-messageOut),`translateY(${(1-messageIn)*58-messageOut*48}px)`);
      const enter=ease((a.p-.61)/.16),exit=ease((a.p-.91)/.09);
      scene(brand,enter*(1-exit),`translateY(${(1-enter)*42-exit*35}px)`);
      intro.style.setProperty('--progress',a.p);field(canvasData[0],a.p,false);
    }
    if(b.visible){
      const t=b.p*5.5+.12;words.forEach((el,i)=>deck(el,t,i,'word'));
      document.querySelector('.input-count').textContent=`0${Math.min(6,Math.floor(t)+1)} / 06`;
      input.style.setProperty('--progress',b.p);field(canvasData[1],b.p,true);
    }
    if(c.visible){
      const t=c.p*6.55;const out=ease((t-.55)/.42);scene(opening,1-out,`translateY(${-out*90}px)`);
      steps.forEach((el,i)=>deck(el,t-.87,i,i===steps.length-1?'business':'step'));
      markers.forEach((el,i)=>el.classList.toggle('active',t>=i+1.05));
      document.querySelector('.pm-geometry').style.transform=`translate(-50%,-50%) rotate(${c.p*210}deg) scale(${1+c.p*.3})`;
      pm.style.setProperty('--progress',c.p);
    }
    if(d.visible){
      const enter=ease((d.p-.13)/.29),exit=ease((d.p-.86)/.14);
      scene(networkStatement,enter*(1-exit),`translateY(${(1-enter)*60-exit*36}px)`);
      networkField(d.p);network.style.setProperty('--progress',d.p);
    }
    if(e.visible){
      const light=e.p>.75;
      manifesto.style.backgroundColor=light?'#edf0ed':'#050708';
      manifesto.style.color=light?'#171f21':'#f4f5f2';
      manifestoLines.forEach((line,i)=>{
        const visible=ease((e.p-(i===0?.09:.25))/.24);
        line.style.setProperty('--line-opacity',visible);
        line.style.setProperty('--line-shift',`${(1-visible)*72}px`);
      });
      manifesto.style.setProperty('--rule-progress',ease((e.p-.48)/.29));
      manifesto.style.setProperty('--brand-opacity',ease((e.p-.63)/.2));
    }
  }
  function schedule(){if(enabled&&!frame)frame=requestAnimationFrame(update);}
  function configure(){
    enabled=!paused&&!media.matches&&'IntersectionObserver' in window;
    root.classList.toggle('cinematic',enabled);
    scenes.forEach(el=>{el.style.removeProperty('opacity');el.style.removeProperty('transform');el.style.removeProperty('visibility');});
    if(observer)observer.disconnect();
    removeEventListener('scroll',schedule);removeEventListener('resize',resize);
    cancelAnimationFrame(frame);frame=0;
    toggle.hidden=false;toggle.setAttribute('aria-pressed',String(!enabled));toggle.textContent=enabled?'動きを止める':'静止表示中';
    if(enabled){
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});
      document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
      addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize,{passive:true});resize();
    }else{
      [...canvasData,networkData].forEach(({canvas,context})=>context&&context.clearRect(0,0,canvas.width,canvas.height));
      manifesto.style.removeProperty('background-color');manifesto.style.removeProperty('color');
      manifestoLines.forEach(line=>{line.style.removeProperty('--line-opacity');line.style.removeProperty('--line-shift');});
      manifesto.style.removeProperty('--rule-progress');manifesto.style.removeProperty('--brand-opacity');
    }
  }
  toggle.addEventListener('click',()=>{if(media.matches)return;paused=!paused;configure();toggle.textContent=paused?'動きを再開する':'動きを止める';});
  if(media.addEventListener)media.addEventListener('change',configure);
  configure();
})();

