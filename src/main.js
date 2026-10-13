// ==========================================================================
// Ерекше білім беру қажеттіліктері бар балалардың диагностикасы
// Негізгі клиенттік логика
// ==========================================================================

import bookContent from './data/book_content.json';
import tocData from './data/toc.json';
import assessmentData from './data/assessment.json';
import methodicalData from './data/methodical.json';
import authorData from './data/author.json';
import prefaceData from './data/preface.json';

const state = {
  currentRoute: 'cover',
  theme: localStorage.getItem('book3_theme') || 'paper',
  fontSize: localStorage.getItem('book3_fontsize') || 'md',
  sidebarOpen: window.innerWidth > 860,
  specialFilter: 'all',
  specialSearch: ''
};

const elements = {
  readingProgress: document.getElementById('readingProgress'),
  readingContainer: document.getElementById('readingContainer'),
  sidebar: document.getElementById('sidebar'),
  sidebarBackdrop: document.getElementById('sidebarBackdrop'),
  closeSidebarBtn: document.getElementById('closeSidebarBtn'),
  tocNav: document.getElementById('tocNav'),
  sidebarFilterInput: document.getElementById('sidebarFilterInput'),
  toggleSidebarBtn: document.getElementById('toggleSidebarBtn'),
  brandHomeBtn: document.getElementById('brandHomeBtn'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIcon: document.getElementById('themeIcon'),
  fontDecBtn: document.getElementById('fontDecBtn'),
  fontIncBtn: document.getElementById('fontIncBtn'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  openSearchBtn: document.getElementById('openSearchBtn'),
  searchModal: document.getElementById('searchModal'),
  closeSearchModalBtn: document.getElementById('closeSearchModalBtn'),
  globalSearchInput: document.getElementById('globalSearchInput'),
  searchResults: document.getElementById('searchResults'),
  prefaceModalBtn: document.getElementById('prefaceModalBtn'),
  prefaceModal: document.getElementById('prefaceModal'),
  prefaceModalBody: document.getElementById('prefaceModalBody'),
  closePrefaceModalBtn: document.getElementById('closePrefaceModalBtn'),
  authorModalBtn: document.getElementById('authorModalBtn'),
  authorModal: document.getElementById('authorModal'),
  authorModalBody: document.getElementById('authorModalBody'),
  closeAuthorModalBtn: document.getElementById('closeAuthorModalBtn'),
  navTabs: document.querySelectorAll('.nav-tab-btn')
};

function openSidebar() {
  elements.sidebar.classList.remove('collapsed');
  if (elements.sidebarBackdrop && window.innerWidth <= 860) {
    elements.sidebarBackdrop.classList.add('active');
  }
}

function closeSidebar() {
  elements.sidebar.classList.add('collapsed');
  if (elements.sidebarBackdrop) {
    elements.sidebarBackdrop.classList.remove('active');
  }
}

function toggleSidebar() {
  if (elements.sidebar.classList.contains('collapsed')) {
    openSidebar();
  } else {
    closeSidebar();
  }
}

// --------------------------------------------------------------------------
// Тақырып және қаріп
// --------------------------------------------------------------------------
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('book3_theme', theme);
  const icons = { paper: '☀️', sepia: '📜', dark: '🌙' };
  if (elements.themeIcon) elements.themeIcon.textContent = icons[theme] || '☀️';
}

function cycleTheme() {
  const themes = ['paper', 'sepia', 'dark'];
  const next = themes[(themes.indexOf(state.theme) + 1) % themes.length];
  applyTheme(next);
}

function applyFontSize(size) {
  state.fontSize = size;
  document.documentElement.setAttribute('data-size', size);
  localStorage.setItem('book3_fontsize', size);
}

function changeFontSize(delta) {
  const sizes = ['sm', 'md', 'lg', 'xl'];
  let idx = sizes.indexOf(state.fontSize) + delta;
  if (idx >= 0 && idx < sizes.length) {
    applyFontSize(sizes[idx]);
  }
}

// --------------------------------------------------------------------------
// Сайдбар (TOC)
// --------------------------------------------------------------------------
function renderTOC(filter = '') {
  elements.tocNav.innerHTML = '';
  const search = filter.toLowerCase().trim();

  // Негізгі тараулар
  const items = tocData.filter(item => {
    return !search || item.title.toLowerCase().includes(search) || item.shortTitle.toLowerCase().includes(search);
  });

  items.forEach(item => {
    const link = document.createElement('a');
    link.className = `toc-item-link ${state.currentRoute === item.id ? 'active' : ''}`;
    link.href = `#${item.id}`;
    link.innerHTML = `
      <span class="toc-item-badge">${item.shortTitle}</span>
      <span>${item.title.replace(item.shortTitle, '').replace(/^[.:\s-]+/, '').trim() || item.title}</span>
    `;
    elements.tocNav.appendChild(link);
  });

  // Тұрақты арнайы бөлімдер пункттері
  const divider = document.createElement('div');
  divider.style.borderTop = '1px solid var(--border)';
  divider.style.margin = '0.5rem 0';
  elements.tocNav.appendChild(divider);

  const assessLink = document.createElement('a');
  assessLink.className = `toc-item-link ${state.currentRoute === 'assessment' ? 'active' : ''}`;
  assessLink.href = '#assessment';
  assessLink.innerHTML = `
    <span class="toc-item-badge" style="color: var(--accent);">📊</span>
    <span style="font-weight: 600; color: var(--accent);">Бағалау және рефлексия (${assessmentData.count})</span>
  `;
  elements.tocNav.appendChild(assessLink);

  const methodLink = document.createElement('a');
  methodLink.className = `toc-item-link ${state.currentRoute === 'methodical' ? 'active' : ''}`;
  methodLink.href = '#methodical';
  methodLink.innerHTML = `
    <span class="toc-item-badge" style="color: var(--badge-method);">💡</span>
    <span style="font-weight: 600; color: var(--badge-method);">Әдістемелік нұсқау (${methodicalData.count})</span>
  `;
  elements.tocNav.appendChild(methodLink);

  const files = document.createElement('div');
  files.className = 'toc-group';
  files.style.marginTop = '0.75rem';
  files.innerHTML = `
    <div class="toc-group-title">Түпнұсқа файлдар</div>
    <a class="toc-item-link" href="${encodeURI('./originals/учебник.docx')}" download><span class="toc-item-badge">DOCX</span><span>Оқулық (учебник.docx)</span></a>
    <a class="toc-item-link" href="${encodeURI('./originals/алғы сөз.txt')}" target="_blank" rel="noopener"><span class="toc-item-badge">TXT</span><span>Алғы сөз</span></a>
    <a class="toc-item-link" href="${encodeURI('./originals/автор.txt')}" target="_blank" rel="noopener"><span class="toc-item-badge">TXT</span><span>Автор туралы</span></a>
  `;
  elements.tocNav.appendChild(files);
}

// --------------------------------------------------------------------------
// Басты бет (Cover Hero)
// --------------------------------------------------------------------------
function renderCoverPage() {
  elements.readingContainer.innerHTML = `
    <div class="cover-hero">
      <div class="cover-ministry">
        Қазақстан Республикасы білім және ғылым министрлігі
      </div>

      <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid var(--border); box-shadow: var(--shadow-sm); margin: -0.25rem 0;">
        <img src="./assets/images/logo.jpg" alt="Логотип" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>

      <h1 class="cover-title">
        ЕРЕКШЕ БІЛІМ БЕРУ ҚАЖЕТТІЛІКТЕРІ БАР БАЛАЛАРДЫҢ ПСИХОЛОГИЯЛЫҚ-ПЕДАГОГИКАЛЫҚ ДИАГНОСТИКАСЫ
      </h1>

      <div class="cover-author">
        ${authorData.name}
      </div>

      <div class="cover-place">
        Ақтөбе, 2025 ж.
      </div>

      <div class="cover-actions">
        <a href="#ch1" class="btn-primary">
          Оқулыққа кіру →
        </a>
        <a href="./originals/учебник.docx" download class="btn-primary" style="background-color: #2563eb;">
          📥 Түпнұсқа DOCX жүктеу (1.8 МБ)
        </a>
        <button id="coverPrefaceBtn" class="btn-secondary">
          📖 Алғы сөз
        </button>
        <button id="coverAuthorBtn" class="btn-secondary">
          👤 Автор туралы
        </button>
      </div>

      <div class="cover-actions" style="margin-top: 0.5rem;">
        <a href="#assessment" class="btn-secondary" style="border-color: var(--accent); color: var(--accent);">
          📊 Бағалау & Рефлексия бөлімі (${assessmentData.count})
        </a>
        <a href="#methodical" class="btn-secondary" style="border-color: var(--badge-method); color: var(--badge-method);">
          💡 Әдістемелік нұсқау бөлімі (${methodicalData.count})
        </a>
      </div>

      <div class="cover-meta" style="margin-top: 1.5rem;">
        <div>📚 <strong>12</strong> Негізгі бөлім мен тарау</div>
        <div>📊 <strong>${assessmentData.count}</strong> Бағалау материалы</div>
        <div>💡 <strong>${methodicalData.count}</strong> Әдістемелік нұсқаулық</div>
        <div>🖼 <strong>15</strong> Схема мен сурет</div>
      </div>
    </div>
  `;

  document.getElementById('coverPrefaceBtn')?.addEventListener('click', openPrefaceModal);
  document.getElementById('coverAuthorBtn')?.addEventListener('click', openAuthorModal);
}

// --------------------------------------------------------------------------
// Оқу парағы (Section Reader)
// --------------------------------------------------------------------------
function renderSectionPage(sectionId, scrollToPNum = null) {
  const section = bookContent.find(s => s.id === sectionId);
  if (!section) {
    elements.readingContainer.innerHTML = `<div class="cover-hero"><h2>Тарау табылмады</h2><a href="#cover" class="btn-primary">Басты бетке оралу</a></div>`;
    return;
  }

  const currentIndex = tocData.findIndex(item => item.id === sectionId);
  const prevSection = currentIndex > 0 ? tocData[currentIndex - 1] : null;
  const nextSection = currentIndex < tocData.length - 1 ? tocData[currentIndex + 1] : null;

  elements.readingContainer.innerHTML = `
    <article class="article-container">
      <header class="article-header">
        <span class="article-category-badge">${section.shortTitle}</span>
        <h1 class="article-title">${section.title}</h1>
        <div class="article-meta">
          <span>📖 ~${Math.max(3, Math.round(section.numParagraphs / 6))} минуттық оқу</span>
          <span>Абзац саны: ${section.numParagraphs}</span>
        </div>
      </header>

      <div class="article-body">
        ${section.contentHtml}
      </div>

      <nav class="chapter-navigation" aria-label="Бөлімдер бойынша шарлау">
        ${prevSection ? `
          <a href="#${prevSection.id}" class="nav-card">
            <span class="nav-card-label">← Алдыңғы тарау</span>
            <span class="nav-card-title">${prevSection.shortTitle}: ${prevSection.title}</span>
          </a>
        ` : '<div></div>'}

        ${nextSection ? `
          <a href="#${nextSection.id}" class="nav-card" style="text-align: right; align-items: flex-end;">
            <span class="nav-card-label">Келесі тарау →</span>
            <span class="nav-card-title">${nextSection.shortTitle}: ${nextSection.title}</span>
          </a>
        ` : '<div></div>'}
      </nav>
    </article>
  `;

  // Егер нақты абзацқа секіру керек болса
  if (scrollToPNum !== null) {
    setTimeout(() => {
      const targetEl = document.getElementById(`p-${scrollToPNum}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.classList.add('highlight-target');
        setTimeout(() => targetEl.classList.remove('highlight-target'), 2500);
      }
    }, 150);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// --------------------------------------------------------------------------
// Тұрақты бөлімдер: Бағалау және Әдістемелік нұсқау (Permanent Sections)
// --------------------------------------------------------------------------
function renderSpecialSection(type) {
  const isAssessment = type === 'assessment';
  const data = isAssessment ? assessmentData : methodicalData;
  const accentColor = isAssessment ? 'var(--accent)' : 'var(--badge-method)';

  // Кілт сөздер тізімі
  const allKeywords = Array.from(new Set(data.items.map(i => i.keyword))).sort();

  // Сүзу
  const filtered = data.items.filter(item => {
    const matchPill = state.specialFilter === 'all' || item.keyword === state.specialFilter;
    const matchSearch = !state.specialSearch || item.text.toLowerCase().includes(state.specialSearch.toLowerCase());
    return matchPill && matchSearch;
  });

  elements.readingContainer.innerHTML = `
    <div class="special-section-header">
      <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem;">
        <h1 class="special-title" style="color: ${accentColor};">${data.title}</h1>
        <span class="cover-badge" style="background-color: var(--bg-hover); color: var(--text-main);">
          Барлығы: ${data.count} материал
        </span>
      </div>
      <p class="special-desc">${data.description}</p>

      <!-- Іздеу жолағы -->
      <div style="margin-top: 0.5rem;">
        <input type="text" id="specialSearchInput" value="${state.specialSearch}" 
          placeholder="${isAssessment ? 'Бағалау сұрақтары немесе критерийлері бойынша іздеу...' : 'Әдістеме немесе нұсқаулар бойынша іздеу...'}" 
          style="width: 100%; padding: 0.65rem 1rem; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); font-size: 0.95rem; background: var(--bg-surface); color: var(--text-main);" />
      </div>

      <!-- Кілт сөз фильтрлері -->
      <div class="filter-pills-row">
        <button class="filter-pill ${state.specialFilter === 'all' ? 'active' : ''}" data-keyword="all">
          Барлығы (${data.count})
        </button>
        ${allKeywords.map(kw => {
          const count = data.items.filter(i => i.keyword === kw).length;
          return `
            <button class="filter-pill ${state.specialFilter === kw ? 'active' : ''}" data-keyword="${kw}">
              ${kw} (${count})
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Табылған материалдар карточкалары -->
    <div class="items-grid">
      <div style="font-size: 0.88rem; color: var(--text-muted);">
        Көрсетілуде: <strong>${filtered.length}</strong> фрагмент
      </div>

      ${filtered.map(item => `
        <div class="special-item-card">
          <div class="item-card-header">
            <span class="item-keyword-tag" style="background: ${isAssessment ? 'var(--badge-assess-bg)' : 'var(--badge-method-bg)'}; color: ${accentColor};">
              #${item.keyword}
            </span>
            <span class="item-chapter-ref">
              Тарау: <strong>${item.sectionTitle}</strong> [Абзац §${item.pNum}]
            </span>
          </div>

          <div class="item-card-text">
            ${item.text}
          </div>

          <button class="item-jump-link jump-to-p-btn" data-sec-id="${item.sectionId}" data-p-num="${item.pNum}">
            Оқулықтағы осы бөлімге өту →
          </button>
        </div>
      `).join('')}

      ${filtered.length === 0 ? `
        <div style="text-align: center; padding: 3rem 0; color: var(--text-muted);">
          Бұл сүзгі бойынша материал табылмады. Басқа кілт сөзді таңдаңыз.
        </div>
      ` : ''}
    </div>
  `;

  // Сүзгі түймелері
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.specialFilter = btn.dataset.keyword;
      renderSpecialSection(type);
    });
  });

  // Іздеу
  const searchInput = document.getElementById('specialSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      state.specialSearch = e.target.value;
      renderSpecialSection(type);
    });
  }

  // Оқулықтың сол жеріне секіру
  document.querySelectorAll('.jump-to-p-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const secId = btn.dataset.secId;
      const pNum = parseInt(btn.dataset.pNum, 10);
      window.location.hash = `#${secId}`;
      setTimeout(() => {
        renderSectionPage(secId, pNum);
      }, 50);
    });
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// Роутер
// --------------------------------------------------------------------------
function navigate(route) {
  state.currentRoute = route || 'cover';

  elements.navTabs.forEach(btn => {
    const r = btn.dataset.route;
    let isActive = false;
    if (r === 'cover' && state.currentRoute === 'cover') isActive = true;
    else if (r === 'ch1' && (state.currentRoute.startsWith('ch1') || state.currentRoute.startsWith('ch2'))) isActive = true;
    else if (r === 'ch3' && state.currentRoute === 'ch3') isActive = true;
    else if (r === 'assessment' && state.currentRoute === 'assessment') isActive = true;
    else if (r === 'methodical' && state.currentRoute === 'methodical') isActive = true;

    btn.classList.toggle('active', isActive);
  });

  renderTOC(elements.sidebarFilterInput ? elements.sidebarFilterInput.value : '');

  if (state.currentRoute === 'cover') {
    renderCoverPage();
  } else if (state.currentRoute === 'assessment') {
    renderSpecialSection('assessment');
  } else if (state.currentRoute === 'methodical') {
    renderSpecialSection('methodical');
  } else {
    renderSectionPage(state.currentRoute);
  }

  if (window.innerWidth <= 860) {
    closeSidebar();
  }
}

function handleHashChange() {
  const hash = window.location.hash.replace('#', '').trim();
  navigate(hash || 'cover');
}

// --------------------------------------------------------------------------
// Модаль терезелер (Алғы сөз & Автор туралы)
// --------------------------------------------------------------------------
function openPrefaceModal() {
  elements.prefaceModalBody.innerHTML = `
    <div style="font-family: var(--font-body); line-height: 1.8; color: var(--text-main);">
      ${prefaceData.content.split('\n\n').map(p => `<p style="margin-bottom: 1.15rem; text-align: justify;">${p}</p>`).join('')}
    </div>
  `;
  elements.prefaceModal.classList.add('open');
}

function openAuthorModal() {
  elements.authorModalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem; align-items: center;">
      <div style="width: 140px; height: 140px; border-radius: 50%; overflow: hidden; border: 4px solid var(--accent); box-shadow: var(--shadow-md);">
        <img src="${authorData.photo}" alt="${authorData.name}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>

      <div style="text-align: center;">
        <h2 style="font-size: 1.5rem; color: var(--text-main); font-weight: 700;">${authorData.name}</h2>
        <p style="color: var(--accent); font-weight: 600; font-size: 1rem;">${authorData.title}</p>
      </div>

      <div style="font-family: var(--font-body); line-height: 1.8; color: var(--text-main); font-size: 0.95rem; text-align: justify; border-top: 1px solid var(--border); padding-top: 1.25rem;">
        ${authorData.bio.split('\n\n').map(p => `<p style="margin-bottom: 1rem;">${p}</p>`).join('')}
      </div>
    </div>
  `;
  elements.authorModal.classList.add('open');
}

// --------------------------------------------------------------------------
// Іздеу
// --------------------------------------------------------------------------
function performSearch(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) {
    elements.searchResults.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem 0;">Іздеу үшін кемінде 2 әріп енгізіңіз</p>`;
    return;
  }

  const results = [];
  bookContent.forEach(sec => {
    if (sec.title.toLowerCase().includes(q)) {
      results.push({ id: sec.id, title: sec.title, snippet: sec.title });
      return;
    }
    const plain = sec.contentHtml.replace(/<[^>]+>/g, ' ');
    const idx = plain.toLowerCase().indexOf(q);
    if (idx !== -1) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(plain.length, idx + 100);
      const snip = plain.substring(start, end).replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>');
      results.push({ id: sec.id, title: sec.title, snippet: `...${snip}...` });
    }
  });

  if (results.length === 0) {
    elements.searchResults.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem 0;">«${query}» бойынша ештеңе табылмады</p>`;
    return;
  }

  elements.searchResults.innerHTML = `
    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">Табылды: ${results.length} бөлім</div>
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      ${results.map(r => `
        <a href="#${r.id}" class="search-result-item" style="padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">${r.title}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${r.snippet}</div>
        </a>
      `).join('')}
    </div>
  `;

  elements.searchResults.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => elements.searchModal.classList.remove('open'));
  });
}

// --------------------------------------------------------------------------
// Прогресс
// --------------------------------------------------------------------------
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const b = document.body;
  const st = 'scrollTop';
  const sh = 'scrollHeight';
  const percent = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;
  if (elements.readingProgress) {
    elements.readingProgress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }
});

function init() {
  applyTheme(state.theme);
  applyFontSize(state.fontSize);

  elements.toggleSidebarBtn.addEventListener('click', toggleSidebar);
  elements.closeSidebarBtn?.addEventListener('click', closeSidebar);
  elements.sidebarBackdrop?.addEventListener('click', closeSidebar);
  elements.brandHomeBtn.addEventListener('click', () => window.location.hash = '#cover');
  elements.navTabs.forEach(btn => {
    if (btn.dataset.route) {
      btn.addEventListener('click', () => window.location.hash = `#${btn.dataset.route}`);
    }
  });

  elements.prefaceModalBtn?.addEventListener('click', openPrefaceModal);
  elements.closePrefaceModalBtn?.addEventListener('click', () => elements.prefaceModal.classList.remove('open'));
  elements.prefaceModal?.addEventListener('click', e => {
    if (e.target === elements.prefaceModal) elements.prefaceModal.classList.remove('open');
  });

  elements.authorModalBtn?.addEventListener('click', openAuthorModal);
  elements.closeAuthorModalBtn?.addEventListener('click', () => elements.authorModal.classList.remove('open'));
  elements.authorModal?.addEventListener('click', e => {
    if (e.target === elements.authorModal) elements.authorModal.classList.remove('open');
  });

  elements.themeToggleBtn.addEventListener('click', cycleTheme);
  elements.fontDecBtn.addEventListener('click', () => changeFontSize(-1));
  elements.fontIncBtn.addEventListener('click', () => changeFontSize(1));
  elements.fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  });
  elements.sidebarFilterInput.addEventListener('input', e => renderTOC(e.target.value));

  elements.openSearchBtn.addEventListener('click', () => {
    elements.searchModal.classList.add('open');
    elements.globalSearchInput.focus();
  });
  elements.closeSearchModalBtn.addEventListener('click', () => elements.searchModal.classList.remove('open'));
  elements.searchModal.addEventListener('click', e => {
    if (e.target === elements.searchModal) elements.searchModal.classList.remove('open');
  });
  elements.globalSearchInput.addEventListener('input', e => performSearch(e.target.value));

  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      elements.searchModal.classList.add('open');
      elements.globalSearchInput.focus();
    }
    if (e.key === 'Escape') {
      elements.searchModal.classList.remove('open');
      elements.prefaceModal.classList.remove('open');
      elements.authorModal.classList.remove('open');
    }
  });

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
}

init();
