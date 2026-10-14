/* Diseñador visual de Emily · estilos por elemento y capas añadidas.
   Todos los cambios se guardan en window.EMILY_CONFIG.design. */
(function(){
"use strict";
const base=new Map();
let lastCustom=[];
let lastHidden=new Set();
let lastBackgrounds=new Set();
let activeCfg=window.EMILY_CONFIG||{};
const originalIds=[
"envelopeWrap","open","angel","wax","cover-floral","cross","cover-title-line","cover-name",
"cover-day","cover-month","cover-year","cover-subtitle","cover-button","blessing",
"parents-heading","parents","godmother-heading","godmother",
"countdown-heading","date-large","month-top","weekday-year","calendar",
"ceremony-heading","church","church-location","ceremony-time","maps-button",
"dress-heading","dress-text","dress-chips","rsvp-heading","rsvp-message","rsvp-button",
"album-heading","album-message","album-button","closing-message","closing-title"
];
const sectionIds=["gate","portada","familia","fecha","ceremonia","vestimenta","asistencia","album","despedida"];
const lookup=id=>document.getElementById(id);
const canColor=value=>typeof value==="string"&&/^#[0-9a-f]{6}$/i.test(value);
const cap=(n,min,max,d)=>Number.isFinite(+n)?Math.min(max,Math.max(min,+n)):d;
const sanitizeImage=src=>{
 if(typeof src!=="string")return"";
 if(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src)&&src.length<1250000)return src;
 try{const url=new URL(src);return url.protocol==="https:"?url.href:"";}catch(e){return""}
};
function start(){
 for(const id of originalIds){
   const el=lookup(id);if(!el)continue;
   el.dataset.designKey=id;el.dataset.designOriginal="1";
   base.set(id,{css:el.getAttribute("style")||"",markup:el.innerHTML,hidden:el.hidden});
 }
 const gate=lookup("gate");if(gate)gate.dataset.designSection="gate";
 for(const id of sectionIds.slice(1)){const s=lookup(id);if(s)s.dataset.designSection=id}
 window.__emilyVisualUpdate=function(){
   const cfg=window.EMILY_CONFIG||{};
   const design=cfg.design||{};
   apply(design,cfg);
 };
 apply((window.EMILY_CONFIG||{}).design||{},window.EMILY_CONFIG||{});
 window.addEventListener("message",event=>{
   if(event.origin!==location.origin||event.data?.type!=="emily-preview-update")return;
   // Wait until the main invitation script has updated the underlying content.
   queueMicrotask(()=>apply((event.data.config||{}).design||{},event.data.config||{}));
 });
}
function restore(){
 for(const id of originalIds){
  const el=lookup(id),snapshot=base.get(id);if(!el||!snapshot)continue;
  el.setAttribute("style",snapshot.css);
  // Conserva los valores controlados por el editor principal después del restablecimiento.
  if(id==="cover-title-line")el.style.fontStyle=activeCfg.firstItalic?"italic":"normal";
  if(id==="cover-name")el.style.fontStyle=activeCfg.secondItalic?"italic":"normal";
  if(id==="angel"&&canColor(activeCfg.angelWings))el.style.setProperty("--angel-wings",activeCfg.angelWings);
  if(el.dataset.imageOverridden==="1"){el.innerHTML=snapshot.markup;delete el.dataset.imageOverridden;}
  if(lastHidden.has(id)){
   const special={cross:activeCfg.coverCross===false,"cover-floral":activeCfg.coverFlowers===false,wax:activeCfg.showSeal===false,
    "cover-subtitle":!activeCfg.showSubtitle||!activeCfg.subtitle,
    "rsvp-button":!activeCfg.googleFormUrl||activeCfg.embedGoogleForm===true,
    "album-button":!activeCfg.albumUrl};
   el.hidden=Object.prototype.hasOwnProperty.call(special,id)?special[id]:false;
  }
 }
 for(const el of lastCustom){el.remove()}
 lastCustom=[];
 for(const el of [...document.querySelectorAll(".emily-extra-section")])el.remove();
}
function geometry(el,placement){
 if(!placement||typeof placement!=="object")return;
 const area=el.closest("[data-design-section]");
 if(!area)return;
 el.style.position="absolute";
 el.style.left=cap(placement.x,-30,130,25)+"%";
 el.style.top=cap(placement.y,-30,130,25)+"%";
 el.style.width=cap(placement.w,3,150,50)+"%";
 el.style.height=placement.h&&Number(placement.h)>0?cap(placement.h,12,1200,100)+"px":"auto";
 el.style.transform="rotate("+cap(placement.rotate,-360,360,0)+"deg)";
 el.style.zIndex=String(cap(placement.z,0,999,20));
 el.style.margin="0";
 el.style.maxWidth="none";
}
function decorationsSvg(kind){
 const strok='#bda06a';
 if(kind==="angel")return '<svg viewBox="0 0 120 140" aria-hidden="true" style="width:100%;height:100%"><ellipse cx="60" cy="14" rx="26" ry="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M37 75Q9 38 5 66Q5 103 44 103M83 75Q111 38 115 66Q115 103 76 103" fill="#fff" stroke="currentColor" stroke-width="1.5"/><path d="M39 88Q60 75 81 88L94 137H26Z" fill="#f1e6d3" stroke="currentColor"/><circle cx="60" cy="53" r="29" fill="#f7dfc3" stroke="currentColor"/><path d="M33 48Q30 18 55 20Q83 9 89 45Q74 25 60 30Q42 30 33 48Z" fill="#b89a75"/><circle cx="50" cy="56" r="2" fill="#66523c"/><circle cx="70" cy="56" r="2" fill="#66523c"/><path d="M54 69Q60 73 66 69" fill="none" stroke="#ae806e" stroke-width="2"/></svg>';
 if(kind==="cross")return '<svg viewBox="0 0 100 125" aria-hidden="true" style="width:100%;height:100%"><path d="M50 4V119M14 36H86" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>';
 if(kind==="dove")return '<svg viewBox="0 0 150 115" aria-hidden="true" style="width:100%;height:100%"><path d="M7 68 Q47 55 58 24 Q66 62 83 50 Q123 26 145 9 Q135 64 94 76 Q70 110 37 95 Q49 85 51 76 Q22 90 7 68Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
 if(kind==="flower")return '<svg viewBox="0 0 120 120" aria-hidden="true" style="width:100%;height:100%"><path d="M65 72Q55 90 48 115" stroke="#a2ae9a" stroke-width="2" fill="none"/><g fill="#fffefa" stroke="currentColor" stroke-width="1.6"><ellipse cx="60" cy="44" rx="13" ry="30"/><ellipse cx="60" cy="44" rx="13" ry="30" transform="rotate(72 60 44)"/><ellipse cx="60" cy="44" rx="13" ry="30" transform="rotate(144 60 44)"/><ellipse cx="60" cy="44" rx="13" ry="30" transform="rotate(216 60 44)"/><ellipse cx="60" cy="44" rx="13" ry="30" transform="rotate(288 60 44)"/></g><circle cx="60" cy="44" r="9" fill="#dcbf85"/></svg>';
 if(kind==="sparkle")return '<svg viewBox="0 0 100 100" aria-hidden="true" style="width:100%;height:100%"><path d="M50 1Q60 38 99 50Q60 61 50 99Q38 61 1 50Q38 38 50 1Z" fill="currentColor" opacity=".85"/></svg>';
 if(kind==="heart")return '<svg viewBox="0 0 100 100" aria-hidden="true" style="width:100%;height:100%"><path d="M50 89L10 50Q-2 22 20 16Q39 10 50 32Q64 7 83 17Q108 33 90 55Z" fill="none" stroke="currentColor" stroke-width="4"/></svg>';
 if(kind==="ornament")return '<svg viewBox="0 0 180 90" aria-hidden="true" style="width:100%;height:100%"><path d="M0 43H71M109 43H180M90 12V75" stroke="currentColor" stroke-width="1.6"/><path d="M89 44Q65 30 75 23Q90 20 89 44Q113 30 102 23Q89 20 89 44Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
 return '<span aria-hidden="true" style="font-size:44px">✧</span>';
}
function createSection(item){
 if(!item||typeof item!=="object"||typeof item.id!=="string"||!/^[\w-]{1,45}$/.test(item.id))return;
 const main=lookup("invitation");if(!main)return;
 const node=document.createElement("section");node.id=item.id;
 node.className="section emily-extra-section";
 node.dataset.designSection=item.id;
 node.style.minHeight=cap(item.height,180,1600,650)+"px";
 if(canColor(item.background))node.style.background=item.background;
 const footer=lookup("despedida");
 if(footer)main.insertBefore(node,footer);else main.appendChild(node);
 lastCustom.push(node);
}
function createExtra(item){
 if(!item||typeof item!=="object")return;
 if(!/^[a-z0-9_-]{1,55}$/i.test(item.id||""))return;
 const section=lookup(item.section);if(!section)return;
 const el=document.createElement(item.kind==="image"?"img":item.kind==="button"?"a":"div");
 el.dataset.designKey=item.id;el.dataset.designExtra="1";
 el.style.boxSizing="border-box";el.style.textAlign="center";
 el.style.whiteSpace="pre-line";
 el.style.overflow="visible";
 const type=item.kind||"text";
 if(type==="image"){
  const source=sanitizeImage(item.src);
  if(!source)return;
  el.src=source;el.alt=String(item.alt||"Decoración").slice(0,150);
  el.style.objectFit="contain";el.draggable=false;
 }else if(type==="ornament"){
  el.innerHTML=decorationsSvg(item.shape||"sparkle");
  el.style.color=canColor(item.color)?item.color:"#bda06a";
 }else{
  el.textContent=String(item.text||"").slice(0,900);
  if(type==="button"){el.href=(typeof item.href==="string"&&/^https:\/\//.test(item.href))?item.href:"#";el.target="_blank";el.rel="noopener noreferrer";el.style.padding="12px";el.style.borderRadius="32px";el.style.border="1px solid currentColor";}
 }
 if(type==="text"||type==="button"){
  el.style.fontFamily=(typeof item.font==="string"&&item.font.length<60)?('"'+item.font.replace(/[^A-Za-z ]/g,"")+'",Georgia,serif'):"Georgia,serif";
  el.style.fontSize=cap(item.size,10,150,28)+"px";
  el.style.fontWeight=item.bold?"700":"400";
  el.style.fontStyle=item.italic?"italic":"normal";
  el.style.letterSpacing=cap(item.spacing,-3,20,0)+"px";
  el.style.textAlign=["left","right","center"].includes(item.align)?item.align:"center";
  el.style.lineHeight=String(cap(item.lineHeight,0.8,3,1.15));
  el.style.color=canColor(item.color)?item.color:"#b69a64";
 }
 if(canColor(item.background))el.style.background=item.background;
 if(item.opacity!=null)el.style.opacity=cap(item.opacity,0,1,1);
 geometry(el,item.position||{x:20,y:35,w:60,z:30});
 section.appendChild(el);lastCustom.push(el);
}
function apply(design,config){
 activeCfg=config||window.EMILY_CONFIG||{};
 for(const id of lastBackgrounds){const section=lookup(id);if(section){section.style.backgroundImage="";section.style.backgroundSize="";section.style.backgroundPosition="";}}
 lastBackgrounds=new Set();
 restore();
 for(const section of design.sections||[]){createSection(section)}
 for(const [id,img] of Object.entries(design.backgrounds||{})){
  const section=lookup(id),source=sanitizeImage(img);
  if(section&&source){section.style.backgroundImage="url("+JSON.stringify(source)+")";section.style.backgroundSize="cover";section.style.backgroundPosition="center";lastBackgrounds.add(id)}
 }
 for(const [id,src] of Object.entries(design.images||{})){
  const el=lookup(id),url=sanitizeImage(src);
  if(!el||!base.has(id)||!url)continue;
  el.innerHTML="";
  if(el.namespaceURI==="http://www.w3.org/2000/svg"){
   const image=document.createElementNS("http://www.w3.org/2000/svg","image");
   image.setAttribute("href",url);image.setAttribute("x","0");image.setAttribute("y","0");image.setAttribute("width","100%");image.setAttribute("height","100%");
   image.setAttribute("preserveAspectRatio","xMidYMid meet");el.appendChild(image);
  }else{
   const img=document.createElement("img");img.src=url;img.alt=id;img.draggable=false;
   img.style.cssText="width:100%;height:100%;object-fit:contain;display:block;";el.appendChild(img);
  }
  el.dataset.imageOverridden="1";
 }
 for(const [id,content] of Object.entries(design.texts||{})){
  if(!base.has(id))continue;
  const el=lookup(id);if(el&&typeof content==="string")el.textContent=content.slice(0,1500);
 }
 for(const [id,style] of Object.entries(design.styles||{})){
  const el=lookup(id);if(!el||!base.has(id)||!style)continue;
  if(canColor(style.color))el.style.color=style.color;
  if(canColor(style.background))el.style.background=style.background;
  if(style.size!=null)el.style.fontSize=cap(style.size,9,160,24)+"px";
  if(typeof style.font==="string"&&style.font.length<60)el.style.fontFamily='"'+style.font.replace(/[^A-Za-z ]/g,"")+'",Georgia,serif';
  if(style.italic!=null)el.style.fontStyle=style.italic?"italic":"normal";
  if(style.bold!=null)el.style.fontWeight=style.bold?"700":"400";
  if(style.spacing!=null)el.style.letterSpacing=cap(style.spacing,-4,28,0)+"px";
  if(style.lineHeight!=null)el.style.lineHeight=String(cap(style.lineHeight,0.8,3,1.2));
  if(style.opacity!=null)el.style.opacity=cap(style.opacity,0,1,1);
  if(["center","left","right"].includes(style.align))el.style.textAlign=style.align;
 }
 for(const [id,placement] of Object.entries(design.placements||{})){
  const el=lookup(id);if(el&&base.has(id))geometry(el,placement);
 }
 for(const item of design.elements||[]){createExtra(item)}
 lastHidden=new Set(design.hidden||[]);
 for(const id of lastHidden){const el=lookup(id);if(el&&(base.has(id)||el.dataset.designExtra==="1"))el.hidden=true}
 if(window.__emilyDesignSelectCallback)window.__emilyDesignSelectCallback();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
