const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';let state={title:'Mi primer flujograma',nodes:[],edges:[]},selected=null,mode='select',origin=null,scale=1,drag=null,history=[],future=[];
const selectedIds=new Set();
function selectOnly(id){selectedIds.clear();selected=id;if(id)selectedIds.add(id);}
function clearSelection(){selectOnly(null);}
function selectedNodes(){return state.nodes.filter(n=>selectedIds.has(n.id));}
function chooseNode(id,event){
 if(event.ctrlKey||event.metaKey||event.shiftKey){
  if(selectedIds.has(id))selectedIds.delete(id);else selectedIds.add(id);
  selected=[...selectedIds].at(-1)||null;return false;
 }
 if(!selectedIds.has(id))selectOnly(id);else selected=id;
 return true;
}
function beginGroupDrag(event){drag={x:event.clientX,y:event.clientY,started:false,nodes:selectedNodes().map(n=>({id:n.id,x:n.x,y:n.y,w:n.w,h:n.h}))};}
function moveGroupDrag(event){
 if(!drag||!drag.nodes.length)return;
 let dx=(event.clientX-drag.x)/scale,dy=(event.clientY-drag.y)/scale;
 if(!drag.started&&Math.hypot(dx,dy)<2)return;
 if(!drag.started){snapshot();drag.started=true;}
 const minX=Math.min(...drag.nodes.map(n=>n.x)),minY=Math.min(...drag.nodes.map(n=>n.y));
 const maxX=Math.max(...drag.nodes.map(n=>n.x+n.w)),maxY=Math.max(...drag.nodes.map(n=>n.y+n.h));
 dx=Math.max(10-minX,Math.min(2350-maxX,dx));dy=Math.max(10-minY,Math.min(1750-maxY,dy));
 for(const original of drag.nodes){let n=state.nodes.find(n=>n.id===original.id);if(n){n.x=original.x+dx;n.y=original.y+dy;}}
 render();
}
const uid=()=>crypto.randomUUID();const node=(type,text,x,y,fill='#ffffff')=>({id:uid(),type,text,x,y,w:type==='diamond'?150:170,h:type==='diamond'?100:66,fill,stroke:'#6b897c',textColor:'#294b3c',font:13,bold:false,highlight:''});
function example(){const a=node('pill','Inicio',80,220,'#e4f2e8'),b=node('rect','Recibir solicitud',310,220),c=node('diamond','¿Cumple los\nrequisitos?',570,203,'#fff4d9'),d=node('rect','Registrar\nbeneficiarios',830,130,'#eaf0fb'),e=node('rect','Revisar solicitud',830,340,'#fff0e8'),f=node('pill','Fin',1080,130,'#e4f2e8');return {title:'Proceso de atención',nodes:[a,b,c,d,e,f],edges:[[a,b,''],[b,c,''],[c,d,'Sí'],[c,e,'No'],[e,b,'Corregir'],[d,f,'']].map(([a,b,text])=>({id:uid(),from:a.id,to:b.id,text,stroke:'#8a9e93',textColor:'#607d6c',font:12}))};}
function snapshot(){history.push(JSON.stringify(state));if(history.length>80)history.shift();future=[];}function persist(){try{localStorage.setItem('trazo-v1',JSON.stringify(state));$('saved').textContent='Guardado en este navegador';}catch{$('saved').textContent='Descarga una copia para guardar';}}function changed(){persist();render();}function el(tag,attrs={},parent){let e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(parent)parent.append(e);return e;}
function getSelected(){if(selectedIds.size>1)return undefined;return [...state.nodes,...state.edges].find(n=>n.id===selected);}function render(){const ng=$('nodes'),eg=$('edges');ng.replaceChildren();eg.replaceChildren();$('title').value=state.title;$('count').textContent=state.nodes.length+' figuras';$('undo').disabled=!history.length;$('redo').disabled=!future.length;
for(const edge of state.edges){let a=state.nodes.find(n=>n.id===edge.from),b=state.nodes.find(n=>n.id===edge.to);if(!a||!b)continue;let right=b.x>=a.x+a.w/2;let x1=right?a.x+a.w:a.x,y1=a.y+a.h/2,x2=right?b.x:b.x+b.w,y2=b.y+b.h/2;let k=Math.max(60,Math.abs(x2-x1)*.48);let path=`M ${x1} ${y1} C ${x1+(right?k:-k)} ${y1}, ${x2+(right?-k:k)} ${y2}, ${x2} ${y2}`;let g=el('g',{'class':'edge'},eg);el('path',{d:path,fill:'none',stroke:'transparent','stroke-width':16},g);el('path',{d:path,fill:'none',stroke:selected===edge.id?'#268b65':edge.stroke,'stroke-width':selected===edge.id?2.5:1.6,'marker-end':'url(#arrow)'},g);let t=el('text',{x:(x1+x2)/2,y:(y1+y2)/2-9,'text-anchor':'middle',fill:edge.textColor||'#607d6c','font-size':edge.font||12,'font-family':'Segoe UI, sans-serif','font-weight':edge.bold?'700':'400',style:'paint-order:stroke;stroke:#f8faf9;stroke-width:5px'},g);t.textContent=edge.text||'';g.onpointerdown=e=>{e.stopPropagation();selectOnly(edge.id);render();sync();};}
for(const n of state.nodes){let g=el('g',{'class':'node',transform:`translate(${n.x},${n.y})`},ng),attrs={fill:n.type==='text'?'transparent':n.fill,stroke:n.type==='text'?'none':n.stroke,'stroke-width':1.5};if(n.type==='diamond')el('polygon',{points:`${n.w/2},0 ${n.w},${n.h/2} ${n.w/2},${n.h} 0,${n.h/2}`,...attrs},g);else if(n.type==='document')el('path',{d:`M0 0H${n.w}V${n.h-12}Q${n.w*.75} ${n.h+8} ${n.w/2} ${n.h-5}T0 ${n.h-5}Z`,...attrs},g);else el('rect',{width:n.w,height:n.h,rx:n.type==='pill'?n.h/2:5,...attrs},g);
let lines=n.text.split('\n'),lineH=n.font*1.25,start=n.h/2-(lines.length-1)*lineH/2;for(let [i,line]of lines.entries()){if(n.highlight)el('rect',{x:Math.max(2,(n.w-line.length*n.font*.57)/2-3),y:start+i*lineH-n.font*.8,width:Math.min(n.w-4,line.length*n.font*.57+6),height:lineH,rx:2,fill:n.highlight},g);let t=el('text',{x:n.w/2,y:start+i*lineH,'text-anchor':'middle','dominant-baseline':'middle','font-family':'Segoe UI, sans-serif','font-size':n.font,'font-weight':n.bold?'700':'400',fill:n.textColor,'pointer-events':'none'},g);t.textContent=line;}
if(selectedIds.has(n.id)||origin===n.id){el('rect',{x:-5,y:-5,width:n.w+10,height:n.h+10,rx:8,fill:'none',stroke:'#2b9871','stroke-width':1.5,'stroke-dasharray':origin===n.id?'5 3':'none'},g);for(const[x,y]of [[-5,-5],[n.w+5,-5],[-5,n.h+5],[n.w+5,n.h+5]])el('rect',{x:x-3,y:y-3,width:6,height:6,fill:'white',stroke:'#2b9871'},g);}
g.onpointerdown=e=>{if(e.button!==0)return;e.stopPropagation();if(mode==='connect'){if(!origin){origin=n.id;$('hint').textContent='Ahora selecciona la figura de destino';}else if(origin!==n.id){if(!state.edges.some(v=>v.from===origin&&v.to===n.id)){snapshot();state.edges.push({id:uid(),from:origin,to:n.id,text:'',stroke:'#81998b',textColor:'#607d6c',font:12});}origin=null;setMode('select');persist();}render();return;}const shouldDrag=chooseNode(n.id,e);if(shouldDrag){beginGroupDrag(e);$('canvas').setPointerCapture(e.pointerId);}render();sync();};g.onclick=e=>{if(e.detail===0){if(mode==='connect')g.onpointerdown({button:0,stopPropagation:()=>{}});else{chooseNode(n.id,e);render();sync();}};};g.ondblclick=()=>{$('label').focus();$('label').select();};}}
function sync(){
 const group=selectedNodes();
 if(selectedIds.size>1){document.body.classList.add('editing');$('editor').hidden=true;$('empty').hidden=false;$('empty').textContent='Ctrl+clic o Shift+clic para añadir o quitar. Arrastra una figura seleccionada para mover todo el grupo.';$('propTitle').textContent=group.length+' elementos seleccionados';$('duplicate').disabled=!group.length;$('delete').disabled=false;$('hint').textContent=group.length+' seleccionados · Arrastra para mover el grupo · Esc para deseleccionar';return;}
 $('empty').textContent='Selecciona una figura o una conexión para personalizarla.';
 if(mode==='select')$('hint').textContent='Ctrl+clic o Shift+clic: selección múltiple · Arrastra para mover';
 let n=getSelected();document.body.classList.toggle('editing',!!n);$('editor').hidden=!n;$('empty').hidden=!!n;$('propTitle').textContent=n?(n.from?'Conexión':'Editar figura'):'Hazlo tuyo';for(let id of ['duplicate','delete'])$(id).disabled=!n;if(!n)return;$('label').value=n.text||'';for(const id of ['font','fill','stroke','textColor','width','height']){$(id).value=n[id==='width'?'w':id==='height'?'h':id]||(id==='fill'?'#ffffff':13);$(id).disabled=!!n.from&&['fill','width','height'].includes(id);}$('highlight').value=n.highlight||'#fef08a';$('highlight').disabled=!!n.from;$('clearHighlight').disabled=!!n.from;$('bold').classList.toggle('active',!!n.bold);}
function setMode(m){mode=m;origin=null;$('select').classList.toggle('active',m==='select');$('connect').classList.toggle('active',m==='connect');$('hint').textContent=m==='connect'?'Selecciona la figura de origen y luego la de destino':'Selecciona una figura para editarla · Arrastra para mover';render();}
$('canvas').onpointermove=moveGroupDrag;$('canvas').onpointerup=()=>{if(drag){drag=null;persist();}};$('canvas').onpointercancel=()=>{drag=null;persist();};$('canvas').onpointerdown=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey)return;clearSelection();origin=null;render();sync();};
document.querySelectorAll('[data-shape]').forEach(b=>b.onclick=()=>{snapshot();let v=$('viewport'),n=node(b.dataset.shape,b.dataset.shape==='text'?'Escribe aquí':b.dataset.shape==='diamond'?'¿Decisión?':b.dataset.shape==='pill'?'Inicio / fin':b.dataset.shape==='document'?'Documento':'Nuevo proceso',Math.round((v.scrollLeft+v.clientWidth/2)/scale-85),Math.round((v.scrollTop+v.clientHeight/2)/scale-33));state.nodes.push(n);selectOnly(n.id);setMode('select');changed();sync();});
for(const id of ['label','font','fill','stroke','textColor','highlight','width','height']){$(id).oninput=()=>{let n=getSelected();if(!n)return;let key={label:'text',width:'w',height:'h'}[id]||id;let val=$(id).value;if(['font','width','height'].includes(id)){val=Number(val);let min=Number($(id).min),max=Number($(id).max);if(!Number.isFinite(val))return;val=Math.min(max,Math.max(min,val));}snapshot();n[key]=val;changed();sync();};}
$('bold').onclick=()=>{let n=getSelected();if(n){snapshot();n.bold=!n.bold;changed();sync();}};$('clearHighlight').onclick=()=>{let n=getSelected();if(n){snapshot();n.highlight='';changed();}};$('select').onclick=()=>setMode('select');$('connect').onclick=()=>setMode(mode==='connect'?'select':'connect');
$('delete').onclick=()=>{
 const ids=new Set(selectedIds);if(!ids.size)return;snapshot();
 state.nodes=state.nodes.filter(n=>!ids.has(n.id));state.edges=state.edges.filter(e=>!ids.has(e.id)&&!ids.has(e.from)&&!ids.has(e.to));
 clearSelection();changed();sync();
};
function pasteGroup(nodes,edges=[],offset=28){
 if(!nodes.length)return;
 const minX=Math.min(...nodes.map(n=>n.x)),minY=Math.min(...nodes.map(n=>n.y)),maxX=Math.max(...nodes.map(n=>n.x+n.w)),maxY=Math.max(...nodes.map(n=>n.y+n.h));
 let dx=Math.max(10-minX,Math.min(2350-maxX,offset)),dy=Math.max(10-minY,Math.min(1750-maxY,offset));
 const ids=new Map(nodes.map(n=>[n.id,uid()]));
 const copies=nodes.map(n=>({...structuredClone(n),id:ids.get(n.id),x:n.x+dx,y:n.y+dy}));
 const links=edges.filter(e=>ids.has(e.from)&&ids.has(e.to)).map(e=>({...structuredClone(e),id:uid(),from:ids.get(e.from),to:ids.get(e.to)}));
 snapshot();state.nodes.push(...copies);state.edges.push(...links);clearSelection();copies.forEach(n=>selectedIds.add(n.id));selected=copies.at(-1).id;drag=null;setMode('select');changed();sync();$('canvas').focus({preventScroll:true});
}
$('duplicate').onclick=()=>{
 const nodes=selectedNodes();if(nodes.length){pasteGroup(nodes,state.edges,25);return;}
 const e=getSelected();if(e?.from){snapshot();let copy={...structuredClone(e),id:uid()};state.edges.push(copy);selectOnly(copy.id);changed();sync();}
};
$('undo').onclick=()=>{if(!history.length)return;future.push(JSON.stringify(state));state=JSON.parse(history.pop());clearSelection();changed();sync();};$('redo').onclick=()=>{if(!future.length)return;history.push(JSON.stringify(state));state=JSON.parse(future.pop());clearSelection();changed();sync();};$('title').onchange=()=>{snapshot();state.title=$('title').value.trim()||'Sin título';changed();};
function load(s){snapshot();state=s;clearSelection();origin=null;changed();sync();}function confirmReplace(){return !state.nodes.length||confirm('¿Reemplazar el lienzo actual? Descarga una copia si quieres conservarlo.');}$('new').onclick=()=>{if(confirmReplace())load({title:'Nuevo flujograma',nodes:[],edges:[]});};$('example').onclick=()=>{if(confirmReplace())load(example());};
function download(name,data,type){let url=URL.createObjectURL(new Blob([data],{type}));let a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}function filename(){return (state.title.replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,80)||'diagrama');}$('save').onclick=()=>download(filename()+'.json',JSON.stringify(state,null,2),'application/json');$('open').onclick=()=>$('file').click();
function valid(s){return s&&typeof s.title==='string'&&Array.isArray(s.nodes)&&Array.isArray(s.edges)&&s.nodes.length<=1000&&s.edges.length<=4000&&s.nodes.every(n=>typeof n.id==='string'&&typeof n.text==='string'&&['rect','pill','diamond','document','text'].includes(n.type)&&['x','y','w','h','font'].every(k=>Number.isFinite(n[k]))&&n.w>=35&&n.h>=20&&n.font>=8&&n.font<=100&&['fill','stroke','textColor'].every(k=>/^#[0-9a-f]{6}$/i.test(n[k]))&&(!n.highlight||/^#[0-9a-f]{6}$/i.test(n.highlight)))&&new Set(s.nodes.map(n=>n.id)).size===s.nodes.length&&s.edges.every(e=>typeof e.id==='string'&&typeof e.text==='string'&&s.nodes.some(n=>n.id===e.from)&&s.nodes.some(n=>n.id===e.to)&&/^#[0-9a-f]{6}$/i.test(e.stroke));}
$('file').onchange=async e=>{try{let f=e.target.files[0];if(!f)return;if(f.size>5e6)throw Error();let s=JSON.parse(await f.text());if(!valid(s))throw Error();if(confirmReplace())load(s);}catch{toast('Archivo inválido. Abre un archivo JSON guardado por Trazo.');}e.target.value='';};
function exportSvg(){let old=selected,oldIds=[...selectedIds],oldOrigin=origin;clearSelection();origin=null;render();let clone=$('canvas').cloneNode(true);selected=old;oldIds.forEach(id=>selectedIds.add(id));origin=oldOrigin;render();let nodes=state.nodes;let x=nodes.length?Math.min(...nodes.map(n=>n.x))-35:0,y=nodes.length?Math.min(...nodes.map(n=>n.y))-60:0,w=nodes.length?Math.max(...nodes.map(n=>n.x+n.w))-x+80:800,h=nodes.length?Math.max(...nodes.map(n=>n.y+n.h))-y+60:600;clone.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);clone.setAttribute('width',w);clone.setAttribute('height',h);clone.style.width=w+'px';clone.style.height=h+'px';clone.querySelector(':scope > rect').setAttribute('fill','#ffffff');return {svg:new XMLSerializer().serializeToString(clone),w,h};}
$('export').onclick=()=>download(filename()+'.svg',exportSvg().svg,'image/svg+xml');
function zoom(v){scale=Math.max(.4,Math.min(2,v));$('canvas').style.width=2400*scale+'px';$('canvas').style.height=1800*scale+'px';$('canvas').setAttribute('viewBox','0 0 2400 1800');$('zoom').textContent=Math.round(scale*100)+'%';}$('plus').onclick=()=>zoom(scale+.1);$('minus').onclick=()=>zoom(scale-.1);$('reset').onclick=()=>{zoom(1);$('viewport').scrollTo(0,0);};document.onkeydown=e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'){e.preventDefault();clearSelection();state.nodes.forEach(n=>selectedIds.add(n.id));selected=state.nodes.at(-1)?.id||null;render();sync();return;}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$(e.shiftKey?'redo':'undo').click();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();$('redo').click();}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('delete').click();}if(e.key==='Escape'){setMode('select');clearSelection();render();sync();}};function toast(t){$('toast').textContent=t;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',4000);}
try{let s=JSON.parse(localStorage.getItem('trazo-v1'));state=valid(s)?s:example();}catch{state=example();}zoom(.8);render();sync();





// Copiar y pegar usa el portapapeles del navegador, también en la app local.
function editingText(target){return target instanceof Element&&!!target.closest('input,textarea,[contenteditable="true"]');}
const CLIPBOARD_TYPE='application/x-trazo-figure+json';
function clipboardFigure(value){
 if(!value||value.format!=='trazo-figure'||value.version!==1)return null;
 const n=value.node;
 if(!n||!valid({title:'Portapapeles',nodes:[n],edges:[]})||n.text.length>5000||n.w>2400||n.h>1800)return null;
 return structuredClone(n);
}
function placePastedFigure(figure){
 const n=structuredClone(figure);n.id=uid();
 n.x=Math.max(10,Math.min(2350-n.w,n.x+28));
 n.y=Math.max(10,Math.min(1750-n.h,n.y+28));
 for(let attempt=0;attempt<30&&state.nodes.some(other=>Math.abs(other.x-n.x)<2&&Math.abs(other.y-n.y)<2);attempt++){
  const x=Math.min(2350-n.w,n.x+28),y=Math.min(1750-n.h,n.y+28);
  if(x===n.x&&y===n.y)break;n.x=x;n.y=y;
 }
 snapshot();state.nodes.push(n);selectOnly(n.id);drag=null;setMode('select');changed();sync();
 $('canvas').focus({preventScroll:true});
 toast('Figura pegada con su formato');
}
document.addEventListener('copy',event=>{
 if(editingText(event.target)||editingText(document.activeElement))return;
 const nodes=selectedNodes();if(!nodes.length||!event.clipboardData)return;
 const data=nodes.length===1?JSON.stringify({format:'trazo-figure',version:1,node:nodes[0]}):JSON.stringify({format:'trazo-selection',version:1,nodes,edges:state.edges.filter(e=>selectedIds.has(e.from)&&selectedIds.has(e.to))});
 event.clipboardData.setData('text/plain',data);
 try{event.clipboardData.setData(CLIPBOARD_TYPE,data);}catch{}
 event.preventDefault();toast('Figura copiada · Ctrl+V para pegar');
});
document.addEventListener('paste',event=>{
 if(editingText(event.target)||editingText(document.activeElement)||!event.clipboardData)return;
 const raw=event.clipboardData.getData(CLIPBOARD_TYPE)||event.clipboardData.getData('text/plain');
 if(!raw||raw.length>5000000)return;
 let value;try{value=JSON.parse(raw);}catch{}
 if(value?.format==='trazo-selection'){
  event.preventDefault();
  if(value.version!==1||!valid({title:'Grupo',nodes:value.nodes,edges:value.edges})||!value.nodes.length||value.nodes.some(n=>n.text.length>5000||n.w>2400||n.h>1800)){toast('El grupo copiado no es válido.');return;}
  pasteGroup(value.nodes,value.edges);toast('Grupo pegado con sus conexiones');return;
 }
 const figure=clipboardFigure(value);
 if(figure){event.preventDefault();placePastedFigure(figure);return;}
 if(value?.format==='trazo-figure'){event.preventDefault();toast('La figura copiada no es válida.');return;}
 if(raw.length>5000){toast('El texto es demasiado largo para una figura.');return;}
 const viewport=$('viewport');
 const text=raw.replace(/\r\n?/g,'\n');
 const lines=text.split('\n').flatMap(line=>line.match(/.{1,42}/gu)||['']);
 const n=node('text',lines.join('\n'),(viewport.scrollLeft+viewport.clientWidth/2)/scale-130,(viewport.scrollTop+viewport.clientHeight/2)/scale-40);
 n.w=280;n.h=Math.min(500,Math.max(50,lines.length*17+20));
 event.preventDefault();placePastedFigure(n);
});
// Exportación PDF sin dependencias ni conexión a Internet.
function createPdf(jpeg,iw,ih){
 const pageW=841.89,pageH=595.28,margin=28.35;
 const ratio=Math.min((pageW-2*margin)/iw,(pageH-2*margin)/ih);
 const w=iw*ratio,h=ih*ratio,x=(pageW-w)/2,y=(pageH-h)/2;
 const enc=new TextEncoder(),chunks=[],offsets=[0];let length=0;
 const append=value=>{let bytes=typeof value==='string'?enc.encode(value):value;chunks.push(bytes);length+=bytes.length;};
 const object=(id,body)=>{offsets[id]=length;append(id+' 0 obj\n'+body+'\nendobj\n');};
 append('%PDF-1.4\n');
 object(1,'<< /Type /Catalog /Pages 2 0 R >>');
 object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+pageW+' '+pageH+'] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
 offsets[4]=length;append('4 0 obj\n<< /Type /XObject /Subtype /Image /Width '+iw+' /Height '+ih+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpeg.length+' >>\nstream\n');append(jpeg);append('\nendstream\nendobj\n');
 const content='q\n'+w.toFixed(3)+' 0 0 '+h.toFixed(3)+' '+x.toFixed(3)+' '+y.toFixed(3)+' cm\n/Im0 Do\nQ\n';
 object(5,'<< /Length '+enc.encode(content).length+' >>\nstream\n'+content+'endstream');
 const xref=length;append('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)append(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
 append('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');
 return new Blob(chunks,{type:'application/pdf'});
}
$('pdf').onclick=async()=>{
 const button=$('pdf');button.disabled=true;button.textContent='Generando PDF…';let url;
 try{
  if(!state.nodes.length){toast('Añade una figura antes de exportar.');return;}
  const {svg,w,h}=exportSvg();url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});
  const factor=Math.min(3,5000/w,5000/h,Math.sqrt(16000000/(w*h)));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(w*factor));canvas.height=Math.max(1,Math.ceil(h*factor));
  const context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  const jpeg=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.97));if(!jpeg)throw Error('No se pudo generar la imagen');
  const pdf=createPdf(new Uint8Array(await jpeg.arrayBuffer()),canvas.width,canvas.height);
  download(filename()+'.pdf',pdf,'application/pdf');toast('PDF exportado · A4 horizontal');
 }catch(error){console.error(error);toast('No se pudo exportar el PDF. Inténtalo de nuevo.');}
 finally{if(url)URL.revokeObjectURL(url);button.disabled=false;button.textContent='Exportar PDF ↓';}
};
