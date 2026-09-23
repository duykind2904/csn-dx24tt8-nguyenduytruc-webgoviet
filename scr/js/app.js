// ===== LOAD DỮ LIỆU TỪ ADMIN =====
function loadCustomDestinations() {
  try {
    const custom = JSON.parse(localStorage.getItem('goviet_custom') || '[]');
    custom.forEach(function (d) {
      if (!DESTINATIONS.find(function (x) { return x.id === d.id; })) {
        DESTINATIONS.push(d);
      }
    });
  } catch (e) {}
}

// ===== KHỞI TẠO SELECT DANH MỤC =====
function initCategories() {
  const select = document.getElementById('categorySelect');
  const cats = [];
  DESTINATIONS.forEach(function (d) {
    if (!cats.includes(d.category)) cats.push(d.category);
  });
  cats.sort();
  cats.forEach(function (c) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

// ===== STATE – trạng thái hiện tại của ứng dụng =====
const state = {
  view: 'home',       // trang đang hiện: home | destinations | detail | about
  query: '',          // từ khóa tìm kiếm
  region: '',         // miền đang lọc
  category: '',       // loại hình đang lọc
  sort: 'default',    // kiểu sắp xếp
  page: 1,            // trang hiện tại ở danh sách
  homePage: 1,        // trang hiện tại ở trang chủ
  perPage: 6,         // số card mỗi trang
  detailId: null      // id địa danh đang xem chi tiết
};

// ===== ROUTER – điều hướng theo URL hash =====
function parseHash() {
  const hash = location.hash.replace('#', '') || 'home';
  if (hash.startsWith('detail/')) {
    return { view: 'detail', id: parseInt(hash.split('/')[1]) };
  }
  if (hash === 'home' || hash === 'destinations' || hash === 'about') {
    return { view: hash };
  }
  return { view: 'home' };
}

function onRouteChange() {
  const route = parseHash();
  // Reset bộ lọc khi chuyển trang (trừ khi vào xem chi tiết)
  if (route.view !== state.view && route.view !== 'detail') {
    state.query = '';
    state.region = '';
    state.category = '';
    state.sort = 'default';
    state.page = 1;
  }
  state.view = route.view;
  state.detailId = route.id || null;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

window.addEventListener('hashchange', onRouteChange);
window.addEventListener('load', onRouteChange);

// ===== LỌC VÀ SẮP XẾP DỮ LIỆU =====
function getFiltered() {
  let list = DESTINATIONS.slice(); // sao chép mảng gốc

  if (state.query.trim()) {
    const q = state.query.toLowerCase();
    list = list.filter(function (d) {
      return d.name.toLowerCase().includes(q)
          || d.province.toLowerCase().includes(q)
          || d.description.toLowerCase().includes(q)
          || d.category.toLowerCase().includes(q);
    });
  }

  if (state.region) {
    list = list.filter(function (d) { return d.region === state.region; });
  }
  if (state.category) {
    list = list.filter(function (d) { return d.category === state.category; });
  }

  if (state.sort === 'name-asc') {
    list.sort(function (a, b) { return a.name.localeCompare(b.name, 'vi'); });
  } else if (state.sort === 'name-desc') {
    list.sort(function (a, b) { return b.name.localeCompare(a.name, 'vi'); });
  } else if (state.sort === 'rating-desc') {
    list.sort(function (a, b) { return b.rating - a.rating; });
  }

  return list;
}

function getPaged(list) {
  const start = (state.page - 1) * state.perPage;
  return list.slice(start, start + state.perPage);
}

// ===== TẠO CARD =====
function makeCard(d) {
  const node = document.getElementById('tpl-card').content.cloneNode(true);

  node.querySelector('article').addEventListener('click', function () {
    location.hash = 'detail/' + d.id;
  });

  const img = node.querySelector('.card-photo');
  if (d.images && d.images[0]) {
    img.src = d.images[0];
    img.alt = d.name;
  } else {
    img.remove();
    node.querySelector('.card-img').style.background = d.gradient;
  }

  node.querySelector('.card-badge').textContent = d.category;
  node.querySelector('.card-rating').textContent = '★ ' + d.rating;
  node.querySelector('.tag-region').textContent = 'Miền ' + d.region;
  node.querySelector('.card-name').textContent = d.name;
  node.querySelector('.card-province').textContent = '📍 ' + d.province;
  node.querySelector('.card-desc').textContent = d.description;
  node.querySelector('.card-time').textContent = '🗓 ' + d.bestTime;

  return node;
}

function fillGrid(containerId, list) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = '';
  list.forEach(function (d) { grid.appendChild(makeCard(d)); });
}

// ===== PHÂN TRANG =====
// containerId: id của div chứa nút | currentPage: trang hiện tại | total: tổng số trang | onChangePage: hàm gọi khi đổi trang
function buildPagination(containerId, currentPage, total, onChangePage) {
  const pag = document.getElementById(containerId);
  pag.innerHTML = '';
  if (total <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.textContent = '‹ Trước';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', function () { onChangePage(currentPage - 1); });
  pag.appendChild(prevBtn);

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button');
    btn.className = currentPage === i ? 'page-btn active' : 'page-btn';
    btn.textContent = i;
    btn.addEventListener('click', function () { onChangePage(i); });
    pag.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.textContent = 'Sau ›';
  nextBtn.disabled = currentPage === total;
  nextBtn.addEventListener('click', function () { onChangePage(currentPage + 1); });
  pag.appendChild(nextBtn);
}

function changePage(n) {
  const total = Math.ceil(getFiltered().length / state.perPage);
  if (n < 1 || n > total) return;
  state.page = n;
  renderDestinations();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function changeHomePage(n) {
  const total = Math.ceil(DESTINATIONS.length / state.perPage);
  if (n < 1 || n > total) return;
  state.homePage = n;
  renderHome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ẨN HIỆN TRANG =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(function (p) {
    p.classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

function updateNavActive() {
  document.querySelectorAll('.nav-link').forEach(function (a) {
    const href = a.getAttribute('href').replace('#', '');
    a.classList.toggle('active', href === state.view);
  });
}

function renderApp() {
  updateNavActive();
  closeMobile();
  if (state.view === 'home')              renderHome();
  else if (state.view === 'destinations') renderDestinations();
  else if (state.view === 'detail')       renderDetail(state.detailId);
  else if (state.view === 'about')        renderAbout();
  else                                    renderHome();
}

// ===== TRANG CHỦ =====
function renderHome() {
  showPage('page-home');
  document.getElementById('stat-total').textContent = DESTINATIONS.length;

  const sorted = DESTINATIONS.slice().sort(function (a, b) { return b.rating - a.rating; });
  const total = Math.ceil(sorted.length / state.perPage);
  const start = (state.homePage - 1) * state.perPage;
  const paged = sorted.slice(start, start + state.perPage);

  fillGrid('featured-grid', paged);
  buildPagination('home-pagination', state.homePage, total, changeHomePage);

  document.getElementById('heroForm').onsubmit = function (e) {
    e.preventDefault();
    const q = document.getElementById('heroInput').value.trim();
    if (q) { state.query = q; state.page = 1; }
    location.hash = 'destinations';
  };
}

// ===== TRANG DANH SÁCH =====
function renderDestinations() {
  showPage('page-destinations');

  // Đồng bộ các control với state hiện tại
  document.getElementById('searchInput').value = state.query;
  document.getElementById('regionSelect').value = state.region;
  document.getElementById('categorySelect').value = state.category;
  document.getElementById('sortSelect').value = state.sort;

  const filtered = getFiltered();
  const paged = getPaged(filtered);
  const totalPages = Math.ceil(filtered.length / state.perPage);
  const hasFilter = state.query || state.region || state.category || state.sort !== 'default';

  document.getElementById('result-count').textContent = filtered.length;
  document.getElementById('searchClear').classList.toggle('visible', state.query !== '');
  document.getElementById('resetBtn').classList.toggle('hidden', !hasFilter);

  const grid = document.getElementById('cards-grid');
  const emptyMsg = document.getElementById('empty-msg');

  if (paged.length > 0) {
    grid.classList.remove('hidden');
    emptyMsg.classList.add('hidden');
    fillGrid('cards-grid', paged);
  } else {
    grid.classList.add('hidden');
    emptyMsg.classList.remove('hidden');
  }

  buildPagination('pagination', state.page, totalPages, changePage);
  attachDestListeners();
}

function attachDestListeners() {
  const searchInput = document.getElementById('searchInput');

  searchInput.oninput = function () {
    state.query = searchInput.value;
    state.page = 1;
    renderDestinations();
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
  };

  document.getElementById('searchClear').onclick = function () {
    state.query = '';
    state.page = 1;
    renderDestinations();
  };

  document.getElementById('regionSelect').onchange = function () {
    state.region = this.value;
    state.page = 1;
    renderDestinations();
  };

  document.getElementById('categorySelect').onchange = function () {
    state.category = this.value;
    state.page = 1;
    renderDestinations();
  };

  document.getElementById('sortSelect').onchange = function () {
    state.sort = this.value;
    state.page = 1;
    renderDestinations();
  };

  document.getElementById('resetBtn').onclick = function () {
    state.query = '';
    state.region = '';
    state.category = '';
    state.sort = 'default';
    state.page = 1;
    renderDestinations();
  };
}

// ===== TRANG CHI TIẾT =====
function renderDetail(id) {
  showPage('page-detail');

  const d = DESTINATIONS.find(function (x) { return x.id === id; });
  if (!d) {
    document.getElementById('detail-name').textContent = 'Không tìm thấy địa danh';
    return;
  }

  const allImages = d.images || [];

  // Ảnh hero lớn
  const heroImg = document.getElementById('detail-hero-img');
  if (allImages[0]) {
    heroImg.src = allImages[0];
    heroImg.alt = d.name;
    heroImg.style.display = '';
    heroImg.style.cursor = 'zoom-in';
    heroImg.onclick = function () { openLightbox(allImages, 0); };
    document.getElementById('detail-hero').style.background = '';
  } else {
    heroImg.style.display = 'none';
    document.getElementById('detail-hero').style.background = d.gradient;
  }

  // Gallery ảnh nhỏ bên dưới hero
  const gallery = document.getElementById('detail-gallery');
  gallery.innerHTML = '';
  if (allImages.length > 1) {
    allImages.slice(1).forEach(function (src, i) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = d.name;
      img.className = 'gallery-img';
      img.loading = 'lazy';
      img.addEventListener('click', function () { openLightbox(allImages, i + 1); });
      gallery.appendChild(img);
    });
  }

  // Điền thông tin
  document.getElementById('detail-emoji').textContent = d.emoji;
  document.getElementById('detail-name').textContent = d.name;
  document.getElementById('detail-province').textContent = '📍 ' + d.province;
  document.getElementById('detail-region').textContent = 'Miền ' + d.region;
  document.getElementById('detail-category').textContent = d.category;
  document.getElementById('detail-besttime').textContent = d.bestTime;
  document.getElementById('detail-rating').textContent = d.rating + ' / 5.0';
  document.getElementById('detail-desc').innerHTML = d.detail;

  // Điểm nổi bật
  const hlContainer = document.getElementById('detail-highlights');
  hlContainer.innerHTML = '';
  d.highlights.forEach(function (h) {
    const span = document.createElement('span');
    span.className = 'highlight-item';
    span.textContent = '✓ ' + h;
    hlContainer.appendChild(span);
  });

  // Địa danh tương tự
  const related = DESTINATIONS.filter(function (x) {
    return x.id !== id && x.category === d.category;
  }).slice(0, 3);

  const relatedSection = document.getElementById('detail-related-section');
  if (related.length > 0) {
    relatedSection.classList.remove('hidden');
    fillGrid('detail-related', related);
  } else {
    relatedSection.classList.add('hidden');
  }
}

// ===== TRANG GIỚI THIỆU =====
function renderAbout() {
  showPage('page-about');
}

// ===== LIGHTBOX – xem ảnh phóng to =====
let lbImages = [];
let lbIndex = 0;

function openLightbox(images, index) {
  lbImages = images;
  lbIndex = index;
  showLightboxImage();
  document.getElementById('lightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

function showLightboxImage() {
  document.getElementById('lightbox-img').src = lbImages[lbIndex];
  const showNav = lbImages.length > 1;
  document.getElementById('lightboxPrev').style.display = showNav ? '' : 'none';
  document.getElementById('lightboxNext').style.display = showNav ? '' : 'none';
}

function initLightbox() {
  // Click ngoài ảnh → đóng
  document.getElementById('lightbox').addEventListener('click', function (e) {
    if (e.target === this) closeLightbox();
  });

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);

  document.getElementById('lightboxPrev').addEventListener('click', function () {
    lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
    showLightboxImage();
  });

  document.getElementById('lightboxNext').addEventListener('click', function () {
    lbIndex = (lbIndex + 1) % lbImages.length;
    showLightboxImage();
  });

  // Phím tắt: Escape đóng, ← → chuyển ảnh
  document.addEventListener('keydown', function (e) {
    if (document.getElementById('lightbox').classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft')  { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLightboxImage(); }
    if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; showLightboxImage(); }
  });
}

// ===== MOBILE MENU =====
function toggleMobile() {
  document.getElementById('mobileMenu').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}

function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

// ===== KHỞI ĐỘNG =====
loadCustomDestinations();
initCategories();
initLightbox();
