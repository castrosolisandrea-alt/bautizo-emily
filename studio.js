/* Estudio visual para el bautizo de Emily.
   Sin cuentas o permisos de publicación en el navegador: publica mediante config.js. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const base=window.EMILY_CONFIG||{};
function clone(v){return v===undefined?undefined:JSON.parse(JSON.stringify(v))}
function clean(d){const result=d&&typeof d==="object"?d:{};return{
 hidden:Array.isArray(result.hidden)?result.hidden:[],
 placements:result.placements&&typeof result.placements==="object"?result.placements:{},
 styles:result.styles&&typeof result.styles==="object"?result.styles:{},
 texts:result.texts&&typeof result.texts==="object"?result.texts:{},
 images:result.images&&typeof result.images==="object"?result.images:{},
 backgrounds:result.backgrounds&&typeof result.backgrounds==="object"?result.backgrounds:{},
 sections:Array.isArray(result.sections)?result.sections:[],
 elements:Array.isArray(result.elements)?result.elements:[]
};}
let settings={...clone(base),design:clean(clone(base.design||{}))};
try{const saved=localStorage.getItem("emily-studio-v1");if(saved){const o=JSON.parse(saved);settings={...settings,...o,design:clean(o.design)}}}catch(e){}
const history=[],future=[];
const nativeIds=["envelopeWrap","open","angel","wax","cover-floral","cross","cover-title-line","cover-name","cover-day","cover-month","cover-year","cover-subtitle","cover-button","blessing","parents-heading","parents","godmother-heading","godmother","countdown-heading","month-top","date-large","weekday-year","calendar","ceremony-heading","church","church-location","ceremony-time","maps-button","dress-heading","dress-text","dress-chips","rsvp-heading","rsvp-message","rsvp-button","album-heading","album-message","album-button","closing-message","closing-title"];
const sectionDefs=[
 ["gate","Sobre",null],["portada","Portada",null],["familia","Familia","showFamily"],
 ["fecha","Cuenta regresiva","showCountdown"],["ceremonia","Ceremonia","showCeremony"],
 ["vestimenta","Vestimenta","showDressCode"],["asistencia","Confirmación","showRSVP"],
 ["album","Álbum","showAlbum"],["despedida","Despedida","showClosing"]
];
const fonts=["Cormorant Garamond","EB Garamond","Playfair Display","Libre Baskerville","Georgia","Great Vibes","Allura","Parisienne","Dancing Script","Sacramento","Tangerine","Marcellus","Cinzel","Lora","Josefin Sans","Montserrat","DM Sans","Poppins"];
const ornaments=[
 ["cross","Cruz","✝"],["dove","Paloma","🕊"],["flower","Flor blanca","✿"],
 ["ornament","Línea fina","❧"],["sparkle","Destello","✧"],["heart","Corazón","♡"],
 ["angel","Angelito","♧"]
];
const nativeLabels={
 envelopeWrap:"Sobre completo",open:"Botón abrir",angel:"Angelito",wax:"Sello",cross:"Cruz",
 "cover-floral":"Flores de portada","cover-title-line":"Bautizo de","cover-name":"Emily",
 "cover-day":"Número del día","cover-month":"Mes","cover-year":"Año",
 "cover-subtitle":"Frase opcional","cover-button":"Botón portada",
 blessing:"Bendición","parents-heading":"Título padres",parents:"Nombres padres",
 "godmother-heading":"Título madrina",godmother:"Madrina",
 "countdown-heading":"Título contador","month-top":"Mes del contador","date-large":"Día contador",
 "weekday-year":"Día de semana",calendar:"Agendar fecha","ceremony-heading":"Título ceremonia",
 church:"Nombre de iglesia","church-location":"Ciudad", "ceremony-time":"Hora ceremonia",
 "maps-button":"Botón mapa","dress-heading":"Código de vestimenta",
 "dress-text":"Vestimenta","dress-chips":"Paleta pastel","rsvp-heading":"Título confirmación",
 "rsvp-message":"Mensaje confirmación","rsvp-button":"Botón confirmar",
 "album-heading":"Título del álbum","album-message":"Texto del álbum",
 "album-button":"Botón del álbum","closing-message":"Mensaje final",
 "closing-title":"¡Te esperamos!"
};
let tool="design",section="gate",selected=null,mode="edit",move=null,frameReady=false;
const iframe=$("phone");
function notify(txt){$("saving").textContent=txt}
function snapshot(){history.push(clone(settings));if(history.length>45)history.shift();future.length=0;}
function edit(fn,{remember=true,render=true}={}){
 if(remember)snapshot();fn();if(render){sync();drawInspector();drawTool()}notify("Cambios sin publicar");
}
function undo(){
 if(!history.length)return;
 future.push(clone(settings));settings=history.pop();sync();drawInspector();drawTool();notify("Cambio deshecho");
}
function redo(){
 if(!future.length)return;
 history.push(clone(settings));settings=future.pop();sync();drawInspector();drawTool();notify("Cambio rehecho");
}
function sync(){
 if(!frameReady)return;
 iframe.contentWindow.postMessage({type:"emily-preview-update",config:settings},location.origin);
}
function doc(){try{return iframe.contentDocument}catch(e){return null}}
function find(id){const d=doc();if(!d)return null;return [...d.querySelectorAll("[data-design-key]")].find(el=>el.dataset.designKey===id)||null}
function getSectionNode(s){return doc()?.getElementById(s)||null}
function labelFor(id){if(nativeLabels[id])return nativeLabels[id];const custom=settings.design.elements.find(x=>x.id===id);return custom?(custom.kind==="text"?(custom.text||"Texto").slice(0,27):custom.kind==="image"?"Imagen":custom.kind==="ornament"?"Adorno "+custom.shape:"Botón"):"Elemento";}
function activateTool(name){
 tool=name;$("tool-title").textContent={design:"Diseños",texts:"Textos",elements:"Elementos",uploads:"Subir imágenes",layers:"Capas",sections:"Secciones",settings:"Datos del evento"}[tool]||"Diseños";
 document.querySelectorAll(".rail button").forEach(b=>b.classList.toggle("active",b.dataset.tool===tool));
 drawTool();$("inspector").classList.remove("show");
 $("library").classList.add("show");
}
function showDialog(content){
 $("modal-body").replaceChildren();if(typeof content==="string")$("modal-body").innerHTML=content;else $("modal-body").appendChild(content);
 $("modal").hidden=false;
}
function hideDialog(){$("modal").hidden=true}
function node(tag,cls,text){
 const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;
}
function button(text,action,cls="mini-button"){const el=node("button",cls,text);el.type="button";el.addEventListener("click",action);return el}
function p(text,cls=""){return node("p",cls,text)}
function toolHeading(parent,text){parent.appendChild(node("h3","",text))}
function rowButton(parent,title,subtitle,symbol,action){
 const b=button("",action,"add-row");
 const icon=node("span","icon",symbol),body=node("span");
 body.appendChild(node("strong","",title));if(subtitle)body.appendChild(node("small","",subtitle));
 b.append(icon,body);parent.appendChild(b);
}
function mountSection(id){
 section=id;$("section-selector").value=id;
 const needsEnvelope=id==="gate";
 const currentSrc=iframe.getAttribute("src")||"";
 const nextSrc="./index.html?editorPreview="+(needsEnvelope?"envelope":"sections");
 if(!currentSrc.includes("editorPreview="+(needsEnvelope?"envelope":"sections"))){
  frameReady=false;iframe.src=nextSrc;
 }else scrollToSection();
 drawTool();
}
function scrollToSection(){
 if(section==="gate"){
  try{iframe.contentWindow.scrollTo({top:0,left:0,behavior:"instant"})}catch(e){}
  return;
 }
 const f=iframe.contentWindow,s=getSectionNode(section);
 if(f&&s)f.scrollTo({top:Math.max(0,s.getBoundingClientRect().top+f.scrollY-3),behavior:"instant"});
}
function selectedElementInfo(){
 if(!selected)return null;
 const element=settings.design.elements.find(e=>e.id===selected);
 if(element)return{custom:true,data:element};
 if(nativeIds.includes(selected))return{custom:false,data:null};
 return null;
}
function selectedInDocument(){
 const el=find(selected);
 if(el){el.setAttribute("data-editor-selected","1");}
}
function clearMark(){
 doc()?.querySelectorAll('[data-editor-selected="1"]').forEach(x=>x.removeAttribute("data-editor-selected"));
}
function select(id){
 if(selected===id){drawInspector();return}
 clearMark();selected=id;
 selectedInDocument();drawInspector();
 if(tool==="layers")drawTool();
 if(window.innerWidth<=1090){$("inspector").classList.add("show");$("library").classList.remove("show")}
}
function previewStyles(){
 const d=doc();if(!d)return;
 const style=d.createElement("style");
 style.id="emily-studio-preview";
 style.textContent='[data-design-key]{cursor:grab!important;}[data-design-key]:hover{outline:1.5px dashed #b99b66!important;outline-offset:4px;}[data-editor-selected="1"]{outline:2px solid #977443!important;outline-offset:5px;}[data-design-extra="1"]{user-select:none;}html{scrollbar-width:thin}';
 d.head.appendChild(style);
}
function setupFrame(){
 const d=doc();if(!d)return;
 frameReady=true;
 try{d.defaultView.history.scrollRestoration="manual"}catch(e){}
 if(mode==="edit"){previewStyles();d.addEventListener("pointerdown",dragBegin,true);d.addEventListener("pointermove",dragMove,true);d.addEventListener("pointerup",dragEnd,true);d.addEventListener("pointercancel",dragEnd,true);d.addEventListener("click",stopInteractive,true);d.addEventListener("dblclick",editTextDouble,true)}
 d.defaultView.__emilyDesignSelectCallback=()=>{clearMark();selectedInDocument()};
 sync();
 setTimeout(()=>{scrollToSection();selectedInDocument()},140);
 if(section==="gate")setTimeout(scrollToSection,550);
}
function stopInteractive(e){
 if(mode!=="edit")return;
 if(e.target.closest("a,button")||e.target.closest("[data-design-key]")){e.preventDefault();e.stopImmediatePropagation();}
}
function editTextDouble(e){
 const el=e.target.closest("[data-design-key]");
 if(!el||!selected||el.dataset.designKey!==selected)return;
 const info=selectedElementInfo();
 if(info?.custom&&info.data.kind==="image")return;
 e.preventDefault();
 openTextModal(selected);
}
function dragBegin(e){
 if(mode!=="edit"||e.button>0)return;
 const el=e.target.closest("[data-design-key]");
 if(!el)return;
 e.preventDefault();e.stopPropagation();
 const id=el.dataset.designKey;
 select(id);
 const parent=el.closest("[data-design-section]");
 if(!parent)return;
 const pRect=parent.getBoundingClientRect(),rect=el.getBoundingClientRect();
 const custom=settings.design.elements.find(item=>item.id===id);
 const prev=clone(custom?(custom.position||{}):(settings.design.placements[id]||{}));
 move={
  id,el,parent,original:prev,
  startX:e.clientX,startY:e.clientY,
  x:typeof prev.x==="number"?prev.x:(rect.left-pRect.left)/pRect.width*100,
  y:typeof prev.y==="number"?prev.y:(rect.top-pRect.top)/pRect.height*100,
  w:typeof prev.w==="number"?prev.w:rect.width/pRect.width*100,
  h:typeof prev.h==="number"?prev.h:0,
  rotate:typeof prev.rotate==="number"?prev.rotate:0,
  z:typeof prev.z==="number"?prev.z:30,
  width:pRect.width,height:pRect.height,changed:false
 };
 try{el.setPointerCapture(e.pointerId)}catch(err){}
}
function dragMove(e){
 if(!move)return;
 const dx=(e.clientX-move.startX)/move.width*100;
 const dy=(e.clientY-move.startY)/move.height*100;
 if(Math.abs(dx)+Math.abs(dy)<.35&&!move.changed)return;
 move.changed=true;
 const newX=Math.max(-25,Math.min(125,move.x+dx)),newY=Math.max(-25,Math.min(125,move.y+dy));
 move.el.style.position="absolute";
 move.el.style.left=newX+"%";move.el.style.top=newY+"%";
 move.el.style.width=move.w+"%";move.el.style.height=move.h>0?move.h+"px":"auto";
 move.el.style.margin="0";move.el.style.zIndex=String(move.z);
 move.el.style.transform="rotate("+move.rotate+"deg)";
 e.preventDefault();
}
function dragEnd(e){
 if(!move)return;
 if(move.changed){
  const dx=(e.clientX-move.startX)/move.width*100,dy=(e.clientY-move.startY)/move.height*100;
  const item={x:Math.round(Math.max(-25,Math.min(125,move.x+dx))*10)/10,y:Math.round(Math.max(-25,Math.min(125,move.y+dy))*10)/10,w:move.w,h:move.h,rotate:move.rotate,z:move.z};
  snapshot();
  const obj=settings.design.elements.find(el=>el.id===move.id);
  if(obj)obj.position=item;else settings.design.placements[move.id]=item;
  sync();notify("Posición modificada");drawInspector();
 }
 move=null;
}
function openTextModal(id){
 const wrap=node("div");
 wrap.appendChild(node("h2","","Editar texto"));
 const element=find(id);
 const info=selectedElementInfo();
 const current=info?.custom?info.data.text||"":settings.design.texts[id]??(element?.textContent||"").trim();
 const label=node("label","field");
 label.appendChild(node("span","","Contenido"));
 const area=node("textarea");area.value=current;area.rows=5;area.style.width="100%";area.style.marginTop="8px";
 label.appendChild(area);wrap.appendChild(label);
 wrap.appendChild(button("Guardar texto",()=>{
  edit(()=>{if(info?.custom)info.data.text=area.value;else settings.design.texts[id]=area.value});
  hideDialog();
 },"primary"));
 showDialog(wrap);
}
function newId(){return "item"+Date.now().toString(36)+Math.floor(Math.random()*9000+1000)}
function createElement(kind,shape=""){
 const next={
  id:newId(),section,kind,
  text:kind==="text"?"Tu nuevo texto":kind==="button"?"Abrir enlace":"",
  src:"",shape:shape||"sparkle",font:"Cormorant Garamond",size:kind==="text"?35:21,
  color:"#bd9b61",align:"center",bold:false,italic:false,
  spacing:0,lineHeight:1.15,opacity:1,position:{x:20,y:37,w:60,h:0,rotate:0,z:36}
 };
 if(kind==="ornament"){next.position={x:35,y:29,w:30,h:0,rotate:0,z:36}}
 if(section==="gate")next.position.y=25;
 if(kind==="image"){fileMode="new";triggerFile();return}
 edit(()=>settings.design.elements.push(next));select(next.id);
}
function chosenSectionChoices(container){
 const sel=node("select");sel.id="select-section";
 sectionDefs.forEach(([id,label])=>{const o=node("option","",label);o.value=id;sel.appendChild(o)});
 settings.design.sections.forEach(s=>{const o=node("option","",s.title||s.id);o.value=s.id;sel.appendChild(o)});
 sel.value=section;sel.addEventListener("change",()=>mountSection(sel.value));container.appendChild(sel);
}
function populateSections(){
 const sel=$("section-selector"),prev=sel.value;
 sel.replaceChildren();
 sectionDefs.forEach(([id,label])=>{const o=node("option","",label);o.value=id;sel.appendChild(o)});
 settings.design.sections.forEach(s=>{const o=node("option","",s.title||s.id);o.value=s.id;sel.appendChild(o)});
 sel.value=section;
 if(sel.selectedIndex===-1){section="portada";sel.value=section}
}
function drawTool(){
 const area=$("tool-content");area.replaceChildren();
 if(tool==="design"){
  area.appendChild(p("Prueba diseños sobre tu invitación. Podrás modificar después cualquier elemento.","tool-note"));
  const looks=[
   ["Original marfil","Blanco marfil, dorado champagne, cruz clásica","classic"],
   ["Elegancia floral","Flores tenues y títulos delicados","floral"],
   ["Minimalista","Sin flores, mucho espacio y dorado sutil","clean"],
   ["Romántico","Cursiva delicada y beige cálido","romantic"]
  ];
  looks.forEach(([title,desc,preset])=>{
   const t=button("",()=>applyPreset(preset),"style-tile "+(preset==="floral"?"floral":preset==="romantic"?"airy":preset==="clean"?"dark":""));
   t.appendChild(node("b","",preset==="romantic"?"Emily":preset==="clean"?"Bautizo":preset==="floral"?"✿ Emily":"✝ Emily"));
   t.appendChild(node("em","",title));t.appendChild(node("p","",desc));area.appendChild(t);
  });
  area.appendChild(p("Si no te gusta un diseño, usa Deshacer. No se reemplaza el contenido del bautizo.","info"));
 }else if(tool==="texts"){
  toolHeading(area,"Agregar textos");
  rowButton(area,"Añadir título","Grande y elegante","T",()=>{createElement("text")});
  rowButton(area,"Añadir subtítulo","Para frases cortas","Aa",()=>{
   createElement("text");const item=settings.design.elements.at(-1);
   if(item){edit(()=>{item.size=24;item.text="Escribe tu subtítulo";item.italic=true})}
  });
  rowButton(area,"Añadir párrafo","Texto más pequeño","¶",()=>{
   createElement("text");const item=settings.design.elements.at(-1);
   if(item){edit(()=>{item.size=18;item.color="#635647";item.text="Tu mensaje especial"})}
  });
  rowButton(area,"Añadir botón","Un enlace tocable","▢",()=>createElement("button"));
  area.appendChild(node("div","divider"));
  toolHeading(area,"Fuentes disponibles");
  fonts.forEach(f=>{
   const b=button(f,()=>{
    if(!selected)return;
    setStyle("font",f);
   },"add-row");
   b.style.fontFamily='"'+f+'",Georgia,serif';b.style.fontSize="19px";
   area.appendChild(b);
  });
 }else if(tool==="elements"){
  toolHeading(area,"Buscar elementos");
  const search=node("input","tool-search");search.placeholder="Cruz, flor, paloma, estrella...";
  area.appendChild(search);
  const grid=node("div","grid2");
  const render=()=>{
   grid.replaceChildren();
   ornaments.filter(([shape,label])=>(shape+" "+label).toLowerCase().includes(search.value.toLowerCase())).forEach(([shape,label,symbol])=>{
    const b=button(" ",()=>createElement("ornament",shape),"tile");
    b.textContent="";
    b.appendChild(node("span","symbol",symbol));
    b.appendChild(node("small","",label));
    grid.appendChild(b);
   });
  };search.addEventListener("input",render);render();area.appendChild(grid);
  area.appendChild(p("Son elementos vectoriales propios. Si prefieres otras ilustraciones, también puedes subir tus PNG, JPG o WebP.","tool-note"));
 }else if(tool==="uploads"){
  toolHeading(area,"Tu propia biblioteca");
  area.appendChild(p("Puedes subir una cruz, angelito, flores, fondo o cualquier ilustración. Recomendamos PNG con transparencia.","tool-note"));
  rowButton(area,"Subir imagen","La colocaré en la sección seleccionada","↥",()=>{fileMode="new";triggerFile()});
  rowButton(area,"Subir fondo de la sección","Reemplazar el fondo con tu imagen","▧",()=>{fileMode="background";triggerFile()});
  if(settings.design.backgrounds?.[section])rowButton(area,"Quitar fondo personalizado","Volver al fondo marfil","✕",()=>edit(()=>{delete settings.design.backgrounds[section]}));
  if(selected)rowButton(area,"Reemplazar seleccionado","Poner otra imagen en su lugar","↺",()=>{fileMode="replace";triggerFile()});
  area.appendChild(p("Las imágenes se comprimen y quedan guardadas en la configuración. Los archivos publicados son visibles para cualquiera con el enlace.","info"));
 }else if(tool==="layers"){
  toolHeading(area,"Capas de "+sectionTitle(section));
  const d=doc(),s=getSectionNode(section);
  if(s){
   const els=[...s.querySelectorAll("[data-design-key]")].filter(el=>el.closest("[data-design-section]")===s);
   els.reverse().forEach(el=>{
    const id=el.dataset.designKey;
    const row=node("div","layer"+(selected===id?" active":""));
    row.appendChild(node("span","",labelFor(id)));
    row.querySelector("span").addEventListener("click",()=>select(id));
    const hidden=settings.design.hidden.includes(id);
    const eye=button(hidden?"◌":"◉",()=>{
      edit(()=>toggleHidden(id));
    },"eye");
    eye.title=hidden?"Mostrar":"Ocultar";row.appendChild(eye);
    area.appendChild(row);
   });
  }else area.appendChild(p("Carga esta sección para ver sus capas."));
  area.appendChild(p("Toca una capa para seleccionarla. En Propiedades puedes cambiar su orden, tamaño y posición.","tool-note"));
 }else if(tool==="sections"){
  toolHeading(area,"Orden de la invitación");
  sectionDefs.forEach(([id,name,key])=>{
   const row=node("div","layer");
   const label=node("span","",name);label.addEventListener("click",()=>mountSection(id));row.appendChild(label);
   if(key){
    row.appendChild(button(settings[key]===false?"＋":"◉",()=>edit(()=>{settings[key]=settings[key]===false}),"eye"));
   }area.appendChild(row);
  });
  settings.design.sections.forEach(s=>{
   const row=node("div","layer");
   const title=node("span","",s.title||s.id);title.addEventListener("click",()=>mountSection(s.id));row.appendChild(title);
   row.appendChild(button("✕",()=>{if(confirm("¿Eliminar la sección y sus elementos?"))edit(()=>{settings.design.sections=settings.design.sections.filter(v=>v.id!==s.id);settings.design.elements=settings.design.elements.filter(v=>v.section!==s.id);populateSections();mountSection("portada")})},"eye"));
   area.appendChild(row);
  });
  area.appendChild(button("＋ Añadir sección en blanco",()=>{
   const name=prompt("Nombre de la nueva sección:","Un momento especial");
   if(!name)return;
   const id="seccion"+Date.now().toString(36);
   edit(()=>{
    settings.design.sections.push({id,title:name,background:settings.ivory,height:650});
    settings.design.elements.push({id:newId(),section:id,kind:"text",text:name,size:41,font:"Cormorant Garamond",color:settings.gold,italic:true,align:"center",position:{x:12,y:38,w:76,z:20}});
    populateSections();
   });mountSection(id);
  },"mini-button full primary"));
 }else if(tool==="settings"){
  toolHeading(area,"Información y conexiones");
  area.appendChild(p("Puedes continuar editando los textos, fechas, la iglesia y todos los enlaces aquí, sin entrar al código.","tool-note"));
  field(area,"Título principal",settings,"first","text");
  field(area,"Nombre",settings,"second","text");
  field(area,"Google Forms para confirmar",settings,"googleFormUrl","url",null,"Solo el enlace público para responder, no el enlace de Sheets.");
  field(area,"Enlace del álbum de fotos",settings,"albumUrl","url",null,"Activa la colaboración en Google Fotos para permitir subidas.");
  field(area,"Límite anunciado",settings,"guestLimit","select",null,null,[
   ["1","Una persona"],["2","Máximo dos"],["none","Ocultarlo"]]);
  field(area,"Nombre de iglesia",settings,"church","text");
  field(area,"Hora de ceremonia",settings,"ceremonyTime","text");
  field(area,"Fecha real para contador",settings,"eventISO","text",null,"Ejemplo: 2026-11-21T11:00:00-05:00");
  area.appendChild(node("div","divider"));
  area.appendChild(button("Configuración detallada anterior ↗",()=>window.open("./editor.html","_blank"),"mini-button full"));
  area.appendChild(p("Si no quieres usar código, también puedo ayudarte a publicar cada cambio desde esta conversación.","info"));
 }
}
function applyPreset(which){
 edit(()=>{
  const d=settings.design;
  d.styles={};d.placements={};
  if(which==="classic"){
   Object.assign(settings,{ivory:"#FCFAF6",gold:"#BD9B61",background:"#F9F6F0",coverFlowers:true,showEnvelopeFlowers:true,font:"Cormorant Garamond",firstItalic:false,secondItalic:false,firstSize:43,secondSize:85});
  }else if(which==="floral"){
   Object.assign(settings,{ivory:"#FFFCF8",gold:"#BF9E67",background:"#F9F5EE",coverFlowers:true,showEnvelopeFlowers:true,font:"Playfair Display",firstItalic:false,secondItalic:false,firstSize:39,secondSize:69});
  }else if(which==="clean"){
   Object.assign(settings,{ivory:"#FDFBF8",gold:"#A98A59",background:"#FBF8F2",coverFlowers:false,showEnvelopeFlowers:false,font:"Marcellus",firstItalic:false,secondItalic:false,firstSize:36,secondSize:68});
  }else if(which==="romantic"){
   Object.assign(settings,{ivory:"#FEFAF5",gold:"#C39E65",background:"#F6EEE4",coverFlowers:true,showEnvelopeFlowers:true,font:"Parisienne",firstItalic:false,secondItalic:false,firstSize:44,secondSize:93});
  }
 });
}
function sectionTitle(id){return sectionDefs.find(v=>v[0]===id)?.[1]||settings.design.sections.find(s=>s.id===id)?.title||id}
function toggleHidden(id){
 const arr=settings.design.hidden;
 if(arr.includes(id))settings.design.hidden=arr.filter(v=>v!==id);
 else settings.design.hidden=[...arr,id];
}
function field(container,title,obj,key,type,done,help,optionsList){
 const wrap=node("div","field"+(type==="checkbox"?" checkbox":""));
 const label=node("label");
 label.textContent=title;wrap.appendChild(label);
 let input;
 if(type==="textarea")input=node("textarea");
 else if(type==="select"){
  input=node("select");
  for(const [value,text] of (optionsList||[])){const opt=node("option","",text);opt.value=value;input.appendChild(opt)}
 }else{
  input=node("input");input.type=type==="checkbox"?"checkbox":type==="number"?"number":type==="color"?"color":type==="range"?"range":type==="url"?"url":"text";
 }
 if(type==="checkbox"){
  input.checked=!!obj[key];label.prepend(input);
 }else{
  if(type==="color"&&!/^#[0-9a-f]{6}$/i.test(obj[key]||""))obj[key]="#bda06a";
  input.value=obj[key]??"";
  if(type==="number"){input.step="1";input.min="-1000";input.max="1400";}
  wrap.appendChild(input);
 }
 if(help)wrap.appendChild(node("small","",help));
 let prior=null;
 const update=()=>{
  const value=input.type==="checkbox"?input.checked:input.type==="number"?Number(input.value):input.value;
  if(value===obj[key])return;
  if(!prior){snapshot();prior=true;}
  obj[key]=value;sync();notify("Cambios sin publicar");
  if(typeof done==="function")done();
 };
 input.addEventListener("input",update);
 input.addEventListener("change",()=>{update();prior=false;});
 container.appendChild(wrap);return input;
}
function setStyle(key,value){
 if(!selected)return;
 edit(()=>{
  const item=settings.design.elements.find(v=>v.id===selected);
  if(item){item[key]=value;return}
  const s=settings.design.styles[selected]||{};
  s[key]=value;settings.design.styles[selected]=s;
 });drawInspector();
}
function getStyle(key,fallback){
 const item=settings.design.elements.find(v=>v.id===selected);
 return item?(item[key]??fallback):(settings.design.styles[selected]?.[key]??fallback);
}
function getPlacement(){
 const item=settings.design.elements.find(v=>v.id===selected);
 if(item)return item.position||{x:25,y:30,w:50,h:0,z:30,rotate:0};
 const stored=settings.design.placements[selected];
 if(stored)return stored;
 const el=find(selected),area=el?.closest("[data-design-section]");
 if(!el||!area)return{x:25,y:35,w:50,h:0,z:30,rotate:0};
 const r=el.getBoundingClientRect(),p=area.getBoundingClientRect();
 return{x:+((r.left-p.left)/p.width*100).toFixed(1),y:+((r.top-p.top)/p.height*100).toFixed(1),w:+(r.width/p.width*100).toFixed(1),h:0,z:30,rotate:0};
}
function setPlacement(key,value){
 if(!selected)return;
 edit(()=>{
  const item=settings.design.elements.find(v=>v.id===selected);
  if(item){item.position={...getPlacement(),[key]:value};}
  else settings.design.placements[selected]={...getPlacement(),[key]:value};
 });
}
function inspectorSection(container){
 const pEl=node("p","tool-note","Selecciona un texto, una cruz, una flor o un dibujo en el celular. Después podrás moverlo, cambiarlo o eliminarlo.");
 container.appendChild(pEl);
 toolHeading(container,"Colores principales");
 for(const [label,key] of [["Marfil","ivory"],["Dorado champagne","gold"],["Color del texto","ink"]]){
  field(container,label,settings,key,"color",null);
 }
 container.appendChild(button("Añadir texto",()=>createElement("text"),"mini-button full"));
}
function drawInspector(){
 const holder=$("inspector-content");holder.replaceChildren();
 const info=selectedElementInfo();
 if(!selected||!info){$("inspector-title").textContent="Propiedades";inspectorSection(holder);return;}
 $("inspector-title").textContent=labelFor(selected);
 const isCustom=info.custom, obj=info.data||{};
 const isImage=isCustom&&obj.kind==="image";
 const isOrnament=isCustom&&obj.kind==="ornament";
 const style=settings.design.styles[selected]||{};
 const isStructural=["envelopeWrap","angel","wax","dress-chips"].includes(selected);
 holder.appendChild(p("Arrastra el elemento directamente sobre el celular. Los cambios quedan en tu borrador hasta publicarlos.","tool-note"));
 if(isCustom&&["text","button"].includes(obj.kind)){
  field(holder,"Contenido del texto",obj,"text","textarea");
 }else if(!isCustom&&!isStructural&&!["cross","cover-floral"].includes(selected)){
  if(settings.design.texts[selected]===undefined)settings.design.texts[selected]=find(selected)?.textContent?.trim()??"";
  field(holder,"Texto",settings.design.texts,selected,"textarea");
 }
 if(isCustom&&obj.kind==="button")field(holder,"Enlace del botón",obj,"href","url");
 if(isOrnament){
  field(holder,"Tipo de adorno",obj,"shape","select",null,null,ornaments.map(([value,label])=>[value,label]));
 }
 if(!["envelopeWrap","dress-chips"].includes(selected)){
  const fontObj=isCustom?obj:(settings.design.styles[selected]||(settings.design.styles[selected]={}));
  const fontsOptions=fonts.map(f=>[f,f]);
  if(!isImage&&!isOrnament&&selected!=="angel"&&selected!=="wax"){
   if(!isCustom&&!fontObj.font)fontObj.font=settings.font||"Cormorant Garamond";
   field(holder,"Tipografía",fontObj,"font","select",null,null,fontsOptions);
   field(holder,"Tamaño de letra",fontObj,isCustom?"size":"size","number");
   field(holder,"Cursiva",fontObj,"italic","checkbox");
   field(holder,"Negrita",fontObj,"bold","checkbox");
   field(holder,"Separación entre letras",fontObj,"spacing","number");
   field(holder,"Interlineado",fontObj,"lineHeight","number");
   field(holder,"Alineación",fontObj,"align","select",null,null,[["left","Izquierda"],["center","Centro"],["right","Derecha"]]);
  }
  field(holder,"Color",fontObj,"color","color");
  field(holder,"Opacidad (0 a 1)",fontObj,"opacity","number");
 }
 const wrap=node("div","two-fields");
 const placement=getPlacement();
 for(const [key,label] of [["x","Horizontal (%)"],["y","Vertical (%)"],["w","Ancho (%)"],["h","Alto (px)"],["rotate","Rotación (°)"],["z","Capa (orden)"]]){
  const proxy={value:placement[key]??0};
  const input=field(wrap,label,proxy,"value","number");
  input.addEventListener("input",()=>{if(Number.isFinite(Number(input.value)))setPlacement(key,Number(input.value))});
 }
 holder.appendChild(node("div","divider"));
 holder.appendChild(node("h3","","Posición y tamaño"));
 holder.appendChild(wrap);
 holder.appendChild(node("div","divider"));
 holder.appendChild(node("h3","","Imágenes y elementos"));
 if(selected==="angel"){
  holder.appendChild(button("Cambiar angelito por imagen",()=>{fileMode="replace";triggerFile()},"mini-button full"));
  holder.appendChild(button("Restaurar angelito original",()=>edit(()=>{settings.angelImageUrl=""}),"mini-button full"));
 }else if(!["envelopeWrap","open","dress-chips"].includes(selected)){
  holder.appendChild(button("Subir imagen para reemplazar",()=>{fileMode="replace";triggerFile()},"mini-button full"));
 }
 if(settings.design.images[selected]){
  holder.appendChild(button("Restaurar imagen original",()=>edit(()=>{delete settings.design.images[selected]}),"mini-button full"));
 }
 const actions=node("div","buttons-row");
 actions.appendChild(button("Duplicar",duplicateSelected));
 if(!isCustom)actions.appendChild(button(settings.design.hidden.includes(selected)?"Mostrar":"Ocultar",()=>edit(()=>toggleHidden(selected))));
 actions.appendChild(button("Eliminar",removeSelected,"mini-button danger"));
 holder.appendChild(actions);
}
function duplicateSelected(){
 if(!selected)return;
 const custom=settings.design.elements.find(x=>x.id===selected);
 if(custom){
  const copy=clone(custom);copy.id=newId();copy.position={...copy.position,x:Math.min(90,(copy.position?.x||20)+5),y:Math.min(90,(copy.position?.y||20)+5),z:(copy.position?.z||35)+1};
  edit(()=>settings.design.elements.push(copy));select(copy.id);return;
 }
 const el=find(selected);if(!el)return;
 const kind=["cross","cover-floral","wax","angel"].includes(selected)?"image":"text";
 if(kind==="image"){
  const src=settings.design.images[selected]||settings.angelImageUrl;
  if(!src){alert("Para duplicar este dibujo, primero súbelo como imagen personalizada.");return;}
  const copy={id:newId(),kind:"image",section,src,position:{...getPlacement(),x:getPlacement().x+5,y:getPlacement().y+5,z:45}};
  edit(()=>settings.design.elements.push(copy));select(copy.id);
 }else{
  const copy={id:newId(),kind:"text",section,text:settings.design.texts[selected]??el.textContent.trim(),font:getStyle("font",settings.font),size:parseFloat(getComputedStyle(el).fontSize)||28,color:getStyle("color",settings.gold),position:{...getPlacement(),x:getPlacement().x+5,y:getPlacement().y+5,z:45}};
  edit(()=>settings.design.elements.push(copy));select(copy.id);
 }
}
function removeSelected(){
 if(!selected)return;
 const id=selected;
 const custom=settings.design.elements.some(v=>v.id===id);
 if(!confirm(custom?"¿Eliminar este elemento?":"¿Ocultar este elemento original? Puedes recuperarlo en Capas."))return;
 edit(()=>{
  if(custom)settings.design.elements=settings.design.elements.filter(v=>v.id!==id);
  else toggleHidden(id);
 });selected=null;drawInspector();
}
let fileMode="new";
function triggerFile(){$("file-upload").value="";$("file-upload").click()}
function loadFile(file){
 if(!file||!["image/png","image/jpeg","image/webp"].includes(file.type)){notify("Usa PNG, JPG o WebP");return}
 if(file.size>10*1024*1024){alert("La imagen supera 10 MB. Elige una más pequeña.");return}
 const url=URL.createObjectURL(file),img=new Image();
 img.onload=()=>{
  try{
   const scale=Math.min(1,620/Math.max(img.naturalWidth,img.naturalHeight));
   const canvas=document.createElement("canvas");
   canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
   canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
   canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
   let data=canvas.toDataURL("image/webp",0.72);
   if(!data.startsWith("data:image/webp"))data=canvas.toDataURL("image/png");
   if(data.length>260000){alert("La imagen aún es muy grande para guardarla en GitHub. Usa una versión más pequeña.");return}
   if(fileMode==="background"){
    edit(()=>{settings.design.backgrounds=settings.design.backgrounds||{};settings.design.backgrounds[section]=data});
   }else if(fileMode==="replace"&&selected){
    edit(()=>{
     const element=settings.design.elements.find(x=>x.id===selected);
     if(element){element.kind="image";element.src=data;}
     else if(selected==="angel"){settings.angelImageUrl=data;}
     else if(["envelopeWrap","open","dress-chips"].includes(selected)){
      settings.design.elements.push({id:newId(),section,kind:"image",src:data,position:{x:20,y:30,w:60,z:50}});
     }else settings.design.images[selected]=data;
    });
   }else{
    const obj={id:newId(),section,kind:"image",src:data,alt:file.name,position:{x:17,y:32,w:66,h:0,z:42,rotate:0}};
    edit(()=>settings.design.elements.push(obj));select(obj.id);
   }
   notify("Imagen subida al borrador");
  }finally{URL.revokeObjectURL(url)}
 };
 img.onerror=()=>{URL.revokeObjectURL(url);alert("No pude abrir esa imagen.")};
 img.src=url;
}
$("file-upload").addEventListener("change",e=>loadFile(e.target.files?.[0]));
function serialize(){return"/* Invitación de Emily. Ajustes generados con studio.html */\nwindow.EMILY_CONFIG = "+JSON.stringify(settings,null,2)+";\n";}
function modalPublish(){
 const modal=node("div");
 modal.innerHTML='<h2>Publicar el nuevo diseño</h2><p>Los cambios que estás viendo siguen siendo <strong>privados en este navegador</strong>. Para que aparezcan en el enlace de invitados, publica tu configuración en GitHub.</p>';
 const ol=node("ol");
 ["Pulsa «Copiar configuración» o descarga el archivo.","Abre config.js de tu repositorio y pulsa el icono del lápiz.","Selecciona el contenido actual, pega el nuevo y pulsa «Commit changes».","Espera unos minutos y actualiza el enlace público de la invitación."].forEach(t=>ol.appendChild(node("li","",t)));
 modal.appendChild(ol);
 const actions=node("div","actions");
 actions.appendChild(button("Copiar configuración",async()=>{
  try{await navigator.clipboard.writeText(serialize());notify("Configuración copiada");alert("Copiado. Ya puedes pegarlo en config.js de GitHub.");}
  catch(e){alert("El navegador no permitió copiar. Prueba «Descargar archivo».")}
 },"primary"));
 actions.appendChild(button("Descargar config.js",downloadConfig,"muted"));
 actions.appendChild(button("Abrir GitHub ↗",()=>window.open("https://github.com/castrosolisandrea-alt/bautizo-emily/edit/main/config.js","_blank","noopener"),"muted"));
 modal.appendChild(actions);
 modal.appendChild(p("No introduzcas contraseñas ni enlaces privados: el archivo de configuración de la invitación será público.","info"));
 showDialog(modal);
}
function downloadConfig(){
 const blob=new Blob([serialize()],{type:"text/javascript;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="config.js";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
}
function save(){
 try{localStorage.setItem("emily-studio-v1",JSON.stringify(settings));notify("Borrador guardado aquí")}
 catch(e){alert("El borrador es muy pesado para este navegador. Descarga la configuración o reduce las imágenes.")}
}
function attach(){
 document.querySelectorAll(".rail button").forEach(b=>b.addEventListener("click",()=>activateTool(b.dataset.tool)));
 document.querySelectorAll("[data-mobile-tool]").forEach(b=>b.addEventListener("click",()=>{
  if(b.dataset.mobileTool==="inspector"){$("inspector").classList.toggle("show");$("library").classList.remove("show")}
  else{activateTool(b.dataset.mobileTool);$("inspector").classList.remove("show")}
 }));
 $("section-selector").addEventListener("change",e=>{selected=null;mountSection(e.target.value);drawInspector()});
 $("edit-mode").addEventListener("click",()=>setMode("edit"));
 $("test-mode").addEventListener("click",()=>setMode("test"));
 iframe.addEventListener("load",setupFrame);
 // The iframe can finish loading before the editor script attaches listeners.
 try{if(iframe.contentDocument?.readyState==="complete")setupFrame()}catch(e){}
 $("save").addEventListener("click",save);
 $("publish").addEventListener("click",()=>{save();modalPublish()});
 $("undo").addEventListener("click",undo);$("redo").addEventListener("click",redo);
 $("modal-close").addEventListener("click",hideDialog);
 $("modal").addEventListener("click",e=>{if(e.target===$("modal"))hideDialog()});
 document.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)){
   if(e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo()}
   if(e.key.toLowerCase()==="y"){e.preventDefault();redo()}
  }
  if(e.key==="Escape"){hideDialog();$("inspector").classList.remove("show");$("library").classList.remove("show")}
  if(e.key==="Delete"&&selected&&document.activeElement?.tagName==="BODY")removeSelected();
 });
 populateSections();activateTool("design");drawInspector();notify("Borrador local");
}
function setMode(value){
 mode=value;selected=null;drawInspector();frameReady=false;
 $("edit-mode").classList.toggle("active",value==="edit");
 $("test-mode").classList.toggle("active",value==="test");
 iframe.src="./index.html?editorPreview="+(value==="test"?"envelope":section==="gate"?"envelope":"sections");
 if(value==="test")notify("Modo prueba: toca para abrir");else notify("Modo edición");
}
attach();
})();
