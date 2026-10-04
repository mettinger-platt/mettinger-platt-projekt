const entriesEl = document.querySelector('#entries');
const statusEl = document.querySelector('#status');
const searchEl = document.querySelector('#search');
const form = document.querySelector('#entryForm');
const formMsg = document.querySelector('#formMsg');
const imageInput = document.querySelector('#imageInput');
const previewWrap = document.querySelector('#previewWrap');
const preview = document.querySelector('#preview');
const removeImage = document.querySelector('#removeImage');

let entries = [];

function esc(s=''){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function render(filter=''){
  const q = filter.trim().toLowerCase();
  const list = entries.filter(e =>
    [e.german,e.platt,e.note,e.period].filter(Boolean).some(v => v.toLowerCase().includes(q))
  );

  if(!list.length){
    entriesEl.innerHTML = '';
    statusEl.textContent = q ? 'Keine passenden Einträge gefunden.' : 'Noch keine freigegebenen Einträge.';
    return;
  }

  statusEl.textContent = `${list.length} ${list.length === 1 ? 'Eintrag' : 'Einträge'}`;
  entriesEl.innerHTML = list.map(e => `
    <article class="card">
      ${e.image_key ? `<img loading="lazy" src="/images/${encodeURIComponent(e.image_key)}" alt="Bild zu ${esc(e.german)}">` : ''}
      <div class="card-body">
        <h3 class="word">${esc(e.german)}</h3>
        <div class="translation">${esc(e.platt)}</div>
        ${e.note ? `<p>${esc(e.note)}</p>` : ''}
        <div class="meta">
          ${e.period ? `${esc(e.period)}` : ''}
          ${e.period && e.submitter ? ' · ' : ''}
          ${e.submitter ? `Beitrag von ${esc(e.submitter)}` : ''}
        </div>
      </div>
    </article>
  `).join('');
}

async function loadEntries(){
  statusEl.textContent = 'Wörterbuch wird geladen …';
  try{
    const res = await fetch('/api/entries');
    if(!res.ok) throw new Error('Laden fehlgeschlagen');
    entries = await res.json();
    render();
  }catch(err){
    statusEl.textContent = 'Das Wörterbuch konnte gerade nicht geladen werden.';
  }
}

searchEl.addEventListener('input', e => render(e.target.value));

imageInput.addEventListener('change', () => {
  const file = imageInput.files?.[0];
  if(!file){ previewWrap.classList.add('hidden'); return; }
  if(file.size > 5 * 1024 * 1024){
    alert('Das Bild ist größer als 5 MB.');
    imageInput.value = '';
    previewWrap.classList.add('hidden');
    return;
  }
  preview.src = URL.createObjectURL(file);
  previewWrap.classList.remove('hidden');
});

removeImage.addEventListener('click', () => {
  imageInput.value = '';
  preview.removeAttribute('src');
  previewWrap.classList.add('hidden');
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  formMsg.textContent = 'Beitrag wird übertragen …';
  const data = new FormData(form);

  try{
    const res = await fetch('/api/entries', {method:'POST', body:data});
    const payload = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(payload.error || 'Übertragung fehlgeschlagen');

    form.reset();
    previewWrap.classList.add('hidden');
    formMsg.textContent = 'Vielen Dank! Der Beitrag wurde gespeichert und wartet auf Freigabe.';
  }catch(err){
    formMsg.textContent = err.message || 'Beim Absenden ist ein Fehler aufgetreten.';
  }
});

loadEntries();
