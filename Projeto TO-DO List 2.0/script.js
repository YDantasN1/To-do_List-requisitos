(function() {
        const app = document.getElementById('app');
        const MAX_TASKS = 10;

        let state = {
            tasks: null,
            loading: true,
            showModal: false,
            addError: '',
            confirmDeleteId: null,
        };

        // ---------- storage helpers ----------
        function getOrNull(key, shared) {
            try {
                const r =  localStorage.getItem(key);
                return r ? JSON.parse(r) : null;
            } catch (e) {
                return null;
            }
        }
        function set(key, value, shared) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) { console.error('storage set failed', e); }
        }

        function init() {
            let tasks = getOrNull('tasks', true);
            if (!tasks) {
                tasks = [ ];
                 set('tasks', tasks, true);
            }
            tasks = tasks.filter((task) => {
                const createdAt = new Date(task.created_at);
                const resetTasks = new Date();
                console.log(createdAt.getFullYear());
                console.log(createdAt.getMonth()+1);
                console.log(createdAt.getDate())
                if (createdAt.getFullYear() > resetTasks.getFullYear()) {
                    return false;
                }
                if (createdAt.getMonth() > resetTasks.getMonth()) {
                    return false;
                }
                return createdAt.getDate() >= resetTasks.getDate();

            });
            state.tasks = tasks.sort((a, b) => a.order - b.order);
            state.loading = false;
            render();

        }

        function cryptoId() {
            return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        }

        function titleCase(str) {
            return str.replace(/(^|[\s-])\S/g, c => c.toUpperCase());
        }

        function todayLabel() {
            const d = new Date();
            const raw = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
            return titleCase(raw);
        }

        // ---------- icons ----------
        const icoList = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h9"/><circle cx="4" cy="6" r="1.4" fill="#fff" stroke="none"/><circle cx="4" cy="12" r="1.4" fill="#fff" stroke="none"/><path d="M3.2 17.5l1 1.4 2-2.4" /></svg>`;
        const icoTrash = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`;
        const icoPlus = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
        const icoCheck = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
        const icoAlert = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z"/></svg>`;
        const icoEdit = `<svg 
                                class="nome-grupo__icone"
                                fill="currentColor"
                                stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"
                                xmlns="http://www.w3.org/2000/svg"
                                width="17"
                                height="17"
                                viewBox="0 0 494.936 494.936"
                                xml:space="preserve"
                            >
                                <g>
                                    <g>
                                        <path 
                                            class="nome-grupo__icone"
                                            d="M389.844,182.85c-6.743,0-12.21,5.467-12.21,12.21v222.968c0,23.562-19.174,42.735-42.736,42.735H67.157
                                            c-23.562,0-42.736-19.174-42.736-42.735V150.285c0-23.562,19.174-42.735,42.736-42.735h267.741c6.743,0,12.21-5.467,12.21-12.21
                                            s-5.467-12.21-12.21-12.21H67.157C30.126,83.13,0,113.255,0,150.285v267.743c0,37.029,30.126,67.155,67.157,67.155h267.741
                                            c37.03,0,67.156-30.126,67.156-67.155V195.061C402.054,188.318,396.587,182.85,389.844,182.85z"/>
                                        <path d="M483.876,20.791c-14.72-14.72-38.669-14.714-53.377,0L221.352,229.944c-0.28,0.28-3.434,3.559-4.251,5.396l-28.963,65.069
                                            c-2.057,4.619-1.056,10.027,2.521,13.6c2.337,2.336,5.461,3.576,8.639,3.576c1.675,0,3.362-0.346,4.96-1.057l65.07-28.963
                                            c1.83-0.815,5.114-3.97,5.396-4.25L483.876,74.169c7.131-7.131,11.06-16.61,11.06-26.692
                                            C494.936,37.396,491.007,27.915,483.876,20.791z M466.61,56.897L257.457,266.05c-0.035,0.036-0.055,0.078-0.089,0.107
                                            l-33.989,15.131L238.51,247.3c0.03-0.036,0.071-0.055,0.107-0.09L447.765,38.058c5.038-5.039,13.819-5.033,18.846,0.005
                                            c2.518,2.51,3.905,5.855,3.905,9.414C470.516,51.036,469.127,54.38,466.61,56.897z"/>
                                    </g>
                                </g>
                            </svg>`

        // ---------- render ----------
        function render() {
            if (state.loading) {
                app.innerHTML = `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:14px;">Carregando…</div>`;
                return;
            }
            renderTasks();
        }

        function renderTasks() {
            const tasks = state.tasks.slice().sort((a, b) => a.order - b.order);
            const pendentes = tasks.filter(t => !t.completed);
            const concluidas = tasks.filter(t => t.completed);
            const atLimit = tasks.length >= MAX_TASKS;

            app.innerHTML = `
      <div class="task-screen">
        <div class="task-header">
          <div class="header-top">
            <div>
              <div class="header-date">${todayLabel()}</div>
              <div class="header-title">Minhas Tarefas</div>
            </div>
          </div>
          <div class="stats-row">
            <div class="stat-card"><div class="stat-num">${pendentes.length}</div><div class="stat-label">Pendentes</div></div>
            <div class="stat-card"><div class="stat-num">${concluidas.length}</div><div class="stat-label">Concluídas</div></div>
            <div class="stat-card"><div class="stat-num">${tasks.length}/${MAX_TASKS}</div><div class="stat-label">Total</div></div>
          </div>
        </div>

        <div class="task-body">
          <div class="section-row">
            <div class="section-label">A FAZER</div>
            <div class="section-hint">Arraste para reordenar</div>
          </div>
          <div class="task-list" id="taskListPending">
            ${pendentes.length ? pendentes.map(taskCardHtml).join('') : `<div class="empty-state">Nenhuma tarefa pendente.<br/>Toque em "Nova tarefa" para começar.</div>`}
          </div>

          <div class="fab-wrap">
            ${atLimit ? `<div class="limit-msg">Limite de ${MAX_TASKS} tarefas atingido. Exclua alguma para adicionar outra.</div>` : ''}
            <button class="fab-btn${atLimit ? ' disabled' : ''}" id="btnNovaTarefa" ${atLimit ? 'disabled' : ''}>${icoPlus} Nova tarefa</button>
          </div>

          ${concluidas.length ? `
          <div class="section-row" style="margin-top:20px;">
            <div class="section-label">CONCLUÍDAS</div>
          </div>
          <div class="task-list" id="taskListDone">
            ${concluidas.map(taskCardHtml).join('')}
          </div>` : ''}
        </div>

        <div class="toast" id="toast"></div>
        ${state.showEditId ? modalHtmlEdit() : ''}
        ${state.showModal ? modalHtml() : ''}
        ${state.confirmDeleteId ? confirmDeleteHtml() : ''}
      </div>
    `;

    if(!atLimit){
      document.getElementById('btnNovaTarefa').onclick = ()=>{ state.showModal = true; state.addError=''; render(); };
    }

    // task interactions
    tasks.forEach(t=>{
      const card = document.getElementById('card-'+t.id);
      if(!card) return;
      card.querySelector('.checkbox').onclick = ()=> onCheckboxClick(t.id);
      card.querySelector('.delete-btn').onclick = ()=> {
        state.confirmDeleteId = t.id;
        render();
      };
      card.querySelector('.edit-btn').onclick = ()=>{
          state.showEditId = t.id;
          render();
      };
      if(!t.completed){
        const info = card.querySelector('.task-info');
        info.addEventListener('pointerdown', (e)=> startDrag(e, t.id));
      }
    });

    if(state.showModal){
      wireModal();
    }
    if(state.confirmDeleteId){
      wireConfirmDelete();
    }
    if(state.showEditId){
        wireModalEdit();
    }
  }

  function taskCardHtml(t){
    return `
      <div class="task-card${t.completed?' completed':''}" id="card-${t.id}" data-id="${t.id}">
        <div class = "task-status">
        <div class="checkbox${t.completed?' checked':''}">${t.completed?icoCheck:''}</div>
        </div>
        <div class="task-info">
          <p class="task-title">${escapeHtml(t.title)}</p>
          <span class="task-time">${t.completed? 'Concluída às '+escapeHtml(t.time||'' ): ''}</span>
        </div>
        <div class = "task-actions">
        <button class = "edit-btn" title = "Editar tarefa">${icoEdit}</button>
        <button class="delete-btn" title="Excluir tarefa">${icoTrash}</button>
        </div>
      </div>
    `;
  }

  function escapeHtml(s){
    return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function persistTasks(){
    set('tasks', state.tasks, true);
  }

  function onCheckboxClick(id){
    const t = state.tasks.find(x=>x.id===id);
    if(!t) return;
    if(t.completed){
      t.completed = false;
      t.time = '';
    } else {
      t.completed = true;
      const hora = new Date();
      t.time = hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    persistTasks();
    render();
  }

  function deleteTask(id){
    state.tasks = state.tasks.filter(x=>x.id!==id);
    state.tasks.forEach((t,i)=>t.order=i);
    state.confirmDeleteId = null;
    persistTasks();
    render();
    showToast('Tarefa removida');
  }
  function showToast(msg){
    setTimeout(()=>{
      const el = document.getElementById('toast');
      if(!el) return;
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(()=> el.classList.remove('show'), 1600);
    }, 10);
  }

  // ---------- drag & drop reorder (fixed-position ghost, never escapes viewport) ----------
  let drag = null;

  function startDrag(e, id){
    e.preventDefault();
    const card = document.getElementById('card-'+id);
    const list = card.closest('.task-list');
    const rect = card.getBoundingClientRect();

    const ghost = card.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    document.body.appendChild(ghost);

    card.classList.add('placeholder-hidden');

    drag = {
      id,
      list,
      ghost,
      grabOffsetY: e.clientY - rect.top,
      order: Array.from(list.querySelectorAll('.task-card')).map(c => c.dataset.id),
    };

    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
    window.addEventListener('pointercancel', onDragEnd);
  }

  function onDragMove(e){
    if(!drag) return;

    // mantém o card fantasma sempre dentro da viewport (nunca "sai" da tela)
    const gh = drag.ghost.getBoundingClientRect();
    let top = e.clientY - drag.grabOffsetY;
    top = Math.max(8, Math.min(window.innerHeight - gh.height - 8, top));
    drag.ghost.style.top = top + 'px';

    // auto-scroll ao arrastar perto do topo/fundo (facilita no celular)
    const edge = 70;
    if (e.clientY < edge) {
        window.scrollBy(0, -12);
    } else if (e.clientY > window.innerHeight - edge) {
        window.scrollBy(0, 12);
    }

    // figure out which slot we're hovering over, based on the real (non-ghost) cards
    const cards = Array.from(drag.list.querySelectorAll('.task-card'));
    const pointerY = e.clientY;
    let targetIndex = drag.order.length - 1;
    for(let i=0;i<cards.length;i++){
      const r = cards[i].getBoundingClientRect();
      const mid = r.top + r.height/2;
      if(pointerY < mid){
        targetIndex = drag.order.indexOf(cards[i].dataset.id);
        break;
      }
    }
    const fromIndex = drag.order.indexOf(drag.id);
    if(targetIndex !== fromIndex){
      drag.order.splice(fromIndex,1);
      drag.order.splice(targetIndex,0,drag.id);
      drag.order.forEach(cardId=>{
        const el = document.getElementById('card-'+cardId);
        if(el) drag.list.appendChild(el);
      });
    }
  }

  function onDragEnd(){
    if(!drag) return;

    // pega a ordem das tarefas pendentes conforme ficou na tela
    const pendingOrder = drag.order;
    const doneIds = state.tasks.filter(t=>t.completed).map(t=>t.id);

    // pendentes primeiro (na nova ordem), concluídas depois (mantendo a ordem entre elas)
    [...pendingOrder, ...doneIds].forEach((id,i)=>{
      const t = state.tasks.find(x=>x.id===id);
      if(t) t.order = i;
    });
    state.tasks.sort((a,b)=>a.order-b.order);

    drag.ghost.remove();
    const realCard = document.getElementById('card-'+drag.id);
    if(realCard) realCard.classList.remove('placeholder-hidden');

    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
    window.removeEventListener('pointercancel', onDragEnd);

    persistTasks();
    drag = null;
  }

  // ---------- add task modal ----------
  function modalHtml(){
    return `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal-sheet">
          <h3 class="modal-title">Nova tarefa</h3>
          <label class="field-label">Título</label>
          <input class="field-input" id="newTitle" placeholder="Ex: Organizar prateleiras" maxlength="80" />
          <div class="error-msg">${state.addError}</div>
          <div class="modal-actions">
            <button class="btn-secondary" id="btnCancelar">Cancelar</button>
            <button class="btn-primary" id="btnSalvarTarefa">Adicionar tarefa</button>
          </div>
        </div>
      </div>
    `;
  }

  function wireModal(){
    document.getElementById('modalOverlay').addEventListener('click', (e)=>{
      if(e.target.id === 'modalOverlay'){ state.showModal=false; render(); }
    });
    document.getElementById('btnCancelar').onclick = ()=>{ state.showModal=false; render(); };
    document.getElementById('btnSalvarTarefa').onclick = addTask;
    const newTitle = document.getElementById('newTitle');
    newTitle.focus();
    // capitaliza a primeira letra automaticamente enquanto o usuário digita
    newTitle.addEventListener('input', () => {
        const start = newTitle.selectionStart;
        const end = newTitle.selectionEnd;
        const v = newTitle.value;
        newTitle.value = v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
        newTitle.setSelectionRange(start, end);
    });
    newTitle.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
  }

  function addTask(){
    if(state.tasks.length >= MAX_TASKS){
      state.addError = `Limite de ${MAX_TASKS} tarefas atingido.`;
      render();
      return;
    }
    let title = document.getElementById('newTitle').value.trim();
    if(!title){
      state.addError = 'Digite um título para a tarefa.';
      render();
      return;
    }
    title = title.substring(0, 1).toUpperCase()+title.substring(1);
    state.tasks.push({
        id: cryptoId(),
        title,
        time: '',
        created_at: new Date(),
        completed:false,
        order: state.tasks.length
    });
    state.showModal = false;
    state.addError = '';
    persistTasks();
    render();
    showToast('Tarefa adicionada');
  }
  // editar task modal
    function modalHtmlEdit(){
        const tarefa = state.tasks.find((task) => task.id === state.showEditId);
      return `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal-sheet">
          <h3 class="modal-title">Editar tarefa</h3>
          <label class="field-label">Título</label>
          <input class="field-input" id="newTitle" value = "${tarefa.title}" placeholder="Ex: Organizar prateleiras" maxlength="80" />
          <div class="error-msg">${state.addError}</div>
          <div class="modal-actions">
            <button class="btn-secondary" id="btnCancelar">Cancelar</button>
            <button class="btn-primary" id="btnAtualizarTarefa">Atualizar tarefa</button>
          </div>
        </div>
      </div>
    `;
    }
    function wireModalEdit(){
        document.getElementById('modalOverlay').addEventListener('click', (e)=>{
            if(e.target.id === 'modalOverlay'){ state.showEditId=undefined; render(); }
        });
        document.getElementById('btnCancelar').onclick = ()=>{ state.showEditId=undefined; render(); };
        document.getElementById('btnAtualizarTarefa').onclick = updateTask;
        const newTitle = document.getElementById('newTitle');
        newTitle.focus();
        // capitaliza a primeira letra automaticamente enquanto o usuário digita
        newTitle.addEventListener('input', () => {
            const start = newTitle.selectionStart;
            const end = newTitle.selectionEnd;
            const v = newTitle.value;
            newTitle.value = v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
            newTitle.setSelectionRange(start, end);
        });
        newTitle.addEventListener('keydown', e => { if (e.key === 'Enter') updateTask(); });
    }
    function updateTask(){

        let title = document.getElementById('newTitle').value.trim();
        if(!title){
            state.addError = 'Digite um título para a tarefa.';
            render();
            return;
        }
        title = title.substring(0, 1).toUpperCase()+title.substring(1);
        const index = state.tasks.findIndex((task) => task.id === state.showEditId);
        state.tasks[index].title = title;
        state.showEditId = undefined;
        state.addError = '';
        persistTasks();
        render();
        showToast('Tarefa atualizada');
    }


  // ---------- delete confirmation modal ----------
  function confirmDeleteHtml(){
    const t = state.tasks.find(x=>x.id===state.confirmDeleteId);
    const title = t ? escapeHtml(t.title) : 'esta tarefa';
    return `
      <div class="modal-overlay" id="confirmOverlay">
        <div class="modal-sheet confirm-sheet">
          <div class="confirm-icon">${icoAlert}</div>
          <h3 class="modal-title" style="text-align:center;">Excluir tarefa?</h3>
          <p class="confirm-text">Tem certeza que deseja excluir "<b>${title}</b>"? Essa ação não pode ser desfeita.</p>
          <div class="modal-actions">
            <button class="btn-secondary" id="btnCancelDelete">Cancelar</button>
            <button class="btn-danger" id="btnConfirmDelete">Excluir</button>
          </div>
        </div>
      </div>
    `;
  }

  function wireConfirmDelete(){
    document.getElementById('confirmOverlay').addEventListener('click', (e)=>{
      if(e.target.id === 'confirmOverlay'){ state.confirmDeleteId=null; render(); }
    });
    document.getElementById('btnCancelDelete').onclick = ()=>{ state.confirmDeleteId=null; render(); };
    document.getElementById('btnConfirmDelete').onclick = ()=> deleteTask(state.confirmDeleteId);
  }

  init();
})();
