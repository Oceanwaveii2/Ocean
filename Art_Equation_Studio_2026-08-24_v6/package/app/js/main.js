  (() => {
    const STORAGE = 'art-equation-studio-v1';
    const $ = s => document.querySelector(s); const $$ = s => [...document.querySelectorAll(s)];
    const today = () => new Date().toISOString().slice(0,10);
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
    const emptyReaderMemory = () => ({positions:{},bookmarks:{},notes:{},crops:{}});
    const defaults = [
      {id:'recipe-simplify', title:'Reference to Sketch', category:'Simplification', problem:'Turn mixed visual references into a loose, useful sketch that is easier to draw over and combine.', workflow:'Collect references by component.\nUse Seedream Pro, Gemini, or Nanobanana to simplify into sketch language.\nCorrect gesture and spatial errors by hand.\nUse the sketch as a controlled construction layer.', models:'Seedream Pro · Gemini · Nanobanana'},
      {id:'recipe-turnaround', title:'Fast Character Turnaround', category:'Construction', problem:'Produce usable front/back reference from a strong three-quarter character image.', workflow:'Generate a full-body three-quarter view.\nFlatten to black-and-white line art.\nAdd flat color information.\nConvert to a 3D model and rotate for supporting views.\nManually correct any anatomy or clothing inconsistencies.', models:'Image-to-3D tools · Illustrator'},
      {id:'recipe-lighting', title:'Lighting & Style Unification', category:'Finishing', problem:'Make a composite or 3D-based image feel like one finished illustration.', workflow:'Build composition and depth with simple models or separated objects.\nDo not spend production time on complex 3D lighting.\nConvert with a chosen style reference.\nUse a final model pass to unify style and believable lighting.\nFix only the remaining high-value errors manually.', models:'Qwen Image · GPT Image · Nanobanana · Seedream Pro'},
      {id:'recipe-clothing', title:'Clothing Consistency Decision', category:'Construction', problem:'Choose the lowest-labor method that keeps clothing readable and consistent in the frame.', workflow:'For loose one-off clothing, draw by hand and limit frame complexity.\nFor repeated accessories, make a simple 3D object.\nUse video AI only when the cost is worth the close-up consistency.\nAvoid full garment simulation unless the project truly needs a riggable outfit.', models:'Illustrator · simple 3D assets · video AI'},
      {id:'recipe-prompt', title:'Model-Specific Prompt Pass', category:'Prompting', problem:'Convert a raw image idea into a prompt designed for the selected model and task.', workflow:'State the exact job: generate, edit, restyle, or unify.\nDescribe subject, composition, camera, materials, and constraints.\nSpecify what must stay consistent.\nGive the model a reference role instead of asking it to invent complex sequential logic.\nSave successful wording as a variation.', models:'GPT Image · Qwen Image · Nanobanana · Seedream Pro'}
    ];
    const blankBoard = (name='Board I') => ({id:'board-'+uid(),name,items:[],groups:[],connectors:[],zoom:100});
    const blankProject = () => ({ id:uid(), title:'', date:today(), summary:'', tags:'', count:'', time:'', difficulty:'Undecided', deliverables:'', purpose:'', audience:'', challenges:'', solution:'', tools:'', narrative:'', references:'', stage1:'', stage2:'', stage3:'', recipeIds:[], boards:[blankBoard()], activeBoardId:null, savedAt:null, archived:false });
    const exampleProject = () => ({ ...blankProject(), id:'rainee-strip-club-example', title:'Rainee Transforms — Strip Club Redesign', summary:'A set of screenshot redraws and a Quagmire replacement for a Fifth Element-style strip club redesign.', count:'Shot list + turn sheets', time:'Estimate after references', difficulty:'High', deliverables:'Shot lists, number of images, turn sheets, screenshot redraws, and a Quagmire replacement.', challenges:'Accurate turn sheets and geometrically correct backgrounds.', solution:'Use Image-to-3D to mock up the strip club. Use simple 3D blockouts. Use Image-to-3D for each stripper to generate turn sheets quickly.', narrative:'Stripperella. Yuri with multiple harems.', recipeIds:['recipe-turnaround','recipe-lighting','recipe-clothing'] });
    let state = loadState(); let currentId = state.currentId; const requestedProjectId=new URLSearchParams(location.search).get('project'); if(requestedProjectId&&state.projects.some(item=>item.id===requestedProjectId))currentId=requestedProjectId; let category = 'all'; let saveFolderHandle = null; let editingRecipeId = null; let chapters = []; let activeChapter = null; let activePage = 0; let readerMode = 'vertical'; let readerZoom = 100; let readerUrls = []; let chapterCoverUrls = new Map(); let boardAssetUrls = []; let cropImage = null; let cropBox = null; let cropPointerStart = null; let boardDrag = null; let splitResizeActive = false; let selectedBoardItemIds = new Set(); let draggedBoardId = null; let boardPan = null; let boardMarquee = null; let spaceHeld = false; let activeBoardNoteId=null; let boardNoteSelection=null; let readerObserver=null; let readerGeneration=0; let noteFocusState=null; let connectMode=false; let connectPendingId=null; let connectorHandleDrag=null; let waypointDrag=null; let selectedConnectorIds=new Set(); let boardUndoStack=[]; let boardRedoStack=[]; let boardHistoryBoardId=null; let boardDragHistorySnapshot=null; let noteEditSnapshot=null; let boardListUndoSnapshot=null; let pendingTextureSlot=null; let pendingRecipeThumbnail=undefined; let boardPipWindow=null; let boardPipSyncTimer=null; let boardPipView=null; let boardNavTrail=[]; let promptImageDataUrl=null; let boardContextMenuItemId=null; let boardClipboard=null; let lastBoardPointerScreen=null; let contextMenuBoardPoint=null; let minimapDrag=false; let boardFisheye=false; let boardFisheyeRaf=null; let eraseImage=null; let eraseBox=null; let erasePointerStart=null; let eraseItemId=null; let cutoutImage=null; let cutoutBox=null; let cutoutPointerStart=null; let cutoutItemId=null; let warpImage=null; let warpItemId=null; let warpHandles=[]; let warpDragHandleId=null; let shapeTool=null; let boardShapeDraw=null;
    function normaliseProjectBoards(p){ if(!Array.isArray(p.boards)||!p.boards.length)p.boards=[blankBoard()]; p.boards.forEach((board,index)=>{board.id=board.id||'board-'+uid();board.name=board.name||`Board ${index+1}`;board.items=Array.isArray(board.items)?board.items:[];board.groups=Array.isArray(board.groups)?board.groups:[];board.connectors=Array.isArray(board.connectors)?board.connectors:[];board.zoom=Number(board.zoom)||100;board.panX=Number(board.panX)||0;board.panY=Number(board.panY)||0;if(board.snapExplicit!==true)board.snap=false;board.minimal=board.minimal===true;}); if(!p.activeBoardId||!p.boards.some(board=>board.id===p.activeBoardId))p.activeBoardId=p.boards[0].id; return p; }
    function loadState(){ try { const saved=JSON.parse(localStorage.getItem(STORAGE)); if(saved?.projects?.length){ saved.projects.forEach(normaliseProjectBoards); return {projects:saved.projects,recipes:saved.recipes?.length?saved.recipes:defaults,currentId:saved.currentId||saved.projects[0].id,reader:{...emptyReaderMemory(),...(saved.reader||{})}}; } }catch{} const ex=normaliseProjectBoards(exampleProject()); return {projects:[ex],recipes:defaults,currentId:ex.id,reader:emptyReaderMemory()}; }
    function persist(){ state.currentId=currentId; localStorage.setItem(STORAGE,JSON.stringify(state)); }
    function applyTheme(mode){ const light=mode==='light';document.body.classList.toggle('light-mode',light);const lightToggle=$('#set-light-mode');if(lightToggle)lightToggle.checked=light;$('#theme-color-meta')?.setAttribute('content',light?'#f2f0eb':'#101113');try{localStorage.setItem('art-equation-studio-theme',light?'light':'dark');}catch{} syncBoardTint(); }
    function openFolderDb(){ return new Promise((resolve,reject)=>{ const request=indexedDB.open('art-equation-studio-files',1); request.onupgradeneeded=()=>request.result.createObjectStore('handles'); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); }); }
    async function rememberFolder(handle){ const db=await openFolderDb(); await new Promise((resolve,reject)=>{ const tx=db.transaction('handles','readwrite');tx.objectStore('handles').put(handle,'save-folder');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error); }); }
    async function restoreFolder(){ try { const db=await openFolderDb(); saveFolderHandle=await new Promise((resolve,reject)=>{const tx=db.transaction('handles','readonly');const req=tx.objectStore('handles').get('save-folder');req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);}); } catch {} }
    function calendarDateKey(date=new Date()){ return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
    function dailyWorksheetEntries(projectId){ const prefix=`art-equation-daily:${projectId}:`;const entries=[];for(let index=0;index<localStorage.length;index++){const storageKey=localStorage.key(index);if(!storageKey?.startsWith(prefix))continue;try{entries.push({date:storageKey.slice(prefix.length),data:JSON.parse(localStorage.getItem(storageKey))});}catch{}}return entries.sort((a,b)=>a.date.localeCompare(b.date)); }
    function allDailyWorksheets(){ const prefix='art-equation-daily:';const entries=[];for(let index=0;index<localStorage.length;index++){const storageKey=localStorage.key(index);if(!storageKey?.startsWith(prefix))continue;const remainder=storageKey.slice(prefix.length);const divider=remainder.lastIndexOf(':');if(divider<1)continue;try{entries.push({projectId:remainder.slice(0,divider),date:remainder.slice(divider+1),data:JSON.parse(localStorage.getItem(storageKey))});}catch{}}return entries; }
    function clearDailyWorksheets(){ allDailyWorksheets().forEach(entry=>localStorage.removeItem(`art-equation-daily:${entry.projectId}:${entry.date}`)); }
    function restoreDailyWorksheets(entries,projectId=''){ (entries||[]).forEach(entry=>{const targetProjectId=projectId||entry.projectId;if(!targetProjectId||!entry.date||!entry.data)return;try{localStorage.setItem(`art-equation-daily:${targetProjectId}:${entry.date}`,JSON.stringify({...entry.data,projectId:targetProjectId}));}catch{}}); }
    function backupPayload(){ return {...state,dailyWorksheets:allDailyWorksheets()}; }
    async function rollPreviousBackup(){ try { const existing=await saveFolderHandle.getFileHandle('art-equation-studio-data.json'); const existingFile=await existing.getFile(); if(!existingFile.size)return; const backupHandle=await saveFolderHandle.getFileHandle('art-equation-studio-data.backup.json',{create:true}); const writer=await backupHandle.createWritable(); await writer.write(await existingFile.arrayBuffer()); await writer.close(); } catch {} }
    async function writeFolderBackup(){ if(!saveFolderHandle)return false; try { let permission=await saveFolderHandle.queryPermission({mode:'readwrite'}); if(permission!=='granted')permission=await saveFolderHandle.requestPermission({mode:'readwrite'}); if(permission!=='granted')return false; await rollPreviousBackup(); const file=await saveFolderHandle.getFileHandle('art-equation-studio-data.json',{create:true}); const writer=await file.createWritable(); await writer.write(JSON.stringify(backupPayload(),null,2)); await writer.close(); return true; } catch { return false; } }
    async function folderWritePermission(){ if(!saveFolderHandle)return false; try { let permission=await saveFolderHandle.queryPermission({mode:'readwrite'});if(permission!=='granted')permission=await saveFolderHandle.requestPermission({mode:'readwrite'});return permission==='granted'; }catch{return false;} }
    function assetFilename(file){ const extension=(file.name.match(/\.[a-z0-9]+$/i)||[''])[0]; const base=(file.name.replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'')||'asset').slice(0,72); return `${base}-${uid()}${extension}`; }
    async function boardAssetsDirectory(board){ const projects=await saveFolderHandle.getDirectoryHandle('art-equation-projects',{create:true});const projectDir=await projects.getDirectoryHandle(project().id,{create:true});const boards=await projectDir.getDirectoryHandle('boards',{create:true});const boardDir=await boards.getDirectoryHandle(board.id,{create:true});return boardDir.getDirectoryHandle('assets',{create:true}); }
    async function copyBoardAsset(file,board){ if(!(await folderWritePermission()))throw new Error('Folder permission was not granted');const assets=await boardAssetsDirectory(board);const filename=assetFilename(file);const fileHandle=await assets.getFileHandle(filename,{create:true});const writer=await fileHandle.createWritable();await writer.write(file);await writer.close();return {storage:'folder',file:filename,type:file.type||'',size:file.size||0}; }
    async function boardAssetUrl(item){ if(item.storage!=='folder'||!item.asset?.file||!saveFolderHandle)return null;try{const projects=await saveFolderHandle.getDirectoryHandle('art-equation-projects');const projectDir=await projects.getDirectoryHandle(project().id);const boards=await projectDir.getDirectoryHandle('boards');const boardDir=await boards.getDirectoryHandle(activeBoard().id);const assets=await boardDir.getDirectoryHandle('assets');const file=await (await assets.getFileHandle(item.asset.file)).getFile();const url=URL.createObjectURL(file);boardAssetUrls.push(url);return url;}catch{return null;} }
    function clearBoardAssetUrls(){ boardAssetUrls.forEach(url=>URL.revokeObjectURL(url));boardAssetUrls=[]; }
    function project(){ return state.projects.find(p=>p.id===currentId) || state.projects[0]; }
    function setStatus(msg){ $('#status').textContent=msg; setTimeout(()=>{if($('#status').textContent===msg) $('#status').textContent='';},2600); }
    function setLibraryLoading(active,message=''){ $('#library-loading').hidden=!active; if(message)$('#library-loading').textContent=message; ['#choose-manga-folder','#choose-cbr-files','#choose-cbz-files'].forEach(selector=>$(selector).disabled=active); }
    function escapeHtml(s){ const d=document.createElement('div');d.textContent=s||'';return d.innerHTML; }
    function confirmDialog(title,message,{confirmLabel='Delete',danger=true}={}){ return new Promise(resolve=>{ const dlg=$('#confirm-dialog'); $('#confirm-dialog-title').textContent=title; $('#confirm-dialog-message').textContent=message; const okBtn=$('#confirm-dialog-ok'); okBtn.textContent=confirmLabel; okBtn.className='btn '+(danger?'danger':'primary'); const cancelBtn=$('#confirm-dialog-cancel'); let settled=false; const finish=result=>{ if(settled)return; settled=true; okBtn.removeEventListener('click',onOk); cancelBtn.removeEventListener('click',onCancel); dlg.removeEventListener('close',onClose); resolve(result); }; const onOk=()=>{ settled=true; okBtn.removeEventListener('click',onOk); cancelBtn.removeEventListener('click',onCancel); dlg.removeEventListener('close',onClose); dlg.close(); resolve(true); }; const onCancel=()=>{ dlg.close(); finish(false); }; const onClose=()=>finish(false); okBtn.addEventListener('click',onOk); cancelBtn.addEventListener('click',onCancel); dlg.addEventListener('close',onClose); dlg.showModal(); }); }
    function promptDialog(title,defaultValue='',message=''){ return new Promise(resolve=>{ const dlg=$('#prompt-dialog'); $('#prompt-dialog-title').textContent=title; const messageEl=$('#prompt-dialog-message'); messageEl.textContent=message; messageEl.hidden=!message; const input=$('#prompt-dialog-input'); input.value=defaultValue; const form=$('#prompt-dialog-form'); const cancelBtn=$('#prompt-dialog-cancel'); let settled=false; const finish=result=>{ if(settled)return; settled=true; form.removeEventListener('submit',onSubmit); cancelBtn.removeEventListener('click',onCancel); dlg.removeEventListener('close',onClose); resolve(result); }; const onSubmit=event=>{ event.preventDefault(); settled=true; form.removeEventListener('submit',onSubmit); cancelBtn.removeEventListener('click',onCancel); dlg.removeEventListener('close',onClose); dlg.close(); resolve(input.value); }; const onCancel=()=>{ dlg.close(); finish(null); }; const onClose=()=>finish(null); form.addEventListener('submit',onSubmit); cancelBtn.addEventListener('click',onCancel); dlg.addEventListener('close',onClose); dlg.showModal(); input.focus(); input.select(); }); }
    function naturalSort(a,b){ return a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}); }
    function pageKey(chapter=activeChapter,index=activePage){ return `${chapter.path}::${chapter.pages[index].name}`; }
    function rememberPage(){ if(!activeChapter)return; state.reader.positions[activeChapter.path]=activePage; persist(); }
    function renderBookmarks(){ const entries=Object.values(state.reader.bookmarks||{}).sort((a,b)=>b.addedAt-a.addedAt); const panel=$('#bookmark-panel'); panel.hidden=!entries.length; $('#bookmark-list').innerHTML=entries.map(bookmark=>`<button class="bookmark" data-bookmark="${escapeHtml(bookmark.key)}"><b>${escapeHtml(bookmark.chapterTitle)} · p.${bookmark.pageIndex+1}</b><small>${escapeHtml(bookmark.note||bookmark.pageName)}</small></button>`).join(''); $$('[data-bookmark]').forEach(button=>button.onclick=()=>openBookmark(button.dataset.bookmark)); }
    function renderCrops(){ const crops=Object.values(state.reader.crops||{}).sort((a,b)=>b.addedAt-a.addedAt); const panel=$('#crop-panel'); panel.hidden=!crops.length; $('#crop-list').innerHTML=crops.map(crop=>`<button class="crop-card" data-crop="${escapeHtml(crop.id)}"><img src="${crop.preview}" alt="${escapeHtml(crop.title)}"><div><b>${escapeHtml(crop.title)}</b><small>${escapeHtml(crop.tags||crop.chapterTitle)}${crop.projectTitle?` · ${escapeHtml(crop.projectTitle)}`:''}</small></div></button>`).join(''); $$('[data-crop]').forEach(button=>button.onclick=()=>openCrop(button.dataset.crop)); }
    async function openCrop(id){ const crop=state.reader.crops[id]; if(!crop)return; const chapterIndex=chapters.findIndex(chapter=>chapter.path===crop.path); if(chapterIndex<0){ $('#library-status').textContent='Choose the folder or archive containing this crop first.'; return; } await openChapter(chapterIndex); const index=activeChapter.pages.findIndex(page=>page.name===crop.pageName); activePage=index>=0?index:crop.pageIndex; await renderReader(); $('#reader-note').textContent=`Crop reference: ${crop.title}${crop.tags?` · ${crop.tags}`:''}`; }
    async function openBookmark(key){ const bookmark=state.reader.bookmarks[key]; if(!bookmark){return;} const chapterIndex=chapters.findIndex(chapter=>chapter.path===bookmark.path); if(chapterIndex<0){ $('#library-status').textContent='Choose the folder or CBR containing this bookmark first.'; return; } await openChapter(chapterIndex); const pageIndex=activeChapter.pages.findIndex(page=>page.name===bookmark.pageName); activePage=pageIndex>=0?pageIndex:bookmark.pageIndex; await renderReader(); }
    function switchView(id){ $$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.view===id)); $$('.view').forEach(v=>v.classList.toggle('active',v.id===id)); if(id==='recipes-view') renderRecipes(); if(id==='boards-view')renderBoard(); }
    function renderProject(){ const p=project(); $$('.view [data-field]').forEach(el=>{ el.value=p[el.dataset.field] ?? ''; }); $('#project-heading').textContent=p.title||'Untitled Project'; $('#side-project-title').textContent=p.title||'Untitled Project'; $('#inspector-title').textContent=p.title||'Untitled Project'; $('#inspector-summary').textContent=p.summary||'Project details appear here as you work.'; $('#side-project-date').textContent=p.savedAt?`Last saved ${new Date(p.savedAt).toLocaleDateString()}`:'Not saved yet'; $('#last-saved').textContent=p.savedAt?new Date(p.savedAt).toLocaleDateString():'Never'; $('#archive-project').textContent=p.archived?'Restore Project':'Archive Project'; const todayWorksheet=dailyWorksheetEntries(p.id).find(entry=>entry.date===calendarDateKey());const activeTasks=(todayWorksheet?.data?.tasks||[]).filter(task=>String(task.text||'').trim());const completed=activeTasks.filter(task=>task.done).length;$('#today-tasks').textContent=activeTasks.length?`${completed} / ${activeTasks.length}`:'None';
      const relevant=['title','summary','count','time','deliverables','purpose','audience','challenges','solution','tools','narrative','references','stage1','stage2','stage3']; const filled=relevant.filter(k=>String(p[k]||'').trim()).length; $('#field-progress').textContent=`${filled} / ${relevant.length}`; const attached=state.recipes.filter(r=>p.recipeIds.includes(r.id)); $('#recipe-progress').textContent=attached.length; $('#selected-recipes').innerHTML=attached.length?attached.map(r=>`<button class="btn" data-open-recipe="${r.id}" style="margin:3px">${escapeHtml(r.title)}</button>`).join(''):'No recipes attached yet. Open Visual Recipes to add one.'; $$('[data-open-recipe]').forEach(b=>b.onclick=()=>{switchView('recipes-view');openRecipe(b.dataset.openRecipe);}); const projectCrops=Object.values(state.reader.crops||{}).filter(crop=>crop.projectId===p.id).sort((a,b)=>b.addedAt-a.addedAt); $('#project-crops').innerHTML=projectCrops.length?projectCrops.map(crop=>`<button class="crop-card" data-project-crop="${crop.id}"><img src="${crop.preview}" alt="${escapeHtml(crop.title)}"><div><b>${escapeHtml(crop.title)}</b><small>${escapeHtml(crop.tags||crop.chapterTitle)}</small></div></button>`).join(''):'<span class="hint">No saved visual references are attached to this project yet.</span>'; $$('[data-project-crop]').forEach(button=>button.onclick=()=>{switchView('references-view');openCrop(button.dataset.projectCrop);}); renderProjectList(); renderBoardList(); }
    function renderProjectList(){ const active=project().id; const q=($('#project-search')?.value||'').toLowerCase().trim(); const sort=$('#project-sort')?.value||'recent'; const showArchived=$('#project-show-archived')?.checked||false; let list=state.projects.filter(p=>(showArchived||!p.archived)&&(!q||`${p.title} ${p.summary} ${p.tags||''}`.toLowerCase().includes(q))); list=list.slice().sort((a,b)=>{ if(sort==='title')return (a.title||'Untitled Project').localeCompare(b.title||'Untitled Project'); if(sort==='date')return (b.date||'').localeCompare(a.date||''); return (b.savedAt||0)-(a.savedAt||0); }); $('#project-list').innerHTML=list.length?list.map(p=>`<button class="project-row ${p.id===active?'active':''}" data-project="${p.id}"><i class="dot"></i><span>${escapeHtml(p.title||'Untitled Project')}${p.archived?' <small style="text-transform:uppercase;letter-spacing:.08em">· Archived</small>':''}<small>${escapeHtml(p.date||'No date')} · ${escapeHtml(p.summary||'No summary')}</small></span></button>`).join(''):'<div class="empty">No projects match this search.</div>'; $$('[data-project]').forEach(b=>b.onclick=()=>{currentId=b.dataset.project;renderProject();switchView('project-view');}); }
    function activeBoard(){ const p=project(); normaliseProjectBoards(p); return p.boards.find(board=>board.id===p.activeBoardId)||p.boards[0]; }
    function boardById(id){ return project().boards.find(board=>board.id===id); }
    function renderBreadcrumb(){ const board=activeBoard(); const parts=[`<button type="button" class="breadcrumb-crumb" data-crumb-home="1">Home</button>`,`<span class="breadcrumb-sep">/</span>`,`<span>${escapeHtml(boardLabel())}</span>`,`<span class="breadcrumb-sep">/</span>`]; boardNavTrail.forEach(id=>{ const ancestor=boardById(id); if(!ancestor)return; parts.push(`<button type="button" class="breadcrumb-crumb" data-crumb-board="${ancestor.id}">${escapeHtml(ancestor.name)}</button>`,`<span class="breadcrumb-sep">›</span>`); }); parts.push(`<span class="breadcrumb-current">${escapeHtml(board.name)}</span>`); const unsortedCount=board.items.filter(i=>!i.groupId).length; const el=$('#board-breadcrumb'); el.innerHTML=`<span class="board-breadcrumb-trail">${parts.join('')}</span><span class="board-breadcrumb-unsorted">${unsortedCount} unsorted</span>`; el.querySelector('[data-crumb-home]').onclick=closeSplitBoard; el.querySelectorAll('[data-crumb-board]').forEach(button=>{button.onclick=()=>jumpToTrailBoard(button.dataset.crumbBoard);}); }
    function jumpToTrailBoard(id){ const idx=boardNavTrail.indexOf(id); if(idx===-1||!boardById(id))return; boardNavTrail=boardNavTrail.slice(0,idx); project().activeBoardId=id; persist(); renderBoard(); }
    function openLinkedBoard(targetId){ const target=boardById(targetId); if(!target)return; const current=activeBoard(); boardNavTrail=[...boardNavTrail,current.id]; project().activeBoardId=targetId; persist(); renderBoard(); setStatus(`Opened ${target.name}.`); }
    function pickBoardLinkTarget(boards){ return new Promise(resolve=>{ const dlg=$('#board-link-dialog'); const select=$('#board-link-select'); select.innerHTML=boards.map(b=>`<option value="${b.id}">${escapeHtml(b.name)}</option>`).join(''); const form=$('#board-link-dialog-form'); const cancelBtn=$('#board-link-dialog-cancel'); let settled=false; const finish=result=>{ if(settled)return; settled=true; form.removeEventListener('submit',onSubmit); cancelBtn.removeEventListener('click',onCancel); dlg.removeEventListener('close',onClose); resolve(result); }; const onSubmit=event=>{ event.preventDefault(); settled=true; form.removeEventListener('submit',onSubmit); cancelBtn.removeEventListener('click',onCancel); dlg.removeEventListener('close',onClose); dlg.close(); resolve(select.value); }; const onCancel=()=>{ dlg.close(); finish(null); }; const onClose=()=>finish(null); form.addEventListener('submit',onSubmit); cancelBtn.addEventListener('click',onCancel); dlg.addEventListener('close',onClose); dlg.showModal(); select.focus(); }); }
    async function addBoardLink(){ const board=activeBoard(); const boards=project().boards.filter(b=>b.id!==board.id); if(!boards.length){setStatus('Add another board first — nothing to link to yet.');return;} const targetId=await pickBoardLinkTarget(boards); if(!targetId)return; const target=boardById(targetId); if(!target)return; pushBoardHistory(); const point=boardPosition(board.items.length); board.items.push({id:'board-item-'+uid(),kind:'board-link',target:targetId,name:target.name,x:point.x,y:point.y,w:190,h:150,groupId:$('#board-group-select').value||''}); persist(); renderBoard(); setStatus(`Linked to ${target.name}.`); }
    function boardLabel(){ return project().title||'Untitled Project'; }
    function openSplitBoard(){ boardNavTrail=[]; document.body.classList.add('split-view'); renderBoard(); autoFrameBoardIfOutOfView(); }
    function autoFrameBoardIfOutOfView(){ const board=activeBoard();const content=[...board.items,...board.groups];if(!content.length)return;const wrap=$('#board-canvas-wrap');if(!wrap)return;const scale=(board.zoom||100)/100;const panX=board.panX||0;const panY=board.panY||0;const left=Math.min(...content.map(item=>item.x??80));const top=Math.min(...content.map(item=>item.y??80));const right=Math.max(...content.map(item=>(item.x??80)+(item.w||190)));const bottom=Math.max(...content.map(item=>(item.y??80)+(item.h||260)));const viewLeft=left*scale+panX;const viewTop=top*scale+panY;const viewRight=right*scale+panX;const viewBottom=bottom*scale+panY;const outOfView=viewRight<0||viewBottom<0||viewLeft>wrap.clientWidth||viewTop>wrap.clientHeight;if(outOfView)fitBoard(); }
    function closeSplitBoard(){ document.body.classList.remove('split-view'); switchView('project-view'); }
    function renderBoardList(){ const p=project(); const board=activeBoard(); $('#board-list').innerHTML=p.boards.map(item=>{ const cover=item.coverSrc||item.items[0]?.src; return `<button class="board-tile ${item.id===board.id?'active':''}" draggable="true" data-board-id="${item.id}" title="Open ${escapeHtml(item.name)}. Double-click to rename."><div class="board-tile-cover"${!cover&&item.color?` style="background:${item.color};"`:''}>${cover?`<img src="${cover}" alt="${escapeHtml(item.name)} board cover">`:(item.color?'':'+')}</div><span>${escapeHtml(item.name)}</span><small>Double-click to rename</small></button>`; }).join(''); $$('[data-board-id]').forEach(button=>{button.onclick=()=>{if(draggedBoardId)return;p.activeBoardId=button.dataset.boardId;persist();openSplitBoard();};button.ondblclick=event=>{event.preventDefault();p.activeBoardId=button.dataset.boardId;persist();openSplitBoard();$('#board-title').focus();$('#board-title').select();};button.ondragstart=event=>startBoardReorder(event,button);button.ondragover=event=>overBoardReorder(event,button);button.ondragleave=()=>button.classList.remove('drop-target');button.ondrop=event=>dropBoardReorder(event,button);button.ondragend=endBoardReorder;}); }
    function startBoardReorder(event,button){ draggedBoardId=button.dataset.boardId;button.classList.add('dragging');event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',draggedBoardId); }
    function overBoardReorder(event,button){ if(!draggedBoardId||draggedBoardId===button.dataset.boardId)return;event.preventDefault();event.dataTransfer.dropEffect='move';$$('.board-tile.drop-target').forEach(tile=>tile.classList.remove('drop-target'));button.classList.add('drop-target'); }
    function dropBoardReorder(event,button){ event.preventDefault();const sourceId=draggedBoardId||event.dataTransfer.getData('text/plain');const targetId=button.dataset.boardId;if(!sourceId||sourceId===targetId)return;const p=project();const from=p.boards.findIndex(board=>board.id===sourceId);const to=p.boards.findIndex(board=>board.id===targetId);if(from<0||to<0)return;const [moved]=p.boards.splice(from,1);p.boards.splice(to,0,moved);persist();endBoardReorder();renderBoardList();setStatus('Board order saved.'); }
    function endBoardReorder(){ draggedBoardId=null;$$('.board-tile').forEach(tile=>tile.classList.remove('dragging','drop-target')); }
    function boardGroupOptions(){ const board=activeBoard(); const select=$('#board-group-select'); const prior=select.value; select.innerHTML=`<option value="">Unsorted</option>${board.groups.map(group=>`<option value="${group.id}">${escapeHtml(group.name)}</option>`).join('')}`; if([...select.options].some(option=>option.value===prior))select.value=prior; }
    function screenToBoard(clientX,clientY){ const board=activeBoard();const rect=$('#board-canvas-wrap').getBoundingClientRect();const scale=board.zoom/100;return {x:(clientX-rect.left-(board.panX||0))/scale,y:(clientY-rect.top-(board.panY||0))/scale}; }
    function boardViewportCenter(){ const wrap=$('#board-canvas-wrap');const rect=wrap.getBoundingClientRect();return screenToBoard(rect.left+wrap.clientWidth/2,rect.top+wrap.clientHeight/2); }
    function boardZoomTier(zoom){ return zoom<50?'dot':(zoom<90?'thumb':'full'); }
    /* Viewport culling, layer 2 (JS): cards far outside the visible board rectangle
       are dropped from rendering (display:none) so a large reference board only pays
       layout/paint for what's near the viewport. Coordinates come from the app's own
       screenToBoard() math (canvas transform-origin is 0 0), computed against item
       data — no per-card getBoundingClientRect reads. Never culls the active note,
       selected cards, the connect-pending card, or an expanded note's card, so
       editing, selection, and connect mode can't be disrupted; culled cards return
       automatically as the view moves. Middle tier between the CSS
       content-visibility rule on .board-card (skip work for near-off-screen cards)
       and full virtualization (spatial index + only-visible DOM), which is the
       eventual Milanote/Miro-grade step if boards grow past what this supports. */
    function updateBoardCulling(){
      const wrap=$('#board-canvas-wrap');const board=activeBoard();
      if(!wrap||!board)return;
      const wrapRect=wrap.getBoundingClientRect();
      const margin=900; // board-space buffer so fast pans don't flash missing cards
      const v0=screenToBoard(wrapRect.left,wrapRect.top);
      const v1=screenToBoard(wrapRect.right,wrapRect.bottom);
      const vx0=v0.x-margin,vx1=v1.x+margin,vy0=v0.y-margin,vy1=v1.y+margin;
      const byId=new Map(board.items.map(entry=>[entry.id,entry]));
      $$('#board-canvas .board-card').forEach(card=>{
        const id=card.dataset.boardItem;
        if(selectedBoardItemIds.has(id)||id===activeBoardNoteId||id===connectPendingId||card.classList.contains('note-expanded-elsewhere')){card.style.display='';return;}
        const item=byId.get(id);
        if(!item){card.style.display='';return;}
        const x=item.x??80,y=item.y??80,w=item.w||190;
        const h=item.h||(item.kind==='shape'?130:item.kind==='document'?(item.hasPreview!==undefined?item.hasPreview:170):item.kind==='board-link'?150:item.kind==='note'?190:190);
        const off=x>vx1||x+w<vx0||y>vy1||y+h<vy0;
        card.style.display=off?'none':'';
      });
    }
    function applyBoardView(){ const board=activeBoard();const wrap=$('#board-canvas-wrap');const canvas=$('#board-canvas');const scale=board.zoom/100;const panX=board.panX||0;const panY=board.panY||0;const minor=Math.max(8,Math.round(32*scale));const major=minor*5;canvas.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`;wrap.style.backgroundSize=`${minor}px ${minor}px,${minor}px ${minor}px,${major}px ${major}px,${major}px ${major}px`;wrap.style.backgroundPosition=`${panX}px ${panY}px,${panX}px ${panY}px,${panX}px ${panY}px,${panX}px ${panY}px`;$('#board-zoom').value=board.zoom;$('#board-zoom-value').textContent=`${board.zoom}%`;wrap.style.cursor=boardPan?'grabbing':boardMarquee?'crosshair':'crosshair'; canvas.classList.remove('zoom-tier-dot','zoom-tier-thumb','zoom-tier-full'); canvas.classList.add(`zoom-tier-${boardZoomTier(board.zoom)}`); renderBoardMinimap(); syncBoardPipDebounced(); positionNoteFormatToolbar(); positionShapeFormatToolbar(); updateBoardCulling(); }
    function renderBoardMinimap(){ const board=activeBoard();const mapEl=$('#board-minimap');const wrap=$('#board-canvas-wrap');if(!mapEl||!wrap)return;const content=[...board.items,...board.groups];if(content.length<6){mapEl.hidden=true;return;}mapEl.hidden=false;const left=Math.min(...content.map(item=>item.x??80));const top=Math.min(...content.map(item=>item.y??80));const right=Math.max(...content.map(item=>(item.x??80)+(item.w||190)));const bottom=Math.max(...content.map(item=>(item.y??80)+(item.h||240)));const boardW=Math.max(right-left,1),boardH=Math.max(bottom-top,1);const mapW=mapEl.clientWidth||170,mapH=mapEl.clientHeight||120;const pad=6;const scale=Math.min((mapW-pad*2)/boardW,(mapH-pad*2)/boardH);const offX=(mapW-boardW*scale)/2,offY=(mapH-boardH*scale)/2;const toMap=(x,y)=>({x:(x-left)*scale+offX,y:(y-top)*scale+offY});mapEl.dataset.mapLeft=left;mapEl.dataset.mapTop=top;mapEl.dataset.mapScale=scale;mapEl.dataset.mapOffX=offX;mapEl.dataset.mapOffY=offY;const dotsHtml=board.items.map(item=>{const w=Math.max((item.w||190)*scale,3),h=Math.max((item.h||240)*scale,3);const p=toMap(item.x??80,item.y??80);const kindClass=item.kind==='note'?'note':item.kind==='document'?'doc':item.kind==='board-link'?'link':'media';return `<div class="board-minimap-item ${kindClass}" style="left:${p.x}px;top:${p.y}px;width:${w}px;height:${h}px;"></div>`;}).join('');const viewScale=board.zoom/100;const panX=board.panX||0,panY=board.panY||0;const viewLeftBoard=(0-panX)/viewScale,viewTopBoard=(0-panY)/viewScale;const viewRightBoard=(wrap.clientWidth-panX)/viewScale,viewBottomBoard=(wrap.clientHeight-panY)/viewScale;const v1=toMap(viewLeftBoard,viewTopBoard),v2=toMap(viewRightBoard,viewBottomBoard);const vpLeft=Math.min(v1.x,v2.x),vpTop=Math.min(v1.y,v2.y);const vpW=Math.min(Math.abs(v2.x-v1.x),mapW),vpH=Math.min(Math.abs(v2.y-v1.y),mapH);const viewportHtml=`<div class="board-minimap-viewport" style="left:${Math.max(vpLeft,0)}px;top:${Math.max(vpTop,0)}px;width:${vpW}px;height:${vpH}px;"></div>`;mapEl.innerHTML=dotsHtml+viewportHtml; }
    function minimapPointToBoard(event){ const mapEl=$('#board-minimap');const rect=mapEl.getBoundingClientRect();const left=Number(mapEl.dataset.mapLeft||0),top=Number(mapEl.dataset.mapTop||0),scale=Number(mapEl.dataset.mapScale||1)||1,offX=Number(mapEl.dataset.mapOffX||0),offY=Number(mapEl.dataset.mapOffY||0);const mx=event.clientX-rect.left,my=event.clientY-rect.top;return {x:(mx-offX)/scale+left,y:(my-offY)/scale+top}; }
    function panBoardToMinimapPoint(event){ const board=activeBoard();const wrap=$('#board-canvas-wrap');const point=minimapPointToBoard(event);const scale=board.zoom/100;board.panX=wrap.clientWidth/2-point.x*scale;board.panY=wrap.clientHeight/2-point.y*scale;applyBoardView();persist(); }
    function startMinimapPan(event){ event.preventDefault();minimapDrag=true;panBoardToMinimapPoint(event);$('#board-minimap').setPointerCapture(event.pointerId); }
    function moveMinimapPan(event){ if(!minimapDrag)return;panBoardToMinimapPoint(event); }
    function endMinimapPan(event){ if(!minimapDrag)return;minimapDrag=false;const mapEl=$('#board-minimap');if(event?.pointerId!==undefined&&mapEl.hasPointerCapture(event.pointerId))mapEl.releasePointerCapture(event.pointerId); }

    /* Tier 12 migration, first slice (2026-08-22): READ-ONLY render path.
       Scope, per HANDOFF_FOR_CLAUDE.md's own recommendation: draw the real board's items on a
       canvas (Canvas2D only this slice — WebGPU is deferred, see note below) mirroring the exact
       same board.zoom/panX/panY/selectedBoardItemIds state the DOM layer already uses, WITHOUT
       touching any interaction code. Design choice for safety: the existing DOM `.board-card`
       nodes stay exactly as they are — mounted, positioned, fully interactive (pointerdown,
       drag, resize, connector handles, connect-mode clicks all unchanged) — this canvas just
       draws on TOP of them (z-index 3) with `pointer-events:none`, and `.board-card{opacity:0}`
       makes the DOM layer invisible without disabling its hit-testing. So selection, panning,
       zooming, and connector click/select all continue to work through the untouched DOM/SVG
       layer underneath; only the pixels the person sees have changed. This was a deliberate
       trade against re-implementing hit-testing/pan/zoom on canvas (what the spike's own
       hitTestCard/screenToWorld do) — that duplication is real interaction-layer work the
       handoff explicitly deferred to a later slice, and doing it blind with no live-browser
       verification here was judged too risky for one session.
       UPDATE 2026-08-23, item 1f: drag/resize is no longer blocked. Rather than porting the
       board-renderer-poc spike's overlay mechanism wholesale, this reuses the existing
       `.selected` class already toggled by setSelectedBoardItems: under GPU Preview, only
       `.board-card.selected` gets opacity:1 + pointer-events:auto + a z-index above the canvas
       (see CSS above) — every other card stays invisible AND now pointer-events:none (closing
       part of 1e for free: non-selected cards' buttons can no longer be clicked blind). A
       non-selected card's own onpointerdown never fires (pointer-events:none), so the click
       bubbles straight to #board-canvas-wrap's existing pointerdown handler, which already did
       point-based hit-testing for marquee-select (updateBoardMarquee, called once even on a
       zero-movement click from endBoardPan) — so click-to-select, shift-click-to-add, and
       marquee-select all keep working through the exact same code path as the DOM baseline,
       unchanged. Once a card is selected it becomes a real, positioned, visible DOM node again,
       so startBoardDrag's move/resize logic, note-edit, the connector-handle, and the note-expand/
       board-link-open/remove buttons all work exactly as before — no separate overlay node was
       needed because the "real" card was never removed from the DOM, only hidden. This differs
       from the spike's single-node-overlay sketch in one place: ALL selected cards go live (not
       just one), which is required for group-drag to keep updating every selected card's DOM
       position the same way moveBoardDrag already does in the DOM baseline. Deviation, not a bug
       — documented in TIER12_GPU_PARITY_PLAN.md's 1f writeup.
       Known follow-on gap, not fixed here: a card must be selected once (via the marquee-based
       click) before its own resize handle becomes clickable — in the DOM baseline the resize
       handle is clickable without pre-selecting. Minor, not blocking; next session can decide if
       it's worth its own item.
       Connect-mode's own click path (handleConnectClick) was NOT specifically audited against
       this mode this session — a non-selected card can no longer receive a connect-mode click
       directly (pointer-events:none), so recommend toggling GPU Preview off before using Connect
       mode until a later slice explicitly covers it — same caveat as before, now sharper.
       WebGPU deferred, not skipped: the spike's WebGPU pipeline (real-image-as-texture path,
       shared white-texture trick, pre-allocated vertex buffer) is proven and ready to port, but
       wiring it against the real app's actual item schema (vs. the spike's mock cards) is a
       second unit of real work, and this session had no live browser to verify a WebGPU pipeline
       against — Canvas2D is easy to reason about and cheap to get right blind; a broken WebGPU
       pipeline silently falling back or black-screening is not something node-level syntax
       checking would catch. Next Tier 12 session's natural scope.
       New primitives this slice had to build that the spike explicitly flagged as uncovered:

      // Item 9 (board-group chrome on canvas): drawn after items, matching the DOM's own append
      // order (renderBoard() appends .board-group elements after .board-card elements, so in the
      // DOM they already paint on top — the group's translucent background tints any card beneath
      // it the same way there). The DOM group div itself stays for interaction (title/buttons/
      // resize grip, lifted to z-index 5 — see the CSS comment above); only its background/border/
      // title-bar fill are replaced by this canvas draw, one-for-one with the DOM's own colors.
      (board.groups||[]).forEach(group=>{
        const gx=group.x||40, gy=group.y||40, gw=group.w||440, gh=group.h||360;
        const gpx=gx*s+panX, gpy=gy*s+panY, gpw=gw*s, gph=gh*s;
        if(gpx+gpw<0||gpx>canvas.width||gpy+gph<0||gpy>canvas.height)return;
        const titleH=Math.round(29*s);
        ctx.save();
        ctx.fillStyle='#1a1d2133'; ctx.fillRect(gpx,gpy,gpw,gph);
        ctx.fillStyle='#1d2025'; ctx.fillRect(gpx,gpy,gpw,titleH);
        ctx.strokeStyle='#3b4047'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(gpx,gpy+titleH+0.5); ctx.lineTo(gpx+gpw,gpy+titleH+0.5); ctx.stroke();
        ctx.strokeStyle='#575d65'; ctx.strokeRect(gpx+0.5,gpy+0.5,gpw-1,gph-1);
        boardGpuDrawWrappedText(ctx,group.name||'Untitled group',gpx+9*s,gpy+titleH/2+4*s,gpw-70*s,12*s,'#c49a67',1);
        ctx.restore();
      });
    }
    function activeBoardNote(){ return activeBoard().items.find(item=>item.id===activeBoardNoteId&&item.kind==='note'); }
    function boardNoteSelected(){ const board=activeBoard(); return [...selectedBoardItemIds].some(id=>board.items.find(item=>item.id===id)?.kind==='note'); }
    function noteFormatToolbarVisible(){ return boardNoteSelected()||!!activeBoardNote(); }
    function saveBoardNote(item,body,title){ item.name=title.textContent.trim().slice(0,80)||'Note';item.html=body.innerHTML;item.text=body.textContent;persist();const label=body.closest('.board-card').querySelector('footer span');label.textContent=item.name;label.title=item.name; }
    function rememberBoardNoteSelection(){ const selection=window.getSelection();if(!selection?.rangeCount)return;const range=selection.getRangeAt(0);const note=range.commonAncestorContainer.nodeType===1?range.commonAncestorContainer:range.commonAncestorContainer.parentElement;const body=note?.closest?.('.board-note-body');if(!body)return;activeBoardNoteId=body.closest('.board-card')?.dataset.boardItem||null;boardNoteSelection=range.cloneRange(); }
    function restoreBoardNoteSelection(body){ if(!body)return;body.focus();if(!boardNoteSelection)return;const selection=window.getSelection();selection.removeAllRanges();selection.addRange(boardNoteSelection); }
    function runBoardNoteCommand(command,value=null){ const item=activeBoardNote();const body=$(`[data-board-item="${activeBoardNoteId}"] .board-note-body`);if(!item||!body){setStatus('Click inside a note before formatting it.');return;}beginNoteEditSnapshot();restoreBoardNoteSelection(body);document.execCommand(command,false,value);saveBoardNote(item,body,body.closest('.board-card').querySelector('.board-note-title'));rememberBoardNoteSelection();syncBoardNoteToolbar(); }
    function syncBoardNoteToolbar(){ const item=activeBoardNote();$$('[data-note-command]').forEach(button=>{button.classList.toggle('active',item&&['bold','italic','underline','strikeThrough','insertUnorderedList','insertOrderedList'].includes(button.dataset.noteCommand)&&document.queryCommandState(button.dataset.noteCommand));});$('#note-format-toolbar').style.opacity=item?'1':'.45'; $('#note-format-toolbar').hidden=!noteFormatToolbarVisible();
      if(item){ const body=$(`[data-board-item="${activeBoardNoteId}"] .board-note-body`);const selection=window.getSelection();let ref=body;if(selection?.rangeCount){const node=selection.getRangeAt(0).startContainer;ref=(node.nodeType===1?node:node.parentElement)||body;}
        if(body?.contains(ref)){ const computed=getComputedStyle(ref); const sizeInput=$('#note-size'); const fontSelect=$('#note-font-select'); const fontCustom=$('#note-font-custom'); if(document.activeElement!==sizeInput)sizeInput.value=Math.round(parseFloat(computed.fontSize))||''; if(document.activeElement!==fontSelect&&document.activeElement!==fontCustom)setFontControlValue(fontSelect,fontCustom,(computed.fontFamily||'').split(',')[0].replace(/["']/g,'').trim()); } }
      positionNoteFormatToolbar();
    }
    /* Contextual bar: the note-format toolbar lives absolutely-positioned inside
       #board-canvas-wrap (see CSS) and tracks whichever note is active/selected,
       instead of sitting fixed at the top. This is toolbar-reorg step 3, which
       inherits Tier 13 polish-guide item F per the addendum (§1b/§2) — same
       control, contextual-disclosure placement instead of a fixed position. */
    function activeOrSelectedBoardNoteItem(){
      const item=activeBoardNote();
      if(item)return item;
      const board=activeBoard();
      const id=[...selectedBoardItemIds].find(candidateId=>board.items.find(entry=>entry.id===candidateId)?.kind==='note');
      return id?board.items.find(entry=>entry.id===id):null;
    }
    function positionNoteFormatToolbar(){
      const toolbar=$('#note-format-toolbar');
      if(!toolbar||toolbar.hidden)return;
      const wrap=$('#board-canvas-wrap');
      if(!wrap)return;
      const noteItem=activeOrSelectedBoardNoteItem();
      const card=noteItem?$(`[data-board-item="${noteItem.id}"]`):null;
      const wrapRect=wrap.getBoundingClientRect();
      if(!card){ toolbar.style.left='12px'; toolbar.style.top='12px'; return; }
      const cardRect=card.getBoundingClientRect();
      const toolbarRect=toolbar.getBoundingClientRect();
      let left=cardRect.left-wrapRect.left;
      let top=cardRect.top-wrapRect.top-toolbarRect.height-8;
      if(top<4)top=Math.min(cardRect.bottom-wrapRect.top+8,wrap.clientHeight-toolbarRect.height-4);
      const maxLeft=Math.max(4,wrap.clientWidth-toolbarRect.width-4);
      left=Math.min(Math.max(4,left),maxLeft);
      toolbar.style.left=`${left}px`;
      toolbar.style.top=`${Math.max(4,top)}px`;
    }
    /* Shape context bar (toolbar-reorg step 5, built per owner direction
       2026-08-24): same contextual-disclosure pattern as the note toolbar —
       hidden unless a shape card is selected, positioned above it, tracking
       pan/zoom via the same live-rect approach. Fill/stroke/width are stored
       on the item and applied to the card as CSS custom properties
       (--shape-fill/--shape-stroke/--shape-stroke-w); the .board-shape-svg CSS
       consumes them with the original hard-coded values as fallbacks, so
       pre-existing shapes render exactly as before and hover/selected gold
       highlighting (which overrides at higher specificity) still works. */
    function boardShapeSelected(){ const board=activeBoard(); return [...selectedBoardItemIds].some(id=>board.items.find(entry=>entry.id===id)?.kind==='shape'); }
    function firstSelectedShape(){ const board=activeBoard(); return board.items.find(entry=>selectedBoardItemIds.has(entry.id)&&entry.kind==='shape'); }
    function syncShapeFormatToolbar(){
      const toolbar=$('#shape-format-toolbar');
      if(!toolbar)return;
      const show=boardShapeSelected();
      toolbar.hidden=!show;
      if(show){
        const shape=firstSelectedShape();
        if(shape){
          $('#shape-type-select').value=shape.shapeType||'rect';
          if(shape.fill&&shape.fill!=='none')$('#shape-fill').value=shape.fill;
          $('#shape-stroke').value=shape.stroke||'#3d9ca8';
          $('#shape-stroke-width').value=shape.strokeW||2;
        }
        positionShapeFormatToolbar();
      }
    }
    function positionShapeFormatToolbar(){
      const toolbar=$('#shape-format-toolbar');
      if(!toolbar||toolbar.hidden)return;
      const shape=firstSelectedShape();
      const card=shape?$(`[data-board-item="${shape.id}"]`):null;
      const wrap=$('#board-canvas-wrap');
      if(!wrap)return;
      const wrapRect=wrap.getBoundingClientRect();
      if(!card){ toolbar.style.left='12px'; toolbar.style.top='12px'; return; }
      const cardRect=card.getBoundingClientRect();
      const toolbarRect=toolbar.getBoundingClientRect();
      let left=cardRect.left-wrapRect.left;
      let top=cardRect.top-wrapRect.top-toolbarRect.height-8;
      if(top<4)top=Math.min(cardRect.bottom-wrapRect.top+8,wrap.clientHeight-toolbarRect.height-4);
      const maxLeft=Math.max(4,wrap.clientWidth-toolbarRect.width-4);
      left=Math.min(Math.max(4,left),maxLeft);
      toolbar.style.left=`${left}px`;
      toolbar.style.top=`${Math.max(4,top)}px`;
    }
    function setShapeStyle(prop,value){
      const board=activeBoard();
      const shapes=board.items.filter(entry=>selectedBoardItemIds.has(entry.id)&&entry.kind==='shape');
      if(!shapes.length){setStatus('Select a shape first.');return;}
      pushBoardHistory();
      shapes.forEach(shape=>shape[prop]=value);
      persist();
      renderBoard();
    }
    // --- Range-wrapping helpers: execCommand can't do arbitrary px sizes or custom font names reliably, so we wrap the live selection in a styled <span> ourselves. ---
    function wrapBoardNoteSelectionWithStyle(body,styleProp,value){
      restoreBoardNoteSelection(body);
      const selection=window.getSelection();
      if(!selection||!selection.rangeCount||selection.isCollapsed){ body.style[styleProp]=value; return; }
      const range=selection.getRangeAt(0);
      if(!body.contains(range.commonAncestorContainer)){ setStatus('Click inside a note before formatting it.'); return; }
      const span=document.createElement('span'); span.style[styleProp]=value;
      try{ range.surroundContents(span); }
      catch{ const fragment=range.extractContents(); span.appendChild(fragment); range.insertNode(span); }
      selection.removeAllRanges(); const newRange=document.createRange(); newRange.selectNodeContents(span); selection.addRange(newRange);
      boardNoteSelection=newRange.cloneRange();
    }
    function applyBoardNoteFont(fontName){ const item=activeBoardNote();const body=$(`[data-board-item="${activeBoardNoteId}"] .board-note-body`);if(!item||!body||!fontName.trim()){setStatus('Click inside a note before formatting it.');return;}beginNoteEditSnapshot();wrapBoardNoteSelectionWithStyle(body,'fontFamily',`"${fontName.trim()}", serif`);saveBoardNote(item,body,body.closest('.board-card').querySelector('.board-note-title'));syncBoardNoteToolbar(); }
    function applyBoardNoteSize(px){ const item=activeBoardNote();const body=$(`[data-board-item="${activeBoardNoteId}"] .board-note-body`);const n=parseInt(px,10);if(!item||!body||!n||n<1){setStatus('Click inside a note before formatting it.');return;}beginNoteEditSnapshot();wrapBoardNoteSelectionWithStyle(body,'fontSize',`${n}px`);saveBoardNote(item,body,body.closest('.board-card').querySelector('.board-note-title'));syncBoardNoteToolbar(); }
    const loadedWebFonts=new Set();
    const SYSTEM_FONT_NAMES=['Georgia','Times New Roman','Garamond','Baskerville','Palatino','Arial','Helvetica','Verdana','Tahoma','Trebuchet MS','Segoe UI','Calibri','Courier New','Consolas','Comic Sans MS','Impact'];
    const SYSTEM_SAFE_FONTS=new Set([...SYSTEM_FONT_NAMES.map(name=>name.toLowerCase()),'serif','sans-serif','monospace']);
    const OTHER_FONT_VALUE='__other__';
    function populateFontSelect(select){ select.innerHTML=`<optgroup label="System fonts">${SYSTEM_FONT_NAMES.map(name=>`<option value="${name}">${name}</option>`).join('')}</optgroup>${loadedWebFonts.size?`<optgroup label="Google Fonts (this session)">${[...loadedWebFonts].map(name=>`<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}</optgroup>`:''}<option value="${OTHER_FONT_VALUE}">Other…</option>`; }
    function setFontControlValue(select,customInput,name){ const clean=(name||'').trim(); const match=[...select.options].some(option=>option.value===clean); if(match){ select.value=clean; customInput.hidden=true; } else { select.value=OTHER_FONT_VALUE; customInput.hidden=false; customInput.value=clean; } }
    function injectGoogleFontLink(name){ const clean=name.trim();if(!clean||loadedWebFonts.has(clean))return;const family=clean.replace(/\s+/g,'+');const link=document.createElement('link');link.rel='stylesheet';link.href=`https://fonts.googleapis.com/css2?family=${family}:wght@400;700&display=swap`;document.head.appendChild(link);loadedWebFonts.add(clean);populateFontSelect($('#note-font-select')); }
    function loadGoogleFontByName(name){ const clean=name.trim();if(!clean)return;injectGoogleFontLink(clean);setFontControlValue($('#note-font-select'),$('#note-font-custom'),clean);applyBoardNoteFont(clean);setStatus(`Loaded "${clean}" from Google Fonts and applied it.`); }
    function ensureFontsLoadedForSavedNote(html){ if(!html)return;const matches=html.matchAll(/font-family:\s*["']?([^;"'"]+)["']?/gi);for(const match of matches){const first=(match[1]||'').split(',')[0].trim();if(first&&!SYSTEM_SAFE_FONTS.has(first.toLowerCase()))injectGoogleFontLink(first);} }
    function boardSnapshot(board){ return JSON.stringify({items:board.items,groups:board.groups,connectors:board.connectors||[]}); }
    function applyBoardSnapshot(board,snap){ const data=JSON.parse(snap); board.items=data.items; board.groups=data.groups; board.connectors=data.connectors||[]; }
    function commitBoardHistorySnapshot(snapshot){ if(!snapshot)return; const board=activeBoard(); if(!board)return; if(boardHistoryBoardId!==board.id){boardHistoryBoardId=board.id;boardUndoStack=[];boardRedoStack=[];} boardUndoStack.push(snapshot); if(boardUndoStack.length>50)boardUndoStack.shift(); boardRedoStack=[]; }
    function pushBoardHistory(){ const board=activeBoard(); if(!board)return; commitBoardHistorySnapshot(boardSnapshot(board)); }
    function beginNoteEditSnapshot(){ if(noteEditSnapshot)return; const board=activeBoard(); if(!board)return; noteEditSnapshot=boardSnapshot(board); }
    function commitNoteEditSnapshot(){ if(!noteEditSnapshot)return; const board=activeBoard(); const pending=noteEditSnapshot; noteEditSnapshot=null; if(!board||boardSnapshot(board)===pending)return; commitBoardHistorySnapshot(pending); updateUndoRedoButtons(); }
    function updateUndoRedoButtons(){ const board=activeBoard(); const match=board&&board.id===boardHistoryBoardId; const undoBtn=$('#board-undo'); const redoBtn=$('#board-redo'); const railUndo=$('#rail-board-undo'); const railRedo=$('#rail-board-redo'); const canUndo=(match&&boardUndoStack.length)||boardListUndoSnapshot; const canRedo=match&&boardRedoStack.length; if(undoBtn)undoBtn.disabled=!canUndo; if(redoBtn)redoBtn.disabled=!canRedo; if(railUndo)railUndo.disabled=!canUndo; if(railRedo)railRedo.disabled=!canRedo; }
    function captureBoardListUndo(){ const p=project(); boardListUndoSnapshot={projectId:p.id,boards:JSON.parse(JSON.stringify(p.boards)),activeBoardId:p.activeBoardId}; }
    function undoBoardListAction(){ if(!boardListUndoSnapshot)return; const p=project(); if(boardListUndoSnapshot.projectId!==p.id){boardListUndoSnapshot=null;return;} p.boards=boardListUndoSnapshot.boards; p.activeBoardId=boardListUndoSnapshot.activeBoardId; boardListUndoSnapshot=null; boardUndoStack=[]; boardRedoStack=[]; boardHistoryBoardId=null; boardNavTrail=[]; selectedBoardItemIds.clear(); selectedConnectorIds.clear(); persist(); if(document.body.classList.contains('split-view'))renderBoard();else renderBoardList(); setStatus('Undid last board action.'); }
    function undoBoard(){ const board=activeBoard(); if(board&&boardHistoryBoardId===board.id&&boardUndoStack.length){ boardRedoStack.push(boardSnapshot(board)); applyBoardSnapshot(board,boardUndoStack.pop()); selectedBoardItemIds.clear(); selectedConnectorIds.clear(); persist(); renderBoard(); setStatus('Undid last board change.'); return; } undoBoardListAction(); }
    function redoBoard(){ const board=activeBoard(); if(!board||boardHistoryBoardId!==board.id||!boardRedoStack.length)return; boardUndoStack.push(boardSnapshot(board)); applyBoardSnapshot(board,boardRedoStack.pop()); selectedBoardItemIds.clear(); selectedConnectorIds.clear(); persist(); renderBoard(); setStatus('Redid board change.'); }
    function renderBoard(){
      closeNoteFocus(); closeBoardContextMenu();
      const board=activeBoard(); clearBoardAssetUrls();
      selectedBoardItemIds=new Set([...selectedBoardItemIds].filter(id=>board.items.some(item=>item.id===id)));
      $('#board-canvas').classList.toggle('board-minimal',!!board.minimal); syncSettingsControls(); syncBoardTint(); updateUndoRedoButtons(); if($('#tb-transform-group'))$('#tb-transform-group').hidden=!selectedBoardItemIds.size; if($('#note-format-toolbar')){$('#note-format-toolbar').hidden=!noteFormatToolbarVisible();positionNoteFormatToolbar();} syncShapeFormatToolbar();
      $('#board-title').value=board.name; renderBreadcrumb();
      boardGroupOptions(); renderBoardList(); const canvas=$('#board-canvas'); canvas.innerHTML=''; applyBoardView();
      board.groups.forEach(group=>{const el=document.createElement('div');el.className='board-group';el.dataset.boardGroup=group.id;el.style.left=`${group.x||40}px`;el.style.top=`${group.y||40}px`;el.style.width=`${group.w||440}px`;el.style.height=`${group.h||360}px`;if(group.color)applyBoardGroupTint(el,group);const groupCardCount=board.items.filter(i=>i.groupId===group.id).length;el.innerHTML=`<div class="board-group-title"><span title="${escapeHtml(group.name)}">${escapeHtml(group.name)}</span><small class="board-group-count">${groupCardCount} card${groupCardCount===1?'':'s'}</small><button type="button" class="board-group-color" title="Color group" aria-label="Color ${escapeHtml(group.name)}">●</button><button type="button" class="board-group-rename" title="Rename group" aria-label="Rename ${escapeHtml(group.name)}">✎</button><button type="button" class="board-group-delete" title="Delete group (keeps its cards)" aria-label="Delete ${escapeHtml(group.name)}">×</button></div><i class="board-group-resize" title="Resize group"></i>`;el.onpointerdown=event=>startGroupDrag(event,group,el);el.oncontextmenu=event=>{event.preventDefault();event.stopPropagation();openGroupContextMenu(event,group);};el.querySelector('.board-group-color').onpointerdown=event=>event.stopPropagation();el.querySelector('.board-group-color').onclick=event=>{event.stopPropagation();openBoardColorMenu(event.currentTarget,color=>{if(color)group.color=color;else delete group.color;persist();renderBoard();setStatus(color?`Group "${group.name}" tinted.`:'Group tint removed.');});};el.querySelector('.board-group-rename').onpointerdown=event=>event.stopPropagation();el.querySelector('.board-group-rename').onclick=event=>{event.stopPropagation();renameBoardGroup(group.id);};el.querySelector('.board-group-delete').onpointerdown=event=>event.stopPropagation();el.querySelector('.board-group-delete').onclick=event=>{event.stopPropagation();deleteBoardGroup(group.id);};canvas.appendChild(el);});
      if(!board.items.length){const empty=document.createElement('div');const center=boardViewportCenter();empty.className='board-empty';empty.style.left=`${center.x}px`;empty.style.top=`${center.y}px`;empty.innerHTML='This board is ready for references.<br><br><button class="btn primary" id="empty-add-images">Add Images</button>';canvas.appendChild(empty);$('#empty-add-images').onclick=()=>$('#board-image-input').click();}
      const connectorsSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');connectorsSvg.setAttribute('class','board-connectors');connectorsSvg.innerHTML='<defs><marker id="board-connector-arrowhead" markerWidth="10" markerHeight="9" refX="8" refY="4.5" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0,0 L9,4.5 L0,9 Z" fill="context-stroke"></path></marker></defs>';canvas.appendChild(connectorsSvg);
      board.items.forEach(item=>{
        const isNote=item.kind==='note'; const isDocument=item.kind==='document'; const isBoardLink=item.kind==='board-link'; const isShape=item.kind==='shape'; const linkTarget=isBoardLink?boardById(item.target):null; const linkBroken=isBoardLink&&!linkTarget; const displayName=isBoardLink?(linkTarget?linkTarget.name:item.name):item.name; const hasDocPreview=isDocument&&(item.hasPreview!==undefined?item.hasPreview:DOC_PREVIEW_TYPES.includes(item.docType)); const isImagePreviewDoc=isDocument&&hasDocPreview&&!!item.previewImg; const isThreeDDoc=isDocument&&DOC_3D_TYPES.includes(item.docType); const card=document.createElement('article');
        card.className=`board-card ${isNote?'note-card':''} ${isDocument?'document-card':''} ${isDocument&&!hasDocPreview?'filebadge-card':''} ${isThreeDDoc?'threed-card':''} ${isBoardLink?'board-link-card':''} ${isShape?'shape-card':''} ${linkBroken?'board-link-broken':''} ${selectedBoardItemIds.has(item.id)?'selected':''} ${item.id===connectPendingId?'connect-pending':''}`;
        card.dataset.boardItem=item.id; card.style.left=`${item.x??80}px`; card.style.top=`${item.y??80}px`; card.style.width=`${item.w||190}px`; if(isShape)card.style.height=`${item.h||130}px`; if(isShape){ if(item.fill!==undefined)card.style.setProperty('--shape-fill',item.fill); if(item.stroke!==undefined)card.style.setProperty('--shape-stroke',item.stroke); if(item.strokeW!==undefined)card.style.setProperty('--shape-stroke-w',item.strokeW); } if(isNote||isDocument||isBoardLink)card.style.height=`${item.h||(isBoardLink?150:(isDocument?(isThreeDDoc?260:(hasDocPreview?170:120)):150))}px`; if(isNote&&item.bgColor)card.style.backgroundColor=item.bgColor;
        const linkCover=isBoardLink&&!linkBroken?(linkTarget.coverSrc||linkTarget.items.find(entry=>entry.kind==='image'&&entry.src)?.src||''):'';
        const media=isShape?boardShapeSvgContent(item):isNote?'':isBoardLink?(linkBroken?`<div class="board-link-broken-badge">⚠ Board removed</div>`:`<div class="board-link-thumb">${linkCover?`<img src="${linkCover}" alt="${escapeHtml(linkTarget.name)} board cover">`:'<span class="board-link-icon">▦</span>'}</div><div class="board-link-label">↷ ${escapeHtml(linkTarget.name)}</div>`):isDocument?(isImagePreviewDoc?`<div class="board-doc-badge">${escapeHtml((item.docType||'pdf').toUpperCase())}</div><img class="board-doc-image-preview" src="${item.previewImg}" alt="${escapeHtml(item.name)}" loading="lazy">`:hasDocPreview?`<div class="board-doc-badge">${escapeHtml((item.docType||'txt').toUpperCase())}</div><div class="board-doc-preview">${escapeHtml(item.text||'')||'(No readable text found in this file.)'}</div>`:`<div class="board-doc-filebadge"><span class="board-doc-filebadge-ext">${escapeHtml((item.docType||'file').toUpperCase())}</span><span class="board-doc-filebadge-size">${escapeHtml(formatFileSize(item.fileSize))}</span></div>`):item.kind==='video'?`<video ${item.src?`src="${item.src}"`:''} controls preload="metadata"></video>`:`<img src="${item.src||''}" alt="${escapeHtml(item.name)}" loading="lazy">`;
        card.innerHTML=`${media}${isThreeDDoc?textureSlotsHtml(item):''}<button type="button" class="board-connector-handle" title="Drag to another card to connect them" aria-label="Drag to connect ${escapeHtml(displayName)} to another card"></button>${isNote?`<button type="button" class="board-note-expand" title="Expand note" aria-label="Expand ${escapeHtml(item.name)}">⤢</button><div class="board-note-title" contenteditable="false" spellcheck="true" title="Drag to move · double-click to edit title"></div><div class="board-note-body" contenteditable="true" spellcheck="true"></div>`:''}${isBoardLink&&!linkBroken?`<button type="button" class="board-link-open" title="Open ${escapeHtml(linkTarget.name)}" aria-label="Open ${escapeHtml(linkTarget.name)}">Open →</button>`:''}<footer><span title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</span><button class="board-card-remove" title="Remove from board" aria-label="Remove ${escapeHtml(displayName)}">×</button></footer><i class="board-card-resize" title="Resize"></i>`;
        if(!isNote&&!isBoardLink)applyMediaStyle(item,card.querySelector(':scope > img, :scope > video'));
        card.onpointerdown=event=>{ if(connectMode){ if(event.button!==0)return; event.preventDefault(); event.stopPropagation(); handleConnectClick(item.id); return; } startBoardDrag(event,item,card); };
        card.oncontextmenu=event=>{ event.preventDefault(); event.stopPropagation(); openBoardContextMenu(event,item); };
        card.querySelector('.board-card-remove').onclick=event=>{event.stopPropagation();removeBoardItem(item.id);};
        if(isBoardLink&&!linkBroken){ const openBtn=card.querySelector('.board-link-open'); openBtn.addEventListener('pointerdown',event=>event.stopPropagation()); openBtn.addEventListener('click',event=>{event.stopPropagation();openLinkedBoard(item.target);}); card.querySelector('footer').addEventListener('dblclick',event=>{if(event.target.closest('.board-card-remove')||event.target.closest('.board-link-open'))return;event.stopPropagation();openLinkedBoard(item.target);}); }
        if(isThreeDDoc)card.querySelectorAll('.board-texture-slot').forEach(slotEl=>{slotEl.onpointerdown=event=>event.stopPropagation();slotEl.onclick=event=>{event.stopPropagation();if(event.target.closest('.board-texture-slot-clear')){clearTextureSlot(item.id,slotEl.dataset.slotKey);return;}pendingTextureSlot={itemId:item.id,slotKey:slotEl.dataset.slotKey};$('#texture-slot-input').click();};});
        card.querySelector('.board-connector-handle').addEventListener('pointerdown',event=>startConnectorHandleDrag(event,item));
        const note=card.querySelector('.board-note-body'); const noteTitle=card.querySelector('.board-note-title');
        if(note){noteTitle.textContent=item.name||'Note';if(item.html!==undefined){note.innerHTML=item.html||'';ensureFontsLoadedForSavedNote(item.html||'');}else note.textContent=item.text||'';note.addEventListener('pointerdown',event=>event.stopPropagation());note.addEventListener('focus',()=>{activeBoardNoteId=item.id;beginNoteEditSnapshot();syncBoardNoteToolbar();});note.addEventListener('blur',event=>{commitNoteEditSnapshot();if($('#note-format-toolbar')?.contains(event.relatedTarget||document.activeElement))return;if(activeBoardNoteId===item.id){activeBoardNoteId=null;const toolbar=$('#note-format-toolbar');if(toolbar){toolbar.hidden=!noteFormatToolbarVisible();positionNoteFormatToolbar();}}});note.addEventListener('input',()=>saveBoardNote(item,note,noteTitle));noteTitle.addEventListener('pointerdown',event=>{if(noteTitle.isContentEditable)event.stopPropagation();});noteTitle.addEventListener('dblclick',event=>{event.stopPropagation();beginNoteEditSnapshot();noteTitle.contentEditable='true';noteTitle.classList.add('editing');noteTitle.focus();});noteTitle.addEventListener('blur',()=>{if(noteTitle.isContentEditable){noteTitle.contentEditable='false';noteTitle.classList.remove('editing');saveBoardNote(item,note,noteTitle);commitNoteEditSnapshot();}});noteTitle.addEventListener('input',()=>saveBoardNote(item,note,noteTitle));note.addEventListener('keyup',rememberBoardNoteSelection);note.addEventListener('mouseup',rememberBoardNoteSelection);
          const expandBtn=card.querySelector('.board-note-expand');expandBtn?.addEventListener('pointerdown',event=>event.stopPropagation());expandBtn?.addEventListener('click',event=>{event.stopPropagation();openNoteFocus(item.id);});
          card.querySelector('footer').addEventListener('dblclick',event=>{if(event.target.closest('.board-card-remove')||event.target.closest('.board-note-expand'))return;event.stopPropagation();openNoteFocus(item.id);});}
        card.querySelector('video')?.addEventListener('pointerdown',event=>event.stopPropagation()); canvas.appendChild(card);
        if(item.storage==='folder'){boardAssetUrl(item).then(url=>{const element=card.querySelector(item.kind==='video'?'video':'img');if(url&&card.isConnected&&element){element.src=url;element.load?.();}else if(!url&&item.kind==='video'&&card.isConnected){card.querySelector('footer span').textContent=`${item.name} (choose save folder to play)`;}});}
      });
      renderConnectorLines(connectorsSvg,board);
      if(boardPipWindow)syncBoardPip();
      updateBoardCulling();
    }
    function rectEdgePoint(cx,cy,hw,hh,dx,dy){ if(!dx&&!dy)return {x:cx,y:cy}; const sx=dx?Math.abs(hw/dx):Infinity; const sy=dy?Math.abs(hh/dy):Infinity; const s=Math.min(sx,sy); return {x:cx+dx*s,y:cy+dy*s}; }
    function bezierPoint(p0,p1,p2,t){ const mt=1-t; return {x:mt*mt*p0.x+2*mt*t*p1.x+t*t*p2.x,y:mt*mt*p0.y+2*mt*t*p1.y+t*t*p2.y}; }
    function connectorPath(p1,p2,curved,waypoints){ 
      if(waypoints&&waypoints.length>0){
        // Build path with waypoints
        let d=`M ${p1.x} ${p1.y}`;
        let prev=p1;
        for(const wp of waypoints){ d+=` L ${wp.x} ${wp.y}`; prev=wp; }
        d+=` L ${p2.x} ${p2.y}`;
        // Calculate mid point (use middle waypoint or midpoint of line)
        let mid;
        if(waypoints.length%2===1) mid=waypoints[Math.floor(waypoints.length/2)];
        else if(waypoints.length>0){
          const i=Math.floor(waypoints.length/2)-1;
          mid={x:(waypoints[i].x+waypoints[i+1].x)/2,y:(waypoints[i].y+waypoints[i+1].y)/2};
        } else mid={x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2};
        return {d,mid};
      }
      if(!curved)return {d:`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`,mid:{x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2}}; 
      const len=Math.hypot(p2.x-p1.x,p2.y-p1.y)||1; 
      const nx=-(p2.y-p1.y)/len, ny=(p2.x-p1.x)/len; 
      const offset=Math.min(Math.max(len*0.25,24),90); 
      const cx=(p1.x+p2.x)/2+nx*offset, cy=(p1.y+p2.y)/2+ny*offset; 
      return {d:`M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`,mid:bezierPoint(p1,{x:cx,y:cy},p2,0.5)}; 
    }
    /* Bug fix (2026-08-23, live user report): renderConnectorLines was only ever called from
       renderBoard() itself — never during a drag. Connector lines are SVG paths computed in raw
       board-space coordinates (correct for pan/zoom, since the SVG is a transformed child of
       #board-canvas same as the cards), but their endpoints are recomputed from item.x/y/w/h only
       on a full render. moveBoardDrag updates item.x/y and the dragged card's DOM position on every
       pointermove but never re-ran that computation, so a connector's line froze at wherever it was
       when the drag started — visibly detached from both cards by the time you let go, since
       endBoardDrag doesn't call renderBoard() either (only persist()). This is what showed up as a
       connector line pointing at nothing: the cards it's attached to had already been dragged away,
       the line just never caught up. Cheap, targeted fix: re-run just the connector pass (not a full
       renderBoard(), which would also churn every card's DOM node mid-drag) whenever a drag changes
       a position or size that a connector could be anchored to. */
    function refreshBoardConnectorsLive(){ const svg=$('.board-connectors'); if(!svg)return; renderConnectorLines(svg,activeBoard()); }
    function renderConnectorLines(svg,board){ selectedConnectorIds=new Set([...selectedConnectorIds].filter(id=>board.connectors.some(conn=>conn.id===id))); svg.querySelectorAll('.board-connector').forEach(el=>el.remove()); (board.connectors||[]).forEach(conn=>{ const from=board.items.find(entry=>entry.id===conn.from); const to=board.items.find(entry=>entry.id===conn.to); if(!from||!to)return; const a=boardItemBounds(from); const b=boardItemBounds(to); const ca={x:a.x+a.w/2,y:a.y+a.h/2}; const cb={x:b.x+b.w/2,y:b.y+b.h/2}; const dx=cb.x-ca.x, dy=cb.y-ca.y; if(!dx&&!dy)return; const p1=rectEdgePoint(ca.x,ca.y,a.w/2,a.h/2,dx,dy); const p2=rectEdgePoint(cb.x,cb.y,b.w/2,b.h/2,-dx,-dy); const {d,mid}=connectorPath(p1,p2,!!conn.curved,conn.waypoints); const g=document.createElementNS('http://www.w3.org/2000/svg','g'); g.setAttribute('class',`board-connector${selectedConnectorIds.has(conn.id)?' selected':''}`); let pathHtml=`<path class="board-connector-hit" d="${d}"></path><path class="board-connector-line" d="${d}" marker-end="url(#board-connector-arrowhead)"></path>`; // Add waypoint circles for selected connectors with waypoints if(selectedConnectorIds.has(conn.id)&&conn.waypoints&&conn.waypoints.length>0){ conn.waypoints.forEach((wp,idx)=>{ const hitR=12; pathHtml+=`<circle class="board-connector-waypoint" cx="${wp.x}" cy="${wp.y}" r="5" data-waypoint-idx="${idx}"></circle><circle class="board-connector-waypoint-hit" cx="${wp.x}" cy="${wp.y}" r="${hitR}" data-waypoint-idx="${idx}"></circle>`; }); } g.innerHTML=pathHtml; const hit=g.querySelector('.board-connector-hit'); hit.addEventListener('click',event=>{event.stopPropagation();selectConnectorClick(conn.id,event);}); g.addEventListener('contextmenu',event=>openConnectorContextMenu(event,conn.id)); // Add waypoint drag handlers const waypointHits=g.querySelectorAll('.board-connector-waypoint-hit'); waypointHits.forEach(hit=>{ hit.addEventListener('mousedown',event=>startWaypointDrag(event,conn.id,parseInt(hit.dataset.waypointIdx))); hit.addEventListener('touchstart',event=>startWaypointDrag(event,conn.id,parseInt(hit.dataset.waypointIdx)),{passive:false}); }); const mx=mid.x, my=mid.y; if(conn.label){ const charW=7, padX=6, padY=4, textH=14; const w=Math.max(conn.label.length*charW+padX*2,16); const rect=document.createElementNS('http://www.w3.org/2000/svg','rect'); rect.setAttribute('class','board-connector-label-bg'); rect.setAttribute('x',mx-w/2); rect.setAttribute('y',my-textH/2-padY/2); rect.setAttribute('width',w); rect.setAttribute('height',textH+padY); rect.setAttribute('rx',4); const text=document.createElementNS('http://www.w3.org/2000/svg','text'); text.setAttribute('class','board-connector-label-text'); text.setAttribute('x',mx); text.setAttribute('y',my+4); text.setAttribute('text-anchor','middle'); text.textContent=conn.label; const openEdit=event=>{event.stopPropagation();editConnectorLabel(conn.id);}; rect.addEventListener('click',openEdit); text.addEventListener('click',openEdit); g.appendChild(rect); g.appendChild(text); } else { const addBtn=document.createElementNS('http://www.w3.org/2000/svg','circle'); addBtn.setAttribute('class','board-connector-label-add'); addBtn.setAttribute('cx',mx); addBtn.setAttribute('cy',my); addBtn.setAttribute('r',8); addBtn.setAttribute('tabindex','0'); addBtn.setAttribute('role','button'); addBtn.setAttribute('aria-label','Add label to connector'); const addBtnTitle=document.createElementNS('http://www.w3.org/2000/svg','title'); addBtnTitle.textContent='Add label'; addBtn.appendChild(addBtnTitle); const openLabelEdit=event=>{event.stopPropagation();editConnectorLabel(conn.id);}; addBtn.addEventListener('click',openLabelEdit); addBtn.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openLabelEdit(event);}}); const addPlus=document.createElementNS('http://www.w3.org/2000/svg','text'); addPlus.setAttribute('class','board-connector-label-add'); addPlus.setAttribute('x',mx); addPlus.setAttribute('y',my+4); addPlus.setAttribute('text-anchor','middle'); addPlus.setAttribute('font-size','12'); addPlus.setAttribute('style','fill:var(--teal);pointer-events:none;'); addPlus.textContent='+'; g.appendChild(addBtn); g.appendChild(addPlus); } svg.appendChild(g); }); }
    async function editConnectorLabel(id){ const board=activeBoard(); const conn=(board.connectors||[]).find(entry=>entry.id===id); if(!conn)return; const value=await promptDialog('Connector label',conn.label||'','Add a short label to this connector (leave blank to remove it).'); if(value===null)return; pushBoardHistory(); conn.label=value.trim(); persist(); renderBoard(); setStatus(conn.label?'Connector label updated.':'Connector label removed.'); }
    function toggleConnectMode(){ connectMode=!connectMode; connectPendingId=null; if(connectMode&&shapeTool)toggleShapeTool(shapeTool); $('#rail-toggle-connect').classList.toggle('active',connectMode); $('#board-canvas-wrap').classList.toggle('connect-mode',connectMode); setStatus(connectMode?'Connect mode on — click a card, then click a second card to link them. Escape or Connect to exit.':'Connect mode off.'); renderBoard(); }
    function handleConnectClick(id){ if(!connectPendingId){ connectPendingId=id; renderBoard(); setStatus('Now click a second card to connect it to this one.'); return; } if(connectPendingId===id){ connectPendingId=null; renderBoard(); setStatus('Connect canceled.'); return; } addConnector(connectPendingId,id); connectPendingId=null; }
    function closeBoardContextMenu(){ const menu=$('#board-context-menu'); if(menu){menu.classList.remove('open');menu.classList.remove('canvas-context');} boardContextMenuItemId=null; contextMenuBoardPoint=null; }
    function updateContextMenuAvailability(){ $('#ctx-copy').disabled=!selectedBoardItemIds.size; $('#ctx-paste').disabled=!boardClipboard||!boardClipboard.items.length; const eligibleImages=activeBoard().items.filter(item=>selectedBoardItemIds.has(item.id)&&!item.kind&&item.src).length; $('#ctx-flatten').disabled=eligibleImages<2; $('#ctx-erase').disabled=eligibleImages!==1; $('#ctx-cutout').disabled=eligibleImages!==1; $('#ctx-warp').disabled=eligibleImages!==1; const selectedItems=activeBoard().items.filter(item=>selectedBoardItemIds.has(item.id)); $('#ctx-duplicate').disabled=!selectedItems.length; $('#ctx-send-back').disabled=!selectedItems.length; $('#ctx-ungroup').disabled=!selectedItems.some(item=>item.groupId); const alignReady=selectedItems.length>=2; $$('#board-context-menu [data-align]').forEach(button=>button.disabled=!alignReady); const connectorReady=selectedConnectorIds.size>0; $('#ctx-connector-curve').disabled=!connectorReady; $('#ctx-connector-label').disabled=connectorReady?selectedConnectorIds.size!==1:true; $('#ctx-connector-delete').disabled=!connectorReady; const isGroupContext=boardContextMenuItemId?.startsWith('group:'); if(isGroupContext){ const groupId=boardContextMenuItemId.match(/^group:(.+)$/)?.[1]; const group=groupId?activeBoard().groups.find(g=>g.id===groupId):null; $('#ctx-group-rename').disabled=!group; $('#ctx-group-cover').disabled=!group; $('#ctx-group-color').disabled=!group; $('#ctx-group-delete').disabled=!group; const itemsInGroup=group?activeBoard().items.filter(i=>i.groupId===groupId).length:0; $('#ctx-group-items').disabled=!group||!itemsInGroup; }}
    function positionContextMenu(event){ const menu=$('#board-context-menu'); const maxLeft=window.innerWidth-menu.offsetWidth-8; const maxTop=window.innerHeight-menu.offsetHeight-8; menu.style.left=`${Math.max(4,Math.min(event.clientX,maxLeft))}px`; menu.style.top=`${Math.max(4,Math.min(event.clientY,maxTop))}px`; }
    function openBoardContextMenu(event,item){ if(connectMode)return; if(!selectedBoardItemIds.has(item.id)){selectedBoardItemIds.clear();selectedBoardItemIds.add(item.id);selectedConnectorIds.clear();setSelectedBoardItems(selectedBoardItemIds);} boardContextMenuItemId=item.id; contextMenuBoardPoint=screenToBoard(event.clientX,event.clientY); const menu=$('#board-context-menu'); menu.classList.remove('canvas-context'); menu.classList.add('open'); updateContextMenuAvailability(); positionContextMenu(event); }
    function openCanvasContextMenu(event){ if(connectMode)return; boardContextMenuItemId=null; contextMenuBoardPoint=screenToBoard(event.clientX,event.clientY); const menu=$('#board-context-menu'); menu.classList.add('canvas-context'); menu.classList.add('open'); updateContextMenuAvailability(); positionContextMenu(event); }
    /* Connector right-click (toolbar-reorg step 4 completion): arrows get their
       own context-menu mode — connector-only items (curve/label/delete) replace
       the card-only ones. The connector is selected on right-click so the
       operations apply to exactly what was clicked. */
    function openConnectorContextMenu(event,connectorId){ if(connectMode)return; event.preventDefault(); event.stopPropagation(); selectedBoardItemIds.clear(); selectedConnectorIds=new Set([connectorId]); renderBoard(); const menu=$('#board-context-menu'); closeBoardContextMenu(); menu.classList.add('connector-context'); menu.classList.add('open'); updateContextMenuAvailability(); positionContextMenu(event); }
    /* Group right-click context menu (toolbar-reorg step 4 continuation): groups get
       their own context-menu with rename, choose cover, color tag, delete group options. */
    function openGroupContextMenu(event,group){ if(connectMode)return; event.preventDefault(); event.stopPropagation(); boardContextMenuItemId='group:'+group.id; contextMenuBoardPoint={x:group.x||40,y:group.y||40}; const menu=$('#board-context-menu'); closeBoardContextMenu(); menu.classList.add('group-context'); menu.classList.add('open'); updateContextMenuAvailability(); positionContextMenu(event); }
    function startConnectFromContextMenu(id){ if(!connectMode)toggleConnectMode(); connectPendingId=id; renderBoard(); setStatus('Now click a second card to connect it to this one.'); }
    function addConnector(fromId,toId,waypoints){ const board=activeBoard(); if(board.connectors.some(c=>(c.from===fromId&&c.to===toId)||(c.from===toId&&c.to===fromId))){ setStatus('These cards are already connected. Choose another pair.'); renderBoard(); return; } pushBoardHistory(); board.connectors.push({id:'board-connector-'+uid(),from:fromId,to:toId,label:'',curved:false,waypoints:waypoints||[]}); persist(); renderBoard(); setStatus('Arrow added. Connect mode is still on — choose another pair to draw another.'); }
    function selectConnectorClick(id,event){ if(event.shiftKey){ if(selectedConnectorIds.has(id))selectedConnectorIds.delete(id);else selectedConnectorIds.add(id); } else { selectedConnectorIds=new Set([id]); } renderBoard(); setStatus(selectedConnectorIds.size>1?`${selectedConnectorIds.size} arrows selected.`:'Arrow selected — right-click it for curve/label/delete, or press Delete.'); }
    function removeSelectedConnectors(){ const board=activeBoard(); const total=selectedConnectorIds.size; if(!total){setStatus('Select an arrow first.');return;} pushBoardHistory(); board.connectors=board.connectors.filter(c=>!selectedConnectorIds.has(c.id)); selectedConnectorIds.clear(); persist(); renderBoard(); setStatus(`Removed ${total} arrow${total===1?'':'s'}.`); }
    function toggleSelectedConnectorsCurved(){ const board=activeBoard(); if(!selectedConnectorIds.size){ setStatus('Select one or more connectors first — click a connector line to select it.'); return; } const selected=board.connectors.filter(c=>selectedConnectorIds.has(c.id)); const turnOn=!selected.every(c=>c.curved); pushBoardHistory(); selected.forEach(c=>{c.curved=turnOn;}); persist(); renderBoard(); setStatus(`Curved routing ${turnOn?'on':'off'} for ${selected.length} connector${selected.length===1?'':'s'}.`); }
    function connectorPreviewEl(){ const svg=$('.board-connectors'); if(!svg)return null; let line=svg.querySelector('#board-connector-preview'); if(!line){ line=document.createElementNS('http://www.w3.org/2000/svg','line'); line.id='board-connector-preview'; line.setAttribute('class','board-connector-line board-connector-preview-line'); svg.appendChild(line); } return line; }
    function startConnectorHandleDrag(event,item){ if(boardMarquee||event.button!==0)return; event.preventDefault(); event.stopPropagation(); const handle=event.currentTarget; handle.classList.add('dragging'); connectorHandleDrag={fromId:item.id,handle,moveHandler:null,keyHandler:null}; connectorHandleDrag.moveHandler=moveEvent=>updateConnectorHandleDrag(moveEvent); connectorHandleDrag.keyHandler=keyEvent=>{if(keyEvent.key==='Escape')cancelConnectorHandleDrag();}; window.addEventListener('pointermove',connectorHandleDrag.moveHandler); window.addEventListener('pointerup',endConnectorHandleDrag,{once:true}); window.addEventListener('keydown',connectorHandleDrag.keyHandler); updateConnectorHandleDrag(event); }
    function updateConnectorHandleDrag(event){ if(!connectorHandleDrag)return; const board=activeBoard(); const from=board.items.find(entry=>entry.id===connectorHandleDrag.fromId); if(!from)return; const bounds=boardItemBounds(from); const cx=bounds.x+bounds.w/2, cy=bounds.y+bounds.h/2; const point=screenToBoard(event.clientX,event.clientY); const dx=point.x-cx, dy=point.y-cy; const p1=rectEdgePoint(cx,cy,bounds.w/2,bounds.h/2,dx,dy); const line=connectorPreviewEl(); if(line){ line.setAttribute('x1',p1.x); line.setAttribute('y1',p1.y); line.setAttribute('x2',point.x); line.setAttribute('y2',point.y); } $$('.board-card').forEach(el=>el.classList.remove('connect-drop-target')); const overCard=document.elementFromPoint(event.clientX,event.clientY)?.closest('.board-card'); if(overCard&&overCard.dataset.boardItem!==connectorHandleDrag.fromId)overCard.classList.add('connect-drop-target'); }
    function cleanupConnectorHandleDrag(){ if(!connectorHandleDrag)return; window.removeEventListener('pointermove',connectorHandleDrag.moveHandler); window.removeEventListener('keydown',connectorHandleDrag.keyHandler); connectorHandleDrag.handle.classList.remove('dragging'); $$('.board-card').forEach(el=>el.classList.remove('connect-drop-target')); $('.board-connectors')?.querySelector('#board-connector-preview')?.remove(); }
    function cancelConnectorHandleDrag(){ if(!connectorHandleDrag)return; cleanupConnectorHandleDrag(); window.removeEventListener('pointerup',endConnectorHandleDrag); connectorHandleDrag=null; setStatus('Connect canceled.'); }
    function endConnectorHandleDrag(event){ if(!connectorHandleDrag)return; const dragState=connectorHandleDrag; cleanupConnectorHandleDrag(); connectorHandleDrag=null; const overCard=document.elementFromPoint(event.clientX,event.clientY)?.closest('.board-card'); const targetId=overCard?.dataset.boardItem; if(targetId&&targetId!==dragState.fromId)addConnector(dragState.fromId,targetId); }
    function startWaypointDrag(event,connectorId,waypointIdx){ event.preventDefault(); event.stopPropagation(); if(!selectedConnectorIds.has(connectorId))return; const board=activeBoard(); const conn=board.connectors.find(c=>c.id===connectorId); if(!conn||!conn.waypoints||!conn.waypoints[waypointIdx])return; waypointDrag={connectorId,waypointIdx,moveHandler:null,upHandler:null}; waypointDrag.moveHandler=moveEvent=>updateWaypointDrag(moveEvent); waypointDrag.upHandler=()=>endWaypointDrag(); window.addEventListener('pointermove',waypointDrag.moveHandler); window.addEventListener('pointerup',waypointDrag.upHandler,{once:true}); setStatus('Drag waypoint to reshape connector. Press Delete to remove it.'); }
    function updateWaypointDrag(event){ if(!waypointDrag)return; const board=activeBoard(); const conn=board.connectors.find(c=>c.id===waypointDrag.connectorId); if(!conn||!conn.waypoints)return; const point=screenToBoard(event.clientX,event.clientY); conn.waypoints[waypointDrag.waypointIdx]={x:point.x,y:point.y}; refreshBoardConnectorsLive(); }
    function endWaypointDrag(){ if(!waypointDrag)return; window.removeEventListener('pointermove',waypointDrag.moveHandler); waypointDrag=null; pushBoardHistory(); persist(); setStatus('Connector updated.'); }
    function removeWaypoint(){ if(!waypointDrag)return; const board=activeBoard(); const conn=board.connectors.find(c=>c.id===waypointDrag.connectorId); if(!conn||!conn.waypoints)return; pushBoardHistory(); conn.waypoints.splice(waypointDrag.waypointIdx,1); waypointDrag=null; persist(); renderBoard(); setStatus('Waypoint removed.'); }
    function newBoard(){ const p=project(); const suggested=`Board ${p.boards.length+1}`; const name=prompt('Name this board:',suggested); if(name===null)return; captureBoardListUndo(); const board=blankBoard(name.trim()||suggested);p.boards.push(board);p.activeBoardId=board.id;persist();openSplitBoard();setStatus(`Created ${board.name}.`); }
    async function renameBoard(){ const board=activeBoard(); const name=await promptDialog('Board name',board.name); if(name===null)return; const trimmed=name.trim()||board.name; if(trimmed===board.name)return; captureBoardListUndo(); board.name=trimmed;persist();renderBoard();setStatus('Board renamed.'); }
    function commitBoardTitle(){ const board=activeBoard();const name=$('#board-title').value.trim()||board.name||'Untitled Board';if(name===board.name){$('#board-title').value=board.name;return;}captureBoardListUndo();board.name=name;persist();renderBreadcrumb();renderBoardList();updateUndoRedoButtons();setStatus('Board renamed.'); }
    function duplicateBoard(){ const p=project(); const original=activeBoard(); captureBoardListUndo(); boardNavTrail=[]; const copy=structuredClone(original);copy.id='board-'+uid();copy.name=`${original.name} (Copy)`;const groupIds={};copy.groups.forEach(group=>{const prior=group.id;group.id='board-group-'+uid();groupIds[prior]=group.id;});const itemIds={};copy.items.forEach(item=>{const prior=item.id;item.id='board-item-'+uid();itemIds[prior]=item.id;item.groupId=groupIds[item.groupId]||'';});copy.connectors=(copy.connectors||[]).map(conn=>({...conn,id:'board-connector-'+uid(),from:itemIds[conn.from],to:itemIds[conn.to]})).filter(conn=>conn.from&&conn.to);p.boards.push(copy);p.activeBoardId=copy.id;persist();renderBoard();setStatus('Board duplicated.'); }
    async function deleteBoard(){ const p=project(); const board=activeBoard(); if(p.boards.length===1){setStatus('A project needs at least one board.');return;} if(!await confirmDialog(`Delete "${board.name}"?`,`This removes the board and its ${board.items.length} image reference${board.items.length===1?'':'s'}.`,{confirmLabel:'Delete Board'}))return;captureBoardListUndo();p.boards=p.boards.filter(item=>item.id!==board.id);p.activeBoardId=p.boards[0].id;boardNavTrail=[];persist();renderBoard();setStatus('Board deleted.'); }
    /* Tier 13 C — FigJam-style named frame presets. Sizes in board units (1:1 with CSS px at 100% zoom):
       presentation ratios, print formats at 96 dpi, and the three device defaults. `free` keeps the
       historical 440×350 drag-to-size starting frame. */
    const BOARD_GROUP_PRESETS={ free:{name:'Character references',w:440,h:350}, '16:9':{name:'16:9 frame',w:960,h:540}, '4:3':{name:'4:3 frame',w:960,h:720}, '1:1':{name:'1:1 frame',w:800,h:800}, a4p:{name:'A4 portrait',w:794,h:1123}, a4l:{name:'A4 landscape',w:1123,h:794}, letter:{name:'Letter',w:816,h:1056}, desktop:{name:'Desktop',w:1920,h:1080}, tablet:{name:'Tablet',w:834,h:1194}, mobile:{name:'Mobile',w:390,h:844} };
    async function addBoardGroup(presetKey){ const board=activeBoard(); const preset=BOARD_GROUP_PRESETS[presetKey]||BOARD_GROUP_PRESETS.free; const name=await promptDialog('Group name',preset.name,presetKey&&presetKey!=='free'?`Frame preset: ${preset.w}×${preset.h}px.`:''); if(name===null)return; const center=boardViewportCenter(); const group={id:'board-group-'+uid(),name:name.trim()||preset.name,x:Math.round(center.x-preset.w/2+(board.groups.length%3)*28),y:Math.round(center.y-preset.h/2+(board.groups.length%3)*28),w:preset.w,h:preset.h};board.groups.push(group);persist();renderBoard();$('#board-group-select').value=group.id;setStatus(`Created group: ${group.name} (${preset.w}×${preset.h}).`); }
    async function renameBoardGroup(groupId){ const board=activeBoard(); const group=board.groups.find(item=>item.id===groupId); if(!group)return; const name=await promptDialog('Group name',group.name); if(name===null)return; group.name=name.trim()||group.name; persist(); renderBoard(); setStatus('Group renamed.'); }
    async function chooseBoardCoverForGroup(groupId){ const board=activeBoard(); const group=board.groups.find(item=>item.id===groupId); if(!group)return; const input=document.createElement('input'); input.type='file'; input.accept='image/*'; input.onchange=async event=>{ const file=event.target.files[0]; if(!file)return; try{ group.coverSrc=await boardCoverImageData(file); persist(); renderBoard(); setStatus(`Group cover set for "${group.name}".`); }catch{ setStatus('Could not use that image as a group cover.'); }}; input.click(); }
    function openGroupColorMenu(groupId){ const board=activeBoard(); const group=board.groups.find(item=>item.id===groupId); if(!group)return; const anchor=$('#ctx-group-color'); openBoardColorMenu(anchor,color=>{ if(color)group.color=color; else delete group.color; persist(); renderBoard(); setStatus(color?`Group "${group.name}" tinted.`:'Group tint removed.'); }); }
    async function toggleGroupItems(groupId){ const board=activeBoard(); const group=board.groups.find(item=>item.id===groupId); if(!group)return; const itemsInGroup=board.items.filter(item=>item.groupId===groupId); if(!itemsInGroup.length){ setStatus('No items in this group to toggle.'); return; } pushBoardHistory(); const anyUngrouped=itemsInGroup.some(item=>item.groupId); if(anyUngrouped){ itemsInGroup.forEach(item=>item.groupId=''); setStatus(`Ungrouped ${itemsInGroup.length} item${itemsInGroup.length===1?'':'s'}.`); }else{ itemsInGroup.forEach(item=>item.groupId=groupId); setStatus(`Grouped ${itemsInGroup.length} item${itemsInGroup.length===1?'':'s'}.`); } persist(); renderBoard(); }
    async function deleteBoardGroup(groupId){ const board=activeBoard(); const group=board.groups.find(item=>item.id===groupId); if(!group)return; const count=board.items.filter(item=>item.groupId===groupId).length; if(!await confirmDialog(`Delete group "${group.name}"?`,count?`Its ${count} card${count===1?'':'s'} will stay on the board, ungrouped.`:'It has no cards.',{confirmLabel:'Delete Group'}))return; board.items.forEach(item=>{if(item.groupId===groupId)item.groupId='';}); board.groups=board.groups.filter(item=>item.id!==groupId); persist(); renderBoard(); setStatus('Group deleted. Its cards remain on the board.'); }
    function groupSelectedItems(){ const board=activeBoard();const selected=board.items.filter(item=>selectedBoardItemIds.has(item.id));if(!selected.length){setStatus('Select one or more cards first. Shift-click adds cards to the selection.');return;}const name=prompt('Group name:','Reference group');if(name===null)return;const bounds=selected.map(item=>boardItemBounds(item));const left=Math.min(...bounds.map(b=>b.x))-18;const top=Math.min(...bounds.map(b=>b.y))-36;const right=Math.max(...bounds.map(b=>b.x+b.w))+18;const bottom=Math.max(...bounds.map(b=>b.y+b.h))+18;const group={id:'board-group-'+uid(),name:name.trim()||'Untitled group',x:left,y:top,w:right-left,h:bottom-top};pushBoardHistory();board.groups.push(group);selected.forEach(item=>item.groupId=group.id);persist();renderBoard();setStatus(`Grouped ${selected.length} card${selected.length===1?'':'s'}.`); }
    function snapBoardValue(value){ return activeBoard().snap===false?value:Math.round(value/22)*22; }
    function autoAssignBoardGroup(item){ const board=activeBoard();const bounds=boardItemBounds(item);const group=board.groups.find(candidate=>bounds.x>=(candidate.x||0)&&bounds.y>=(candidate.y||0)+25&&bounds.x+bounds.w<=(candidate.x||0)+(candidate.w||0)&&bounds.y+bounds.h<=(candidate.y||0)+(candidate.h||0));if(group&&item.groupId!==group.id){item.groupId=group.id;setStatus(`Added to group: ${group.name}.`);return true;}if(!group&&item.groupId){item.groupId='';}return !!group; }
    function alignSelectedItems(mode){ const selected=activeBoard().items.filter(item=>selectedBoardItemIds.has(item.id));if(selected.length<2){setStatus('Select at least two cards to align them.');return;}const left=Math.min(...selected.map(item=>item.x??80));const right=Math.max(...selected.map(item=>(item.x??80)+(item.w||190)));const top=Math.min(...selected.map(item=>item.y??80));const bottom=Math.max(...selected.map(item=>(item.y??80)+(item.h||240)));pushBoardHistory();selected.forEach(item=>{const width=item.w||190;const height=item.h||240;if(mode==='left')item.x=left;if(mode==='center')item.x=snapBoardValue((left+right-width)/2);if(mode==='right')item.x=right-width;if(mode==='top')item.y=top;if(mode==='middle')item.y=snapBoardValue((top+bottom-height)/2);if(mode==='bottom')item.y=bottom-height;});persist();renderBoard();setStatus(`Aligned ${selected.length} cards.`); }
    function bringSelectedToFront(){ const board=activeBoard();const selected=board.items.filter(item=>selectedBoardItemIds.has(item.id));if(!selected.length){setStatus('Select a card first.');return;}pushBoardHistory();board.items=[...board.items.filter(item=>!selectedBoardItemIds.has(item.id)),...selected];persist();renderBoard();setStatus('Selected cards brought to the front.'); }
    function sendSelectedToBack(){ const board=activeBoard();const selected=board.items.filter(item=>selectedBoardItemIds.has(item.id));if(!selected.length){setStatus('Select a card first.');return;}pushBoardHistory();board.items=[...selected,...board.items.filter(item=>!selectedBoardItemIds.has(item.id))];persist();renderBoard();setStatus('Selected cards sent to the back.'); }
    function ungroupSelectedItems(){ const board=activeBoard();const grouped=board.items.filter(item=>selectedBoardItemIds.has(item.id)&&item.groupId);if(!grouped.length){setStatus('Select card(s) inside a group first.');return;}pushBoardHistory();const affectedGroupIds=new Set(grouped.map(item=>item.groupId));grouped.forEach(item=>delete item.groupId);affectedGroupIds.forEach(groupId=>{if(!board.items.some(item=>item.groupId===groupId))board.groups=board.groups.filter(group=>group.id!==groupId);});persist();renderBoard();setStatus(`Ungrouped ${grouped.length} card${grouped.length===1?'':'s'}.`); }
    /* Tier 11, last item: region-of-interest-aware Compact Pack (Rother, Bordeaux, Hamadi & Blake,
       "AutoCollage", SIGGRAPH 2006). AutoCollage's full pipeline ranks images by cross-image
       "representativeness" (kernel density estimation over matched feature descriptors against every
       other image in the set) and finds each one's region of interest via a learned saliency model, then
       packs and graph-cut-blends toward those regions. That full pipeline is out of scope for one session
       and doesn't map onto this app's Compact Pack anyway: compactPackBoard() only repositions cards (their
       x/y), it never crops or resizes image pixels, so there's no "region of interest" for it to pack
       *toward* in the geometric sense AutoCollage means. Documented, deliberately simplified stand-in that
       still captures the actual complaint ("no awareness of image content"): imageSaliencyScore() reuses
       the existing seamEnergyMap() (gradient-magnitude edge energy, already built for Tier 11's seam
       carving) as a cheap single-image proxy for "visually busy/interesting," and compactPackBoard() now
       sorts cards by that score — most visually-dense images first — instead of by their prior y/x position,
       so a content-rich image can't get buried in the packing order behind an incidental blank/empty one.
       This is single-image saliency, not AutoCollage's cross-image representativeness ranking; a genuinely
       cross-image "most representative of this board" score would need real feature matching, its own
       future session. Video cards, note/document/board-link cards, and any image whose source can't be
       read (e.g. a folder-stored asset with no chosen save folder this session) fall back to score `null`
       and sort after every scored image, in their prior relative order — same graceful-degradation shape
       already used for `item.storage==='folder'` elsewhere in this file. */
    let boardSaliencyCache=new Map();
    function imageSaliencyScore(item){
      return new Promise(resolve=>{
        if(item.kind!=='image'){resolve(null);return;}
        const cacheKey=item.id;
        const cached=boardSaliencyCache.get(cacheKey);
        const sourceHint=item.src||(item.asset&&item.asset.file)||'';
        if(cached&&cached.sourceHint===sourceHint){resolve(cached.score);return;}
        const finish=src=>{
          if(!src){boardSaliencyCache.set(cacheKey,{sourceHint,score:null});resolve(null);return;}
          const image=new Image();
          image.onload=()=>{
            try{
              const size=48;
              const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
              canvas.getContext('2d').drawImage(image,0,0,size,size);
              const data=canvas.getContext('2d').getImageData(0,0,size,size).data;
              const energy=seamEnergyMap(data,size,size);
              let sum=0;for(let i=0;i<energy.length;i++)sum+=energy[i];
              const score=sum/energy.length;
              boardSaliencyCache.set(cacheKey,{sourceHint,score});resolve(score);
            }catch{boardSaliencyCache.set(cacheKey,{sourceHint,score:null});resolve(null);}
          };
          image.onerror=()=>{boardSaliencyCache.set(cacheKey,{sourceHint,score:null});resolve(null);};
          image.src=src;
        };
        if(item.storage==='folder')boardAssetUrl(item).then(finish).catch(()=>finish(null));
        else finish(item.src||'');
      });
    }
    async function compactPackBoard(){ const board=activeBoard();const ungrouped=board.items.filter(item=>!item.groupId);if(!ungrouped.length){setStatus('No ungrouped cards to pack — grouped cards keep their layout.');return;}const gutter=24;const margin=40;const wrap=$('#board-canvas-wrap');const maxWidth=Math.max(420,(wrap.clientWidth||900)-margin*2);const positionOrder=ungrouped.slice().sort((a,b)=>(a.y||0)-(b.y||0)||(a.x||0)-(b.x||0));const imageCount=positionOrder.filter(item=>item.kind==='image').length;if(imageCount)setStatus(`Reading ${imageCount} image${imageCount===1?'':'s'} for content-aware packing…`);const scores=await Promise.all(positionOrder.map(item=>imageSaliencyScore(item)));const scored=positionOrder.map((item,index)=>({item,score:scores[index],order:index}));scored.sort((a,b)=>{if(a.score==null&&b.score==null)return a.order-b.order;if(a.score==null)return 1;if(b.score==null)return -1;return b.score-a.score;});let x=margin,y=margin,rowHeight=0;pushBoardHistory();scored.forEach(({item})=>{const w=item.w||190;const h=item.h||240;if(x>margin&&x+w>margin+maxWidth){x=margin;y+=rowHeight+gutter;rowHeight=0;}item.x=snapBoardValue(x);item.y=snapBoardValue(y);rowHeight=Math.max(rowHeight,h);x+=w+gutter;});persist();renderBoard();setStatus(`Packed ${ungrouped.length} ungrouped card${ungrouped.length===1?'':'s'} into a tidy grid, most visually busy images placed first.`); }
    function toggleBoardSnap(force){ const board=activeBoard();board.snapExplicit=true;board.snap=force===undefined?board.snap===false:!!force;persist();renderBoard();setStatus(`Grid snapping ${board.snap?'enabled':'disabled'}.`); }
    function toggleBoardMinimal(force){ const board=activeBoard();board.minimal=force===undefined?!board.minimal:!!force;persist();renderBoard();setStatus(board.minimal?'Minimal mode on — card footer, resize handle, and connector dot show on hover or select only.':'Minimal mode off.'); }
    function toggleBoardFocus(){ const active=document.body.classList.toggle('board-focus'); $('#toggle-board-focus').title=active?'Exit distraction-free mode':'Toggle distraction-free mode'; setStatus(active?'Distraction-free mode on. Press Esc or the button to exit.':'Distraction-free mode off.'); }
    function applyPipView(){ if(!boardPipWindow||!boardPipView)return; const doc=boardPipWindow.document; const mirror=doc.getElementById('pip-board-mirror'); const canvas=mirror?.querySelector('.board-canvas'); if(!mirror||!canvas)return; const scale=boardPipView.zoom/100; canvas.style.transform=`translate(${boardPipView.panX}px,${boardPipView.panY}px) scale(${scale})`; const minor=Math.max(8,Math.round(32*scale)); const major=minor*5; mirror.style.backgroundSize=`${minor}px ${minor}px,${minor}px ${minor}px,${major}px ${major}px,${major}px ${major}px`; mirror.style.backgroundPosition=`${boardPipView.panX}px ${boardPipView.panY}px,${boardPipView.panX}px ${boardPipView.panY}px,${boardPipView.panX}px ${boardPipView.panY}px,${boardPipView.panX}px ${boardPipView.panY}px`; }
    function wirePipViewControls(mirror){
      mirror.addEventListener('wheel',event=>{ event.preventDefault(); const rect=mirror.getBoundingClientRect(); const oldScale=boardPipView.zoom/100; const nextZoom=Math.max(35,Math.min(200,Math.round(boardPipView.zoom+(event.deltaY<0?10:-10)))); if(nextZoom===boardPipView.zoom)return; const cursorX=event.clientX-rect.left,cursorY=event.clientY-rect.top; const boardX=(cursorX-boardPipView.panX)/oldScale,boardY=(cursorY-boardPipView.panY)/oldScale; const newScale=nextZoom/100; boardPipView.zoom=nextZoom; boardPipView.panX=cursorX-boardX*newScale; boardPipView.panY=cursorY-boardY*newScale; applyPipView(); },{passive:false});
      let dragState=null;
      mirror.addEventListener('pointerdown',event=>{ if(event.button!==0&&event.button!==1)return; dragState={startX:event.clientX,startY:event.clientY,panX:boardPipView.panX,panY:boardPipView.panY}; mirror.setPointerCapture(event.pointerId); mirror.style.cursor='grabbing'; });
      mirror.addEventListener('pointermove',event=>{ if(!dragState)return; boardPipView.panX=dragState.panX+(event.clientX-dragState.startX); boardPipView.panY=dragState.panY+(event.clientY-dragState.startY); applyPipView(); });
      const endPipDrag=event=>{ if(!dragState)return; dragState=null; mirror.style.cursor='grab'; if(event?.pointerId!==undefined&&mirror.hasPointerCapture(event.pointerId))mirror.releasePointerCapture(event.pointerId); };
      mirror.addEventListener('pointerup',endPipDrag); mirror.addEventListener('pointercancel',endPipDrag);
    }
    function syncBoardPip(){ if(!boardPipWindow)return; const doc=boardPipWindow.document; let mirror=doc.getElementById('pip-board-mirror'); if(!mirror){ mirror=doc.createElement('div'); mirror.id='pip-board-mirror'; mirror.className='board-canvas-wrap'; mirror.style.cssText='position:absolute;inset:0;cursor:grab;'; doc.body.appendChild(mirror); wirePipViewControls(mirror); } const canvas=$('#board-canvas'); if(!canvas)return; mirror.innerHTML=canvas.outerHTML; mirror.querySelector('.board-canvas')?.querySelectorAll('video').forEach(video=>video.controls=false); applyPipView(); }
    function syncBoardPipDebounced(){ if(!boardPipWindow)return; clearTimeout(boardPipSyncTimer); boardPipSyncTimer=setTimeout(syncBoardPip,120); }
    async function toggleBoardPip(){
      if(boardPipWindow){ boardPipWindow.close(); return; }
      if(!('documentPictureInPicture' in window)){ setStatus('Floating board isn\'t supported in this browser (needs a recent Chrome, Edge, or Firefox).'); return; }
      try{
        const wrap=$('#board-canvas-wrap'); const pip=await documentPictureInPicture.requestWindow({width:Math.round(wrap.clientWidth*0.6)||480,height:Math.round(wrap.clientHeight*0.6)||360});
        boardPipWindow=pip; boardPipView={zoom:100,panX:0,panY:0};
        const styleSource=document.querySelector('style'); if(styleSource)pip.document.head.appendChild(styleSource.cloneNode(true));
        pip.document.body.style.cssText='margin:0;background:#202020;overflow:hidden;position:relative;height:100vh;';
        pip.addEventListener('pagehide',()=>{ clearTimeout(boardPipSyncTimer); boardPipWindow=null; boardPipView=null; $('#toggle-board-pip').classList.remove('active'); $('#toggle-board-pip').textContent='Float Board'; setStatus('Floating board closed.'); });
        $('#toggle-board-pip').classList.add('active'); $('#toggle-board-pip').textContent='Unfloat Board';
        syncBoardPip();
        setStatus('Floating board opened — it\'s a view-only mirror; keep editing here in this tab.');
      }catch(error){ boardPipWindow=null; boardPipView=null; setStatus('Could not open the floating board window.'); }
    }
    function removeBoardItem(id){ const board=activeBoard();pushBoardHistory();board.items=board.items.filter(item=>item.id!==id);persist();renderBoard();setStatus('Item removed from board.'); }
    function removeSelectedItems(){ const board=activeBoard();const total=selectedBoardItemIds.size;if(!total)return;pushBoardHistory();board.items=board.items.filter(item=>!selectedBoardItemIds.has(item.id));selectedBoardItemIds.clear();persist();renderBoard();setStatus(`Removed ${total} item${total===1?'':'s'} from board.`); }
    function applyMediaStyle(item,media){ if(!media)return; media.style.filter=item.grayscale?'grayscale(1)':''; media.style.transform=`scaleX(${item.flipH?-1:1}) scaleY(${item.flipV?-1:1}) rotate(${item.rotate||0}deg)`; media.style.opacity=item.opacity!=null?item.opacity/100:''; }
    function updateSelectedMediaItems(mutator,recordHistory=true){ const items=activeBoard().items.filter(item=>selectedBoardItemIds.has(item.id)&&item.kind!=='note'&&item.kind!=='document'&&item.kind!=='board-link'); if(!items.length){setStatus('Select one or more image/video cards first.');return null;} if(recordHistory)pushBoardHistory(); items.forEach(item=>{ mutator(item); const card=$(`[data-board-item="${item.id}"]`); applyMediaStyle(item,card?.querySelector('img,video')); }); persist(); if(recordHistory)updateUndoRedoButtons(); return items; }
    function duplicateSelectedItems(){ const board=activeBoard();const selected=board.items.filter(item=>selectedBoardItemIds.has(item.id));if(!selected.length){setStatus('Select one or more cards first.');return;}const copies=selected.map(item=>{const copy=JSON.parse(JSON.stringify(item));copy.id='board-item-'+uid();copy.x=(item.x??80)+24;copy.y=(item.y??80)+24;return copy;});pushBoardHistory();board.items.push(...copies);selectedBoardItemIds=new Set(copies.map(item=>item.id));persist();renderBoard();setStatus(`Duplicated ${copies.length} card${copies.length===1?'':'s'}.`); }
    let nudgePersistTimer=null;
    function nudgeSelectedItems(dx,dy){ const board=activeBoard();const selected=board.items.filter(item=>selectedBoardItemIds.has(item.id));if(!selected.length)return;if(!nudgePersistTimer)pushBoardHistory();selected.forEach(item=>{item.x=(item.x??80)+dx;item.y=(item.y??80)+dy;const card=$(`[data-board-item="${item.id}"]`);if(card){card.style.left=`${item.x}px`;card.style.top=`${item.y}px`;}});clearTimeout(nudgePersistTimer);nudgePersistTimer=setTimeout(()=>{persist();nudgePersistTimer=null;updateUndoRedoButtons();},300); }
    function boardPosition(index){ const board=activeBoard(); const group=board.groups.find(item=>item.id===$('#board-group-select').value); const offset=(board.items.length%4)*205;const row=Math.floor((board.items.length%8)/4)*265;if(group)return {x:(group.x||0)+22+offset,y:(group.y||0)+45+row};const center=boardViewportCenter();return {x:Math.round(center.x-95+(index%5)*28),y:Math.round(center.y-110+(index%5)*28)}; }
    /* Tier 11, item 1: seam carving (Avidan & Shamir, SIGGRAPH 2007) — content-aware resize. Finds the lowest-visual-energy path of pixels across an image and removes it, one seam at a time, instead of naive scale-to-fit/center-crop, so a face or subject near the edge doesn't get squashed or cropped off. Proof-of-concept target: the board cover picker (`chooseBoardCover`/`.board-tile-cover`), which today force-crops via CSS `object-fit:cover` into a fixed 190px-tall tile — the clearest actual instance of "naive crop into a fixed frame" in this app. NOTE: the plan entry that queued this described `compactPackBoard()` as the target ("clearest 1:1 match to an existing button") — that turned out not to be accurate on inspection: `compactPackBoard()` only repositions cards in a grid, it never resizes or crops image pixels, so there was nothing there for seam carving to attach to. Redirected to the board cover picker instead; see session note in MODERNIZATION_PLAN.md. Growing an image (seam insertion) is out of scope for this pass — only shrinking (seam removal) is implemented; if a source image is smaller than the target on an axis, that axis falls back to a plain scale. A cheap pre-scale bounds every image to at most 15% larger than the target per axis before carving starts, so the number of seams removed (and therefore the O(seams × w × h) cost) stays small regardless of the source photo's original resolution. */
    function seamEnergyMap(data,w,h){ const energy=new Float32Array(w*h); const lum=i=>{const p=i*4;return 0.299*data[p]+0.587*data[p+1]+0.114*data[p+2];}; for(let y=0;y<h;y++){ for(let x=0;x<w;x++){ const xl=lum(y*w+Math.max(0,x-1)),xr=lum(y*w+Math.min(w-1,x+1)),yu=lum(Math.max(0,y-1)*w+x),yd=lum(Math.min(h-1,y+1)*w+x); energy[y*w+x]=Math.abs(xl-xr)+Math.abs(yu-yd); } } return energy; }
    function findVerticalSeam(energy,w,h){ const cost=new Float32Array(w*h); const back=new Int32Array(w*h); for(let x=0;x<w;x++)cost[x]=energy[x]; for(let y=1;y<h;y++){ for(let x=0;x<w;x++){ let best=cost[(y-1)*w+x],bestX=x; if(x>0&&cost[(y-1)*w+x-1]<best){best=cost[(y-1)*w+x-1];bestX=x-1;} if(x<w-1&&cost[(y-1)*w+x+1]<best){best=cost[(y-1)*w+x+1];bestX=x+1;} cost[y*w+x]=energy[y*w+x]+best; back[y*w+x]=bestX; } } let minX=0,minVal=cost[(h-1)*w]; for(let x=1;x<w;x++){ if(cost[(h-1)*w+x]<minVal){minVal=cost[(h-1)*w+x];minX=x;} } const seam=new Int32Array(h); seam[h-1]=minX; for(let y=h-2;y>=0;y--)seam[y]=back[(y+1)*w+seam[y+1]]; return seam; }
    function removeVerticalSeam(imageData,seam){ const w=imageData.width,h=imageData.height,data=imageData.data; const out=new Uint8ClampedArray((w-1)*h*4); for(let y=0;y<h;y++){ const sx=seam[y]; let outX=0; for(let x=0;x<w;x++){ if(x===sx)continue; const si=(y*w+x)*4,di=(y*(w-1)+outX)*4; out[di]=data[si];out[di+1]=data[si+1];out[di+2]=data[si+2];out[di+3]=data[si+3]; outX++; } } return new ImageData(out,w-1,h); }
    function seamCarveRemoveVertical(canvas,count){ let w=canvas.width,h=canvas.height; let imageData=canvas.getContext('2d').getImageData(0,0,w,h); for(let i=0;i<count&&w>1;i++){ const energy=seamEnergyMap(imageData.data,w,h); const seam=findVerticalSeam(energy,w,h); imageData=removeVerticalSeam(imageData,seam); w=imageData.width; } const out=document.createElement('canvas'); out.width=w;out.height=h; out.getContext('2d').putImageData(imageData,0,0); return out; }
    function rotateCanvas90(canvas,clockwise){ const w=canvas.width,h=canvas.height; const out=document.createElement('canvas'); out.width=h;out.height=w; const ctx=out.getContext('2d'); if(clockwise){ctx.translate(h,0);ctx.rotate(Math.PI/2);}else{ctx.translate(0,w);ctx.rotate(-Math.PI/2);} ctx.drawImage(canvas,0,0); return out; }
    function drawScaledCanvas(source,w,h){ const out=document.createElement('canvas'); out.width=Math.max(1,w);out.height=Math.max(1,h); out.getContext('2d').drawImage(source,0,0,out.width,out.height); return out; }
    function seamCarveResize(source,targetW,targetH){ let canvas=source; const guard=1.15; if(canvas.width>targetW*guard){ const w=Math.round(targetW*guard); const h=Math.max(1,Math.round(canvas.height*(w/canvas.width))); canvas=drawScaledCanvas(canvas,w,h); } if(canvas.height>targetH*guard){ const h=Math.round(targetH*guard); const w=Math.max(1,Math.round(canvas.width*(h/canvas.height))); canvas=drawScaledCanvas(canvas,w,h); } if(canvas.width>targetW)canvas=seamCarveRemoveVertical(canvas,canvas.width-targetW); if(canvas.height>targetH){ const rotated=rotateCanvas90(canvas,true); const carved=seamCarveRemoveVertical(rotated,rotated.width-targetH); canvas=rotateCanvas90(carved,false); } if(canvas.width!==targetW||canvas.height!==targetH)canvas=drawScaledCanvas(canvas,targetW,targetH); return canvas; }
    const BOARD_COVER_W=300,BOARD_COVER_H=190;
    function boardCoverImageData(file){ return new Promise((resolve,reject)=>{ const url=URL.createObjectURL(file); const image=new Image(); image.onload=()=>{ URL.revokeObjectURL(url); const max=1400; const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight)); const source=document.createElement('canvas'); source.width=Math.max(1,Math.round(image.naturalWidth*scale)); source.height=Math.max(1,Math.round(image.naturalHeight*scale)); source.getContext('2d').drawImage(image,0,0,source.width,source.height); const fitted=seamCarveResize(source,BOARD_COVER_W,BOARD_COVER_H); resolve(fitted.toDataURL('image/jpeg',.8)); }; image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read image'));}; image.src=url; }); }
    function boardImageData(file){ return new Promise((resolve,reject)=>{ const url=URL.createObjectURL(file);const image=new Image();image.onload=()=>{URL.revokeObjectURL(url);const max=1100;const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.76));};image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read image'));};image.src=url;}); }
    function loadImageElement(src){ return new Promise((resolve,reject)=>{ const image=new Image(); image.onload=()=>resolve(image); image.onerror=()=>reject(new Error('Could not load image')); image.src=src; }); }
    function rectsOverlap(a,b){ return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y; }
    function rectIntersection(a,b){ const x=Math.max(a.x,b.x); const y=Math.max(a.y,b.y); const right=Math.min(a.x+a.w,b.x+b.w); const bottom=Math.min(a.y+a.h,b.y+b.h); return {x,y,w:Math.max(0,right-x),h:Math.max(0,bottom-y)}; }
    // Simplified Poisson/gradient-domain blending (Pérez, Gangnet & Blake, "Poisson
    // Image Editing", SIGGRAPH 2003). Solves Laplacian(f)=Laplacian(g) over the
    // overlap region — f is the unknown blended result, g is the new layer being
    // composited in, and the region's border is clamped to the existing composite
    // (Dirichlet boundary condition) — via Gauss-Seidel relaxation, RGB channels
    // only. Alpha is handled separately by linearly fading the blended result back
    // toward the existing composite wherever the new layer is partially
    // transparent, so a soft-edged PNG doesn't get forced fully opaque.
    function poissonBlendOverlap(destData,sourceData,w,h,iterations){
      const result=new Float32Array(destData.data.length);
      for(let i=0;i<destData.data.length;i++)result[i]=destData.data[i];
      const idx=(x,y,c)=>(y*w+x)*4+c;
      for(let iter=0;iter<iterations;iter++){
        for(let y=1;y<h-1;y++){
          for(let x=1;x<w-1;x++){
            const srcAlpha=sourceData.data[idx(x,y,3)]/255;
            if(srcAlpha<=0)continue;
            for(let c=0;c<3;c++){
              const guidance=sourceData.data[idx(x,y,c)]*4-sourceData.data[idx(x-1,y,c)]-sourceData.data[idx(x+1,y,c)]-sourceData.data[idx(x,y-1,c)]-sourceData.data[idx(x,y+1,c)];
              const neighborSum=result[idx(x-1,y,c)]+result[idx(x+1,y,c)]+result[idx(x,y-1,c)]+result[idx(x,y+1,c)];
              const blended=(neighborSum+guidance)/4;
              result[idx(x,y,c)]=result[idx(x,y,c)]*(1-srcAlpha)+blended*srcAlpha;
            }
          }
        }
      }
      const out=new ImageData(w,h);
      for(let i=0;i<result.length;i++)out.data[i]=Math.max(0,Math.min(255,Math.round(result[i])));
      for(let i=3;i<out.data.length;i+=4)out.data[i]=255;
      return out;
    }
    // patchMatchInpaint(): a simplified PatchMatch (Barnes et al., SIGGRAPH 2009)
    // nearest-neighbor-field search used as an "erase object" fill. `imageData`
    // is a plain {data:Uint8ClampedArray} of RGBA pixels (w*h*4 long — a real
    // ImageData works since it has a `.data` property, and so does a plain
    // object, which is what the Node unit test below passes in). `mask` is a
    // Uint8Array, one byte per pixel, 1 = hole to fill, 0 = known-good pixel.
    // Returns a NEW Uint8ClampedArray (RGBA) — never mutates the input.
    // Deliberate proof-of-concept simplifications, same spirit as this tier's
    // other items: single-scale (no coarse-to-fine pyramid), reconstruction is
    // direct-copy-from-best-match-center rather than full multi-patch voting/
    // blending, and a candidate is accepted only if the *center* pixel of its
    // patch footprint is a fully-valid (non-hole, in-bounds) known patch —
    // checked once up front into a `validCenter` lookup, not per-candidate, so
    // propagation/random-search stay O(1) per check instead of re-scanning a
    // whole patch footprint every time.
    function patchMatchInpaint(imageData,mask,w,h,patchSize=7,iterations=5){
      const half=(patchSize-1)>>1;
      const src=imageData.data;
      const out=new Uint8ClampedArray(src);
      const validCenter=new Uint8Array(w*h);
      const centers=[];
      for(let y=half;y<h-half;y++){
        for(let x=half;x<w-half;x++){
          let ok=true;
          for(let dy=-half;dy<=half&&ok;dy++){for(let dx=-half;dx<=half;dx++){if(mask[(y+dy)*w+(x+dx)]){ok=false;break;}}}
          if(ok){validCenter[y*w+x]=1;centers.push(y*w+x);}
        }
      }
      let sr=0,sg=0,sb=0,cnt=0;
      for(let i=0;i<w*h;i++){if(!mask[i]){sr+=src[i*4];sg+=src[i*4+1];sb+=src[i*4+2];cnt++;}}
      const avg=cnt?[sr/cnt,sg/cnt,sb/cnt]:[128,128,128];
      const holes=[];
      for(let i=0;i<w*h;i++){if(mask[i]){out[i*4]=avg[0];out[i*4+1]=avg[1];out[i*4+2]=avg[2];out[i*4+3]=255;holes.push(i);}}
      if(!centers.length||!holes.length)return out; // nothing to sample from — leave the flat bootstrap fill
      const nnfX=new Int32Array(w*h),nnfY=new Int32Array(w*h);
      for(const p of holes){const c=centers[(Math.random()*centers.length)|0];nnfX[p]=c%w;nnfY[p]=(c/w)|0;}
      const patchDist=(tx,ty,sx,sy,best)=>{
        let sum=0;
        for(let dy=-half;dy<=half;dy++){
          const ty2=ty+dy,sy2=sy+dy; if(ty2<0||ty2>=h)continue;
          for(let dx=-half;dx<=half;dx++){
            const tx2=tx+dx,sx2=sx+dx; if(tx2<0||tx2>=w)continue;
            const ti=(ty2*w+tx2)*4,si=(sy2*w+sx2)*4;
            const dr=out[ti]-src[si],dg=out[ti+1]-src[si+1],db=out[ti+2]-src[si+2];
            sum+=dr*dr+dg*dg+db*db;
            if(sum>=best)return sum;
          }
        }
        return sum;
      };
      const maxDim=Math.max(w,h);
      for(let iter=0;iter<iterations;iter++){
        const reverse=iter%2===1;
        const order=reverse?holes.slice().reverse():holes;
        for(const p of order){
          const x=p%w,y=(p/w)|0;
          let bestX=nnfX[p],bestY=nnfY[p];
          let bestD=patchDist(x,y,bestX,bestY,Infinity);
          const step=reverse?1:-1;
          const nxp=p+step; if(x+step>=0&&x+step<w){const cx=nnfX[nxp]-step,cy=nnfY[nxp];if(cx>=half&&cx<w-half&&cy>=half&&cy<h-half&&validCenter[cy*w+cx]){const d=patchDist(x,y,cx,cy,bestD);if(d<bestD){bestD=d;bestX=cx;bestY=cy;}}}
          const nyp=p+step*w; if(y+step>=0&&y+step<h){const cx2=nnfX[nyp],cy2=nnfY[nyp]-step;if(cx2>=half&&cx2<w-half&&cy2>=half&&cy2<h-half&&validCenter[cy2*w+cx2]){const d=patchDist(x,y,cx2,cy2,bestD);if(d<bestD){bestD=d;bestX=cx2;bestY=cy2;}}}
          let radius=maxDim;
          while(radius>=1){
            const rx=Math.min(w-1-half,Math.max(half,bestX+((Math.random()*2-1)*radius|0)));
            const ry=Math.min(h-1-half,Math.max(half,bestY+((Math.random()*2-1)*radius|0)));
            if(validCenter[ry*w+rx]){const d=patchDist(x,y,rx,ry,bestD);if(d<bestD){bestD=d;bestX=rx;bestY=ry;}}
            radius>>=1;
          }
          nnfX[p]=bestX;nnfY[p]=bestY;
        }
        for(const p of holes){const si=(nnfY[p]*w+nnfX[p])*4;out[p*4]=src[si];out[p*4+1]=src[si+1];out[p*4+2]=src[si+2];out[p*4+3]=255;}
      }
      return out;
    }
    // --- GrabCut-style "Cut Out Subject" (Rother, Kolmogorov & Blake, SIGGRAPH/TOG 2004) ---
    // A genuine, deliberately simplified graph-cut segmentation, in the same spirit as
    // this tier's other items. Two documented simplifications versus the paper:
    // (1) hard k-means color clusters stand in for full covariance-aware Gaussian
    //     Mixture Models — cluster-distance is used as the per-pixel data cost instead
    //     of a true GMM negative log-likelihood. Simpler to implement correctly and to
    //     unit-test than a covariance-matrix GMM, at some cost to segmentation quality
    //     on subjects with subtle color/lighting gradients.
    // (2) max-flow is a plain BFS augmenting-path search (Edmonds-Karp), not the
    //     incremental Boykov-Kolmogorov algorithm real GrabCut implementations use —
    //     correct, but slower on large graphs. The aggressive working-resolution cap
    //     in runCutoutObject() below exists specifically because of this.
    // No border matting (the paper's alpha-matte edge refinement) — output is a binary
    // mask with a single cheap box-blur pass on the alpha channel to soften jaggies,
    // not a true soft matte. Box-only selection, same as this tier's other rectangle-
    // gated tools (erase, Poisson blending, seam carving) — no scribble refinement.
    function colorDist2raw(a,b){ const dr=a[0]-b[0],dg=a[1]-b[1],db=a[2]-b[2]; return dr*dr+dg*dg+db*db; }
    function nearestClusterDist2(col,clusters){ let best=Infinity; for(const c of clusters){ const d=colorDist2raw(col,c); if(d<best)best=d; } return best; }
    // Deterministic k-means (evenly-spaced initial centroids, not random) so results —
    // and this feature's unit tests — are reproducible across runs.
    function kMeansColors(colors,k,iterations=4){
      if(!colors.length)return [[128,128,128]];
      if(colors.length<=k)return colors.map(c=>c.slice());
      const centroids=[];
      for(let ci=0;ci<k;ci++)centroids.push(colors[Math.floor(ci*colors.length/k)].slice());
      for(let iter=0;iter<iterations;iter++){
        const sums=centroids.map(()=>[0,0,0,0]);
        for(const col of colors){
          let best=0,bestDist=Infinity;
          for(let ci=0;ci<centroids.length;ci++){const d=colorDist2raw(col,centroids[ci]);if(d<bestDist){bestDist=d;best=ci;}}
          sums[best][0]+=col[0];sums[best][1]+=col[1];sums[best][2]+=col[2];sums[best][3]++;
        }
        for(let ci=0;ci<centroids.length;ci++)if(sums[ci][3]>0)centroids[ci]=[sums[ci][0]/sums[ci][3],sums[ci][1]/sums[ci][3],sums[ci][2]/sums[ci][3]];
      }
      return centroids;
    }
    // Minimal directed-graph max-flow (Edmonds-Karp). Edges are always added in
    // (forward,reverse) pairs, so `edge XOR 1` always gives an edge's reverse partner —
    // the standard trick that lets augmenting-path update skip a separate lookup table.
    function makeFlowGraph(numNodes){ return {numNodes,to:[],cap:[],head:new Int32Array(numNodes).fill(-1),next:[]}; }
    function addFlowEdge(g,u,v,capUV,capVU=0){ g.to.push(v);g.cap.push(capUV);g.next.push(g.head[u]);g.head[u]=g.to.length-1; g.to.push(u);g.cap.push(capVU);g.next.push(g.head[v]);g.head[v]=g.to.length-1; }
    function bfsAugmentingPath(g,s,t){
      const parentEdge=new Int32Array(g.numNodes).fill(-1);
      const visited=new Uint8Array(g.numNodes); visited[s]=1;
      const queue=[s]; let qi=0;
      while(qi<queue.length){
        const u=queue[qi++];
        for(let e=g.head[u];e!==-1;e=g.next[e]){
          const v=g.to[e];
          if(!visited[v]&&g.cap[e]>0){ visited[v]=1; parentEdge[v]=e; if(v===t)return parentEdge; queue.push(v); }
        }
      }
      return visited[t]?parentEdge:null;
    }
    // Safety-valve iteration cap (documented, same pattern as this tier's other capped
    // loops) — guards against a pathological graph producing an excessive number of
    // small augmenting paths rather than looping unbounded.
    function maxFlow(g,s,t,maxIterations=20000){
      for(let iter=0;iter<maxIterations;iter++){
        const parentEdge=bfsAugmentingPath(g,s,t);
        if(!parentEdge)break;
        let pathFlow=Infinity,v=t;
        while(v!==s){ const e=parentEdge[v]; pathFlow=Math.min(pathFlow,g.cap[e]); v=g.to[e^1]; }
        v=t;
        while(v!==s){ const e=parentEdge[v]; g.cap[e]-=pathFlow; g.cap[e^1]+=pathFlow; v=g.to[e^1]; }
      }
    }
    function sourceReachableSet(g,s){
      const visited=new Uint8Array(g.numNodes); visited[s]=1;
      const queue=[s]; let qi=0;
      while(qi<queue.length){
        const u=queue[qi++];
        for(let e=g.head[u];e!==-1;e=g.next[e]){ const v=g.to[e]; if(!visited[v]&&g.cap[e]>0){visited[v]=1;queue.push(v);} }
      }
      return visited;
    }
    // One graph-cut pass: `bgLocked[i]` marks pixels outside the drawn box as definite
    // background (infinite-capacity t-link, so the min cut can never separate them from
    // the sink); every other pixel gets a data-term t-link from its distance to the
    // current foreground/background color clusters, plus contrast-weighted n-links to
    // its 4-connected neighbors (Boykov & Jolly 2001's formulation — a low-contrast
    // neighbor pair is expensive to cut, encouraging the boundary to snap to real edges).
    // Constants (DATA_SCALE, the n-link weight of 50) are tuned empirically to balance
    // data vs. smoothness terms for 0-255 RGB input, not derived from the paper.
    function minCutSegment(imageData,w,h,bgLocked,fgClusters,bgClusters,beta){
      const DATA_SCALE=1/5000, NLINK_WEIGHT=50;
      const n=w*h, s=n, t=n+1;
      const g=makeFlowGraph(n+2);
      const src=imageData.data;
      for(let y=0;y<h;y++){
        for(let x=0;x<w;x++){
          const i=y*w+x, idx=i*4;
          const col=[src[idx],src[idx+1],src[idx+2]];
          if(bgLocked[i]){ addFlowEdge(g,s,i,0); addFlowEdge(g,i,t,1e9); }
          else{ const dBg=nearestClusterDist2(col,bgClusters)*DATA_SCALE; const dFg=nearestClusterDist2(col,fgClusters)*DATA_SCALE; addFlowEdge(g,s,i,dBg); addFlowEdge(g,i,t,dFg); }
          if(x+1<w){ const j=i+1,idx2=idx+4; const w_pq=NLINK_WEIGHT*Math.exp(-beta*colorDist2raw(col,[src[idx2],src[idx2+1],src[idx2+2]])); addFlowEdge(g,i,j,w_pq,w_pq); }
          if(y+1<h){ const j=i+w,idx2=j*4; const w_pq=NLINK_WEIGHT*Math.exp(-beta*colorDist2raw(col,[src[idx2],src[idx2+1],src[idx2+2]])); addFlowEdge(g,i,j,w_pq,w_pq); }
        }
      }
      maxFlow(g,s,t);
      const reachable=sourceReachableSet(g,s);
      const mask=new Uint8Array(n);
      for(let i=0;i<n;i++)mask[i]=reachable[i]?1:0;
      return mask;
    }
    // Full segmentation: `imageData` is a plain {data:Uint8ClampedArray} (w*h*4 RGBA —
    // a real ImageData or a plain object both work, same convention as
    // patchMatchInpaint, so this is unit-testable without a DOM). `box` is
    // {x,y,w,h} in this same imageData's own pixel coordinates; everything outside it
    // is treated as definite background. Returns a Uint8Array mask, 1=foreground.
    // Iterates cluster-fit + re-cut a fixed, capped number of times (3) rather than to
    // energy convergence, same "capped, not converged" pattern as Poisson blending and
    // PatchMatch elsewhere in this tier.
    function grabCutSegment(imageData,box,w,h,iterations=3){
      const n=w*h;
      const bgLocked=new Uint8Array(n);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const inBox=x>=box.x&&x<box.x+box.w&&y>=box.y&&y<box.y+box.h; bgLocked[y*w+x]=inBox?0:1; }
      if(!bgLocked.some(v=>v===1))return new Uint8Array(n); // box covers the whole image — no background reference exists, so nothing to compare against
      let mask=new Uint8Array(n); for(let i=0;i<n;i++)mask[i]=bgLocked[i]?0:1;
      let sumSq=0,count=0;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const idx=(y*w+x)*4;
        if(x+1<w){ const idx2=idx+4; sumSq+=colorDist2raw([imageData.data[idx],imageData.data[idx+1],imageData.data[idx+2]],[imageData.data[idx2],imageData.data[idx2+1],imageData.data[idx2+2]]); count++; }
        if(y+1<h){ const idx2=idx+w*4; sumSq+=colorDist2raw([imageData.data[idx],imageData.data[idx+1],imageData.data[idx+2]],[imageData.data[idx2],imageData.data[idx2+1],imageData.data[idx2+2]]); count++; }
      }
      const beta=count&&sumSq>0?1/(2*(sumSq/count)):0;
      for(let iter=0;iter<iterations;iter++){
        const fgColors=[],bgColors=[];
        for(let i=0;i<n;i++){ const idx=i*4; const col=[imageData.data[idx],imageData.data[idx+1],imageData.data[idx+2]]; if(bgLocked[i]||!mask[i])bgColors.push(col); else fgColors.push(col); }
        if(!fgColors.length||!bgColors.length)break; // degenerate split — keep the last valid mask
        const fgClusters=kMeansColors(fgColors,Math.min(5,fgColors.length),4);
        const bgClusters=kMeansColors(bgColors,Math.min(5,bgColors.length),4);
        mask=minCutSegment(imageData,w,h,bgLocked,fgClusters,bgClusters,beta);
      }
      return mask;
    }
    // --- Graph-cut seam-finding for multi-photo merges (Agarwala, Dontcheva, Agrawala,
    // Drucker, Colburn, Curless, Salesin & Cohen, "Interactive Digital Photomontage,"
    // SIGGRAPH 2004 — the seam-cost formulation itself is Kwatra, Schödl, Essa, Turk &
    // Bobick's earlier graph-cut texture synthesis, SIGGRAPH 2003, which Photomontage's
    // own seam objective builds on). Layers on top of the Poisson-blending "Flatten to
    // Image" feature above: instead of running the gradient-domain solve over the
    // *entire* overlap rectangle — which softens a double-exposure ghost where the two
    // layers genuinely disagree, rather than removing it — find the one best seam
    // through the overlap first (the path that runs through pixels where the two images
    // already agree), then only feather the thin band right along that seam.
    // Reuses the same max-flow machinery as the "Cut Out Subject" GrabCut tool above
    // (`makeFlowGraph`/`addFlowEdge`/`maxFlow`/`sourceReachableSet`), so this is the same
    // deliberate proof-of-concept trade-off as that tool: plain Edmonds-Karp
    // (BFS-augmenting-path) max-flow, not the faster incremental Boykov-Kolmogorov
    // algorithm real seam-finding implementations use — hence the working-resolution
    // cap in `photomontageSeamComposite()` below, same reasoning as GrabCut's own cap.
    // destData/sourceData: plain {data:Uint8ClampedArray} RGBA, same w×h (a real
    // ImageData or a plain object both work — same convention as `patchMatchInpaint`/
    // `grabCutSegment`, so this is unit-testable without a DOM). Returns a Uint8Array
    // mask, one byte per pixel: 1 = this pixel comes from the new (source) layer, 0 =
    // keep the existing composite (dest).
    // Terminal constraints, in priority order:
    // (1) Real transparency — a pixel the new layer's own alpha doesn't reach is forced
    //     to dest; a pixel the existing composite never touched before this layer was
    //     painted is forced to source. This alone is enough for a cutout PNG with actual
    //     holes, but for the common case — two fully-opaque rectangular photos, where
    //     neither alpha is ever 0 anywhere inside their shared overlap — it never fires,
    //     which would otherwise leave the graph with no source/sink connectivity at all
    //     (a degenerate zero-cost cut that arbitrarily keeps everything on one side).
    // (2) `edgeBias` (optional {left,right,top,bottom}, each 'dest'|'source'|null) —
    //     which physical side of the overlap rectangle borders pure-dest-only content
    //     versus pure-source-only content, supplied by the caller from the two images'
    //     actual bounding rectangles. Each pixel gets a soft, distance-based t-link cost
    //     toward whichever classified edge it's closer to — strongest right at that
    //     physical edge (so the seam reliably lands inside the true overlap, not at its
    //     border), tapering to near-zero deep in the interior, where the routing is left
    //     to the n-link term below instead.
    // Everywhere both layers have real, unforced pixels, the n-link cost between
    // 4-connected neighbors p,q is Kwatra's M(p,q) = |A(p)-B(p)| + |A(q)-B(q)| — cutting
    // between two pixels where dest and source already look similar costs little, so the
    // min cut threads through low-mismatch seams instead of a straight line down the middle.
    function photomontageSeamMask(destData,sourceData,w,h,edgeBias){
      const n=w*h, s=n, t=n+1;
      const g=makeFlowGraph(n+2);
      const FORCE=1e9;
      // Empirically tuned against this function's own n-link magnitudes (0-255 RGB
      // squared-difference sums), same "not derived from the paper" caveat as this
      // file's other graph-cut constants (`minCutSegment`'s DATA_SCALE/NLINK_WEIGHT).
      const BIAS_SCALE=4000;
      const colorAt=(data,i)=>{const idx=i*4;return [data[idx],data[idx+1],data[idx+2]];};
      const edgeDistances=(x,y)=>{
        let dDest=Infinity, dSource=Infinity;
        if(edgeBias){
          if(edgeBias.left==='dest')dDest=Math.min(dDest,x); else if(edgeBias.left==='source')dSource=Math.min(dSource,x);
          if(edgeBias.right==='dest')dDest=Math.min(dDest,w-1-x); else if(edgeBias.right==='source')dSource=Math.min(dSource,w-1-x);
          if(edgeBias.top==='dest')dDest=Math.min(dDest,y); else if(edgeBias.top==='source')dSource=Math.min(dSource,y);
          if(edgeBias.bottom==='dest')dDest=Math.min(dDest,h-1-y); else if(edgeBias.bottom==='source')dSource=Math.min(dSource,h-1-y);
        }
        return [dDest,dSource];
      };
      for(let y=0;y<h;y++){
        for(let x=0;x<w;x++){
          const i=y*w+x, idx=i*4;
          const srcAlpha=sourceData.data[idx+3], destAlpha=destData.data[idx+3];
          if(srcAlpha<=0){ addFlowEdge(g,s,i,0); addFlowEdge(g,i,t,FORCE); } // source doesn't reach here — must stay dest
          else if(destAlpha<=0){ addFlowEdge(g,s,i,FORCE); addFlowEdge(g,i,t,0); } // nothing was here before — must become source
          else {
            const [dDest,dSource]=edgeDistances(x,y);
            const bothFinite=Number.isFinite(dDest)&&Number.isFinite(dSource);
            const towardSource=bothFinite?Math.max(0,dDest-dSource)*BIAS_SCALE:0;
            const towardDest=bothFinite?Math.max(0,dSource-dDest)*BIAS_SCALE:0;
            addFlowEdge(g,s,i,towardSource); addFlowEdge(g,i,t,towardDest);
          }
          if(x+1<w){ const j=i+1; const cost=colorDist2raw(colorAt(destData.data,i),colorAt(sourceData.data,i))+colorDist2raw(colorAt(destData.data,j),colorAt(sourceData.data,j)); addFlowEdge(g,i,j,cost,cost); }
          if(y+1<h){ const j=i+w; const cost=colorDist2raw(colorAt(destData.data,i),colorAt(sourceData.data,i))+colorDist2raw(colorAt(destData.data,j),colorAt(sourceData.data,j)); addFlowEdge(g,i,j,cost,cost); }
        }
      }
      maxFlow(g,s,t);
      const reachable=sourceReachableSet(g,s);
      const mask=new Uint8Array(n);
      for(let i=0;i<n;i++)mask[i]=reachable[i]?1:0;
      return mask;
    }
    // Turns the hard 0/1 seam mask into a soft few-pixel-wide [0,1] weight, so any
    // residual one-pixel color mismatch right at the graph-cut boundary reads as a
    // feather rather than a visible hard edge. A cheap box blur, not a gradient-domain
    // solve — pixels more than `radius` away from any label change are untouched (still
    // exactly 0 or 1), so this never softens the interior of either layer, only the seam.
    function featherSeamMask(mask,w,h,radius=2){
      const out=new Float32Array(mask.length);
      for(let y=0;y<h;y++){
        for(let x=0;x<w;x++){
          const i=y*w+x; let sum=0,cnt=0;
          for(let dy=-radius;dy<=radius;dy++){ const y2=y+dy; if(y2<0||y2>=h)continue; for(let dx=-radius;dx<=radius;dx++){ const x2=x+dx; if(x2<0||x2>=w)continue; sum+=mask[y2*w+x2]; cnt++; } }
          out[i]=sum/cnt;
        }
      }
      return out;
    }
    // Composites one overlap rectangle using an already-feathered seam mask, respecting
    // the new layer's own per-pixel alpha (so a soft-edged PNG on top doesn't get forced
    // fully opaque right at the seam either).
    function compositeSeamedOverlap(destData,sourceData,w,h,mask){
      const weight=featherSeamMask(mask,w,h,2);
      const out=new ImageData(w,h);
      for(let i=0;i<w*h;i++){
        const idx=i*4; const srcAlpha=sourceData.data[idx+3]/255; const a=weight[i]*srcAlpha;
        for(let c=0;c<3;c++)out.data[idx+c]=Math.round(destData.data[idx+c]*(1-a)+sourceData.data[idx+c]*a);
        out.data[idx+3]=255;
      }
      return out;
    }
    // Browser-only canvas plumbing (not unit-testable in Node, same as
    // `boardCoverImageData`/`runCutoutObject` elsewhere in this tier): downscales a plain
    // ImageData to a working resolution for the expensive graph-cut, then nearest-
    // neighbor-upscales just the resulting *label decision* back to full size before
    // feathering and compositing happen at full resolution — a full-resolution overlap
    // only ever needs a coarse seam position, not per-pixel graph-cut precision.
    function resampleImageData(imageData,w,h,tw,th){
      const src=document.createElement('canvas'); src.width=w; src.height=h; src.getContext('2d').putImageData(imageData,0,0);
      const dst=document.createElement('canvas'); dst.width=tw; dst.height=th; const dctx=dst.getContext('2d'); dctx.drawImage(src,0,0,tw,th);
      return dctx.getImageData(0,0,tw,th);
    }
    function photomontageSeamComposite(destData,sourceData,w,h,edgeBias){
      const WORKING_CAP=130;
      const scale=Math.min(1,WORKING_CAP/Math.max(w,h));
      let mask;
      if(scale>=1){
        mask=photomontageSeamMask(destData,sourceData,w,h,edgeBias);
      } else {
        const ww=Math.max(1,Math.round(w*scale)), wh=Math.max(1,Math.round(h*scale));
        const smallMask=photomontageSeamMask(resampleImageData(destData,w,h,ww,wh),resampleImageData(sourceData,w,h,ww,wh),ww,wh,edgeBias);
        mask=new Uint8Array(w*h);
        for(let y=0;y<h;y++){ const sy=Math.min(wh-1,Math.floor(y*wh/h)); for(let x=0;x<w;x++){ const sx=Math.min(ww-1,Math.floor(x*ww/w)); mask[y*w+x]=smallMask[sy*ww+sx]; } }
      }
      return compositeSeamedOverlap(destData,sourceData,w,h,mask);
    }
    async function flattenSelectedImagesToGroup(){
      const board=activeBoard();
      const selected=board.items.filter(item=>selectedBoardItemIds.has(item.id)&&!item.kind&&item.src);
      if(selected.length<2){setStatus('Select two or more image cards to flatten together.');return;}
      const rects=selected.map(item=>boardItemBounds(item));
      const left=Math.min(...rects.map(r=>r.x)); const top=Math.min(...rects.map(r=>r.y));
      const right=Math.max(...rects.map(r=>r.x+r.w)); const bottom=Math.max(...rects.map(r=>r.y+r.h));
      const rawW=Math.max(1,right-left), rawH=Math.max(1,bottom-top);
      const scale=Math.min(1,1400/Math.max(rawW,rawH));
      const canvasW=Math.max(1,Math.round(rawW*scale)), canvasH=Math.max(1,Math.round(rawH*scale));
      const canvas=document.createElement('canvas'); canvas.width=canvasW; canvas.height=canvasH;
      const ctx=canvas.getContext('2d');
      const toCanvas=rect=>({x:(rect.x-left)*scale,y:(rect.y-top)*scale,w:rect.w*scale,h:rect.h*scale});
      const order=board.items.filter(item=>selectedBoardItemIds.has(item.id)&&!item.kind&&item.src);
      const drawnRects=[]; setStatus('Flattening — solving seams at the overlaps…');
      for(const item of order){
        const rect=toCanvas(boardItemBounds(item));
        let image; try{image=await loadImageElement(item.src);}catch{continue;}
        let overlapRect=null, edgeBias=null;
        if(drawnRects.length){
          const unionLeft=Math.min(...drawnRects.map(r=>r.x)), unionTop=Math.min(...drawnRects.map(r=>r.y));
          const unionRight=Math.max(...drawnRects.map(r=>r.x+r.w)), unionBottom=Math.max(...drawnRects.map(r=>r.y+r.h));
          const unionRect={x:unionLeft,y:unionTop,w:unionRight-unionLeft,h:unionBottom-unionTop};
          if(rectsOverlap(rect,unionRect)){
            overlapRect=rectIntersection(rect,unionRect);
            // Which physical side of the overlap borders pure-dest-only content versus
            // pure-source-only content — the overlap is the intersection of `rect` (this
            // layer) and `unionRect` (everything drawn so far), so on each axis whichever
            // rectangle's edge is the tighter (binding) one tells us what lies just past it:
            // if `rect` is the binding edge, its own content ends right there and only dest
            // continues past it; if `unionRect` is the binding edge, only source continues.
            edgeBias={
              left: rect.x>=unionRect.x?'dest':'source',
              right: (rect.x+rect.w)<=(unionRect.x+unionRect.w)?'dest':'source',
              top: rect.y>=unionRect.y?'dest':'source',
              bottom: (rect.y+rect.h)<=(unionRect.y+unionRect.h)?'dest':'source',
            };
          }
        }
        const paintLayer=targetCtx=>{ targetCtx.save(); targetCtx.translate(rect.x+rect.w/2,rect.y+rect.h/2); targetCtx.rotate((item.rotate||0)*Math.PI/180); targetCtx.scale(item.flipH?-1:1,item.flipV?-1:1); if(item.grayscale)targetCtx.filter='grayscale(1)'; if(item.opacity!=null)targetCtx.globalAlpha=item.opacity/100; targetCtx.drawImage(image,-rect.w/2,-rect.h/2,rect.w,rect.h); targetCtx.restore(); };
        let destBefore=null;
        const ow=overlapRect?Math.max(0,Math.round(overlapRect.w)):0, oh=overlapRect?Math.max(0,Math.round(overlapRect.h)):0;
        if(overlapRect&&ow>=3&&oh>=3)destBefore=ctx.getImageData(Math.round(overlapRect.x),Math.round(overlapRect.y),ow,oh);
        paintLayer(ctx);
        if(destBefore){
          const layerCanvas=document.createElement('canvas'); layerCanvas.width=canvasW; layerCanvas.height=canvasH;
          const layerCtx=layerCanvas.getContext('2d'); paintLayer(layerCtx);
          const sourceData=layerCtx.getImageData(Math.round(overlapRect.x),Math.round(overlapRect.y),ow,oh);
          const seamed=photomontageSeamComposite(destBefore,sourceData,ow,oh,edgeBias);
          ctx.putImageData(seamed,Math.round(overlapRect.x),Math.round(overlapRect.y));
        }
        drawnRects.push(rect);
      }
      const dataUrl=canvas.toDataURL('image/png');
      pushBoardHistory();
      board.items.push({id:'board-item-'+uid(),name:'Flattened group',src:dataUrl,x:left,y:top,w:Math.round(rawW),h:Math.round(rawH),groupId:''});
      persist(); renderBoard();
      setSelectedBoardItems([board.items[board.items.length-1].id]);
      setStatus(`Flattened ${order.length} images into one card, with seamless blending across the overlaps.`);
    }
    function drawEraseCanvas(){ if(!eraseImage)return; const canvas=$('#erase-canvas'); const context=canvas.getContext('2d'); context.clearRect(0,0,canvas.width,canvas.height); context.drawImage(eraseImage,0,0,canvas.width,canvas.height); if(eraseBox?.w>2&&eraseBox?.h>2){ context.strokeStyle='#c49a67'; context.lineWidth=2; context.setLineDash([6,4]); context.strokeRect(eraseBox.x,eraseBox.y,eraseBox.w,eraseBox.h); context.setLineDash([]); context.fillStyle='rgba(196,154,103,.18)'; context.fillRect(eraseBox.x,eraseBox.y,eraseBox.w,eraseBox.h); } }
    function eraseCanvasPoint(event){ const canvas=$('#erase-canvas'); const rect=canvas.getBoundingClientRect(); return {x:Math.max(0,Math.min(canvas.width,(event.clientX-rect.left)*(canvas.width/rect.width))),y:Math.max(0,Math.min(canvas.height,(event.clientY-rect.top)*(canvas.height/rect.height)))}; }
    async function openEraseModal(itemId){ const item=activeBoard().items.find(i=>i.id===itemId); if(!item||item.kind||!item.src)return; try{ const image=await loadImageElement(item.src); eraseImage=image; eraseItemId=itemId; const scale=Math.min(1,900/image.naturalWidth,620/image.naturalHeight); const canvas=$('#erase-canvas'); canvas.width=Math.max(1,Math.round(image.naturalWidth*scale)); canvas.height=Math.max(1,Math.round(image.naturalHeight*scale)); eraseBox=null; drawEraseCanvas(); $('#erase-modal').classList.add('open'); }catch{ setStatus('Could not load that image for erasing.'); } }
    async function runEraseObject(){ if(!eraseImage||!eraseBox||eraseBox.w<6||eraseBox.h<6){setStatus('Drag a rectangle over the object first.');return;} const canvas=$('#erase-canvas'); const scaleX=eraseImage.naturalWidth/canvas.width, scaleY=eraseImage.naturalHeight/canvas.height; const maskRectFull={x:Math.round(eraseBox.x*scaleX),y:Math.round(eraseBox.y*scaleY),w:Math.max(1,Math.round(eraseBox.w*scaleX)),h:Math.max(1,Math.round(eraseBox.h*scaleY))}; setStatus('Erasing — synthesizing fill…'); $('#run-erase').disabled=true; await new Promise(r=>setTimeout(r,10)); try{ const work=Math.min(1,260/Math.max(eraseImage.naturalWidth,eraseImage.naturalHeight)); const workW=Math.max(1,Math.round(eraseImage.naturalWidth*work)); const workH=Math.max(1,Math.round(eraseImage.naturalHeight*work)); const workCanvas=drawScaledCanvas(eraseImage,workW,workH); const workCtx=workCanvas.getContext('2d'); const workImageData=workCtx.getImageData(0,0,workW,workH); const mrx=Math.max(0,Math.round(maskRectFull.x*work)),mry=Math.max(0,Math.round(maskRectFull.y*work)); const mrw=Math.max(1,Math.round(maskRectFull.w*work)),mrh=Math.max(1,Math.round(maskRectFull.h*work)); const mask=new Uint8Array(workW*workH); for(let y=mry;y<mry+mrh&&y<workH;y++)for(let x=mrx;x<mrx+mrw&&x<workW;x++)mask[y*workW+x]=1; const iterations=(workW*workH)>40000?4:6; const filled=patchMatchInpaint(workImageData,mask,workW,workH,7,iterations); workCtx.putImageData(new ImageData(filled,workW,workH),0,0); const outCanvas=document.createElement('canvas'); outCanvas.width=eraseImage.naturalWidth; outCanvas.height=eraseImage.naturalHeight; const outCtx=outCanvas.getContext('2d'); outCtx.drawImage(eraseImage,0,0); outCtx.save(); outCtx.beginPath(); outCtx.rect(maskRectFull.x,maskRectFull.y,maskRectFull.w,maskRectFull.h); outCtx.clip(); outCtx.drawImage(workCanvas,0,0,workW,workH,0,0,eraseImage.naturalWidth,eraseImage.naturalHeight); outCtx.restore(); const dataUrl=outCanvas.toDataURL('image/png'); const board=activeBoard(); const original=board.items.find(i=>i.id===eraseItemId); pushBoardHistory(); board.items.push({id:'board-item-'+uid(),name:(original?.name||'Image')+' (erased)',src:dataUrl,x:(original?.x||0)+24,y:(original?.y||0)+24,w:original?.w,h:original?.h,groupId:original?.groupId||''}); persist(); renderBoard(); setSelectedBoardItems([board.items[board.items.length-1].id]); $('#erase-modal').classList.remove('open'); setStatus('Object erased — result added as a new card next to the original.'); }catch{ setStatus('Could not process that erase — try a different area.'); } finally { $('#run-erase').disabled=false; } }
    function drawCutoutCanvas(){ if(!cutoutImage)return; const canvas=$('#cutout-canvas'); const context=canvas.getContext('2d'); context.clearRect(0,0,canvas.width,canvas.height); context.drawImage(cutoutImage,0,0,canvas.width,canvas.height); if(cutoutBox?.w>2&&cutoutBox?.h>2){ context.strokeStyle='#c49a67'; context.lineWidth=2; context.setLineDash([6,4]); context.strokeRect(cutoutBox.x,cutoutBox.y,cutoutBox.w,cutoutBox.h); context.setLineDash([]); context.fillStyle='rgba(196,154,103,.18)'; context.fillRect(cutoutBox.x,cutoutBox.y,cutoutBox.w,cutoutBox.h); } }
    function cutoutCanvasPoint(event){ const canvas=$('#cutout-canvas'); const rect=canvas.getBoundingClientRect(); return {x:Math.max(0,Math.min(canvas.width,(event.clientX-rect.left)*(canvas.width/rect.width))),y:Math.max(0,Math.min(canvas.height,(event.clientY-rect.top)*(canvas.height/rect.height)))}; }
    async function openCutoutModal(itemId){ const item=activeBoard().items.find(i=>i.id===itemId); if(!item||item.kind||!item.src)return; try{ const image=await loadImageElement(item.src); cutoutImage=image; cutoutItemId=itemId; const scale=Math.min(1,900/image.naturalWidth,620/image.naturalHeight); const canvas=$('#cutout-canvas'); canvas.width=Math.max(1,Math.round(image.naturalWidth*scale)); canvas.height=Math.max(1,Math.round(image.naturalHeight*scale)); cutoutBox=null; drawCutoutCanvas(); $('#cutout-modal').classList.add('open'); }catch{ setStatus('Could not load that image for cutting out.'); } }
    // Cheap single-pass box blur on just the alpha channel — softens the binary mask's
    // jaggies at the boundary. Not the paper's border matting (no true soft alpha
    // gradient derived from local foreground/background color mixing), documented as
    // a real, deliberate quality trade-off same as this tier's other "not implemented
    // this pass" notes.
    function featherAlphaChannel(imageData,w,h){
      const src=imageData.data, out=new Uint8ClampedArray(src);
      for(let y=0;y<h;y++){
        for(let x=0;x<w;x++){
          let sum=0,cnt=0;
          for(let dy=-1;dy<=1;dy++){ const y2=y+dy; if(y2<0||y2>=h)continue; for(let dx=-1;dx<=1;dx++){ const x2=x+dx; if(x2<0||x2>=w)continue; sum+=src[(y2*w+x2)*4+3]; cnt++; } }
          out[(y*w+x)*4+3]=Math.round(sum/cnt);
        }
      }
      return out;
    }
    async function runCutoutObject(){
      if(!cutoutImage||!cutoutBox||cutoutBox.w<10||cutoutBox.h<10){setStatus('Drag a box around the subject first — leave some background inside it.');return;}
      const canvas=$('#cutout-canvas'); const scaleX=cutoutImage.naturalWidth/canvas.width, scaleY=cutoutImage.naturalHeight/canvas.height;
      const boxFull={x:Math.round(cutoutBox.x*scaleX),y:Math.round(cutoutBox.y*scaleY),w:Math.max(1,Math.round(cutoutBox.w*scaleX)),h:Math.max(1,Math.round(cutoutBox.h*scaleY))};
      // Padding halo around the drawn box supplies background color samples and keeps
      // the processed region — and therefore the max-flow graph — small regardless of
      // the source image's own resolution (the graph-cut step is far more expensive
      // per pixel than erase's PatchMatch search, hence the tighter working cap below).
      const padX=Math.round(boxFull.w*0.25), padY=Math.round(boxFull.h*0.25);
      const regionFull={ x:Math.max(0,boxFull.x-padX), y:Math.max(0,boxFull.y-padY) };
      regionFull.w=Math.min(cutoutImage.naturalWidth,boxFull.x+boxFull.w+padX)-regionFull.x;
      regionFull.h=Math.min(cutoutImage.naturalHeight,boxFull.y+boxFull.h+padY)-regionFull.y;
      if(regionFull.w<=boxFull.w&&regionFull.h<=boxFull.h){setStatus('Leave a bit of background showing inside the box, on every side, then try again.');return;}
      setStatus('Cutting out subject — solving the graph cut…'); $('#run-cutout').disabled=true; await new Promise(r=>setTimeout(r,10));
      try{
        const work=Math.min(1,140/Math.max(regionFull.w,regionFull.h));
        const workW=Math.max(1,Math.round(regionFull.w*work)), workH=Math.max(1,Math.round(regionFull.h*work));
        const regionCanvas=document.createElement('canvas'); regionCanvas.width=regionFull.w; regionCanvas.height=regionFull.h;
        regionCanvas.getContext('2d').drawImage(cutoutImage,regionFull.x,regionFull.y,regionFull.w,regionFull.h,0,0,regionFull.w,regionFull.h);
        const workCanvas=drawScaledCanvas(regionCanvas,workW,workH);
        const workCtx=workCanvas.getContext('2d');
        const workImageData=workCtx.getImageData(0,0,workW,workH);
        const boxInRegion={ x:Math.round((boxFull.x-regionFull.x)*work), y:Math.round((boxFull.y-regionFull.y)*work), w:Math.max(1,Math.round(boxFull.w*work)), h:Math.max(1,Math.round(boxFull.h*work)) };
        const mask=grabCutSegment(workImageData,boxInRegion,workW,workH,3);
        // Paint the working-resolution mask into an alpha canvas, feather it, then
        // upscale (nearest-neighbor on the binary mask, so the feather pass above is
        // what actually softens the edge rather than the upscale interpolation).
        const maskImageData=new ImageData(workW,workH);
        for(let i=0;i<workW*workH;i++){ maskImageData.data[i*4]=255;maskImageData.data[i*4+1]=255;maskImageData.data[i*4+2]=255;maskImageData.data[i*4+3]=mask[i]?255:0; }
        const featheredMask=featherAlphaChannel(maskImageData,workW,workH);
        const maskCanvas=document.createElement('canvas'); maskCanvas.width=workW; maskCanvas.height=workH;
        maskCanvas.getContext('2d').putImageData(new ImageData(featheredMask,workW,workH),0,0);
        const outCanvas=document.createElement('canvas'); outCanvas.width=cutoutImage.naturalWidth; outCanvas.height=cutoutImage.naturalHeight;
        const outCtx=outCanvas.getContext('2d');
        outCtx.drawImage(cutoutImage,0,0);
        // Nearest-neighbor upscale of the mask onto only the processed region; every
        // pixel outside that region was never evaluated, so it's definite background —
        // erased here by simply never being drawn into the destination-in clip.
        const clip=document.createElement('canvas'); clip.width=outCanvas.width; clip.height=outCanvas.height;
        const clipCtx=clip.getContext('2d'); clipCtx.imageSmoothingEnabled=false;
        clipCtx.drawImage(maskCanvas,0,0,workW,workH,regionFull.x,regionFull.y,regionFull.w,regionFull.h);
        outCtx.globalCompositeOperation='destination-in';
        outCtx.drawImage(clip,0,0);
        const dataUrl=outCanvas.toDataURL('image/png');
        const board=activeBoard(); const original=board.items.find(i=>i.id===cutoutItemId);
        pushBoardHistory();
        board.items.push({id:'board-item-'+uid(),name:(original?.name||'Image')+' (cutout)',src:dataUrl,x:(original?.x||0)+24,y:(original?.y||0)+24,w:original?.w,h:original?.h,groupId:original?.groupId||''});
        persist(); renderBoard(); setSelectedBoardItems([board.items[board.items.length-1].id]);
        $('#cutout-modal').classList.remove('open');
        setStatus('Subject cut out — result added as a new transparent-background card next to the original.');
      }catch{ setStatus('Could not cut out that subject — try a looser box with more background showing.'); } finally { $('#run-cutout').disabled=false; }
    }
    // Image Deformation Using Moving Least Squares (Schaefer, McPhail & Warren, SIGGRAPH 2006).
    // Deliberately simplified to the paper's *affine* deformation (§2.1) rather than its
    // similarity/rigid variants (§2.2/§2.3) — affine is the simplest closed-form of the
    // three and needs no iterative solve, which is the property this app actually wants
    // (smooth real-time dragging in a browser tab), at the cost of allowing more shear/
    // scale distortion far from a handle than the rigid variant would. One handle falls
    // back to a pure translation (the paper's formula is degenerate — a single weighted
    // point has zero spread, so the 2x2 matrix it inverts is exactly singular); the
    // general n>=2 case follows the paper's closed-form matrix solve directly.
    function mlsAffineDeform(v,ps,qs){
      const n=ps.length;
      if(n===0)return {x:v.x,y:v.y};
      if(n===1)return {x:v.x+(qs[0].x-ps[0].x),y:v.y+(qs[0].y-ps[0].y)};
      for(let i=0;i<n;i++){ const dx=v.x-ps[i].x,dy=v.y-ps[i].y; if(dx*dx+dy*dy<1e-4)return {x:qs[i].x,y:qs[i].y}; }
      if(n===2){
        // Exactly 2 handles leaves the general weighted-affine solve below permanently singular:
        // a 2-point weighted centroid always sits on the line through the two points, so both
        // deviation vectors are collinear and the covariance matrix is rank-1 for every query
        // point, not just near the handles. Near a handle the 1/dist^2 weights grow large, and
        // floating-point cancellation in that near-zero determinant can read as comfortably
        // non-singular, so the general path's matrix inverse blows up right where a handle is
        // dragged (the tearing/band-collapse bug). Use the standard well-conditioned closed form
        // for this case instead: one global similarity transform (rotation + uniform scale +
        // translation, via complex-number division of the two handle-to-handle vectors) anchored
        // at handle 1 — consistent with the n===1 case already being a global translation.
        const pdx=ps[1].x-ps[0].x, pdy=ps[1].y-ps[0].y, qdx=qs[1].x-qs[0].x, qdy=qs[1].y-qs[0].y;
        const pLen2=pdx*pdx+pdy*pdy;
        if(pLen2<1e-9)return {x:v.x+(qs[0].x-ps[0].x),y:v.y+(qs[0].y-ps[0].y)};
        const Rxx=(pdx*qdx+pdy*qdy)/pLen2, Rxy=(pdx*qdy-pdy*qdx)/pLen2;
        const vx=v.x-ps[0].x, vy=v.y-ps[0].y;
        return {x:vx*Rxx-vy*Rxy+qs[0].x,y:vx*Rxy+vy*Rxx+qs[0].y};
      }
      let wsum=0; const ws=new Array(n);
      for(let i=0;i<n;i++){ const dx=v.x-ps[i].x,dy=v.y-ps[i].y; const w=1/(dx*dx+dy*dy); ws[i]=w; wsum+=w; }
      let pStarX=0,pStarY=0,qStarX=0,qStarY=0;
      for(let i=0;i<n;i++){ pStarX+=ws[i]*ps[i].x; pStarY+=ws[i]*ps[i].y; qStarX+=ws[i]*qs[i].x; qStarY+=ws[i]*qs[i].y; }
      pStarX/=wsum; pStarY/=wsum; qStarX/=wsum; qStarY/=wsum;
      let m00=0,m01=0,m10=0,m11=0,n00=0,n01=0,n10=0,n11=0;
      for(let i=0;i<n;i++){
        const px=ps[i].x-pStarX, py=ps[i].y-pStarY, qx=qs[i].x-qStarX, qy=qs[i].y-qStarY, w=ws[i];
        m00+=w*px*px; m01+=w*px*py; m10+=w*py*px; m11+=w*py*py;
        n00+=w*px*qx; n01+=w*px*qy; n10+=w*py*qx; n11+=w*py*qy;
      }
      const det=m00*m11-m01*m10;
      // Relative (scale-aware) singularity check: with n>=3 non-collinear handles this matrix
      // is genuinely well-conditioned almost everywhere, but its entries scale with the 1/dist^2
      // weights, which grow large right next to a handle. An absolute epsilon compares a
      // determinant whose floating-point cancellation noise scales with (that large weight)^2
      // against a fixed constant, so it stops catching true near-singularity (e.g. handles placed
      // collinearly, or a query point that ends up dominated by just two of the weights) exactly
      // where the resulting matrix inverse would blow up hardest. Scale the threshold by the
      // matrix's own magnitude instead.
      const mScale=Math.abs(m00)+Math.abs(m11)+Math.abs(m01)+Math.abs(m10);
      if(mScale<1e-9||Math.abs(det)<1e-9*mScale*mScale)return {x:v.x,y:v.y};
      const i00=m11/det,i01=-m01/det,i10=-m10/det,i11=m00/det;
      const Mxx=i00*n00+i01*n10, Mxy=i00*n01+i01*n11, Myx=i10*n00+i11*n10, Myy=i10*n01+i11*n11;
      const vx=v.x-pStarX, vy=v.y-pStarY;
      return {x:vx*Mxx+vy*Myx+qStarX,y:vx*Mxy+vy*Myy+qStarY};
    }
    // Renders the deformed image by MLS-warping a coarse grid's vertices, then texture-
    // mapping the source image onto that grid one triangle at a time via the standard
    // canvas-2D triangle-affine trick (solve the 3-point affine that maps the triangle's
    // *original* grid corners onto its *deformed* corners, clip to the deformed triangle,
    // transform, drawImage the whole source image). Because each triangle's transform is
    // itself affine, this is consistent with mlsAffineDeform's own local-affine model, and
    // — unlike a naive per-pixel forward scatter — it can't leave holes: the mesh always
    // tiles the canvas completely (documented trade-off: a handle dragged into a sharp
    // fold can locally invert a triangle, showing as a small visual pinch rather than a
    // crash — acceptable for this pass, not corrected).
    function triangleAffine(src,dst){
      const [x0,y0,x1,y1,x2,y2]=src, [X0,Y0,X1,Y1,X2,Y2]=dst;
      const d=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);
      if(Math.abs(d)<1e-6)return null;
      const a=((X1-X0)*(y2-y0)-(X2-X0)*(y1-y0))/d;
      const b=((Y1-Y0)*(y2-y0)-(Y2-Y0)*(y1-y0))/d;
      const c=((x1-x0)*(X2-X0)-(x2-x0)*(X1-X0))/d;
      const e=((x1-x0)*(Y2-Y0)-(x2-x0)*(Y1-Y0))/d;
      return [a,b,c,e,X0-a*x0-c*y0,Y0-b*x0-e*y0];
    }
    function renderMlsWarp(ctx,image,handles,w,h,grid){
      ctx.clearRect(0,0,w,h);
      if(handles.length<1){ ctx.drawImage(image,0,0,w,h); return; }
      const ps=handles.map(hd=>({x:hd.ox,y:hd.oy})), qs=handles.map(hd=>({x:hd.x,y:hd.y}));
      const cols=grid,rows=grid, verts=[];
      for(let r=0;r<=rows;r++){ verts.push([]); for(let c=0;c<=cols;c++){ const ox=c*w/cols, oy=r*h/rows; const d=mlsAffineDeform({x:ox,y:oy},ps,qs); verts[r].push({ox,oy,dx:d.x,dy:d.y}); } }
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const a=verts[r][c],b=verts[r][c+1],cc=verts[r+1][c],dd=verts[r+1][c+1];
          for(const tri of [[a,b,cc],[b,dd,cc]]){
            const src=[tri[0].ox,tri[0].oy,tri[1].ox,tri[1].oy,tri[2].ox,tri[2].oy];
            const dst=[tri[0].dx,tri[0].dy,tri[1].dx,tri[1].dy,tri[2].dx,tri[2].dy];
            const m=triangleAffine(src,dst); if(!m)continue;
            // Dilate the clip polygon slightly outward from its centroid (the texture-mapping
            // transform above still uses the exact, undilated dst points). Two triangles from
            // the same grid cell share an exact edge in theory, but clip()'s antialiasing softens
            // both sides of that shared edge independently, leaving a faint gap that reads as a
            // visible hairline seam across the whole grid. A small overlap hides that gap.
            const cx=(dst[0]+dst[2]+dst[4])/3, cy=(dst[1]+dst[3]+dst[5])/3, pad=0.75;
            const dilate=(x,y)=>{ const ddx=x-cx,ddy=y-cy,len=Math.hypot(ddx,ddy)||1; return [x+ddx/len*pad,y+ddy/len*pad]; };
            const [x0,y0]=dilate(dst[0],dst[1]),[x1,y1]=dilate(dst[2],dst[3]),[x2,y2]=dilate(dst[4],dst[5]);
            ctx.save(); ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.lineTo(x2,y2); ctx.closePath(); ctx.clip();
            ctx.transform(m[0],m[1],m[2],m[3],m[4],m[5]); ctx.drawImage(image,0,0,w,h); ctx.restore();
          }
        }
      }
    }
    function drawWarpCanvas(){
      if(!warpImage)return; const canvas=$('#warp-canvas'); const ctx=canvas.getContext('2d');
      renderMlsWarp(ctx,warpImage,warpHandles,canvas.width,canvas.height,14);
      warpHandles.forEach(hd=>{
        if(hd.x!==hd.ox||hd.y!==hd.oy){ ctx.beginPath(); ctx.moveTo(hd.ox,hd.oy); ctx.lineTo(hd.x,hd.y); ctx.strokeStyle='rgba(196,154,103,.6)'; ctx.lineWidth=1.5; ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
          ctx.beginPath(); ctx.arc(hd.ox,hd.oy,4,0,Math.PI*2); ctx.strokeStyle='#c49a67'; ctx.lineWidth=1.5; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(hd.x,hd.y,7,0,Math.PI*2); ctx.fillStyle=hd.id===warpDragHandleId?'#e8b96f':'#c49a67'; ctx.fill(); ctx.strokeStyle='#3a2a18'; ctx.lineWidth=1.5; ctx.stroke();
      });
    }
    function warpCanvasPoint(event){ const canvas=$('#warp-canvas'); const rect=canvas.getBoundingClientRect(); return {x:Math.max(0,Math.min(canvas.width,(event.clientX-rect.left)*(canvas.width/rect.width))),y:Math.max(0,Math.min(canvas.height,(event.clientY-rect.top)*(canvas.height/rect.height)))}; }
    function warpHandleAt(point){ return warpHandles.find(hd=>Math.hypot(hd.x-point.x,hd.y-point.y)<=10); }
    async function openWarpModal(itemId){ const item=activeBoard().items.find(i=>i.id===itemId); if(!item||item.kind||!item.src)return; try{ const image=await loadImageElement(item.src); warpImage=image; warpItemId=itemId; const scale=Math.min(1,900/image.naturalWidth,620/image.naturalHeight); const canvas=$('#warp-canvas'); canvas.width=Math.max(1,Math.round(image.naturalWidth*scale)); canvas.height=Math.max(1,Math.round(image.naturalHeight*scale)); warpHandles=[]; warpDragHandleId=null; drawWarpCanvas(); $('#warp-modal').classList.add('open'); }catch{ setStatus('Could not load that image for warping.'); } }
    async function runWarpImage(){
      if(!warpImage||!warpHandles.length){setStatus('Add and drag at least one handle first.');return;}
      const canvas=$('#warp-canvas'); const scaleX=warpImage.naturalWidth/canvas.width, scaleY=warpImage.naturalHeight/canvas.height;
      setStatus('Warping — solving the deformation…'); $('#run-warp').disabled=true; await new Promise(r=>setTimeout(r,10));
      try{
        const fullHandles=warpHandles.map(hd=>({ox:hd.ox*scaleX,oy:hd.oy*scaleY,x:hd.x*scaleX,y:hd.y*scaleY}));
        const outCanvas=document.createElement('canvas'); outCanvas.width=warpImage.naturalWidth; outCanvas.height=warpImage.naturalHeight;
        renderMlsWarp(outCanvas.getContext('2d'),warpImage,fullHandles,outCanvas.width,outCanvas.height,24);
        const dataUrl=outCanvas.toDataURL('image/png');
        const board=activeBoard(); const original=board.items.find(i=>i.id===warpItemId);
        pushBoardHistory();
        board.items.push({id:'board-item-'+uid(),name:(original?.name||'Image')+' (warped)',src:dataUrl,x:(original?.x||0)+24,y:(original?.y||0)+24,w:original?.w,h:original?.h,groupId:original?.groupId||''});
        persist(); renderBoard(); setSelectedBoardItems([board.items[board.items.length-1].id]);
        $('#warp-modal').classList.remove('open');
        setStatus('Image warped — result added as a new card next to the original.');
      }catch{ setStatus('Could not warp that image — try fewer or gentler handle drags.'); } finally { $('#run-warp').disabled=false; }
    }
    function buildPromptTemplate(model,job,subject,composition,materials,consistency,constraints,hasImage){
      const jobWord={generate:'Generate',edit:'Edit',restyle:'Restyle',unify:'Unify'}[job]||'Generate';
      const s=subject||'the subject described here';
      const c=composition||'a clear, well-composed shot';
      const m=materials||'a clean, finished rendering style';
      const keep=consistency||'the established design elements';
      const avoid=constraints||'no additional constraints noted';
      const refLine=hasImage?'Use the attached reference image as the visual anchor for this job — do not invent details that contradict it.':'No reference image was attached — invent reasonable detail only where the notes below leave a gap.';
      if(model==='Qwen Image'){
        return `${jobWord.toLowerCase()}, ${s}, ${c}, ${m}, keep consistent: ${keep}, avoid: ${avoid}${hasImage?', reference image attached':''}`;
      }
      if(model==='Nanobanana'){
        return `${refLine}\n${jobWord} this: ${s}. Composition/camera: ${c}. Materials and style: ${m}. Keep ${keep} exactly as they are — don't drift from that. Avoid: ${avoid}.`;
      }
      if(model==='Seedream Pro'){
        return `${jobWord} — cinematic reference pass.\nSubject: ${s}\nCamera & composition: ${c}\nSurface/lighting treatment: ${m}\nMust remain consistent: ${keep}\nHard constraints: ${avoid}\n${refLine}`;
      }
      if(model==='Gemini'){
        return `1. Job: ${jobWord} the image described below.\n2. Subject: ${s}\n3. Composition and camera: ${c}\n4. Materials and style: ${m}\n5. Keep consistent: ${keep}\n6. Constraints — avoid: ${avoid}\n7. ${refLine}`;
      }
      return `${jobWord} an image of ${s}, composed as ${c}, rendered with ${m}. Keep ${keep} consistent with any existing reference. Avoid: ${avoid}. ${refLine}`;
    }
    function collectPromptReferenceSources(){ const p=project(); const orderedProjects=[p,...state.projects.filter(item=>item.id!==p.id)]; const boardSources=orderedProjects.flatMap(proj=>(proj.boards||[]).flatMap(board=>(board.items||[]).filter(item=>item.src&&!item.kind).map(item=>({src:item.src,label:item.name||'Untitled image',group:`${proj.id===p.id?'This project':(proj.title||'Untitled Project')} · Board: ${board.name||'Untitled board'}`})))); const allCrops=Object.values(state.reader.crops||{}); const orderedCrops=[...allCrops.filter(crop=>crop.projectId===p.id),...allCrops.filter(crop=>crop.projectId!==p.id)]; const cropSources=orderedCrops.map(crop=>({src:crop.preview,label:crop.title||'Saved crop',group:`${crop.projectId===p.id?'This project':(crop.projectTitle||'Unassigned')} · Saved crop`})); return [...boardSources,...cropSources]; }
    function openPromptImagePicker(){ const sources=collectPromptReferenceSources(); const list=$('#prompt-image-picker-list'); list.innerHTML=sources.length?sources.map((item,index)=>`<button type="button" class="crop-card" data-prompt-ref="${index}"><img src="${item.src}" alt="${escapeHtml(item.label)}"><div><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.group)}</small></div></button>`).join(''):'<span class="hint">No board images or saved crops in any project yet.</span>'; $$('[data-prompt-ref]').forEach(button=>button.onclick=()=>{ const item=sources[Number(button.dataset.promptRef)]; promptImageDataUrl=item.src; const preview=$('#prompt-image-preview'); preview.src=item.src; preview.style.display='block'; $('#prompt-image-remove').hidden=false; $('#prompt-image-picker-dialog').close(); }); $('#prompt-image-picker-dialog').showModal(); }
    function recipeThumbnailData(file){ return new Promise((resolve,reject)=>{ const url=URL.createObjectURL(file);const image=new Image();image.onload=()=>{URL.revokeObjectURL(url);const max=320;const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.78));};image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read image'));};image.src=url;}); }
    async function addBoardImages(files){ if(!files?.length)return; const board=activeBoard(); pushBoardHistory(); const groupId=$('#board-group-select').value||''; let added=0;let folderSaved=0; for(const [index,file] of [...files].entries()){ if(!/^image\/(png|jpeg|gif|webp|avif)$/i.test(file.type))continue; try { const point=boardPosition(index);const preview=await boardImageData(file);let asset=null;try{asset=await copyBoardAsset(file,board);folderSaved++;}catch{}board.items.push({id:'board-item-'+uid(),name:file.name,src:preview,x:point.x,y:point.y,groupId,...(asset?{storage:'folder',asset}:{})});added++; } catch{} } try {persist();await writeFolderBackup();} catch {board.items.splice(Math.max(0,board.items.length-added),added);setStatus('These previews exceed browser storage. Add fewer images or smaller files.');return;} renderBoard();setStatus(added?`${added} image${added===1?'':'s'} added.${folderSaved?` ${folderSaved} original${folderSaved===1?'':'s'} copied to the save folder.`:''}`:'No readable image files were added.'); }
    function boardVideoData(file){ return new Promise((resolve,reject)=>{if(file.size>2*1024*1024){reject(new Error('Video is too large'));return;}const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);}); }
    async function addBoardVideos(files){ if(!files?.length)return;const board=activeBoard();pushBoardHistory();let added=0;let oversized=0;let folderSaved=0;for(const [index,file] of [...files].entries()){if(!/^video\/(mp4|webm|quicktime)$/i.test(file.type))continue;try{const point=boardPosition(index);let asset=null;try{asset=await copyBoardAsset(file,board);folderSaved++;}catch{}const src=asset?'':await boardVideoData(file);board.items.push({id:'board-item-'+uid(),kind:'video',name:file.name,src,x:point.x,y:point.y,w:300,groupId:$('#board-group-select').value||'',...(asset?{storage:'folder',asset}:{})});added++;}catch{oversized++;}}try{persist();await writeFolderBackup();}catch{setStatus('Video previews exceed browser storage. Choose a save folder for large videos.');return;}renderBoard();setStatus(added?`${added} playable video${added===1?'':'s'} added.${folderSaved?` ${folderSaved} original${folderSaved===1?'':'s'} copied to the save folder.`:''}${oversized?' Larger files need a selected save folder.':''}`:'Videos must be MP4, WebM, or MOV. Choose a save folder for large videos.');}
    const DOC_PREVIEW_TYPES=['txt','md','rtf'];
    const DOC_IMAGE_PREVIEW_TYPES=['pdf','ai'];
    const DOC_PSD_PREVIEW_TYPES=['psd'];
    const DOC_3D_PREVIEW_TYPES=['glb','gltf'];
    const DOC_3D_TYPES=['glb','gltf','fbx','blend','c4d','ma','mb','obj','3ds','max','ztl','zpr','usd','usda','usdc','usdz'];
    const TEXTURE_SLOT_ROLES=[['baseColor','Base Color','BaseColor'],['normal','Normal','Normal'],['roughness','Roughness','Roughness'],['metalness','Metalness','Metalness'],['ao','AO','AO'],['height','Height','Height'],['emissive','Emissive','Emissive']];
    function textureAssetName(name){ const base=(name||'').replace(/\.[^./\\]+$/,'').trim().replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_-]/g,''); return base||'Asset'; }
    function textureSlotsHtml(item){ const assetName=textureAssetName(item.name); return `<div class="board-doc-textures">${TEXTURE_SLOT_ROLES.map(([key,label,slug])=>{ const slot=item.textureSlots?.[key]; const slotName=`${assetName}_${slug}`; return `<div class="board-texture-slot ${slot?'filled':'placeholder'}" data-slot-key="${key}" title="${escapeHtml(slotName)} — click to ${slot?'replace':'set'}"> ${slot?`<img src="${slot.src}" alt="${escapeHtml(slotName)}" loading="lazy"><button type="button" class="board-texture-slot-clear" data-slot-key="${key}" title="Clear ${escapeHtml(slotName)}" aria-label="Clear ${escapeHtml(slotName)}">×</button>`:`<span class="board-texture-slot-icon">+</span>`}<span class="board-texture-slot-label">${escapeHtml(label)}</span></div>`; }).join('')}</div>`; }
    async function relinkTextureSlot(itemId,slotKey,file){ if(!file)return; const board=activeBoard(); const item=board.items.find(entry=>entry.id===itemId); if(!item)return; try{ const src=await boardImageData(file); pushBoardHistory(); item.textureSlots=item.textureSlots||{}; item.textureSlots[slotKey]={name:file.name,src}; persist(); renderBoard(); setStatus('Texture slot updated.'); }catch{ setStatus('Could not use that image for this texture slot.'); } }
    function clearTextureSlot(itemId,slotKey){ const board=activeBoard(); const item=board.items.find(entry=>entry.id===itemId); if(!item?.textureSlots?.[slotKey])return; pushBoardHistory(); delete item.textureSlots[slotKey]; persist(); renderBoard(); setStatus('Texture slot cleared.'); }
    function stripRtfToText(raw){ let text=raw; text=text.replace(/\{\\(fonttbl|colortbl|stylesheet|info|pict)[\s\S]*?\}\}/g,''); text=text.replace(/\{\\\*[^{}]*\}/g,''); text=text.replace(/\\'[0-9a-fA-F]{2}/g,''); text=text.replace(/\\par[d]?\b ?/g,'\n'); text=text.replace(/\\tab\b ?/g,'\t'); text=text.replace(/\\[a-zA-Z]+-?\d* ?/g,''); text=text.replace(/[{}]/g,''); text=text.replace(/\r/g,''); return text.replace(/\n{3,}/g,'\n\n').trim(); }
    function formatFileSize(bytes){ if(!bytes)return ''; if(bytes<1024)return `${bytes} B`; if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`; return `${(bytes/1024/1024).toFixed(1)} MB`; }
    function downscaleCanvasToDataUrl(sourceCanvas,maxDim){ const scale=Math.min(1,maxDim/Math.max(sourceCanvas.width,sourceCanvas.height)); const canvas=document.createElement('canvas'); canvas.width=Math.max(1,Math.round(sourceCanvas.width*scale)); canvas.height=Math.max(1,Math.round(sourceCanvas.height*scale)); canvas.getContext('2d').drawImage(sourceCanvas,0,0,canvas.width,canvas.height); return canvas.toDataURL('image/jpeg',.8); }
    async function pdfFirstPagePreview(file){ if(!window.pdfjsLib)throw new Error('PDF preview library not available'); if(!window.pdfjsLib.GlobalWorkerOptions.workerSrc)window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; const buffer=await file.arrayBuffer(); const pdf=await window.pdfjsLib.getDocument({data:buffer}).promise; const page=await pdf.getPage(1); const baseViewport=page.getViewport({scale:1}); const maxDim=420; const scale=Math.min(2,maxDim/Math.max(baseViewport.width,baseViewport.height)); const viewport=page.getViewport({scale:scale>0?scale:1}); const canvas=document.createElement('canvas'); canvas.width=Math.max(1,Math.round(viewport.width)); canvas.height=Math.max(1,Math.round(viewport.height)); await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise; return canvas.toDataURL('image/jpeg',.8); }
    async function psdCompositePreview(file){ if(!window.agPsd)throw new Error('PSD preview library not available'); const buffer=await file.arrayBuffer(); const psd=window.agPsd.readPsd(buffer,{skipLayerImageData:true,skipLinkedFilesData:true,skipThumbnail:true}); if(!psd?.canvas)throw new Error('No composite image found in this PSD'); return downscaleCanvasToDataUrl(psd.canvas,420); }
    async function glbThumbnailPreview(file){ if(!window.THREE||!window.THREE.GLTFLoader)throw new Error('3D preview library not available'); const ext=(file.name.split('.').pop()||'').toLowerCase(); const data=ext==='gltf'?await file.text():await file.arrayBuffer(); const gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(data,'',resolve,reject)); const scene=new THREE.Scene(); scene.add(gltf.scene); scene.add(new THREE.AmbientLight(0xffffff,.9)); const key=new THREE.DirectionalLight(0xffffff,.8); key.position.set(1,1,1); scene.add(key); const box=new THREE.Box3().setFromObject(gltf.scene); const size=box.getSize(new THREE.Vector3()); const center=box.getCenter(new THREE.Vector3()); gltf.scene.position.sub(center); const maxDim=Math.max(size.x,size.y,size.z)||1; const camera=new THREE.PerspectiveCamera(40,1,.01,maxDim*100); const dist=maxDim*1.8; camera.position.set(dist,dist*.8,dist); camera.lookAt(0,0,0); const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:true}); renderer.setSize(512,512); renderer.setClearColor(0x14161a,1); renderer.render(scene,camera); const dataUrl=downscaleCanvasToDataUrl(renderer.domElement,420); renderer.dispose(); renderer.forceContextLoss?.(); return dataUrl; }
    async function readDocumentText(file){ const ext=(file.name.split('.').pop()||'').toLowerCase(); const normExt=ext==='markdown'?'md':ext; if(DOC_PREVIEW_TYPES.includes(normExt)){ const raw=await file.text(); const text=normExt==='rtf'?stripRtfToText(raw):raw; return {ext:normExt,text,hasPreview:true}; } if(DOC_IMAGE_PREVIEW_TYPES.includes(normExt)){ try{ const previewImg=await pdfFirstPagePreview(file); return {ext:normExt,previewImg,hasPreview:true}; }catch{ return {ext:normExt||'file',hasPreview:false}; } } if(DOC_PSD_PREVIEW_TYPES.includes(normExt)){ try{ const previewImg=await psdCompositePreview(file); return {ext:normExt,previewImg,hasPreview:true}; }catch{ return {ext:normExt||'file',hasPreview:false}; } } if(DOC_3D_PREVIEW_TYPES.includes(normExt)){ try{ const previewImg=await glbThumbnailPreview(file); return {ext:normExt,previewImg,hasPreview:true}; }catch{ return {ext:normExt||'file',hasPreview:false}; } } return {ext:normExt||'file',text:'',hasPreview:false}; }
    async function addBoardDocuments(files){ if(!files?.length)return; const board=activeBoard(); pushBoardHistory(); const groupId=$('#board-group-select').value||''; let added=0; for(const [index,file] of [...files].entries()){ try{ const {ext,text,previewImg,hasPreview}=await readDocumentText(file); const point=boardPosition(index); const isThreeD=DOC_3D_TYPES.includes(ext); board.items.push({id:'board-item-'+uid(),kind:'document',docType:ext,name:file.name,text:text||'',...(previewImg?{previewImg}:{}),hasPreview,fileSize:file.size,x:point.x,y:point.y,w:220,h:isThreeD?260:(hasPreview?170:120),groupId}); added++; }catch{} } if(!added){setStatus('No files were added.');return;} try{persist();await writeFolderBackup();}catch{board.items.splice(Math.max(0,board.items.length-added),added);setStatus('These documents exceed browser storage. Add fewer or smaller files.');return;} renderBoard();setStatus(`${added} document${added===1?'':'s'} added.`); }
    function openNoteFocus(itemId){ if(noteFocusState)closeNoteFocus(); const card=$(`[data-board-item="${itemId}"]`); const titleEl=card?.querySelector('.board-note-title'); const bodyEl=card?.querySelector('.board-note-body'); if(!card||!titleEl||!bodyEl)return; noteFocusState={itemId,cardEl:card,titleEl,bodyEl}; card.classList.add('note-expanded-elsewhere'); $('#note-focus-title-slot').appendChild(titleEl); $('#note-focus-body-slot').appendChild(bodyEl); $('#note-focus-modal').classList.add('open'); activeBoardNoteId=itemId; syncBoardNoteToolbar(); bodyEl.focus(); }
    function closeNoteFocus(){ if(!noteFocusState)return; const {cardEl,titleEl,bodyEl}=noteFocusState; if(cardEl?.isConnected){ const footer=cardEl.querySelector('footer'); cardEl.insertBefore(titleEl,footer); cardEl.insertBefore(bodyEl,footer); cardEl.classList.remove('note-expanded-elsewhere'); } $('#note-focus-modal').classList.remove('open'); noteFocusState=null; }
    function addBoardNote(){ const board=activeBoard();pushBoardHistory();const point=boardPosition(board.items.length);board.items.push({id:'board-item-'+uid(),kind:'note',name:'Note',html:'',text:'',x:point.x,y:point.y,w:280,h:190,groupId:$('#board-group-select').value||''});persist();renderBoard();setStatus('Note added. Click inside it to write and format it.'); }
    /* Tier 13 B — shape items (rect/oval/line/arrow), Miro-style drawable primitives. Rendered as an
       inline SVG sized from item.w/h so the generic card drag/resize/marquee/connector/undo machinery
       works unchanged; the resize handler re-renders the SVG from the new w/h. Scope cut per plan:
       no rotation, no arrowhead styles. Arrowheads use fill="context-stroke" so they follow the
       hover/selected stroke color like connectors already do. */
    const BOARD_SHAPE_KINDS={rect:'Rectangle',oval:'Oval',line:'Line',arrow:'Arrow'};
    function boardShapeSvgContent(item){ const w=Math.max(24,Math.round(item.w||180)), h=Math.max(14,Math.round(item.h||130));
      if(item.shapeType==='oval')return `<svg class="board-shape-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><ellipse cx="${w/2}" cy="${h/2}" rx="${Math.max(4,w/2-3)}" ry="${Math.max(4,h/2-3)}"></ellipse></svg>`;
      if(item.shapeType==='line'||item.shapeType==='arrow'){ const inset=Math.max(5,Math.min(w,h)*0.1); const arrowPad=item.shapeType==='arrow'?Math.min(20,inset+8):0; const marker=item.shapeType==='arrow'?`<defs><marker id="board-shape-arrowhead-${item.id}" markerWidth="11" markerHeight="9" refX="9" refY="4.5" orient="auto" markerUnits="userSpaceOnUse" stroke-width="${Math.max(1,Number(item.strokeW)||2)}"><path d="M0,0 L10,4.5 L0,9 Z" fill="context-stroke"></path></marker></defs>`:''; const x1=item.flipX?w-inset-arrowPad:inset, x2=item.flipX?inset:w-inset-arrowPad; const y1=item.flipY?inset+arrowPad:h-inset, y2=item.flipY?h-inset:inset+arrowPad; return `<svg class="board-shape-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${marker}<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${item.shapeType==='arrow'?` marker-end="url(#board-shape-arrowhead-${item.id})"`:''}></line></svg>`; }
      return `<svg class="board-shape-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect x="2" y="2" width="${w-4}" height="${h-4}" rx="6"></rect></svg>`; }
    function addBoardShape(shapeType){ const board=activeBoard(); pushBoardHistory(); const point=boardPosition(board.items.length); const isLine=shapeType==='line'||shapeType==='arrow'; board.items.push({id:'board-item-'+uid(),kind:'shape',shapeType,name:BOARD_SHAPE_KINDS[shapeType]||'Shape',x:point.x,y:point.y,w:isLine?220:180,h:isLine?110:130,groupId:$('#board-group-select').value||''}); persist(); renderBoard(); setStatus(`${BOARD_SHAPE_KINDS[shapeType]||'Shape'} added — drag to move, corner grip to resize.`); }
    /* Tier 13 E — Milanote-style color tagging: fixed 15-swatch palette + custom + none, applied to
       groups (frame tint) and the board (canvas backdrop tint). */
    const BOARD_COLOR_PALETTE=['#f24e4e','#f5a623','#f7d154','#7bb661','#439889','#5aa9e6','#3d6fd9','#9265d9','#d965b0','#a9714b','#e9e5dc','#c8c1b5','#8a8f98','#4a4f57','#22262b'];
    function hexToRgb(hex){ const clean=String(hex||'').replace('#',''); const full=clean.length===3?clean.split('').map(ch=>ch+ch).join(''):clean; if(!/^[0-9a-f]{6}$/i.test(full))return null; const int=parseInt(full,16); return {r:(int>>16)&255,g:(int>>8)&255,b:int&255}; }
    function hexToRgba(hex,alpha){ const rgb=hexToRgb(hex); return rgb?`rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`:null; }
    function isDarkColor(hex){ const rgb=hexToRgb(hex); return !!rgb&&(0.2126*rgb.r+0.7152*rgb.g+0.0722*rgb.b)<64; }
    let boardColorApply=null;
    function openBoardColorMenu(anchor,apply){ const menu=$('#board-color-menu'); const grid=$('#board-color-grid'); grid.innerHTML=BOARD_COLOR_PALETTE.map(color=>`<button type="button" class="board-color-swatch" data-color-swatch="${color}" style="background:${color}" title="${color}" aria-label="Tint ${color}"></button>`).join(''); boardColorApply=apply; menu.classList.add('open'); const rect=anchor.getBoundingClientRect(); const mw=menu.offsetWidth,mh=menu.offsetHeight; menu.style.left=`${Math.max(8,Math.min(rect.left,window.innerWidth-mw-8))}px`; menu.style.top=`${rect.bottom+6+mh>window.innerHeight?Math.max(8,rect.top-mh-6):rect.bottom+6}px`; }
    function closeBoardColorMenu(){ const menu=$('#board-color-menu'); if(menu)menu.classList.remove('open'); boardColorApply=null; }
    function applyBoardColorPick(color){ const apply=boardColorApply; if(!apply)return; closeBoardColorMenu(); apply(color||null); }
    function applyBoardGroupTint(el,group){ el.style.borderColor=hexToRgba(group.color,.55)||''; el.style.background=hexToRgba(group.color,.1)||''; const title=el.querySelector('.board-group-title'); if(title){ title.style.background=hexToRgba(group.color,.28)||''; title.style.borderBottomColor=hexToRgba(group.color,.45)||''; title.style.color=isDarkColor(group.color)?'#cfd3d8':group.color; } }
    function syncBoardTint(){ const wrap=$('#board-canvas-wrap'); if(!wrap)return; const board=activeBoard(); if(!board){wrap.style.backgroundColor='';return;} const rgb=hexToRgb(board.color); if(!rgb){wrap.style.backgroundColor='';return;} const base=document.body.classList.contains('light-mode')?[241,238,231]:[32,32,32]; const mix=channel=>Math.round(base[channel]*0.84+[rgb.r,rgb.g,rgb.b][channel]*0.16); wrap.style.backgroundColor=`rgb(${mix(0)},${mix(1)},${mix(2)})`; }
    /* Tier 13 D — one Settings dialog (PureRef-style tabbed) re-homing the toggles that used to be
       scattered across toolbars: Light Mode (global, persisted), Snap + Minimal (per board, persisted),
       Fisheye (per session). GPU Preview stays excluded and dead per the standing instruction. */
    function syncSettingsControls(){ const board=activeBoard(); const lightBox=$('#set-light-mode'); if(lightBox)lightBox.checked=document.body.classList.contains('light-mode'); const snapBox=$('#set-snap'); if(snapBox)snapBox.checked=board.snap!==false; const minimalBox=$('#set-minimal'); if(minimalBox)minimalBox.checked=!!board.minimal; const fisheyeBox=$('#set-fisheye'); if(fisheyeBox)fisheyeBox.checked=boardFisheye; const fisheyeRailBtn=$('#rail-toggle-fisheye'); if(fisheyeRailBtn)fisheyeRailBtn.classList.toggle('active',boardFisheye); }
    function openSettings(){ syncSettingsControls(); $('#settings-dialog').showModal(); }
    async function chooseBoardCover(file){ if(!file)return; try { activeBoard().coverSrc=await boardCoverImageData(file);persist();renderBoardList();setStatus('Board cover updated (content-aware fit — seam carving, not a plain crop).'); } catch { setStatus('Could not use that image as a board cover.'); } }
    function dragBoardFiles(event){ event.preventDefault();event.stopPropagation();const wrap=$('#board-canvas-wrap');if(event.type==='dragenter'||event.type==='dragover'){wrap.classList.add('drag-over');if(!$('#board-drop-message')){const message=document.createElement('div');message.className='board-drop-message';message.id='board-drop-message';message.textContent='Drop images, videos, or documents to add them to this board';wrap.appendChild(message);}return;}wrap.classList.remove('drag-over');$('#board-drop-message')?.remove();if(event.type==='drop'){const files=[...(event.dataTransfer?.files||[])];addBoardImages(files.filter(file=>file.type.startsWith('image/')));addBoardVideos(files.filter(file=>file.type.startsWith('video/')));addBoardDocuments(files.filter(file=>!file.type.startsWith('image/')&&!file.type.startsWith('video/')));}}
    function startBoardDrag(event,item,card){ if(boardMarquee||event.button!==0||event.target.closest('.board-card-remove'))return;if(event.target.closest('.board-note-body')){if(!selectedBoardItemIds.has(item.id)){if(!event.shiftKey)selectedBoardItemIds.clear();selectedBoardItemIds.add(item.id);selectedConnectorIds.clear();setSelectedBoardItems(selectedBoardItemIds);}return;}if(boardFisheye)clearBoardFisheye();const board=activeBoard();boardDragHistorySnapshot=boardSnapshot(board);if(event.target.closest('.board-card-resize')){boardDrag={mode:'resize',item,card,startX:event.clientX,startY:event.clientY,startW:item.w||190,startH:item.h||card.offsetHeight||150,scale:board.zoom/100};}else{if(event.shiftKey)selectedBoardItemIds.add(item.id);else if(!selectedBoardItemIds.has(item.id)){selectedBoardItemIds.clear();selectedBoardItemIds.add(item.id);selectedConnectorIds.clear();}const point=screenToBoard(event.clientX,event.clientY);boardDrag={mode:'move',item,card,startX:point.x,startY:point.y,items:board.items.filter(entry=>selectedBoardItemIds.has(entry.id)).map(entry=>({id:entry.id,x:entry.x??80,y:entry.y??80})),scale:board.zoom/100};setSelectedBoardItems(selectedBoardItemIds);} card.classList.add('dragging');card.setPointerCapture(event.pointerId);event.preventDefault(); }
    function startGroupDrag(event,group,element){ if(event.button!==0||(!event.target.closest('.board-group-title')&&!event.target.closest('.board-group-resize')))return;const scale=activeBoard().zoom/100;const items=activeBoard().items.filter(item=>item.groupId===group.id).map(item=>({id:item.id,x:item.x??80,y:item.y??80}));boardDrag={mode:event.target.closest('.board-group-resize')?'group-resize':'group-move',group,element,startX:event.clientX,startY:event.clientY,startGroupX:group.x||0,startGroupY:group.y||0,startW:group.w||440,startH:group.h||360,items,scale};element.setPointerCapture(event.pointerId);event.preventDefault(); }
    function moveBoardDrag(event){ if(!boardDrag)return;if(boardDrag.mode==='resize'){const width=Math.max(110,snapBoardValue(Math.round(boardDrag.startW+(event.clientX-boardDrag.startX)/boardDrag.scale)));boardDrag.item.w=width;boardDrag.card.style.width=`${width}px`;if(boardDrag.item.kind==='note'||boardDrag.item.kind==='document'||boardDrag.item.kind==='shape'){const height=Math.max(100,snapBoardValue(Math.round(boardDrag.startH+(event.clientY-boardDrag.startY)/boardDrag.scale)));boardDrag.item.h=height;boardDrag.card.style.height=`${height}px`;if(boardDrag.item.kind==='shape'){const svg=boardDrag.card.querySelector('.board-shape-svg');if(svg)svg.outerHTML=boardShapeSvgContent(boardDrag.item);}}refreshBoardConnectorsLive();return;}if(boardDrag.mode==='group-resize'){const width=Math.max(180,snapBoardValue(Math.round(boardDrag.startW+(event.clientX-boardDrag.startX)/boardDrag.scale)));const height=Math.max(120,snapBoardValue(Math.round(boardDrag.startH+(event.clientY-boardDrag.startY)/boardDrag.scale)));boardDrag.group.w=width;boardDrag.group.h=height;boardDrag.element.style.width=`${width}px`;boardDrag.element.style.height=`${height}px`;return;}if(boardDrag.mode==='group-move'){const dx=Math.round((event.clientX-boardDrag.startX)/boardDrag.scale);const dy=Math.round((event.clientY-boardDrag.startY)/boardDrag.scale);boardDrag.group.x=snapBoardValue(boardDrag.startGroupX+dx);boardDrag.group.y=snapBoardValue(boardDrag.startGroupY+dy);boardDrag.element.style.left=`${boardDrag.group.x}px`;boardDrag.element.style.top=`${boardDrag.group.y}px`;boardDrag.items.forEach(start=>{const item=activeBoard().items.find(entry=>entry.id===start.id);if(!item)return;item.x=snapBoardValue(start.x+dx);item.y=snapBoardValue(start.y+dy);const card=$(`[data-board-item="${item.id}"]`);if(card){card.style.left=`${item.x}px`;card.style.top=`${item.y}px`;}});refreshBoardConnectorsLive();return;}const point=screenToBoard(event.clientX,event.clientY);let dx=Math.round(point.x-boardDrag.startX);let dy=Math.round(point.y-boardDrag.startY);const anchorStart=boardDrag.items.find(entry=>entry.id===boardDrag.item.id)||boardDrag.items[0];const anchorBounds=boardItemBounds(boardDrag.item);const excludeIds=new Set(boardDrag.items.map(entry=>entry.id));const align=computeAlignSnap(anchorStart.x+dx,anchorStart.y+dy,anchorBounds.w,anchorBounds.h,excludeIds);dx+=align.dx;dy+=align.dy;const guides=boardAlignGuideEls();if(align.lineX!==null){guides.v.style.left=`${align.lineX}px`;guides.v.classList.add('active');}else guides.v.classList.remove('active');if(align.lineY!==null){guides.h.style.top=`${align.lineY}px`;guides.h.classList.add('active');}else guides.h.classList.remove('active');boardDrag.items.forEach(start=>{const item=activeBoard().items.find(entry=>entry.id===start.id);if(!item)return;item.x=align.lineX!==null?Math.round(start.x+dx):snapBoardValue(start.x+dx);item.y=align.lineY!==null?Math.round(start.y+dy):snapBoardValue(start.y+dy);const card=$(`[data-board-item="${item.id}"]`);if(card){card.style.left=`${item.x}px`;card.style.top=`${item.y}px`;}});refreshBoardConnectorsLive(); }
    function endBoardDrag(){ if(!boardDrag)return;hideAlignGuides();const finished=boardDrag;finished.card?.classList.remove('dragging');boardDrag=null;if(finished.mode==='move')(finished.items||[finished.item]).forEach(start=>{const item=activeBoard().items.find(entry=>entry.id===start.id)||finished.item;autoAssignBoardGroup(item);});if(boardDragHistorySnapshot){const board=activeBoard();if(boardSnapshot(board)!==boardDragHistorySnapshot)commitBoardHistorySnapshot(boardDragHistorySnapshot);boardDragHistorySnapshot=null;updateUndoRedoButtons();}persist(); }
    function setSelectedBoardItems(ids){ selectedBoardItemIds=new Set(ids); const board=activeBoard(); $$('.board-card').forEach(element=>{const isSelected=selectedBoardItemIds.has(element.dataset.boardItem);element.classList.toggle('selected',isSelected);if(isSelected){const item=board.items.find(entry=>entry.id===element.dataset.boardItem);if(item){element.style.left=`${item.x??80}px`;element.style.top=`${item.y??80}px`;if(item.kind!=='board-link')element.style.width=`${item.w||190}px`;const isNote=item.kind==='note',isDocument=item.kind==='document',isBoardLink=item.kind==='board-link';if(item.kind==='shape')element.style.height=`${item.h||130}px`;else if(isNote||isDocument||isBoardLink)element.style.height=`${item.h||(isBoardLink?150:(isDocument?120:190))}px`;}}});const firstMedia=activeBoard().items.find(item=>selectedBoardItemIds.has(item.id)&&item.kind!=='note');if($('#board-img-opacity'))$('#board-img-opacity').value=firstMedia?.opacity??100;if($('#tb-transform-group'))$('#tb-transform-group').hidden=!selectedBoardItemIds.size; if($('#note-format-toolbar')){$('#note-format-toolbar').hidden=!noteFormatToolbarVisible();positionNoteFormatToolbar();} syncShapeFormatToolbar(); }
    function boardAlignGuideEls(){ const canvas=$('#board-canvas'); let v=canvas.querySelector('#board-align-v'); if(!v){v=document.createElement('div');v.id='board-align-v';v.className='board-align-guide vertical';canvas.appendChild(v);} let h=canvas.querySelector('#board-align-h'); if(!h){h=document.createElement('div');h.id='board-align-h';h.className='board-align-guide horizontal';canvas.appendChild(h);} return {v,h}; }
    function hideAlignGuides(){ const canvas=$('#board-canvas'); canvas.querySelector('#board-align-v')?.classList.remove('active'); canvas.querySelector('#board-align-h')?.classList.remove('active'); }
    function computeAlignSnap(rawX,rawY,w,h,excludeIds){ const board=activeBoard();const scale=board.zoom/100;const threshold=6/scale;const targetsX=[],targetsY=[];board.items.forEach(item=>{ if(excludeIds.has(item.id))return;const b=boardItemBounds(item);targetsX.push(b.x,b.x+b.w/2,b.x+b.w);targetsY.push(b.y,b.y+b.h/2,b.y+b.h); });const candX=[rawX,rawX+w/2,rawX+w];const candY=[rawY,rawY+h/2,rawY+h];let bestX=null,bestY=null;candX.forEach(c=>targetsX.forEach(t=>{const d=Math.abs(c-t);if(d<=threshold&&(!bestX||d<bestX.d))bestX={d,line:t,offset:t-c};}));candY.forEach(c=>targetsY.forEach(t=>{const d=Math.abs(c-t);if(d<=threshold&&(!bestY||d<bestY.d))bestY={d,line:t,offset:t-c};}));return {dx:bestX?bestX.offset:0,dy:bestY?bestY.offset:0,lineX:bestX?bestX.line:null,lineY:bestY?bestY.line:null}; }
    /* Board coordinates may legitimately be zero. Every item-position read uses ??80 so all
       render, hit-test, drag, minimap, Fit Board, paste, duplicate, and nudge paths agree.
       Using ||80 makes x:0/y:0 render as 80, while drag snapshots retain 0; the first pointer
       move then snaps the card by roughly 80 board pixels under GPU Preview. */
    function boardItemBounds(item){ const card=$(`[data-board-item="${item.id}"]`);return {x:item.x??80,y:item.y??80,w:item.w||card?.offsetWidth||190,h:item.h||card?.offsetHeight||240}; }
    function updateBoardMarquee(event){ if(!boardMarquee)return;const wrap=$('#board-canvas-wrap');const rect=wrap.getBoundingClientRect();const x1=boardMarquee.startX-rect.left;const y1=boardMarquee.startY-rect.top;const x2=event.clientX-rect.left;const y2=event.clientY-rect.top;const left=Math.min(x1,x2);const top=Math.min(y1,y2);const width=Math.abs(x2-x1);const height=Math.abs(y2-y1);Object.assign(boardMarquee.element.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`});const first=screenToBoard(boardMarquee.startX,boardMarquee.startY);const last=screenToBoard(event.clientX,event.clientY);const minX=Math.min(first.x,last.x);const minY=Math.min(first.y,last.y);const maxX=Math.max(first.x,last.x);const maxY=Math.max(first.y,last.y);const hits=activeBoard().items.filter(item=>{const bounds=boardItemBounds(item);return bounds.x<maxX&&bounds.x+bounds.w>minX&&bounds.y<maxY&&bounds.y+bounds.h>minY;}).map(item=>item.id);setSelectedBoardItems(boardMarquee.additive?[...new Set([...boardMarquee.initial,...hits])]:hits); }
    function startBoardMarquee(event){ const wrap=$('#board-canvas-wrap');if(!event.shiftKey){setSelectedBoardItems([]);if(selectedConnectorIds.size){selectedConnectorIds.clear();renderBoard();}}const element=document.createElement('div');element.className='board-marquee';wrap.appendChild(element);boardMarquee={startX:event.clientX,startY:event.clientY,initial:new Set(selectedBoardItemIds),additive:event.shiftKey,element};wrap.setPointerCapture(event.pointerId);event.preventDefault(); }
    function boardItemAtPoint(clientX,clientY){ const board=activeBoard(); const point=screenToBoard(clientX,clientY); for(let i=board.items.length-1;i>=0;i--){ const item=board.items[i]; const bounds=boardItemBounds(item); if(point.x>=bounds.x&&point.x<=bounds.x+bounds.w&&point.y>=bounds.y&&point.y<=bounds.y+bounds.h)return item; } return null; }
    /* Shape tools, Illustrator-style (owner direction 2026-08-24): clicking a
       shape rail button arms that tool instead of drop-inserting a shape — then
       a left-drag on empty board rubber-bands the shape live (card element and
       its SVG regenerate per move, same direct-update approach as moveBoardDrag,
       never a full renderBoard mid-gesture). Shift constrains rect/oval to a
       square/circle and snaps lines/arrows to 45° steps, matching the vector-
       tool convention. Escape or re-clicking the tool returns to select mode;
       the tool also disarms itself if Connect mode is entered. A click with no
       meaningful drag (under 12 board units) stamps a default-size shape at the
       click point, so the old click-to-add behavior stays reachable. */
    function toggleShapeTool(type){
      shapeTool=shapeTool===type?null:type;
      $$('#board-tool-rail [data-shape-tool]').forEach(button=>button.classList.toggle('active',button.dataset.shapeTool===shapeTool));
      $('#board-canvas-wrap').classList.toggle('shape-tool',!!shapeTool);
      setStatus(shapeTool?`${BOARD_SHAPE_KINDS[shapeTool]} tool active — drag on the board to draw. Shift constrains. Escape to finish.`:'Shape tool off.');
    }
    function startShapeDraw(event){
      const board=activeBoard();
      const start=screenToBoard(event.clientX,event.clientY);
      pushBoardHistory();
      const item={id:'board-item-'+uid(),kind:'shape',shapeType:shapeTool,name:BOARD_SHAPE_KINDS[shapeTool]||'Shape',x:Math.round(start.x),y:Math.round(start.y),w:2,h:2,flipX:false,flipY:false,groupId:$('#board-group-select').value||''};
      board.items.push(item);
      boardShapeDraw={startX:item.x,startY:item.y,item,pointerId:event.pointerId};
      renderBoard();
      const card=$(`[data-board-item="${item.id}"]`);
      boardShapeDraw.card=card;
      const wrap=$('#board-canvas-wrap');
      if(event.pointerId!==undefined&&wrap)wrap.setPointerCapture(event.pointerId);
      setStatus(`Drawing ${BOARD_SHAPE_KINDS[shapeTool]||'shape'} — release to place. Shift constrains.`);
    }
    function updateShapeDraw(event){
      if(!boardShapeDraw)return;
      const item=boardShapeDraw.item;
      const cur=screenToBoard(event.clientX,event.clientY);
      let dx=cur.x-boardShapeDraw.startX, dy=cur.y-boardShapeDraw.startY;
      if(event.shiftKey){
        if(item.shapeType==='line'||item.shapeType==='arrow'){
          const angle=Math.atan2(dy,dx), snapped=Math.round(angle/(Math.PI/4))*(Math.PI/4), len=Math.hypot(dx,dy);
          dx=Math.cos(snapped)*len; dy=Math.sin(snapped)*len;
        } else { const size=Math.max(Math.abs(dx),Math.abs(dy)); dx=Math.sign(dx||1)*size; dy=Math.sign(dy||1)*size; }
      }
      item.x=Math.round(Math.min(boardShapeDraw.startX,boardShapeDraw.startX+dx));
      item.y=Math.round(Math.min(boardShapeDraw.startY,boardShapeDraw.startY+dy));
      item.w=Math.max(2,Math.round(Math.abs(dx)));
      item.h=Math.max(2,Math.round(Math.abs(dy)));
      item.flipX=dx<0; item.flipY=dy<0;
      if(boardShapeDraw.card&&boardShapeDraw.card.isConnected){
        boardShapeDraw.card.style.left=`${item.x}px`;
        boardShapeDraw.card.style.top=`${item.y}px`;
        boardShapeDraw.card.style.width=`${item.w}px`;
        boardShapeDraw.card.style.height=`${item.h}px`;
        const svg=boardShapeDraw.card.querySelector('.board-shape-svg');
        if(svg)svg.outerHTML=boardShapeSvgContent(item);
      }
    }
    function finishShapeDraw(){
      if(!boardShapeDraw)return;
      const item=boardShapeDraw.item;
      const wrap=$('#board-canvas-wrap');
      if(wrap&&wrap.hasPointerCapture?.(boardShapeDraw.pointerId))wrap.releasePointerCapture(boardShapeDraw.pointerId);
      const isLine=item.shapeType==='line'||item.shapeType==='arrow';
      if(item.w<12&&item.h<12){
        // Treat a no-drag click as the classic stamp: default size centered on the click.
        const w=isLine?220:180, h=isLine?110:130;
        item.w=w; item.h=h;
        item.x=Math.round(boardShapeDraw.startX-w/2); item.y=Math.round(boardShapeDraw.startY-h/2);
        item.flipX=isLine?false:item.flipX; item.flipY=isLine?false:item.flipY;
      } else {
        item.w=snapBoardValue(item.w); item.h=snapBoardValue(item.h);
      }
      boardShapeDraw=null;
      persist();
      renderBoard();
      setSelectedBoardItems([item.id]);
      setStatus(`${BOARD_SHAPE_KINDS[item.shapeType]||'Shape'} drawn — right-click it for object operations, or keep drawing.`);
    }
    function startBoardPan(event){ if(boardDrag||![0,1,2].includes(event.button))return;if(boardFisheye)clearBoardFisheye();if(connectMode){if(connectPendingId){connectPendingId=null;renderBoard();setStatus('Connect canceled.');}return;}if(shapeTool&&event.button===0&&!spaceHeld){startShapeDraw(event);return;}if(event.button===0&&!spaceHeld){ if(boardGpuPreviewOn){ const hitItem=boardItemAtPoint(event.clientX,event.clientY); if(hitItem){ const hitCard=$(`[data-board-item="${hitItem.id}"]`); if(hitCard){ startBoardDrag(event,hitItem,hitCard); return; } } } startBoardMarquee(event);return;}event.preventDefault();const board=activeBoard();boardPan={startX:event.clientX,startY:event.clientY,panX:board.panX||0,panY:board.panY||0};const wrap=$('#board-canvas-wrap');wrap.setPointerCapture(event.pointerId);wrap.style.cursor='grabbing'; }
    function moveBoardPan(event){ lastBoardPointerScreen={x:event.clientX,y:event.clientY}; if(boardShapeDraw){updateShapeDraw(event);return;} if(boardFisheye&&!boardDrag&&!boardPan)queueBoardFisheye(event.clientX,event.clientY); if(boardMarquee){updateBoardMarquee(event);return;}if(!boardPan)return;const board=activeBoard();board.panX=boardPan.panX+(event.clientX-boardPan.startX);board.panY=boardPan.panY+(event.clientY-boardPan.startY);applyBoardView(); }
    function endBoardPan(event){ const wrap=$('#board-canvas-wrap');if(boardShapeDraw){finishShapeDraw();return;}if(boardMarquee){updateBoardMarquee(event);boardMarquee.element.remove();boardMarquee=null;if(event?.pointerId!==undefined&&wrap.hasPointerCapture(event.pointerId))wrap.releasePointerCapture(event.pointerId);applyBoardView();return;}if(!boardPan)return;boardPan=null;if(event?.pointerId!==undefined&&wrap.hasPointerCapture(event.pointerId))wrap.releasePointerCapture(event.pointerId);applyBoardView();persist(); }
    /* Tier 10 spike: fisheye/focus+context as a zoom-slider alternative (Gutwin & Skopik, SIGCHI 2007). Cards near the cursor scale up in place, cards further away stay at 1x — lets you inspect one card's detail without zooming the whole board out. Screen-space radius (not board-space) so the magnification feel stays constant regardless of board.zoom. Proof-of-concept only: not integrated with the semantic-zoom tiers, not persisted per board, and deliberately disabled while dragging/panning/resizing to avoid fighting that math.
       Tier 12 item 1c (2026-08-23): Fisheye and GPU Preview are now mutually exclusive rather
       than silently stacking with no visible effect — GPU Preview always drew cards at their
       flat, un-fisheyed position/size (it has no fisheye-aware code path), so having both on used
       to look identical to GPU Preview alone with no indication anything was suppressed. Turning
       either one on while the other is active now turns the other off automatically, with a
       status-bar message explaining why (see toggleBoardFisheye/toggleBoardGpuPreview below). */
    function queueBoardFisheye(clientX,clientY){ if(boardFisheyeRaf)return; boardFisheyeRaf=requestAnimationFrame(()=>{ boardFisheyeRaf=null; applyBoardFisheyeAt(clientX,clientY); }); }
    function applyBoardFisheyeAt(clientX,clientY){ if(!boardFisheye)return; const radius=220; const maxScale=1.6; $$('#board-canvas .board-card').forEach(card=>{ const rect=card.getBoundingClientRect(); const cx=rect.left+rect.width/2; const cy=rect.top+rect.height/2; const dist=Math.hypot(clientX-cx,clientY-cy); const t=Math.max(0,1-dist/radius); const scale=1+(maxScale-1)*t*t; if(scale>1.01){ card.style.transform=`scale(${scale.toFixed(3)})`; card.style.zIndex=String(50+Math.round(t*50)); } else { card.style.transform=''; card.style.zIndex=''; } }); }
    function clearBoardFisheye(){ if(boardFisheyeRaf){cancelAnimationFrame(boardFisheyeRaf);boardFisheyeRaf=null;} $$('#board-canvas .board-card').forEach(card=>{card.style.transform='';card.style.zIndex='';}); }
    function toggleBoardFisheye(force){ const target=force===undefined?!boardFisheye:!!force; if(target===boardFisheye){syncSettingsControls();return;} boardFisheye=target; $('#board-canvas').classList.toggle('board-fisheye-active',boardFisheye); if(!boardFisheye)clearBoardFisheye(); syncSettingsControls(); setStatus(boardFisheye?'Fisheye spike on — move the cursor over cards. Not saved with the board.':'Fisheye off.'); }
    function zoomBoardAt(event){ event.preventDefault();const board=activeBoard();const wrap=$('#board-canvas-wrap');const rect=wrap.getBoundingClientRect();const oldScale=board.zoom/100;const nextZoom=Math.max(35,Math.min(200,Math.round(board.zoom+(event.deltaY<0?10:-10))));if(nextZoom===board.zoom)return;const cursorX=event.clientX-rect.left;const cursorY=event.clientY-rect.top;const boardX=(cursorX-(board.panX||0))/oldScale;const boardY=(cursorY-(board.panY||0))/oldScale;const newScale=nextZoom/100;board.zoom=nextZoom;board.panX=cursorX-boardX*newScale;board.panY=cursorY-boardY*newScale;applyBoardView();persist(); }
    function fitBoard(){ const board=activeBoard();const content=[...board.items,...board.groups];if(!content.length){board.zoom=100;board.panX=0;board.panY=0;applyBoardView();persist();return;}const left=Math.min(...content.map(item=>item.x??80));const top=Math.min(...content.map(item=>item.y??80));const right=Math.max(...content.map(item=>(item.x??80)+(item.w||190)));const bottom=Math.max(...content.map(item=>(item.y??80)+(item.h||260)));const wrap=$('#board-canvas-wrap');const padding=70;const scale=Math.min((wrap.clientWidth-padding)/(right-left||1),(wrap.clientHeight-padding)/(bottom-top||1),1.5);board.zoom=Math.max(35,Math.min(150,Math.round(scale*100)));board.panX=(wrap.clientWidth-(right-left)*scale)/2-left*scale;board.panY=(wrap.clientHeight-(bottom-top)*scale)/2-top*scale;applyBoardView();persist(); }
    function beginSplitResize(event){ if(window.innerWidth<=1100)return; splitResizeActive=true;event.currentTarget.classList.add('dragging');event.currentTarget.setPointerCapture(event.pointerId);event.preventDefault(); }
    function resizeSplit(event){ if(!splitResizeActive)return;const left=Math.max(720,Math.min(window.innerWidth-420,event.clientX));document.body.style.setProperty('--split-left',`${left}px`); }
    function endSplitResize(event){ if(!splitResizeActive)return;splitResizeActive=false;$('#split-divider').classList.remove('dragging');if(event?.pointerId!==undefined&&$('#split-divider').hasPointerCapture(event.pointerId))$('#split-divider').releasePointerCapture(event.pointerId); }
    async function saveProject(){ const p=project(); $$('.view [data-field]').forEach(el=>p[el.dataset.field]=el.value); p.savedAt=Date.now(); persist(); const wrote=await writeFolderBackup(); renderProject(); setStatus(wrote?'Saved locally and to chosen folder.':'Project saved locally.'); }
    async function newProject(){ await saveProject(); const p=blankProject(); state.projects.unshift(p);currentId=p.id;persist();renderProject();switchView('project-view');setStatus('New project ready.'); }
    async function duplicateProject(){ await saveProject(); const original=project(); const p=structuredClone(original);p.id=uid();p.title=(original.title||'Untitled Project')+' (Copy)';p.date=today();p.savedAt=null;p.archived=false;p.boards.forEach(board=>{board.id='board-'+uid();const groupIds={};board.groups.forEach(group=>{const prior=group.id;group.id='board-group-'+uid();groupIds[prior]=group.id;});const itemIds={};board.items.forEach(item=>{const prior=item.id;item.id='board-item-'+uid();itemIds[prior]=item.id;item.groupId=groupIds[item.groupId]||'';});board.connectors=(board.connectors||[]).map(conn=>({...conn,id:'board-connector-'+uid(),from:itemIds[conn.from],to:itemIds[conn.to]})).filter(conn=>conn.from&&conn.to);});normaliseProjectBoards(p); state.projects.unshift(p);currentId=p.id;persist();renderProject();setStatus('Project duplicated.'); }
    function archiveProject(){ const p=project(); p.archived=!p.archived; persist(); renderProject(); setStatus(p.archived?'Project archived. Enable "Show archived" to find it again.':'Project restored to the active list.'); }
    function requestDelete(){ const p=project(); $('#delete-project-name').textContent=p.title||'Untitled Project'; $('#delete-modal').classList.add('open'); }
    async function deleteProject(){ const deleted=project(); state.projects=state.projects.filter(p=>p.id!==deleted.id); if(!state.projects.length)state.projects=[blankProject()]; state.reader.crops=state.reader.crops||{}; Object.values(state.reader.crops).forEach(crop=>{if(crop.projectId===deleted.id){crop.projectId='';crop.projectTitle='Unassigned';}}); currentId=state.projects[0].id; persist(); await writeFolderBackup(); $('#delete-modal').classList.remove('open'); renderProject(); switchView('project-view'); setStatus('Project deleted. Linked crops remain unassigned.'); }
    function renderRecipes(){ const q=$('#recipe-search').value.toLowerCase().trim(); const list=state.recipes.filter(r=>(category==='all'||r.category===category)&&(!q||`${r.title} ${r.problem} ${r.category}`.toLowerCase().includes(q))); $('#recipe-grid').innerHTML=list.length?list.map(r=>{const used=state.projects.filter(p=>p.recipeIds.includes(r.id)).length; return `<article class="recipe-card" data-recipe="${r.id}"><div class="recipe-card-top"><div class="recipe-category">${escapeHtml(r.category)}</div>${used?`<span class="recipe-used-badge">Used in ${used} project${used===1?'':'s'}</span>`:''}</div>${r.thumbnail?`<img class="recipe-thumb" src="${r.thumbnail}" alt="" loading="lazy">`:''}<h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.problem)}</p><footer>${escapeHtml(r.models||'Reusable method')}</footer></article>`;}).join(''):'<div class="empty">No recipe matches this search.</div>'; $$('[data-recipe]').forEach(c=>c.onclick=()=>openRecipe(c.dataset.recipe)); }
    function mimeType(name){ const extension=name.split('.').pop().toLowerCase(); return ({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',bmp:'image/bmp',avif:'image/avif'})[extension]||'application/octet-stream'; }
    const imagePattern=/\.(avif|bmp|gif|jpe?g|png|webp)$/i;
    async function cbrToChapter(file,title=file.name,path=`CBR archive / ${file.name}`){ if(!window.unrarit?.unrar)throw new Error('CBR reader library could not load'); const {entries}=await window.unrarit.unrar(file); const pages=Object.values(entries).filter(entry=>!entry.isDirectory&&imagePattern.test(entry.name)).sort((a,b)=>naturalSort(a.name,b.name)).map(entry=>({name:entry.name,entry})); if(!pages.length)throw new Error('No readable images in CBR'); return {id:uid(),title:title.replace(/\.cbr$/i,''),path,pages}; }
    async function cbzToChapter(file,title=file.name,path=`CBZ archive / ${file.name}`){ if(!window.JSZip)throw new Error('CBZ reader library could not load'); const zip=await window.JSZip.loadAsync(file); const pages=Object.values(zip.files).filter(entry=>!entry.dir&&imagePattern.test(entry.name)).sort((a,b)=>naturalSort(a.name,b.name)).map(zipEntry=>({name:zipEntry.name,zipEntry})); if(!pages.length)throw new Error('No readable images in CBZ'); return {id:uid(),title:title.replace(/\.(cbz|zip)$/i,''),path,pages}; }
    async function chapterFromArchive(file,path){ return /\.cbr$/i.test(file.name)?cbrToChapter(file,file.name,path):cbzToChapter(file,file.name,path); }
    async function scanMangaFolder(root,onProgress=()=>{}){ const found=[]; const archivePattern=/\.(cbr|cbz|zip)$/i; let skipped=0; async function walk(folder,path=[]){ const pages=[]; const archives=[]; const directories=[]; for await(const [name,handle] of folder.entries()){ if(handle.kind==='file'&&imagePattern.test(name))pages.push({name,handle}); else if(handle.kind==='file'&&archivePattern.test(name))archives.push({name,handle}); else if(handle.kind==='directory')directories.push([name,handle]); } pages.sort((a,b)=>naturalSort(a.name,b.name)); if(pages.length)found.push({id:uid(),title:path[path.length-1]||root.name,path:path.join(' / ')||root.name,pages}); directories.sort((a,b)=>naturalSort(a[0],b[0])); for(const [name,handle] of directories)await walk(handle,[...path,name]); for(const archive of archives.sort((a,b)=>naturalSort(a.name,b.name))){ onProgress(`Reading archive: ${archive.name}…`); try { found.push(await chapterFromArchive(await archive.handle.getFile(),[...path,archive.name].join(' / '))); } catch(error) { skipped++; console.warn(`Could not read ${archive.name}`,error); } } } await walk(root,[]); return {found,skipped}; }
    async function chooseMangaFolder(){ if(!window.showDirectoryPicker){ $('#library-status').textContent='Folder scanning needs Chrome or Edge.'; return; } try { const folder=await window.showDirectoryPicker({mode:'read'}); setLibraryLoading(true,'Scanning library…'); $('#library-status').textContent='Scanning images, CBR, and CBZ files…'; const result=await scanMangaFolder(folder,message=>$('#library-status').textContent=message); clearChapterCoverUrls(); chapters=result.found; $('#library-status').textContent=chapters.length?`${folder.name} · ${chapters.length} readable chapter${chapters.length===1?'':'s'}${result.skipped?` · ${result.skipped} archive${result.skipped===1?'':'s'} skipped`:''}`:'No readable image folders or archives found.'; await renderChapterGrid(); } catch(error) { if(error.name!=='AbortError')$('#library-status').textContent='Could not scan that folder.'; } finally { setLibraryLoading(false); } }
    async function chooseArchiveFiles(files,type){ if(!files?.length)return; const imported=[]; let skipped=0; setLibraryLoading(true,`Loading ${type} archive…`); try { for(let index=0;index<files.length;index++){ const file=files[index]; $('#library-status').textContent=`Reading ${type} archive ${index+1} of ${files.length}: ${file.name}`; $('#library-loading').textContent=`Loading ${index+1}/${files.length}…`; try { imported.push(await chapterFromArchive(file,`${type} archive / ${file.name}`)); } catch(error) { skipped++; console.warn(`Could not read ${file.name}`,error); } } chapters=[...chapters,...imported]; $('#library-status').textContent=imported.length?`${imported.length} ${type} chapter${imported.length===1?'':'s'} added.${skipped?` ${skipped} could not be read (password-protected CBR files are unsupported).`:''}`:`No readable ${type} pages found.`; await renderChapterGrid(); } finally { setLibraryLoading(false); } }
    function clearReaderUrls(){ readerUrls.forEach(url=>URL.revokeObjectURL(url)); readerUrls=[]; }
    function clearChapterCoverUrls(){ chapterCoverUrls.forEach(url=>URL.revokeObjectURL(url)); chapterCoverUrls.clear(); }
    async function chapterCoverUrl(chapter){ if(chapterCoverUrls.has(chapter.path))return chapterCoverUrls.get(chapter.path); const url=URL.createObjectURL(await pageBlob(chapter.pages[0])); chapterCoverUrls.set(chapter.path,url); return url; }
    function clearReaderObserver(){ if(readerObserver){ readerObserver.disconnect(); readerObserver=null; } }
    async function pageBlob(page){ return page.handle?await page.handle.getFile():page.entry?await page.entry.blob(mimeType(page.name)):await page.zipEntry.async('blob'); }
    async function imageUrl(page){ const url=URL.createObjectURL(await pageBlob(page)); readerUrls.push(url); return url; }
    async function renderChapterGrid(){ clearReaderUrls(); renderBookmarks(); renderCrops(); const grid=$('#chapter-grid'); grid.innerHTML=chapters.length?chapters.map((chapter,index)=>`<button class="chapter-card" data-chapter="${index}"><div class="chapter-cover" data-cover="${index}"></div><div><b>${escapeHtml(chapter.title)}</b><small>${escapeHtml(chapter.path)} · ${chapter.pages.length} pages</small></div></button>`).join(''):''; $$('[data-chapter]').forEach(button=>button.onclick=()=>openChapter(Number(button.dataset.chapter))); for(const holder of $$('[data-cover]')){ const chapter=chapters[Number(holder.dataset.cover)]; try { const image=document.createElement('img');image.className='chapter-cover';image.alt=`Cover for ${chapter.title}`;image.src=await chapterCoverUrl(chapter);holder.replaceWith(image); }catch{ holder.textContent='Image unavailable'; } } filterChapterGrid(); }
    function filterChapterGrid(){ const term=($('#library-search')?.value||'').trim().toLowerCase(); $$('.chapter-card').forEach(button=>{ const chapter=chapters[Number(button.dataset.chapter)]; const match=!term||chapter.title.toLowerCase().includes(term); button.classList.toggle('search-hidden',!match); }); }
    async function openChapter(index){ activeChapter=chapters[index]; activePage=Math.min(state.reader.positions[activeChapter.path]||0,activeChapter.pages.length-1); $('#library-home').hidden=true; $('#reader-view').hidden=false; $('#references-view').classList.add('reader-active'); $('#reader-title').textContent=activeChapter.title; await renderReader(); }
    function closeReader(){ readerGeneration++; clearReaderUrls(); clearReaderObserver(); activeChapter=null; $('#reader-view').hidden=true; $('#library-home').hidden=false; $('#references-view').classList.remove('reader-active'); }
    function applyReaderZoom(){ const pages=$('#reader-pages'); if(!pages)return; const available=Math.max(280,pages.clientWidth-8); const baseWidth=readerMode==='spread'?Math.max(180,(available-16)/2):readerMode==='single'?Math.min(1240,available):Math.min(980,available); const width=Math.round(baseWidth*(readerZoom/100)); pages.querySelectorAll('.reader-page img').forEach(image=>{image.style.width=`${width}px`;image.style.maxWidth='none';}); $('#zoom-value').textContent=`${readerZoom}%`; }
    async function loadReaderPageImage(image,index){ if(image.dataset.loaded)return; image.dataset.loaded='1'; const gen=readerGeneration; try{ const url=await imageUrl(activeChapter.pages[index]); if(gen!==readerGeneration){ URL.revokeObjectURL(url); readerUrls=readerUrls.filter(existing=>existing!==url); return; } image.src=url; image.classList.remove('reader-page-placeholder'); }catch{ if(gen===readerGeneration)image.classList.add('reader-page-error'); } }
    async function renderReader(){ if(!activeChapter)return; readerGeneration++; clearReaderUrls(); clearReaderObserver(); rememberPage(); const pages=$('#reader-pages'); const vertical=readerMode==='vertical'; pages.className=`reader-pages ${vertical?'vertical':'focused'}`; pages.innerHTML=''; const pageIndexes=vertical?activeChapter.pages.map((_,i)=>i):readerMode==='spread'?[activePage,activePage+1].filter(i=>i<activeChapter.pages.length):[activePage]; if(vertical&&'IntersectionObserver' in window){ readerObserver=new IntersectionObserver(entries=>{ entries.forEach(entry=>{ if(!entry.isIntersecting)return; const image=entry.target; loadReaderPageImage(image,Number(image.dataset.pageIndex)); readerObserver.unobserve(image); }); },{root:pages,rootMargin:'1000px 0px'}); } for(const index of pageIndexes){ const button=document.createElement('button');button.className=`reader-page ${index===activePage?'selected':''}`;button.title=`Page ${index+1}`;button.onclick=()=>{activePage=index;renderReader();};const image=document.createElement('img');image.alt=`${activeChapter.title}, page ${index+1}`;image.dataset.pageIndex=index;button.appendChild(image);pages.appendChild(button); if(vertical&&readerObserver){ image.classList.add('reader-page-placeholder'); readerObserver.observe(image); } else { await loadReaderPageImage(image,index); } } requestAnimationFrame(applyReaderZoom); const key=pageKey(); $('#page-note').value=state.reader.notes[key]||''; $('#bookmark-page').textContent=state.reader.bookmarks[key]?'Remove Bookmark':'Bookmark Page'; $('#reader-note').textContent=`${activeChapter.path} · Page ${activePage+1} of ${activeChapter.pages.length}${vertical?' · Click a page to select it.':''}`; $('#zoom-value').textContent=`${readerZoom}%`; $('#previous-page').disabled=activePage===0; $('#next-page').disabled=activePage>=activeChapter.pages.length-(readerMode==='spread'?2:1); }
    async function moveReader(amount){ if(!activeChapter)return; const step=readerMode==='spread'?2:1; activePage=Math.max(0,Math.min(activeChapter.pages.length-1,activePage+(amount*step))); await renderReader(); }
    async function downloadCurrentPage(){ if(!activeChapter)return; try { const page=activeChapter.pages[activePage]; const blob=await pageBlob(page);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=page.name.split('/').pop();a.click();setTimeout(()=>URL.revokeObjectURL(url),1500); $('#reader-note').textContent=`Downloaded ${page.name.split('/').pop()}. Open it in Photoshop from your Downloads folder.`; }catch{ $('#reader-note').textContent='Could not download this page.'; } }
    function toggleBookmark(){ if(!activeChapter)return; const key=pageKey(); if(state.reader.bookmarks[key])delete state.reader.bookmarks[key]; else state.reader.bookmarks[key]={key,chapterTitle:activeChapter.title,path:activeChapter.path,pageName:activeChapter.pages[activePage].name,pageIndex:activePage,note:state.reader.notes[key]||'',addedAt:Date.now()}; persist(); renderBookmarks(); renderReader(); }
    function savePageNote(){ if(!activeChapter)return; const key=pageKey(); const note=$('#page-note').value.trim(); if(note)state.reader.notes[key]=note;else delete state.reader.notes[key]; if(state.reader.bookmarks[key])state.reader.bookmarks[key].note=note; persist(); renderBookmarks(); }
    function drawCropCanvas(){ if(!cropImage)return; const canvas=$('#crop-canvas'); const context=canvas.getContext('2d'); context.clearRect(0,0,canvas.width,canvas.height); context.drawImage(cropImage,0,0,canvas.width,canvas.height); if(cropBox?.w>2&&cropBox?.h>2){ context.fillStyle='rgba(0,0,0,.38)'; context.fillRect(0,0,canvas.width,canvas.height); context.save(); context.beginPath();context.rect(cropBox.x,cropBox.y,cropBox.w,cropBox.h);context.clip();context.drawImage(cropImage,0,0,canvas.width,canvas.height);context.restore();context.strokeStyle='#c49a67';context.lineWidth=3;context.strokeRect(cropBox.x,cropBox.y,cropBox.w,cropBox.h); } }
    function canvasPoint(event){ const canvas=$('#crop-canvas'); const rect=canvas.getBoundingClientRect(); return {x:Math.max(0,Math.min(canvas.width,(event.clientX-rect.left)*(canvas.width/rect.width))),y:Math.max(0,Math.min(canvas.height,(event.clientY-rect.top)*(canvas.height/rect.height)))}; }
    async function openCropModal(){ if(!activeChapter)return; try { const blob=await pageBlob(activeChapter.pages[activePage]); const url=URL.createObjectURL(blob); const image=new Image(); image.onload=()=>{ URL.revokeObjectURL(url); cropImage=image; const scale=Math.min(1,900/image.naturalWidth,620/image.naturalHeight); const canvas=$('#crop-canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));cropBox={x:canvas.width*.1,y:canvas.height*.1,w:canvas.width*.8,h:canvas.height*.8}; $('#crop-title').value='';$('#crop-tags').value='';$('#crop-project').innerHTML=state.projects.map(p=>`<option value="${p.id}" ${p.id===currentId?'selected':''}>${escapeHtml(p.title||'Untitled Project')}</option>`).join('');drawCropCanvas();$('#crop-modal').classList.add('open'); }; image.onerror=()=>{URL.revokeObjectURL(url);$('#reader-note').textContent='Could not prepare this page for cropping.';}; image.src=url; }catch{ $('#reader-note').textContent='Could not prepare this page for cropping.'; } }
    function saveCrop(){ if(!cropImage||!cropBox||cropBox.w<6||cropBox.h<6)return; const canvas=$('#crop-canvas'); const scaleX=cropImage.naturalWidth/canvas.width, scaleY=cropImage.naturalHeight/canvas.height; const source={x:Math.round(cropBox.x*scaleX),y:Math.round(cropBox.y*scaleY),w:Math.round(cropBox.w*scaleX),h:Math.round(cropBox.h*scaleY)}; const longest=Math.max(source.w,source.h); const outputScale=Math.min(1,1800/longest); const output=document.createElement('canvas');output.width=Math.max(1,Math.round(source.w*outputScale));output.height=Math.max(1,Math.round(source.h*outputScale));output.getContext('2d').drawImage(cropImage,source.x,source.y,source.w,source.h,0,0,output.width,output.height); const preview=document.createElement('canvas'); const previewScale=Math.min(1,360/Math.max(output.width,output.height));preview.width=Math.max(1,Math.round(output.width*previewScale));preview.height=Math.max(1,Math.round(output.height*previewScale));preview.getContext('2d').drawImage(output,0,0,preview.width,preview.height); const projectId=$('#crop-project').value;const linkedProject=state.projects.find(p=>p.id===projectId);const id='crop-'+uid();const crop={id,title:$('#crop-title').value.trim()||`${activeChapter.title} · page ${activePage+1}`,tags:$('#crop-tags').value.trim(),projectId,projectTitle:linkedProject?.title||'Untitled Project',chapterTitle:activeChapter.title,path:activeChapter.path,pageName:activeChapter.pages[activePage].name,pageIndex:activePage,source,preview:preview.toDataURL('image/jpeg',.8),addedAt:Date.now()}; let stored=true; try { state.reader.crops[id]=crop; persist(); } catch { stored=false; delete state.reader.crops[id]; } const url=output.toDataURL('image/png');const download=document.createElement('a');download.href=url;download.download=(crop.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'reference-crop')+'.png';download.click();$('#crop-modal').classList.remove('open');renderCrops();$('#reader-note').textContent=stored?`Saved crop for ${crop.projectTitle} and downloaded PNG.`:'Crop preview is too large for browser storage; downloaded PNG only.'; }
    function copyBoardSelection(){ const board=activeBoard();const selected=board.items.filter(item=>selectedBoardItemIds.has(item.id));if(!selected.length){setStatus('Select one or more cards first.');return;}const ids=new Set(selected.map(item=>item.id));const connectors=(board.connectors||[]).filter(conn=>ids.has(conn.from)&&ids.has(conn.to));boardClipboard={items:structuredClone(selected),connectors:structuredClone(connectors)};setStatus(`Copied ${selected.length} card${selected.length===1?'':'s'}. Paste with Ctrl/Cmd+V — works on this board, another board, or another project.`); }
    function pasteBoardClipboard(boardPoint){ if(!boardClipboard||!boardClipboard.items.length){setStatus('Nothing copied yet — select card(s) and press Ctrl/Cmd+C first.');return;} const board=activeBoard(); const left=Math.min(...boardClipboard.items.map(item=>item.x??80)); const top=Math.min(...boardClipboard.items.map(item=>item.y??80)); const target=boardPoint||(lastBoardPointerScreen?screenToBoard(lastBoardPointerScreen.x,lastBoardPointerScreen.y):boardViewportCenter()); const offsetX=target.x-left; const offsetY=target.y-top; const idMap={}; const copies=boardClipboard.items.map(item=>{const copy=structuredClone(item);const prior=copy.id;copy.id='board-item-'+uid();idMap[prior]=copy.id;copy.x=(item.x??80)+offsetX;copy.y=(item.y??80)+offsetY;copy.groupId='';return copy;}); const connectorCopies=(boardClipboard.connectors||[]).map(conn=>({...conn,id:'board-connector-'+uid(),from:idMap[conn.from],to:idMap[conn.to]})).filter(conn=>conn.from&&conn.to); pushBoardHistory(); board.items.push(...copies); board.connectors=[...(board.connectors||[]),...connectorCopies]; selectedConnectorIds.clear(); persist(); renderBoard(); setSelectedBoardItems(copies.map(item=>item.id)); setStatus(`Pasted ${copies.length} card${copies.length===1?'':'s'}${connectorCopies.length?` with ${connectorCopies.length} connector${connectorCopies.length===1?'':'s'}`:''}.`); }
    function openRecipe(id){ const r=state.recipes.find(x=>x.id===id); if(!r)return; const p=project(); const added=p.recipeIds.includes(r.id); const steps=String(r.workflow||'').split('\n').filter(Boolean); const used=state.projects.filter(x=>x.recipeIds.includes(r.id)).length; const variations=r.variations||[]; const detail=$('#recipe-detail');detail.hidden=false;detail.innerHTML=`<div class="recipe-card-top"><div class="recipe-category">${escapeHtml(r.category)} recipe</div>${used?`<span class="recipe-used-badge">Used in ${used} project${used===1?'':'s'}</span>`:''}</div>${r.thumbnail?`<img class="recipe-detail-thumb" src="${r.thumbnail}" alt="${escapeHtml(r.title)}">`:''}<h2>${escapeHtml(r.title)}</h2><p>${escapeHtml(r.problem)}</p><h3>Workflow</h3><ul>${steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ul><h3>Recommended tools</h3><p>${escapeHtml(r.models||'—')}</p>${variations.length?`<h3>Saved Variations (${variations.length})</h3><div class="recipe-variation-list">${variations.map(v=>`<div class="recipe-variation" data-variation="${v.id}"><div class="recipe-variation-meta"><span>${escapeHtml(v.model||'')}</span><span>${escapeHtml(v.job||'')}</span></div><textarea readonly>${escapeHtml(v.text||'')}</textarea><div style="display:flex;gap:8px;margin-top:6px"><button class="btn" data-copy-variation="${v.id}">Copy</button><button class="btn danger" data-delete-variation="${v.id}">Delete</button></div></div>`).join('')}</div>`:''}<div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn ${added?'danger':'primary'}" id="attach-recipe">${added?'Remove from current project':'Attach to current project'}</button><button class="btn" id="edit-recipe">Edit Recipe</button><button class="btn danger" id="delete-recipe">Delete Recipe</button></div>`; $('#attach-recipe').onclick=()=>{const p=project();p.recipeIds=added?p.recipeIds.filter(x=>x!==r.id):[...p.recipeIds,r.id];persist();renderProject();openRecipe(r.id);renderRecipes();setStatus(added?'Recipe removed.':'Recipe attached to project.');}; $('#edit-recipe').onclick=()=>showRecipeModal(r); $('#delete-recipe').onclick=async()=>{if(!await confirmDialog(`Delete recipe "${r.title}"?`,'It will be removed from all projects.',{confirmLabel:'Delete Recipe'}))return; state.recipes=state.recipes.filter(x=>x.id!==r.id);state.projects.forEach(x=>x.recipeIds=x.recipeIds.filter(recipeId=>recipeId!==r.id));persist();renderProject();renderRecipes();detail.hidden=true;setStatus('Recipe deleted.');}; $$('[data-copy-variation]').forEach(btn=>btn.onclick=async()=>{const v=variations.find(x=>x.id===btn.dataset.copyVariation); if(!v)return; try{await navigator.clipboard.writeText(v.text||'');setStatus('Variation copied to clipboard.');}catch{setStatus('Could not copy automatically — select the text and copy manually.');}}); $$('[data-delete-variation]').forEach(btn=>btn.onclick=()=>{r.variations=(r.variations||[]).filter(x=>x.id!==btn.dataset.deleteVariation);persist();openRecipe(r.id);setStatus('Variation deleted.');}); detail.scrollIntoView({behavior:'smooth',block:'start'}); }
    async function chooseFolder(){ if(!window.showDirectoryPicker){ setStatus('Folder saving needs Chrome or Edge. Use Export Data here instead.'); return; } try { const handle=await window.showDirectoryPicker({mode:'readwrite'}); saveFolderHandle=handle; await rememberFolder(handle); const wrote=await writeFolderBackup(); setStatus(wrote?`Save folder selected: ${handle.name}`:'Folder selected. Click Save Project to allow writing.'); } catch(error) { if(error.name!=='AbortError')setStatus('Could not select save folder.'); } }
    function downloadJson(data,filename){ const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500); }
    function safeFilename(value,fallback){ return (value||fallback).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||fallback; }
    async function exportData(){ await saveProject(); downloadJson(backupPayload(),'art-equation-studio-data.json');setStatus('All application data exported with daily worksheets.'); }
    async function exportProject(){ await saveProject(); const p=project(); const crops=Object.values(state.reader.crops||{}).filter(crop=>crop.projectId===p.id); const cropKeys=new Set(crops.map(crop=>`${crop.path}::${crop.pageName}`)); const payload={app:'Art Equation Studio',exportType:'single-project',version:2,exportedAt:new Date().toISOString(),project:p,recipes:state.recipes.filter(recipe=>p.recipeIds.includes(recipe.id)),dailyWorksheets:dailyWorksheetEntries(p.id),references:{crops,bookmarks:Object.values(state.reader.bookmarks||{}).filter(bookmark=>cropKeys.has(`${bookmark.path}::${bookmark.pageName}`)),notes:Object.fromEntries(Object.entries(state.reader.notes||{}).filter(([key])=>cropKeys.has(key)))}}; downloadJson(payload,`${safeFilename(p.title,'art-equation-project')}-project.json`);setStatus('Current project exported with recipes, daily worksheets, and linked references.'); }
    async function importData(file){ if(!file)return; try { const imported=JSON.parse(await file.text()); if(imported.exportType==='single-project'&&imported.project){ if(!confirm(`Add project "${imported.project.title||'Untitled Project'}" and its linked recipes/references to this app?`))return; const incoming={...blankProject(),...imported.project,id:uid(),savedAt:Date.now()}; state.projects.unshift(incoming); (imported.recipes||[]).forEach(recipe=>{if(!state.recipes.some(existing=>existing.id===recipe.id))state.recipes.push(recipe);}); const crops=imported.references?.crops||[]; crops.forEach(crop=>{const id='crop-'+uid();state.reader.crops[id]={...crop,id,projectId:incoming.id,projectTitle:incoming.title||'Untitled Project'};}); restoreDailyWorksheets(imported.dailyWorksheets,incoming.id); currentId=incoming.id; persist(); await writeFolderBackup(); renderProject(); renderRecipes(); switchView('project-view'); setStatus('Project package imported.'); return; } if(!Array.isArray(imported.projects)||!Array.isArray(imported.recipes))throw new Error('Invalid project data'); if(!confirm('Replace the current browser data with this imported backup?'))return; state={projects:imported.projects.length?imported.projects:[blankProject()],recipes:imported.recipes.length?imported.recipes:defaults,currentId:imported.currentId,reader:{...emptyReaderMemory(),...(imported.reader||{})}}; clearDailyWorksheets(); restoreDailyWorksheets(imported.dailyWorksheets); currentId=state.projects.some(p=>p.id===state.currentId)?state.currentId:state.projects[0].id; persist(); await writeFolderBackup(); renderProject(); renderRecipes(); switchView('project-view'); setStatus('Backup imported.'); } catch { setStatus('That file is not a valid Art Equation backup.'); } finally { $('#import-file').value=''; } }
    function showRecipeModal(recipe=null){ editingRecipeId=recipe?.id||null; pendingRecipeThumbnail=undefined; $('#recipe-modal-title').textContent=recipe?'Edit Visual Recipe':'New Visual Recipe'; $('#new-recipe-title').value=recipe?.title||''; $('#new-recipe-category').value=recipe?.category||'Prompting'; $('#new-recipe-problem').value=recipe?.problem||''; $('#new-recipe-workflow').value=recipe?.workflow||''; $('#new-recipe-models').value=recipe?.models||''; const preview=$('#recipe-thumb-preview'); if(recipe?.thumbnail){preview.src=recipe.thumbnail;preview.style.display='block';$('#recipe-thumb-remove').hidden=false;}else{preview.src='';preview.style.display='none';$('#recipe-thumb-remove').hidden=true;} $('#recipe-modal').classList.add('open'); }
    $$('.tabs button').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
    $$('.recipe-nav button').forEach(b=>b.onclick=()=>{category=b.dataset.category;$$('.recipe-nav button').forEach(x=>x.classList.toggle('active',x===b));switchView('recipes-view');renderRecipes();});
    $('#open-settings').onclick=openSettings; $('#settings-close').onclick=()=>$('#settings-dialog').close(); $$('[data-settings-pane]').forEach(button=>button.onclick=()=>{ $$('.settings-nav button').forEach(entry=>entry.classList.toggle('active',entry===button)); $$('[data-settings-pane-body]').forEach(pane=>pane.classList.toggle('active',pane.dataset.settingsPaneBody===button.dataset.settingsPane)); }); $('#set-light-mode').onchange=event=>applyTheme(event.target.checked?'light':'dark'); $('#set-snap').onchange=event=>toggleBoardSnap(event.target.checked); $('#set-minimal').onchange=event=>toggleBoardMinimal(event.target.checked); $('#set-fisheye').onchange=event=>toggleBoardFisheye(event.target.checked); $('#board-color').onclick=event=>{ event.stopPropagation(); if($('#board-color-menu').classList.contains('open')){closeBoardColorMenu();return;} openBoardColorMenu(event.currentTarget,color=>{ const board=activeBoard(); if(color)board.color=color; else delete board.color; persist(); renderBoard(); setStatus(color?`Board tint set to ${color}.`:'Board tint removed.'); }); }; $('#board-color-grid').onclick=event=>{ const swatch=event.target.closest('[data-color-swatch]'); if(swatch)applyBoardColorPick(swatch.dataset.colorSwatch); }; $('#board-color-custom').onchange=event=>applyBoardColorPick(event.target.value); $('#board-color-none').onclick=()=>applyBoardColorPick(null); document.addEventListener('pointerdown',event=>{ const menu=$('#board-color-menu'); if(!menu.classList.contains('open'))return; if(menu.contains(event.target)||event.target.closest('#board-color'))return; closeBoardColorMenu(); });
    $('#save-project').onclick=saveProject; $('#new-project').onclick=newProject; $('#duplicate-project').onclick=duplicateProject; $('#delete-project').onclick=requestDelete; $('#choose-folder').onclick=chooseFolder; $('#import-json').onclick=()=>$('#import-file').click(); $('#import-file').onchange=e=>importData(e.target.files[0]); $('#export-project').onclick=exportProject; $('#export-json').onclick=exportData; $('#print-project').onclick=async()=>{await saveProject();window.print();}; $('#open-calendar').onclick=async()=>{await saveProject();const p=project();location.href=`project-calendar.html?project=${encodeURIComponent(p.id)}&title=${encodeURIComponent(p.title||'Untitled Project')}`;}; $('#recipe-search').oninput=renderRecipes; $('#project-search').oninput=renderProjectList; $('#project-sort').onchange=renderProjectList; $('#project-show-archived').onchange=renderProjectList; $('#archive-project').onclick=archiveProject;
    function closeTopDataMenu(){ const menu=$('#top-data-menu'); if(!menu||!menu.classList.contains('open'))return; menu.classList.remove('open'); $('#top-data-menu-toggle')?.setAttribute('aria-expanded','false'); }
    $('#top-data-menu-toggle').onclick=event=>{ event.stopPropagation(); const menu=$('#top-data-menu'); const open=menu.classList.toggle('open'); $('#top-data-menu-toggle').setAttribute('aria-expanded',open?'true':'false'); };
    $('#top-data-menu').addEventListener('click',event=>{ if(event.target.closest('button'))closeTopDataMenu(); });
    document.addEventListener('pointerdown',event=>{ const menu=$('#top-data-menu'); if(menu&&menu.classList.contains('open')&&!menu.contains(event.target)&&!event.target.closest('#top-data-menu-toggle'))closeTopDataMenu(); });
    document.addEventListener('keydown',event=>{ if(event.key==='Escape'){closeTopDataMenu(); closeBoardColorMenu();} });
    $('#new-board').onclick=newBoard; $('#back-to-project').onclick=closeSplitBoard; $('#rename-board').onclick=renameBoard; $('#board-title').onblur=commitBoardTitle; $('#board-title').onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();event.currentTarget.blur();} if(event.key==='Escape'){event.preventDefault();event.currentTarget.value=activeBoard().name;event.currentTarget.blur();}}; $('#choose-board-cover').onclick=()=>$('#board-cover-input').click(); $('#board-cover-input').onchange=event=>{chooseBoardCover(event.target.files[0]);event.target.value='';}; $('#duplicate-board').onclick=duplicateBoard; $('#delete-board').onclick=deleteBoard; $('#toggle-board-pip').onclick=toggleBoardPip; $('#new-board-group').onchange=event=>{ if(event.target.value){ addBoardGroup(event.target.value); event.target.value=''; } }; $('#rail-add-shape-rect').onclick=()=>toggleShapeTool('rect'); $('#rail-add-shape-oval').onclick=()=>toggleShapeTool('oval'); $('#rail-add-shape-line').onclick=()=>toggleShapeTool('line'); $('#rail-add-shape-arrow').onclick=()=>toggleShapeTool('arrow'); $('#compact-pack-board').onclick=compactPackBoard; $('#rail-toggle-connect').onclick=toggleConnectMode; $('#rail-toggle-fisheye').onclick=()=>toggleBoardFisheye(); $('#board-undo').onclick=undoBoard; $('#board-redo').onclick=redoBoard; $('#rail-board-undo').onclick=undoBoard; $('#rail-board-redo').onclick=redoBoard; $('#add-board-images').onclick=()=>$('#board-image-input').click(); $('#board-image-input').onchange=event=>{addBoardImages(event.target.files);event.target.value='';}; $('#add-board-videos').onclick=()=>$('#board-video-input').click(); $('#board-video-input').onchange=event=>{addBoardVideos(event.target.files);event.target.value='';}; $('#add-board-documents').onclick=()=>$('#board-document-input').click(); $('#board-document-input').onchange=event=>{addBoardDocuments(event.target.files);event.target.value='';}; $('#rail-add-board-link').onclick=addBoardLink; $('#texture-slot-input').onchange=event=>{const file=event.target.files[0];const pending=pendingTextureSlot;pendingTextureSlot=null;event.target.value='';if(pending&&file)relinkTextureSlot(pending.itemId,pending.slotKey,file);}; $('#toggle-board-focus').onclick=toggleBoardFocus; $('#board-zoom').oninput=event=>{activeBoard().zoom=Number(event.target.value);applyBoardView();persist();}; $('#fit-board').onclick=fitBoard; $('#board-canvas').onpointermove=moveBoardDrag; $('#board-canvas').onpointerup=endBoardDrag; $('#board-canvas').onpointercancel=endBoardDrag; ['dragenter','dragover','dragleave','drop'].forEach(type=>$('#board-canvas-wrap').addEventListener(type,dragBoardFiles)); $('#board-canvas-wrap').addEventListener('pointerdown',startBoardPan); $('#board-canvas-wrap').addEventListener('pointermove',moveBoardPan); $('#board-canvas-wrap').addEventListener('pointerup',endBoardPan); $('#board-canvas-wrap').addEventListener('pointercancel',endBoardPan); $('#board-canvas-wrap').addEventListener('wheel',zoomBoardAt,{passive:false}); $('#board-minimap').addEventListener('pointerdown',startMinimapPan); $('#board-minimap').addEventListener('pointermove',moveMinimapPan); $('#board-minimap').addEventListener('pointerup',endMinimapPan); $('#board-minimap').addEventListener('pointercancel',endMinimapPan); $('#split-divider').onpointerdown=beginSplitResize; $('#split-divider').onpointermove=resizeSplit; $('#split-divider').onpointerup=endSplitResize; $('#split-divider').onpointercancel=endSplitResize;
    $('#board-canvas-wrap').addEventListener('contextmenu',event=>{ event.preventDefault(); openCanvasContextMenu(event); });
    $('#ctx-group').onclick=()=>{closeBoardContextMenu();groupSelectedItems();};
    $('#ctx-ungroup').onclick=()=>{closeBoardContextMenu();ungroupSelectedItems();};
    $('#ctx-bring-front').onclick=()=>{closeBoardContextMenu();bringSelectedToFront();};
    $('#ctx-send-back').onclick=()=>{closeBoardContextMenu();sendSelectedToBack();};
    $('#ctx-duplicate').onclick=()=>{closeBoardContextMenu();duplicateSelectedItems();};
    $$('#board-context-menu [data-align]').forEach(button=>button.onclick=()=>{closeBoardContextMenu();alignSelectedItems(button.dataset.align);});
    $('#ctx-connector-curve').onclick=()=>{closeBoardContextMenu();toggleSelectedConnectorsCurved();};
    $('#ctx-connector-label').onclick=()=>{const id=[...selectedConnectorIds][0];closeBoardContextMenu();if(id)editConnectorLabel(id);};
    $('#ctx-connector-delete').onclick=()=>{closeBoardContextMenu();removeSelectedConnectors();};
    // Group context menu handlers
    $('#ctx-group-rename').onclick=()=>{const match=boardContextMenuItemId?.match(/^group:(.+)$/);if(match){closeBoardContextMenu();renameBoardGroup(match[1]);}};
    $('#ctx-group-cover').onclick=()=>{const match=boardContextMenuItemId?.match(/^group:(.+)$/);if(match){closeBoardContextMenu();chooseBoardCoverForGroup(match[1]);}};
    $('#ctx-group-color').onclick=()=>{const match=boardContextMenuItemId?.match(/^group:(.+)$/);if(match){closeBoardContextMenu();openGroupColorMenu(match[1]);}};
    $('#ctx-group-delete').onclick=()=>{const match=boardContextMenuItemId?.match(/^group:(.+)$/);if(match){closeBoardContextMenu();deleteBoardGroup(match[1]);}};
    $('#ctx-group-items').onclick=()=>{const match=boardContextMenuItemId?.match(/^group:(.+)$/);if(match){closeBoardContextMenu();toggleGroupItems(match[1]);}};
    $('#ctx-remove').onclick=()=>{closeBoardContextMenu();removeSelectedItems();};
    $('#ctx-flip-h').onclick=()=>{closeBoardContextMenu();$('#board-img-fliph').click();};
    $('#ctx-flip-v').onclick=()=>{closeBoardContextMenu();$('#board-img-flipv').click();};
    $('#ctx-rotate').onclick=()=>{closeBoardContextMenu();$('#board-img-rotate').click();};
    $('#ctx-grayscale').onclick=()=>{closeBoardContextMenu();$('#board-img-grayscale').click();};
    $('#ctx-connect').onclick=()=>{const id=boardContextMenuItemId;closeBoardContextMenu();if(id)startConnectFromContextMenu(id);};
    $('#ctx-flatten').onclick=()=>{closeBoardContextMenu();flattenSelectedImagesToGroup();};
    $('#ctx-erase').onclick=()=>{const id=[...selectedBoardItemIds][0];closeBoardContextMenu();if(id)openEraseModal(id);};
    $('#ctx-cutout').onclick=()=>{const id=[...selectedBoardItemIds][0];closeBoardContextMenu();if(id)openCutoutModal(id);};
    $('#ctx-warp').onclick=()=>{const id=[...selectedBoardItemIds][0];closeBoardContextMenu();if(id)openWarpModal(id);};
    $('#ctx-copy').onclick=()=>{closeBoardContextMenu();copyBoardSelection();};
    $('#ctx-paste').onclick=()=>{const point=contextMenuBoardPoint;closeBoardContextMenu();pasteBoardClipboard(point);};
    document.addEventListener('pointerdown',event=>{ const menu=$('#board-context-menu'); if(menu.classList.contains('open')&&!menu.contains(event.target))closeBoardContextMenu(); });
    $('#rail-add-board-note').onclick=addBoardNote;
    $$('[data-note-command]').forEach(button=>{button.onmousedown=event=>event.preventDefault();button.onclick=()=>runBoardNoteCommand(button.dataset.noteCommand);});
    /* The toolbar now lives inside #board-canvas-wrap (toolbar-reorg step 3), which
       has its own pointerdown handler for panning/marquee-select/drag. Stop that
       handler from ever seeing pointerdown events that originate on the toolbar,
       so clicking a format control never starts a pan or clears the live text
       selection before the click handler runs. */
    $('#note-format-toolbar').addEventListener('pointerdown',event=>event.stopPropagation());
    /* Toolbar inputs (font/size/color) take real focus, unlike the format buttons which
       preventDefault their mousedown — so the note's blur handler keeps the active-note state
       alive while focus is inside the toolbar (see the blur handler in renderBoard). This
       focusout restores the normal hide rules once focus leaves the toolbar for anywhere
       other than back into a note body. */
    $('#note-format-toolbar').addEventListener('focusout',event=>{ const to=event.relatedTarget; if(to&&($('#note-format-toolbar').contains(to)||to.closest?.('.board-note-body')))return; if(document.activeElement?.closest?.('.board-note-body'))return; if(activeBoardNoteId){activeBoardNoteId=null;const toolbar=$('#note-format-toolbar');if(toolbar){toolbar.hidden=!noteFormatToolbarVisible();positionNoteFormatToolbar();}} });
    /* Shape format bar: same pointerdown isolation as the note toolbar (its
       clicks must never start a pan or a shape-draw), plus the control wiring.
       Type changes also rename the item to keep the card footer honest. */
    $('#shape-format-toolbar').addEventListener('pointerdown',event=>event.stopPropagation());
    $('#shape-type-select').onchange=event=>{ const value=event.target.value; const board=activeBoard(); const shapes=board.items.filter(entry=>selectedBoardItemIds.has(entry.id)&&entry.kind==='shape'); if(!shapes.length)return; pushBoardHistory(); shapes.forEach(shape=>{shape.shapeType=value;shape.name=BOARD_SHAPE_KINDS[value]||'Shape';shape.flipX=false;shape.flipY=false;}); persist(); renderBoard(); setStatus(`${BOARD_SHAPE_KINDS[value]||'Shape'} applied to ${shapes.length} shape${shapes.length===1?'':'s'}.`); };
    $('#shape-fill').onchange=event=>setShapeStyle('fill',event.target.value);
    $('#shape-fill-none').onclick=()=>setShapeStyle('fill','none');
    $('#shape-stroke').onchange=event=>setShapeStyle('stroke',event.target.value);
    $('#shape-stroke-width').onchange=event=>{ const width=Math.max(1,Math.min(12,parseInt(event.target.value,10)||2)); setShapeStyle('strokeW',width); };
    populateFontSelect($('#note-font-select')); $('#note-font-select').value='Georgia';
    $('#note-font-select').onchange=event=>{ const value=event.target.value; if(value===OTHER_FONT_VALUE){ $('#note-font-custom').hidden=false; $('#note-font-custom').focus(); $('#note-font-custom').select(); return; } $('#note-font-custom').hidden=true; applyBoardNoteFont(value); };
    $('#note-font-custom').onchange=event=>{ const value=event.target.value.trim(); if(value)applyBoardNoteFont(value); };
    $('#note-size').onchange=event=>applyBoardNoteSize(event.target.value); $('#note-color').onchange=event=>runBoardNoteCommand('foreColor',event.target.value); $('#note-highlight').onchange=event=>runBoardNoteCommand('hiliteColor',event.target.value);
    $$('.note-swatch').forEach(button=>button.onclick=()=>{ const note=activeBoardNote(); if(!note){setStatus('Click into a note first.');return;} const color=button.dataset.noteBg; note.bgColor=color||undefined; const card=$(`[data-board-item="${note.id}"]`); if(card)card.style.backgroundColor=color||''; persist(); });
    $('#board-img-grayscale').onclick=()=>{ const items=activeBoard().items.filter(item=>selectedBoardItemIds.has(item.id)&&item.kind!=='note'); if(!items.length){setStatus('Select one or more image/video cards first.');return;} const turnOn=!items.every(item=>item.grayscale); updateSelectedMediaItems(item=>{item.grayscale=turnOn;}); setStatus(`Grayscale ${turnOn?'on':'off'}.`); };
    $('#board-img-fliph').onclick=()=>{ if(updateSelectedMediaItems(item=>{item.flipH=!item.flipH;}))setStatus('Flipped horizontally.'); };
    $('#board-img-flipv').onclick=()=>{ if(updateSelectedMediaItems(item=>{item.flipV=!item.flipV;}))setStatus('Flipped vertically.'); };
    $('#board-img-rotate').onclick=()=>{ if(updateSelectedMediaItems(item=>{item.rotate=((item.rotate||0)+90)%360;}))setStatus('Rotated 90°.'); };
    $('#board-img-opacity').onpointerdown=()=>{ if(activeBoard().items.some(item=>selectedBoardItemIds.has(item.id)&&item.kind!=='note'))pushBoardHistory(); };
    $('#board-img-opacity').oninput=event=>{ if(!activeBoard().items.some(item=>selectedBoardItemIds.has(item.id)&&item.kind!=='note'))return; updateSelectedMediaItems(item=>{item.opacity=Number(event.target.value);},false); };
    $('#board-img-opacity').onchange=()=>updateUndoRedoButtons();
    $('#note-load-webfont').onmousedown=event=>event.preventDefault(); $('#note-load-webfont').onclick=async()=>{ const current=$('#note-font-custom').hidden?$('#note-font-select').value:$('#note-font-custom').value; const name=await promptDialog('Load Google Font',current==='__other__'?'':current||'','Google Fonts family name (e.g. "Inter", "Playfair Display", "JetBrains Mono"):'); if(name)loadGoogleFontByName(name); };
    document.addEventListener('selectionchange',()=>{rememberBoardNoteSelection();syncBoardNoteToolbar();});
    $('#choose-manga-folder').onclick=chooseMangaFolder; $('#choose-cbr-files').onclick=()=>$('#cbr-file-input').click(); $('#cbr-file-input').onchange=e=>{chooseArchiveFiles(e.target.files,'CBR');e.target.value='';}; $('#choose-cbz-files').onclick=()=>$('#cbz-file-input').click(); $('#cbz-file-input').onchange=e=>{chooseArchiveFiles(e.target.files,'CBZ');e.target.value='';}; $('#close-reader').onclick=closeReader; $('#library-search').oninput=filterChapterGrid; $('#previous-page').onclick=()=>moveReader(-1); $('#next-page').onclick=()=>moveReader(1); $('#reader-mode').onchange=e=>{readerMode=e.target.value;renderReader();}; $('#reader-zoom').oninput=e=>{readerZoom=Number(e.target.value);applyReaderZoom();}; $('#bookmark-page').onclick=toggleBookmark; $('#save-crop').onclick=openCropModal; $('#page-note').oninput=savePageNote; $('#download-page').onclick=downloadCurrentPage;
    $('#new-recipe').onclick=()=>showRecipeModal(); $$('[data-close-modal]').forEach(b=>b.onclick=()=>$('#recipe-modal').classList.remove('open')); $('#recipe-modal').onclick=e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('open');};
    $('#recipe-thumb-choose').onclick=()=>$('#recipe-thumb-input').click();
    $('#recipe-thumb-input').onchange=async event=>{ const file=event.target.files[0]; event.target.value=''; if(!file)return; if(!/^image\/(png|jpeg|gif|webp)$/i.test(file.type)){setStatus('Choose a PNG, JPEG, GIF, or WebP image.');return;} try{ const dataUrl=await recipeThumbnailData(file); pendingRecipeThumbnail=dataUrl; const preview=$('#recipe-thumb-preview'); preview.src=dataUrl; preview.style.display='block'; $('#recipe-thumb-remove').hidden=false; }catch{ setStatus('Could not read that image.'); } };
    $('#recipe-thumb-remove').onclick=()=>{ pendingRecipeThumbnail=null; const preview=$('#recipe-thumb-preview'); preview.src=''; preview.style.display='none'; $('#recipe-thumb-remove').hidden=true; };
    $('#prompt-image-choose').onclick=()=>$('#prompt-image-input').click();
    $('#prompt-image-input').onchange=async event=>{ const file=event.target.files[0]; event.target.value=''; if(!file)return; if(!/^image\/(png|jpeg|gif|webp)$/i.test(file.type)){setStatus('Choose a PNG, JPEG, GIF, or WebP image.');return;} try{ const dataUrl=await recipeThumbnailData(file); promptImageDataUrl=dataUrl; const preview=$('#prompt-image-preview'); preview.src=dataUrl; preview.style.display='block'; $('#prompt-image-remove').hidden=false; }catch{ setStatus('Could not read that image.'); } };
    $('#prompt-image-remove').onclick=()=>{ promptImageDataUrl=null; const preview=$('#prompt-image-preview'); preview.src=''; preview.style.display='none'; $('#prompt-image-remove').hidden=true; };
    $('#prompt-image-from-board').onclick=openPromptImagePicker; $('#prompt-image-picker-cancel').onclick=()=>$('#prompt-image-picker-dialog').close();
    $('#generate-prompt').onclick=()=>{ const text=buildPromptTemplate($('#prompt-model').value,$('#prompt-job').value,$('#prompt-subject').value.trim(),$('#prompt-composition').value.trim(),$('#prompt-materials').value.trim(),$('#prompt-consistency').value.trim(),$('#prompt-constraints').value.trim(),!!promptImageDataUrl); $('#prompt-output').value=text; $('#prompt-output-wrap').hidden=false; $('#copy-prompt').hidden=false; $('#save-prompt-variation').hidden=false; setStatus('Prompt generated from local templates — no AI model was called.'); };
    $('#copy-prompt').onclick=async()=>{ const text=$('#prompt-output').value; if(!text)return; try{ await navigator.clipboard.writeText(text); setStatus('Prompt copied to clipboard.'); }catch{ setStatus('Could not copy automatically — select the text and copy manually.'); } };
    $('#save-prompt-variation').onclick=()=>{ const text=$('#prompt-output').value; if(!text)return; let r=state.recipes.find(x=>x.id==='recipe-prompt'); if(!r){ r={id:'recipe-prompt',title:'Model-Specific Prompt Pass',category:'Prompting',problem:'Convert a raw image idea into a prompt designed for the selected model and task.',workflow:'State the exact job: generate, edit, restyle, or unify.\nDescribe subject, composition, camera, materials, and constraints.\nSpecify what must stay consistent.\nGive the model a reference role instead of asking it to invent complex sequential logic.\nSave successful wording as a variation.',models:'GPT Image · Qwen Image · Nanobanana · Seedream Pro'}; state.recipes.push(r); } r.variations=r.variations||[]; r.variations.unshift({id:'variation-'+uid(),model:$('#prompt-model').value,job:$('#prompt-job').value,text,savedAt:Date.now()}); persist(); renderRecipes(); setStatus('Saved as a variation on the Model-Specific Prompt Pass recipe.'); };
    $('#create-recipe').onclick=()=>{const title=$('#new-recipe-title').value.trim(); if(!title)return; const existing=editingRecipeId?state.recipes.find(r=>r.id===editingRecipeId):null; const r=existing||{id:'recipe-'+uid()}; Object.assign(r,{title,category:$('#new-recipe-category').value,problem:$('#new-recipe-problem').value.trim()||'No problem description yet.',workflow:$('#new-recipe-workflow').value.trim()||'Define the workflow.',models:$('#new-recipe-models').value.trim()||'Add recommended tools'}); if(pendingRecipeThumbnail!==undefined){ if(pendingRecipeThumbnail===null)delete r.thumbnail; else r.thumbnail=pendingRecipeThumbnail; } if(!existing)state.recipes.unshift(r);persist();$('#recipe-modal').classList.remove('open');editingRecipeId=null;pendingRecipeThumbnail=undefined;renderRecipes();openRecipe(r.id);setStatus(existing?'Recipe updated.':'Recipe created.');};
    $$('[data-close-delete]').forEach(b=>b.onclick=()=>$('#delete-modal').classList.remove('open')); $('#delete-modal').onclick=e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('open');}; $('#confirm-delete').onclick=deleteProject;
    $$('[data-close-crop]').forEach(b=>b.onclick=()=>$('#crop-modal').classList.remove('open')); $('#crop-modal').onclick=e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('open');}; $('#create-crop').onclick=saveCrop;
    $('#note-focus-close').onclick=()=>closeNoteFocus(); $('#note-focus-modal').onclick=e=>{if(e.target===e.currentTarget)closeNoteFocus();}; document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#note-focus-modal').classList.contains('open')){event.preventDefault();closeNoteFocus();}});
    $('#crop-canvas').onpointerdown=e=>{cropPointerStart=canvasPoint(e);cropBox={x:cropPointerStart.x,y:cropPointerStart.y,w:0,h:0};e.currentTarget.setPointerCapture(e.pointerId);drawCropCanvas();}; $('#crop-canvas').onpointermove=e=>{if(!cropPointerStart)return;const point=canvasPoint(e);cropBox={x:Math.min(cropPointerStart.x,point.x),y:Math.min(cropPointerStart.y,point.y),w:Math.abs(point.x-cropPointerStart.x),h:Math.abs(point.y-cropPointerStart.y)};drawCropCanvas();}; $('#crop-canvas').onpointerup=e=>{cropPointerStart=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
    $('#erase-canvas').onpointerdown=e=>{erasePointerStart=eraseCanvasPoint(e);eraseBox={x:erasePointerStart.x,y:erasePointerStart.y,w:0,h:0};e.currentTarget.setPointerCapture(e.pointerId);drawEraseCanvas();}; $('#erase-canvas').onpointermove=e=>{if(!erasePointerStart)return;const point=eraseCanvasPoint(e);eraseBox={x:Math.min(erasePointerStart.x,point.x),y:Math.min(erasePointerStart.y,point.y),w:Math.abs(point.x-erasePointerStart.x),h:Math.abs(point.y-erasePointerStart.y)};drawEraseCanvas();}; $('#erase-canvas').onpointerup=e=>{erasePointerStart=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
    $$('[data-close-erase]').forEach(b=>b.onclick=()=>$('#erase-modal').classList.remove('open')); $('#erase-modal').onclick=e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('open');}; $('#run-erase').onclick=runEraseObject;
    $('#cutout-canvas').onpointerdown=e=>{cutoutPointerStart=cutoutCanvasPoint(e);cutoutBox={x:cutoutPointerStart.x,y:cutoutPointerStart.y,w:0,h:0};e.currentTarget.setPointerCapture(e.pointerId);drawCutoutCanvas();}; $('#cutout-canvas').onpointermove=e=>{if(!cutoutPointerStart)return;const point=cutoutCanvasPoint(e);cutoutBox={x:Math.min(cutoutPointerStart.x,point.x),y:Math.min(cutoutPointerStart.y,point.y),w:Math.abs(point.x-cutoutPointerStart.x),h:Math.abs(point.y-cutoutPointerStart.y)};drawCutoutCanvas();}; $('#cutout-canvas').onpointerup=e=>{cutoutPointerStart=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
    $$('[data-close-cutout]').forEach(b=>b.onclick=()=>$('#cutout-modal').classList.remove('open')); $('#cutout-modal').onclick=e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('open');}; $('#run-cutout').onclick=runCutoutObject;
    $$('[data-close-warp]').forEach(b=>b.onclick=()=>$('#warp-modal').classList.remove('open')); $('#warp-modal').onclick=e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('open');}; $('#run-warp').onclick=runWarpImage;
    $('#warp-reset').onclick=()=>{ warpHandles.forEach(hd=>{hd.x=hd.ox;hd.y=hd.oy;}); drawWarpCanvas(); };
    $('#warp-clear').onclick=()=>{ warpHandles=[]; warpDragHandleId=null; drawWarpCanvas(); };
    $('#warp-canvas').onpointerdown=e=>{ const point=warpCanvasPoint(e); const hit=warpHandleAt(point); if(hit){ warpDragHandleId=hit.id; } else { const id='wh'+uid(); warpHandles.push({id,ox:point.x,oy:point.y,x:point.x,y:point.y}); warpDragHandleId=id; } e.currentTarget.setPointerCapture(e.pointerId); drawWarpCanvas(); };
    $('#warp-canvas').onpointermove=e=>{ if(!warpDragHandleId)return; const point=warpCanvasPoint(e); const hd=warpHandles.find(h=>h.id===warpDragHandleId); if(!hd)return; hd.x=point.x; hd.y=point.y; drawWarpCanvas(); };
    $('#warp-canvas').onpointerup=e=>{ warpDragHandleId=null; if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId); drawWarpCanvas(); };
    $$('.view [data-field]').forEach(el=>el.addEventListener('input',()=>{const p=project();p[el.dataset.field]=el.value; if(['title','summary'].includes(el.dataset.field)){ $('#project-heading').textContent=p.title||'Untitled Project';$('#side-project-title').textContent=p.title||'Untitled Project';$('#inspector-title').textContent=p.title||'Untitled Project';$('#inspector-summary').textContent=p.summary||'Project details appear here as you work.'; }}));
    document.addEventListener('keydown',event=>{ if(!activeChapter||$('#crop-modal').classList.contains('open')||$('#erase-modal').classList.contains('open')||$('#cutout-modal').classList.contains('open')||$('#warp-modal').classList.contains('open')||$('#recipe-modal').classList.contains('open')||$('#delete-modal').classList.contains('open')||$('#confirm-dialog').open||$('#prompt-dialog').open||$('#board-link-dialog').open||$('#prompt-image-picker-dialog').open)return; const target=event.target; if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target.isContentEditable)return; const key=event.key.toLowerCase(); if(key==='arrowleft'){event.preventDefault();moveReader(-1);return;} if(key==='arrowright'){event.preventDefault();moveReader(1);return;} if(key==='v'){event.preventDefault();readerMode='vertical';$('#reader-mode').value='vertical';renderReader();return;} if(event.key==='1'){event.preventDefault();readerMode='single';$('#reader-mode').value='single';renderReader();return;} if(event.key==='2'){event.preventDefault();readerMode='spread';$('#reader-mode').value='spread';renderReader();return;} if(event.key==='+'||event.key==='='){event.preventDefault();readerZoom=Math.min(175,readerZoom+10);$('#reader-zoom').value=readerZoom;applyReaderZoom();return;} if(event.key==='-'||event.key==='_'){event.preventDefault();readerZoom=Math.max(50,readerZoom-10);$('#reader-zoom').value=readerZoom;applyReaderZoom();} });
    document.addEventListener('keydown',event=>{ if(!document.body.classList.contains('split-view'))return; const target=event.target; if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target.isContentEditable)return; if($('#crop-modal').classList.contains('open')||$('#erase-modal').classList.contains('open')||$('#cutout-modal').classList.contains('open')||$('#warp-modal').classList.contains('open')||$('#recipe-modal').classList.contains('open')||$('#delete-modal').classList.contains('open')||$('#note-focus-modal').classList.contains('open')||$('#confirm-dialog').open||$('#prompt-dialog').open||$('#board-link-dialog').open||$('#prompt-image-picker-dialog').open)return; if(event.key==='Escape'&&shapeTool){ event.preventDefault(); toggleShapeTool(shapeTool); return; } if(event.key==='Escape'&&$('#board-context-menu').classList.contains('open')){ event.preventDefault(); closeBoardContextMenu(); return; } if(event.key==='Escape'&&connectMode){ event.preventDefault(); if(connectPendingId){connectPendingId=null;renderBoard();setStatus('Connect canceled.');}else{toggleConnectMode();} return; } if(event.key==='Escape'&&document.body.classList.contains('board-focus')){ event.preventDefault(); toggleBoardFocus(); return; } if(event.key==='Delete'||event.key==='Backspace'){ if(waypointDrag){ event.preventDefault(); removeWaypoint(); return; } if(selectedConnectorIds.size){ event.preventDefault(); removeSelectedConnectors(); return; } if(!selectedBoardItemIds.size)return; event.preventDefault(); removeSelectedItems(); return; } if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='d'){ if(!selectedBoardItemIds.size)return; event.preventDefault(); duplicateSelectedItems(); return; } if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='c'){ if(!selectedBoardItemIds.size)return; event.preventDefault(); copyBoardSelection(); return; } if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='v'){ if(!boardClipboard||!boardClipboard.items.length)return; event.preventDefault(); pasteBoardClipboard(); return; } if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){ event.preventDefault(); if(event.shiftKey)redoBoard();else undoBoard(); return; } if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='y'){ event.preventDefault(); redoBoard(); return; } if(event.key==='ArrowUp'||event.key==='ArrowDown'||event.key==='ArrowLeft'||event.key==='ArrowRight'){ if(!selectedBoardItemIds.size)return; event.preventDefault(); const step=event.shiftKey?10:1; const dx=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0; const dy=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0; nudgeSelectedItems(dx,dy); } });
    document.addEventListener('paste',event=>{ if(!document.body.classList.contains('split-view'))return; const target=event.target; if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target.isContentEditable)return; if($('#crop-modal').classList.contains('open')||$('#erase-modal').classList.contains('open')||$('#cutout-modal').classList.contains('open')||$('#warp-modal').classList.contains('open')||$('#recipe-modal').classList.contains('open')||$('#delete-modal').classList.contains('open')||$('#note-focus-modal').classList.contains('open')||$('#confirm-dialog').open||$('#prompt-dialog').open||$('#board-link-dialog').open||$('#prompt-image-picker-dialog').open)return; const files=[...(event.clipboardData?.items||[])].filter(item=>item.type.startsWith('image/')).map(item=>item.getAsFile()).filter(Boolean); if(!files.length)return; event.preventDefault(); addBoardImages(files); });
    document.addEventListener('keydown',event=>{const target=event.target;if(event.code!=='Space'||target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target.isContentEditable||!document.body.classList.contains('split-view'))return;spaceHeld=true;event.preventDefault();applyBoardView();});
    document.addEventListener('keyup',event=>{if(event.code!=='Space')return;spaceHeld=false;if(document.body.classList.contains('split-view'))applyBoardView();});
    window.addEventListener('resize',()=>{if(activeChapter)applyReaderZoom();});
    applyTheme(localStorage.getItem('art-equation-studio-theme')||(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')); restoreFolder(); renderProject();
  })();
