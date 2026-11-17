/* Efek tambahan Media Sobat BK: tema otomatis, kartu hidup, transisi, konfeti.
   Berdiri sendiri: tidak mengubah script.js / script.obfuscated.js. */
(function(){
"use strict";
var d=document,root=d.documentElement,still=matchMedia("(prefers-reduced-motion:reduce)");

/* ---------- 3. Tema otomatis (pagi / siang / sore / malam) + tombol pilihan ---------- */
function bucket(){var h=new Date().getHours();return h<5||h>=18?"malam":h<11?"pagi":h<15?"siang":"sore"}
var mode="auto";try{mode=localStorage.getItem("sbk_theme")||"auto"}catch(e){}
var meta=d.querySelector('meta[name="theme-color"]');
if(!meta){meta=d.createElement("meta");meta.name="theme-color";d.head.appendChild(meta)}
function applyTheme(){
  var t=mode==="light"?"siang":mode==="dark"?"malam":bucket();
  root.setAttribute("data-tm",t);
  meta.content=t==="malam"?"#14244a":"#ffffff";
  var b=d.getElementById("uTheme");
  if(b){
    var ic=mode==="light"?"☀️":mode==="dark"?"🌙":"🌗",lb=mode==="light"?"Terang":mode==="dark"?"Gelap":"Otomatis";
    b.innerHTML=ic+'<span class="lb">'+lb+'</span>';
    b.setAttribute("aria-label","Tema tampilan: "+lb+". Ketuk untuk mengganti.");
    b.title="Tema: "+lb
  }
}
(function(){
  var sc=d.querySelector(".scene");
  if(sc){
    var m=d.createElement("i");m.className="moon";sc.appendChild(m);
    var s=d.createElement("div"),h="";s.className="stars";
    for(var i=0;i<28;i++)h+='<b style="left:'+((i*37+11)%97)+'%;top:'+((i*53+7)%88)+'%;animation-delay:-'+((i%7)*.43).toFixed(2)+'s"></b>';
    s.innerHTML=h;sc.appendChild(s)
  }
  var tools=d.querySelector(".tools"),snd=d.getElementById("uSnd");
  if(tools){
    var b=d.createElement("button");b.className="btn sm sun";b.id="uTheme";b.type="button";
    b.onclick=function(){
      mode=mode==="auto"?"light":mode==="light"?"dark":"auto";
      try{localStorage.setItem("sbk_theme",mode)}catch(e){}
      applyTheme()
    };
    tools.insertBefore(b,snd||tools.firstChild)
  }
  applyTheme();setInterval(applyTheme,60000)
})();

/* ---------- 2. Kartu hidup: miring 3D + kilau mengikuti kursor ---------- */
var cur=null,pend=null,raf=0;
function reset(c){if(!c)return;c.style.removeProperty("--rx");c.style.removeProperty("--ry");c.style.removeProperty("--mx");c.style.removeProperty("--my")}
function paint(){
  raf=0;if(!pend||!cur)return;
  var r=cur.getBoundingClientRect(),x=(pend.x-r.left)/r.width,y=(pend.y-r.top)/r.height;
  x=Math.max(0,Math.min(1,x));y=Math.max(0,Math.min(1,y));
  cur.style.setProperty("--ry",((x-.5)*10).toFixed(2)+"deg");
  cur.style.setProperty("--rx",((.5-y)*8).toFixed(2)+"deg");
  cur.style.setProperty("--mx",(x*100).toFixed(1)+"%");
  cur.style.setProperty("--my",(y*100).toFixed(1)+"%")
}
d.addEventListener("pointermove",function(e){
  if(e.pointerType==="touch"||still.matches)return;
  var c=e.target.closest?e.target.closest(".card,.mbox"):null;
  if(c!==cur){reset(cur);cur=c}
  if(!c)return;
  pend={x:e.clientX,y:e.clientY};
  if(!raf)raf=requestAnimationFrame(paint)
},{passive:true});
d.addEventListener("pointerleave",function(){reset(cur);cur=null});

/* ---------- 1. Muncul berurutan saat halaman dibuka ---------- */
var enterTm;
function enter(){
  var v=d.querySelector(".view:not([hidden])");if(!v)return;
  var n=0;
  Array.prototype.forEach.call(v.querySelectorAll(".card,.mbox,.doc"),function(el){el.style.setProperty("--i",Math.min(n++,14))});
  v.classList.remove("fx-enter");void v.offsetWidth;v.classList.add("fx-enter");
  clearTimeout(enterTm);enterTm=setTimeout(function(){v.classList.remove("fx-enter")},1800)
}
addEventListener("hashchange",function(){setTimeout(enter,0)});
new MutationObserver(function(ms){
  ms.forEach(function(m){Array.prototype.forEach.call(m.removedNodes,function(n){if(n.id==="welcome")setTimeout(enter,60)})})
}).observe(d.body,{childList:true});
if(!d.getElementById("welcome"))setTimeout(enter,60);

/* ---------- 4. Konfeti saat media / game dibuka ---------- */
var cv,cx,W=0,H=0,dpr=1,ps=[],cr=0,COL=["#ffd23f","#f39a2e","#ff7aa8","#4cc36b","#1f6fd0","#8a6df2"];
function size(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
function ensure(){
  if(cv)return;
  cv=d.createElement("canvas");cv.id="fxConf";cv.setAttribute("aria-hidden","true");
  d.body.appendChild(cv);cx=cv.getContext("2d");size();addEventListener("resize",size)
}
function tick(){
  cx.clearRect(0,0,W,H);
  ps=ps.filter(function(p){return p.t<p.max&&p.y<H+30});
  ps.forEach(function(p){
    p.t++;p.vy+=.35;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;
    var a=1-Math.max(0,(p.t-p.max*.6)/(p.max*.4));
    cx.save();cx.globalAlpha=Math.max(a,0);cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;
    if(p.round){cx.beginPath();cx.arc(0,0,p.w/2.2,0,6.283);cx.fill()}else cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
    cx.restore()
  });
  if(ps.length)cr=requestAnimationFrame(tick);else{cr=0;cx.clearRect(0,0,W,H)}
}
function burst(x,y){
  if(still.matches)return;
  ensure();
  var n=innerWidth<600?32:46;
  for(var i=0;i<n;i++){
    var a=-Math.PI/2+(Math.random()-.5)*Math.PI*1.15,v=6+Math.random()*9;
    ps.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,w:6+Math.random()*6,h:4+Math.random()*5,
      r:Math.random()*6.28,vr:(Math.random()-.5)*.4,c:COL[i%COL.length],t:0,max:70+Math.random()*30,round:Math.random()<.25})
  }
  if(!cr)cr=requestAnimationFrame(tick)
}
d.addEventListener("click",function(e){
  var c=e.target.closest?e.target.closest(".card"):null;if(!c)return;
  var x=e.clientX,y=e.clientY;
  if(!x&&!y){var r=c.getBoundingClientRect();x=r.left+r.width/2;y=r.top+r.height/2}
  burst(x,y)
});
})();
