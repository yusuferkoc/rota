/* ═══════════════════════════════════════════════════
   CHECKLIST JS
   Local Storage tabanlı yapılacaklar listesi
   ═══════════════════════════════════════════════════ */

const DEFAULT_LIST = [
  {
    cat: 'Resmi Belgeler',
    icon: 'fa-passport',
    items: [
      { id: '1', t: 'Pasaportlar (Geçerlilik tarihi kontrolü)', d: false },
      { id: '2', t: 'Schengen Vizeleri (4 Yetişkin, 2 Çocuk)', d: false },
      { id: '3', t: 'Çocukların kimlikleri', d: false },
      { id: '4', t: 'Seyahat Sağlık Sigortası poliçeleri (6 Kişi)', d: false },
      { id: '5', t: 'Otel ve Feribot rezervasyon çıktıları', d: false }
    ]
  },
  {
    cat: 'Araç Evrakları (Vito)',
    icon: 'fa-car',
    items: [
      { id: '6', t: 'Araç Ruhsatı (Orjinal)', d: false },
      { id: '7', t: 'Green Card (Uluslararası Sigorta)', d: false },
      { id: '8', t: 'Uluslararası Ehliyet / Yeni Tip Ehliyet', d: false },
      { id: '9', t: 'HGS Bakiyesi Kontrolü', d: false },
      { id: '10', t: 'Avrupa Otoyol Vinyetleri (BG, RO, vb. online alınacak)', d: false }
    ]
  },
  {
    cat: 'Araç İçi Hazırlık',
    icon: 'fa-toolbox',
    items: [
      { id: '11', t: 'Motor yağı, su ve lastik basıncı kontrolü', d: false },
      { id: '12', t: '6 adet Fosforlu Yelek (AB Zorunlu!)', d: false },
      { id: '13', t: 'İlk yardım çantası ve Yangın Söndürücü', d: false },
      { id: '14', t: 'Çocuklar için boyun yastığı ve battaniye', d: false },
      { id: '15', t: 'Soğutucu Çanta (Yemek/İçecek için)', d: false },
      { id: '16', t: 'Yedek ampul seti ve çekme halatı', d: false }
    ]
  },
  {
    cat: 'Kişisel & Sağlık',
    icon: 'fa-suitcase-medical',
    items: [
      { id: '17', t: 'Ağrı kesici, ateş düşürücü (Çocuklar için)', d: false },
      { id: '18', t: 'Yara bandı, yanık kremi', d: false },
      { id: '19', t: 'Sürekli kullanılan ilaçlar', d: false },
      { id: '20', t: 'Powerbank ve çoklu şarj kabloları', d: false }
    ]
  },
  {
    cat: 'Yolculuk & Yemek',
    icon: 'fa-utensils',
    items: [
      { id: '21', t: 'Termos (Çay/Kahve)', d: false },
      { id: '22', t: 'Çocuklar için yol atıştırmalıkları', d: false },
      { id: '23', t: 'Konserve veya uzun ömürlü yiyecekler (Helal tedbir)', d: false },
      { id: '24', t: 'Islak mendil, kağıt havlu ve çöp poşetleri', d: false }
    ]
  }
];

let listData = [];

function init() {
  loadTheme();
  loadData();
  render();

  document.getElementById('themeToggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    document.getElementById('themeToggle').innerHTML = next === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });
}

function loadTheme() {
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeToggle').innerHTML = t === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function loadData() {
  const saved = localStorage.getItem('travel_checklist');
  if (saved) {
    listData = JSON.parse(saved);
  } else {
    listData = JSON.parse(JSON.stringify(DEFAULT_LIST));
  }
}

function saveData() {
  localStorage.setItem('travel_checklist', JSON.stringify(listData));
  updateStats();
}

function toggleItem(catIdx, itemIdx) {
  listData[catIdx].items[itemIdx].d = !listData[catIdx].items[itemIdx].d;
  saveData();
  render();
}

function deleteItem(catIdx, itemIdx) {
  listData[catIdx].items.splice(itemIdx, 1);
  saveData();
  render();
}

function addItem(catIdx) {
  const input = document.getElementById(`in_${catIdx}`);
  const val = input.value.trim();
  if (!val) return;
  
  listData[catIdx].items.push({
    id: Date.now().toString(),
    t: val,
    d: false
  });
  input.value = '';
  saveData();
  render();
}

function updateStats() {
  let total = 0;
  let done = 0;
  
  listData.forEach(c => {
    c.items.forEach(i => {
      total++;
      if (i.d) done++;
    });
  });
  
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  
  document.getElementById('statText').innerText = `${done}/${total}`;
  document.getElementById('statFill').style.width = `${pct}%`;
  document.getElementById('statPct').innerText = `${pct}%`;
}

function render() {
  const wrap = document.getElementById('clWrap');
  
  wrap.innerHTML = listData.map((c, cIdx) => `
    <div class="cl-category">
      <div class="cl-cat-head">
        <span><i class="fas ${c.icon}" style="color:var(--accent); margin-right:8px;"></i> ${c.cat}</span>
      </div>
      <div class="cl-items">
        ${c.items.length === 0 ? '<div style="padding:10px 20px; color:var(--muted); font-size:0.85rem;">Bu kategoride madde yok.</div>' : ''}
        ${c.items.map((it, iIdx) => `
          <div class="cl-item ${it.d ? 'done' : ''}">
            <div class="cl-checkbox" onclick="toggleItem(${cIdx}, ${iIdx})"><i class="fas fa-check"></i></div>
            <div class="cl-text" onclick="toggleItem(${cIdx}, ${iIdx})">${it.t}</div>
            <button class="cl-del" onclick="deleteItem(${cIdx}, ${iIdx})" title="Sil"><i class="fas fa-trash"></i></button>
          </div>
        `).join('')}
      </div>
      <div class="cl-add">
        <input type="text" id="in_${cIdx}" placeholder="${c.cat} kategorisine yeni madde ekle..." onkeydown="if(event.key==='Enter') addItem(${cIdx})">
        <button onclick="addItem(${cIdx})">Ekle</button>
      </div>
    </div>
  `).join('');
  
  updateStats();
}

document.addEventListener('DOMContentLoaded', init);
