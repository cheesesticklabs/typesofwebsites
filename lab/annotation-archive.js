/* Preserve the completed page at its original viewport, plus a lossless annotated PNG. */
window.AnnotationArchive=(()=>{
const version='annotation-archive-v1',encoder=new TextEncoder();
let lastFailure=null;
const clone=v=>JSON.parse(JSON.stringify(v));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function record({state,id,site,doc,stage,overlay,pins,geometry}){
 try{
  const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;
  const html=doc.documentElement.cloneNode(true);
  html.querySelectorAll('script,iframe,object,embed').forEach(el=>el.remove());
  html.querySelectorAll('.xray-hover').forEach(el=>el.classList.remove('xray-hover'));
  html.querySelectorAll('input').forEach(el=>el.setAttribute('value',el.value||''));
  html.setAttribute('xmlns','http://www.w3.org/1999/xhtml');html.style.width=width+'px';html.style.height=height+'px';html.style.overflow='hidden';html.style.cursor='default';
  html.querySelector('body').style.width=width+'px';
  const siteHtml=new XMLSerializer().serializeToString(html);
  const shapes=overlay.cloneNode(true);shapes.setAttribute('x','0');shapes.setAttribute('y','0');shapes.setAttribute('width',width);shapes.setAttribute('height',height);shapes.setAttribute('viewBox',`0 0 ${width} ${height}`);shapes.removeAttribute('class');
  const pinLayer=document.createElement('div');pinLayer.setAttribute('xmlns','http://www.w3.org/1999/xhtml');pinLayer.style.cssText=`position:relative;width:${width}px;height:${height}px;overflow:visible`;
  for(const pin of pins.querySelectorAll('button')){const frozen=pin.cloneNode(true),style=getComputedStyle(pin);for(const key of style)frozen.style.setProperty(key,style.getPropertyValue(key));frozen.removeAttribute('id');pinLayer.append(frozen);}
  const pinMarkup=`<foreignObject x="0" y="0" width="${width}" height="${height}">${new XMLSerializer().serializeToString(pinLayer)}</foreignObject>`;
  const frozenSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/><foreignObject x="0" y="0" width="${width}" height="${height}">${siteHtml}</foreignObject>${new XMLSerializer().serializeToString(shapes)}${pinMarkup}</svg>`;
  state.annotationLayouts||={};
  state.annotationLayouts[id]={schemaVersion:version,siteId:site,siteVersion:window.LESSON.siteVersion||'website-purpose-2026-10-18',language:state.lang,capturedAt:new Date().toISOString(),viewport:{width,height,devicePixelRatio:devicePixelRatio||1},geometry:clone(geometry),siteHtml,frozenSvg};
  lastFailure=null;
 }catch(e){lastFailure=e;console.warn('Annotation layout capture failed:',e.message);}
}
async function sha(text){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
function base64(bytes){let s='';for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s);}
async function rasterize(layout){
 // Current classroom sites contain no remote resources. Refuse a misleading image if a future site adds any.
 const xml=new DOMParser().parseFromString(layout.frozenSvg,'image/svg+xml');if(xml.querySelector('parsererror'))throw new Error('The saved page is not valid SVG. Reopen the annotated site and try again.');
 if([...xml.querySelectorAll('img,image,link')].some(el=>{const u=el.getAttribute('src')||el.getAttribute('href');return u&&!u.startsWith('data:')&&!u.startsWith('#');}))throw new Error('An image needs to be embedded before this page can be frozen.');
 const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(layout.frozenSvg);await image.decode();
 const scale=Math.max(1,layout.viewport.devicePixelRatio||1),canvas=document.createElement('canvas');canvas.width=Math.ceil(layout.viewport.width*scale);canvas.height=Math.ceil(layout.viewport.height*scale);
 const ctx=canvas.getContext('2d');ctx.setTransform(scale,0,0,scale,0,0);ctx.drawImage(image,0,0,layout.viewport.width,layout.viewport.height);
 return {dataUrl:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height,scale};
}
async function prepare(state){
 const snapshots=[];
 for(const [id,annotations]of Object.entries(state.evidence||{})){
  if(!Array.isArray(annotations)||!annotations.length)continue;
  const layout=state.annotationLayouts?.[id];
  if(!layout||annotations.some(a=>!layout.geometry.some(g=>g.id===a.id)))throw new Error('Reopen each annotated site once so its exact layout can be saved.');
  const frozen=clone(layout);frozen.geometry=frozen.geometry.filter(g=>annotations.some(a=>a.id===g.id));
  const png=await rasterize(frozen),snapshotId=id.replace(/[^a-zA-Z0-9_-]/g,'_');
  snapshots.push({...frozen,id:snapshotId,evidenceKey:id,annotations:clone(annotations),siteSha256:await sha(frozen.siteHtml),visualSha256:await sha(png.dataUrl),png});
 }
 if(lastFailure&&!snapshots.length)throw lastFailure;
 return {schemaVersion:version,preparedAt:new Date().toISOString(),snapshots};
}
function enqueue(batch,db,doc,collection,submissionId,archive){
 const manifest=[];
 for(const snapshot of archive.snapshots){
  const encoded=base64(encoder.encode(JSON.stringify(snapshot))),chunks=Array.from({length:Math.ceil(encoded.length/180000)},(_,i)=>encoded.slice(i*180000,(i+1)*180000)),path=`${collection}/${submissionId}/annotationSnapshots/${snapshot.id}`;
  const meta={schemaVersion:version,evidenceKey:snapshot.evidenceKey,siteId:snapshot.siteId,siteVersion:snapshot.siteVersion,viewport:snapshot.viewport,annotationCount:snapshot.annotations.length,chunkCount:chunks.length,encoding:'base64-utf8-json',siteSha256:snapshot.siteSha256,visualSha256:snapshot.visualSha256};
  batch.set(doc(db,collection,submissionId,'annotationSnapshots',snapshot.id),meta);
  chunks.forEach((data,index)=>batch.set(doc(db,collection,submissionId,'annotationSnapshots',snapshot.id,'chunks',String(index).padStart(4,'0')),{index,data}));
  manifest.push({id:snapshot.id,path,...meta});
 }
 return manifest;
}
async function download(state,lesson){const archive=await prepare(state),data={schemaVersion:version,lessonId:lesson.id,lessonTitle:lesson.title,studentName:state.name,classPeriod:state.period,answers:clone(state.answers),questionLabels:Object.fromEntries(lesson.pages.flatMap(p=>(p.questions||[]).map(q=>[q.id,Array.isArray(q.label)?q.label[0]:q.label]))),evidence:clone(state.evidence),receipt:state.receipt,archive};const blob=new Blob([JSON.stringify(data)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(state.name||'student').replace(/[^a-z0-9_-]/gi,'_')+'_annotated-work.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
return{record,prepare,enqueue,download,version};
})();
