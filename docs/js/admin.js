const STORAGE_KEY = 'goviet_custom';

const GRADIENTS = [
  { name: 'Đại dương',  value: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { name: 'Núi rừng',   value: 'linear-gradient(135deg, #134e5e, #71b280)' },
  { name: 'Nhiệt đới',  value: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { name: 'Lễ hội',     value: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { name: 'Hoàng hôn',  value: 'linear-gradient(135deg, #f6d365, #fda085)' },
  { name: 'Hoàng gia',  value: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { name: 'Hang động',  value: 'linear-gradient(135deg, #0c3483, #a2b6df)' },
  { name: 'Thành phố',  value: 'linear-gradient(135deg, #fc5c7d, #6a3093)' },
  { name: 'Đảo xanh',   value: 'linear-gradient(135deg, #00b09b, #96c93d)' },
  { name: 'Hoàng kim',  value: 'linear-gradient(135deg, #d4380d, #faad14)' },
];

const EMOJIS = [
  '🏝️','🏔️','🏮','🏯','🦇','🌊','🌸','🏖️','🏛️','⛰️',
  '🗻','🗿','🌴','⛱️','🌆','🛶','💧','🌉','🏄','🐠',
  '🌋','🗺️','🎋','🌺','⛩️','🦅','🌾','🍃','🏕️','🎑',
];

const CATEGORIES = ['Thiên nhiên', 'Văn hóa', 'Di tích lịch sử', 'Biển đảo', 'Núi rừng', 'Thành phố'];

// ===== STORAGE =====
function getCustom() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveCustom(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function nextId() {
  const all = getCustom();
  return all.length ? Math.max(...all.map(d => d.id)) + 1 : 1000;
}

// ===== STATE =====
let pickedRating = 0;
let pickedEmoji = '📍';
let pickedGradient = GRADIENTS[0].value;

// ===== BUILD FORM =====
function buildForm() {
  document.getElementById('formBody').innerHTML = `
    <div class="fg-row">
      <div class="fg">
        <label>Tên địa danh <em>*</em></label>
        <input id="fName" type="text" placeholder="Vd: Vịnh Hạ Long" autocomplete="off" />
        <span class="ferr" id="eName"></span>
      </div>
      <div class="fg">
        <label>Tỉnh / Thành phố <em>*</em></label>
        <input id="fProvince" type="text" placeholder="Vd: Quảng Ninh" autocomplete="off" />
        <span class="ferr" id="eProvince"></span>
      </div>
    </div>

    <div class="fg-row">
      <div class="fg">
        <label>Khu vực <em>*</em></label>
        <select id="fRegion">
          <option value="">-- Chọn miền --</option>
          <option value="Bắc">Miền Bắc</option>
          <option value="Trung">Miền Trung</option>
          <option value="Nam">Miền Nam</option>
        </select>
        <span class="ferr" id="eRegion"></span>
      </div>
      <div class="fg">
        <label>Loại hình <em>*</em></label>
        <select id="fCategory">
          <option value="">-- Chọn loại --</option>
          ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <span class="ferr" id="eCategory"></span>
      </div>
    </div>

    <div class="fg">
      <label>Mô tả ngắn <em>*</em></label>
      <textarea id="fDesc" rows="2" placeholder="Một câu mô tả hấp dẫn hiển thị trên card..."></textarea>
      <span class="ferr" id="eDesc"></span>
    </div>

    <div class="fg">
      <label>Giới thiệu chi tiết</label>
      <textarea id="fDetail" rows="4" placeholder="Nội dung chi tiết: lịch sử, đặc điểm, trải nghiệm du lịch..."></textarea>
    </div>

    <div class="fg-row">
      <div class="fg">
        <label>Điểm nổi bật</label>
        <input id="fHighlights" type="text" placeholder="Điểm A, Điểm B, Điểm C" autocomplete="off" />
        <small>Cách nhau bằng dấu phẩy</small>
      </div>
      <div class="fg">
        <label>Thời điểm lý tưởng</label>
        <input id="fBestTime" type="text" placeholder="Vd: Tháng 3 – Tháng 9" autocomplete="off" />
      </div>
    </div>

    <div class="fg">
      <label>Đánh giá <em>*</em> — <span id="ratingLabel">chưa chọn</span></label>
      <div class="star-row" id="starRow">
        ${[1,2,3,4,5].map(n => `<button type="button" class="star" data-v="${n}">★</button>`).join('')}
        <span class="star-hint">Nhấn sao để chọn</span>
      </div>
      <span class="ferr" id="eRating"></span>
    </div>

    <div class="fg">
      <label>Biểu tượng — <span id="emojiLabel">${pickedEmoji}</span></label>
      <div class="emoji-grid" id="emojiGrid">
        ${EMOJIS.map(e => `<button type="button" class="ep ${e === pickedEmoji ? 'active' : ''}" data-e="${e}">${e}</button>`).join('')}
      </div>
    </div>

    <div class="fg">
      <label>Màu nền thẻ</label>
      <div class="grad-grid" id="gradGrid">
        ${GRADIENTS.map((g, i) => `
          <button type="button" class="gp ${i === 0 ? 'active' : ''}"
            data-g="${g.value}" title="${g.name}"
            style="background:${g.value}">${i === 0 ? '✓' : ''}</button>
        `).join('')}
      </div>
      <div class="grad-preview" id="gradPreview" style="background:${pickedGradient}">
        <span id="previewEmoji">${pickedEmoji}</span>
      </div>
    </div>
  `;

  bindFormEvents();
}

// ===== BIND EVENTS =====
function bindFormEvents() {
  // Star rating
  document.querySelectorAll('.star').forEach(btn => {
    btn.addEventListener('click', () => {
      pickedRating = +btn.dataset.v;
      document.getElementById('ratingLabel').textContent = `${pickedRating}.0 / 5.0`;
      document.getElementById('eRating').textContent = '';
      document.querySelectorAll('.star').forEach(s =>
        s.classList.toggle('on', +s.dataset.v <= pickedRating)
      );
    });
    btn.addEventListener('mouseenter', () => {
      const v = +btn.dataset.v;
      document.querySelectorAll('.star').forEach(s =>
        s.classList.toggle('hov', +s.dataset.v <= v)
      );
    });
    btn.addEventListener('mouseleave', () => {
      document.querySelectorAll('.star').forEach(s => s.classList.remove('hov'));
    });
  });

  // Emoji picker
  document.querySelectorAll('.ep').forEach(btn => {
    btn.addEventListener('click', () => {
      pickedEmoji = btn.dataset.e;
      document.getElementById('emojiLabel').textContent = pickedEmoji;
      document.getElementById('previewEmoji').textContent = pickedEmoji;
      document.querySelectorAll('.ep').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Gradient swatches
  document.querySelectorAll('.gp').forEach(btn => {
    btn.addEventListener('click', () => {
      pickedGradient = btn.dataset.g;
      document.getElementById('gradPreview').style.background = pickedGradient;
      document.querySelectorAll('.gp').forEach(b => {
        b.classList.remove('active');
        b.textContent = '';
      });
      btn.classList.add('active');
      btn.textContent = '✓';
    });
  });

  // Form submit
  document.getElementById('addForm').addEventListener('submit', handleSubmit);
}

// ===== VALIDATION =====
function validate() {
  const rules = [
    ['fName',     'eName',     'Vui lòng nhập tên địa danh'],
    ['fProvince', 'eProvince', 'Vui lòng nhập tỉnh / thành phố'],
    ['fRegion',   'eRegion',   'Vui lòng chọn khu vực'],
    ['fCategory', 'eCategory', 'Vui lòng chọn loại hình'],
    ['fDesc',     'eDesc',     'Vui lòng nhập mô tả ngắn'],
  ];
  let ok = true;
  rules.forEach(([fid, eid, msg]) => {
    const val = document.getElementById(fid).value.trim();
    document.getElementById(eid).textContent = val ? '' : msg;
    if (!val) ok = false;
  });
  document.getElementById('eRating').textContent = pickedRating ? '' : 'Vui lòng chọn đánh giá';
  if (!pickedRating) ok = false;
  return ok;
}

// ===== SUBMIT =====
function handleSubmit(e) {
  e.preventDefault();
  if (!validate()) {
    document.querySelector('.ferr:not(:empty)')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const highlights = document.getElementById('fHighlights').value
    .split(',').map(h => h.trim()).filter(Boolean);
  const desc = document.getElementById('fDesc').value.trim();

  const dest = {
    id: nextId(),
    name: document.getElementById('fName').value.trim(),
    province: document.getElementById('fProvince').value.trim(),
    region: document.getElementById('fRegion').value,
    category: document.getElementById('fCategory').value,
    description: desc,
    detail: document.getElementById('fDetail').value.trim() || desc,
    highlights: highlights.length ? highlights : ['Khám phá ngay'],
    bestTime: document.getElementById('fBestTime').value.trim() || 'Quanh năm',
    rating: pickedRating,
    emoji: pickedEmoji,
    gradient: pickedGradient,
    isCustom: true,
  };

  const list = getCustom();
  list.push(dest);
  saveCustom(list);

  toast(`✅ Đã thêm "${dest.name}" thành công!`, 'success');
  resetForm();
  renderList();
}

// ===== RESET =====
function resetForm() {
  pickedRating = 0;
  pickedEmoji = '📍';
  pickedGradient = GRADIENTS[0].value;
  buildForm();
}

// ===== RENDER LIST =====
function renderList() {
  const list = getCustom();
  document.getElementById('customCount').textContent = `${list.length} địa danh`;
  const el = document.getElementById('customList');

  if (!list.length) {
    el.innerHTML = `
      <div class="list-empty">
        <span class="list-empty-icon">📭</span>
        <p>Chưa có địa danh nào được thêm.<br>Điền form bên trái để bắt đầu.</p>
      </div>`;
    return;
  }

  el.innerHTML = list.map(d => `
    <div class="list-item">
      <div class="list-thumb" style="background:${d.gradient}">${d.emoji}</div>
      <div class="list-info">
        <div class="list-name">${d.name}</div>
        <div class="list-sub">📍 ${d.province} · Miền ${d.region} · ${d.category}</div>
        <div class="list-sub">⭐ ${d.rating}.0 / 5.0 · 🗓 ${d.bestTime}</div>
      </div>
      <button class="btn-del" onclick="confirmDelete(${d.id})" title="Xóa">🗑️</button>
    </div>
  `).join('');
}

// ===== DELETE =====
function confirmDelete(id) {
  const item = getCustom().find(d => d.id === id);
  if (!item) return;
  if (!confirm(`Xóa "${item.name}" khỏi danh sách?`)) return;
  saveCustom(getCustom().filter(d => d.id !== id));
  renderList();
  toast(`🗑️ Đã xóa "${item.name}"`, 'info');
}

// ===== TOAST =====
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3200);
}

// ===== INIT =====
buildForm();
renderList();
