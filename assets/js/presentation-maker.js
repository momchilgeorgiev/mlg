(function () {
  const uuid = () =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'slide-' + Math.random().toString(16).slice(2) + Date.now();
  const els = {
    deckTitle: document.getElementById('deckTitle'),
    deckBrand: document.getElementById('deckBrand'),
    deckTheme: document.getElementById('deckTheme'),
    deckDescription: document.getElementById('deckDescription'),
    deckLang: document.getElementById('deckLang'),
    slideLayout: document.getElementById('slideLayout'),
    slideLabel: document.getElementById('slideLabel'),
    slideSubtitle: document.getElementById('slideSubtitle'),
    slideTitle: document.getElementById('slideTitle'),
    columnEditors: document.getElementById('columnEditors'),
    slideList: document.getElementById('slideList'),
    addSlideBtn: document.getElementById('addSlideBtn'),
    duplicateSlideBtn: document.getElementById('duplicateSlideBtn'),
    deleteSlideBtn: document.getElementById('deleteSlideBtn'),
    exportBtn: document.getElementById('exportBtn'),
    copyHtmlBtn: document.getElementById('copyHtmlBtn'),
    previewFrame: document.getElementById('previewFrame')
  };

  if (!window.marked) {
    console.warn('Presentation maker requires marked.js for Markdown support.');
  } else {
    const renderer = new marked.Renderer();
    const originalList = renderer.list.bind(renderer);
    renderer.list = function (body, ordered, start) {
      if (ordered) {
        return originalList(body, ordered, start);
      }
      return '<ul class="check">\n' + body + '</ul>\n';
    };
    marked.use({ renderer, breaks: true, gfm: true });
  }

  const layouts = {
    single: 1,
    two: 2,
    three: 3
  };

  const defaultState = () => ({
    meta: {
      title: 'Глобализацията и потребителското поведение',
      brand: 'НБУ · BUBB650 Международен маркетинг',
      theme: 'dark',
      description: 'Презентация за курсова работа',
      lang: 'bg'
    },
    slides: [
      {
        id: uuid(),
        label: 'Начало',
        subtitle: 'Презентация',
        title: 'Глобализацията и нейните ефекти',
        layout: 'single',
        headingLevel: 'h1',
        columns: [
          'Добре дошли на сесията. Използвайте тази структура, за да въведете темата и ключовите акценти на презентацията.'
        ]
      },
      {
        id: uuid(),
        label: 'Основни акценти',
        subtitle: 'Какво покриваме',
        title: 'Ключови идеи',
        layout: 'three',
        headingLevel: 'h2',
        columns: [
          '- Контекст и двигатели на промяната\n- Ефекти върху поведението\n- Данни и прозрения',
          '- Тактики за международни екипи\n- Рискове и предизвикателства\n- Дискусионни въпроси',
          '- Следващи стъпки\n- Допълнителни ресурси\n- Възможни приложения'
        ]
      }
    ]
  });

  const STORAGE_KEY = 'presentation-maker-v1';
  let state = loadState();
  let currentIndex = 0;

  function loadState() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.slides = parsed.slides.map((slide) => {
          const clean = { ...slide };
          clean.id = slide.id || uuid();
          clean.headingLevel = slide.headingLevel === 'h1' ? 'h1' : 'h2';
          clean.columns = Array.isArray(slide.columns) ? slide.columns : [''];
          clean.layout = slide.layout && layouts[slide.layout] ? slide.layout : 'single';
          clean.label = slide.label || '';
          clean.subtitle = slide.subtitle || '';
          clean.title = slide.title || 'Заглавие на слайд';
          return clean;
        });
        parsed.meta = {
          title: (parsed.meta && parsed.meta.title) || 'Презентация',
          brand: (parsed.meta && parsed.meta.brand) || '',
          theme: (parsed.meta && parsed.meta.theme) === 'light' ? 'light' : 'dark',
          description: (parsed.meta && parsed.meta.description) || '',
          lang: (parsed.meta && parsed.meta.lang) || 'bg'
        };
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load cached presentation maker state', error);
    }
    return defaultState();
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Unable to persist presentation maker state', error);
    }
  }

  function createSlide(layout = 'single') {
    const desiredColumns = layouts[layout] || 1;
    return {
      id: uuid(),
      label: 'Нов слайд',
      subtitle: '',
      title: 'Заглавие на слайд',
      layout,
      headingLevel: 'h2',
      columns: Array.from({ length: desiredColumns }, () => '')
    };
  }

  function setCurrentIndex(index) {
    currentIndex = Math.max(0, Math.min(index, state.slides.length - 1));
    renderSlideList();
    populateEditor();
    updatePreview();
  }

  function renderSlideList() {
    els.slideList.innerHTML = '';
    state.slides.forEach((slide, idx) => {
      const li = document.createElement('li');
      li.className = 'slide-list-item' + (idx === currentIndex ? ' is-active' : '');
      li.dataset.index = String(idx);
      li.innerHTML = `
        <button type="button" class="slide-select">
          <span class="slide-number">${String(idx + 1).padStart(2, '0')}</span>
          <span class="slide-label">${escapeHtml(slide.label || slide.title || 'Слайд ' + (idx + 1))}</span>
        </button>
        <div class="slide-row-actions">
          <button type="button" class="icon-btn" data-action="up" aria-label="Move up">↑</button>
          <button type="button" class="icon-btn" data-action="down" aria-label="Move down">↓</button>
        </div>
      `;
      els.slideList.appendChild(li);
    });
  }

  function populateEditor() {
    const slide = state.slides[currentIndex];
    if (!slide) {
      els.slideLayout.value = 'single';
      els.slideLabel.value = '';
      els.slideSubtitle.value = '';
      els.slideTitle.value = '';
      els.columnEditors.innerHTML = '';
      return;
    }

    els.deckTitle.value = state.meta.title || '';
    els.deckBrand.value = state.meta.brand || '';
    els.deckTheme.value = state.meta.theme || 'dark';
    els.deckDescription.value = state.meta.description || '';
    els.deckLang.value = state.meta.lang || 'bg';

    els.slideLayout.value = slide.layout;
    els.slideLabel.value = slide.label || '';
    els.slideSubtitle.value = slide.subtitle || '';
    els.slideTitle.value = slide.title || '';

    renderColumnEditors();
  }

  function renderColumnEditors() {
    const slide = state.slides[currentIndex];
    if (!slide) return;

    const requiredColumns = layouts[slide.layout] || 1;
    if (slide.columns.length > requiredColumns) {
      slide.columns = slide.columns.slice(0, requiredColumns);
    } else if (slide.columns.length < requiredColumns) {
      while (slide.columns.length < requiredColumns) {
        slide.columns.push('');
      }
    }

    els.columnEditors.innerHTML = '';

    const headingField = document.createElement('div');
    headingField.className = 'field';
    headingField.innerHTML = `
      <label for="slideHeadingLevel">Heading size</label>
      <select id="slideHeadingLevel">
        <option value="h1"${slide.headingLevel === 'h1' ? ' selected' : ''}>Large (h1)</option>
        <option value="h2"${slide.headingLevel !== 'h1' ? ' selected' : ''}>Regular (h2)</option>
      </select>
    `;
    els.columnEditors.appendChild(headingField);

    const selector = headingField.querySelector('select');
    selector.addEventListener('change', (event) => {
      slide.headingLevel = event.target.value === 'h1' ? 'h1' : 'h2';
      persistState();
      updatePreviewDeferred();
    });

    slide.columns.forEach((content, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'field';

      const label = document.createElement('label');
      label.textContent = `Column ${idx + 1} content`;
      label.setAttribute('for', `column-${idx}`);

      const textarea = document.createElement('textarea');
      textarea.id = `column-${idx}`;
      textarea.rows = 8;
      textarea.placeholder = 'Supports Markdown and inline HTML';
      textarea.value = content;

      textarea.addEventListener('input', (event) => {
        slide.columns[idx] = event.target.value;
        persistState();
        updatePreviewDeferred();
      });

      wrapper.appendChild(label);
      wrapper.appendChild(textarea);
      els.columnEditors.appendChild(wrapper);
    });
  }

  function escapeHtml(value) {
    return value
      ? value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
      : '';
  }

  function renderPresentationHTML() {
    const meta = state.meta;
    const slidesHTML = state.slides
      .map((slide, idx) => renderSlide(slide, idx))
      .join('\n\n');

    const doc = [
      '<!DOCTYPE html>',
      `<html lang="${escapeAttribute(meta.lang || 'bg')}">`,
      '<head>',
      '  <meta charset="utf-8" />',
      '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
      `  <title>${escapeHtml(meta.title || 'Presentation')}</title>`,
      meta.description ? `  <meta name="description" content="${escapeAttribute(meta.description)}" />` : '',
      '  <style>',
      BASE_STYLES.trim(),
      '  </style>',
      '</head>',
      `<body data-generated="presentation-maker">`,
      `  <div class="deck" id="deck" data-theme="${escapeAttribute(meta.theme || 'dark')}">`,
      '    <header class="nav">',
      '      <div class="brand">',
      '        <span class="dot" aria-hidden="true"></span>',
      `        <span>${escapeHtml(meta.brand || '')}</span>`,
      '      </div>',
      '      <div class="controls">',
      '        <button class="icon" id="prev" title="Назад (←)">←</button>',
      '        <button class="icon" id="next" title="Напред (→)">→</button>',
      '        <button class="icon" id="toggleTheme" title="Смяна на тема">Тема</button>',
      '        <button class="icon" id="overviewBtn" data-variant="ghost" title="Преглед (O)">Преглед</button>',
      '      </div>',
      '    </header>',
      '',
      '    <main>',
      '      <div class="slides" id="slides">',
      slidesHTML,
      '      </div>',
      '      <div id="overview" class="overview" aria-hidden="true">',
      '        <div class="grid-ov" id="ovGrid"></div>',
      '      </div>',
      '    </main>',
      '',
      '    <div class="footer">',
      '      <div style="flex:1">',
      '        <span class="muted">Навигация: клавиши <span class="kbd">←</span> <span class="kbd">→</span> · преглед <span class="kbd">O</span> · печат <span class="kbd">Ctrl/Cmd+P</span></span>',
      '      </div>',
      '      <div class="progress" id="progress" aria-hidden="true"></div>',
      '    </div>',
      '  </div>',
      '',
      '  <script>',
      BASE_SCRIPT.trim(),
      '  </script>',
      '</body>',
      '</html>'
    ];

    return doc.filter(Boolean).join('\n');
  }

  function renderSlide(slide, index) {
    const title = escapeHtml(slide.title || `Слайд ${index + 1}`);
    const label = escapeAttribute(slide.label || slide.title || `Слайд ${index + 1}`);
    const subtitle = escapeHtml(slide.subtitle || '');
    const headingTag = slide.headingLevel === 'h1' ? 'h1' : 'h2';

    const content = (slide.columns || [])
      .map((column) => renderColumnContent(column))
      .filter(Boolean);

    let body = '';
    if (content.length) {
      if (slide.layout === 'single') {
        body = content
          .map((col) => `<div class="content-block">${col}</div>`)
          .join('\n');
      } else {
        const gridClass = slide.layout === 'two' ? 'grid cols-2' : 'grid cols-3';
        body = `<div class="${gridClass}">\n${content
          .map((col) => `  <div>${col}</div>`)
          .join('\n')}\n</div>`;
      }
    }

    return (
      `        <section class="slide${index === 0 ? ' current' : ''}" data-title="${label}" tabindex="-1">\n` +
      '          <div class="card">\n' +
      (subtitle ? `            <span class="subtitle">${subtitle}</span>\n` : '') +
      `            <${headingTag}>${title}</${headingTag}>\n` +
      (body ? indentLines(body, 12) + '\n' : '') +
      '          </div>\n' +
      '        </section>'
    );
  }

  function renderColumnContent(column) {
    const value = column || '';
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    if (window.marked) {
      return marked.parse(trimmed);
    }
    return `<p>${escapeHtml(trimmed)}</p>`;
  }

  function indentLines(text, spaces) {
    const pad = ' '.repeat(spaces);
    return text
      .split('\n')
      .map((line) => (line.length ? pad + line : line))
      .join('\n');
  }

  function escapeAttribute(value) {
    return value
      ? value
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      : '';
  }

  function slugify(value) {
    return (value || 'presentation')
      .toString()
      .toLowerCase()
      .replace(/[\s\._]+/g, '-')
      .replace(/[^a-z0-9\-]+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'presentation';
  }

  function updatePreview() {
    const html = renderPresentationHTML();
    if (els.previewFrame) {
      els.previewFrame.srcdoc = html;
    }
    return html;
  }

  const updatePreviewDeferred = debounce(updatePreview, 200);

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function addSlide() {
    const layout = els.slideLayout.value || 'single';
    const newSlide = createSlide(layout);
    state.slides.splice(currentIndex + 1, 0, newSlide);
    setCurrentIndex(currentIndex + 1);
    persistState();
  }

  function duplicateSlide() {
    const original = state.slides[currentIndex];
    if (!original) return;
    const clone = JSON.parse(JSON.stringify(original));
    clone.id = uuid();
    state.slides.splice(currentIndex + 1, 0, clone);
    setCurrentIndex(currentIndex + 1);
    persistState();
  }

  function deleteSlide() {
    if (state.slides.length <= 1) {
      alert('Нужен е поне един слайд.');
      return;
    }
    state.slides.splice(currentIndex, 1);
    setCurrentIndex(currentIndex - 1);
    persistState();
  }

  function moveSlide(fromIndex, direction) {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= state.slides.length) return;
    const [slide] = state.slides.splice(fromIndex, 1);
    state.slides.splice(toIndex, 0, slide);
    setCurrentIndex(toIndex);
    persistState();
  }

  function bindEvents() {
    els.deckTitle.addEventListener('input', (event) => {
      state.meta.title = event.target.value;
      persistState();
      updatePreviewDeferred();
      renderSlideList();
    });

    els.deckBrand.addEventListener('input', (event) => {
      state.meta.brand = event.target.value;
      persistState();
      updatePreviewDeferred();
    });

    els.deckTheme.addEventListener('change', (event) => {
      state.meta.theme = event.target.value;
      persistState();
      updatePreview();
    });

    els.deckDescription.addEventListener('input', (event) => {
      state.meta.description = event.target.value;
      persistState();
      updatePreviewDeferred();
    });

    els.deckLang.addEventListener('input', (event) => {
      state.meta.lang = event.target.value || 'bg';
      persistState();
      updatePreviewDeferred();
    });

    els.slideLayout.addEventListener('change', (event) => {
      const slide = state.slides[currentIndex];
      if (!slide) return;
      slide.layout = event.target.value;
      renderColumnEditors();
      persistState();
      updatePreviewDeferred();
    });

    els.slideLabel.addEventListener('input', (event) => {
      const slide = state.slides[currentIndex];
      if (!slide) return;
      slide.label = event.target.value;
      persistState();
      updatePreviewDeferred();
      renderSlideList();
    });

    els.slideSubtitle.addEventListener('input', (event) => {
      const slide = state.slides[currentIndex];
      if (!slide) return;
      slide.subtitle = event.target.value;
      persistState();
      updatePreviewDeferred();
    });

    els.slideTitle.addEventListener('input', (event) => {
      const slide = state.slides[currentIndex];
      if (!slide) return;
      slide.title = event.target.value;
      persistState();
      updatePreviewDeferred();
      renderSlideList();
    });

    els.addSlideBtn.addEventListener('click', addSlide);
    els.duplicateSlideBtn.addEventListener('click', duplicateSlide);
    els.deleteSlideBtn.addEventListener('click', deleteSlide);

    els.slideList.addEventListener('click', (event) => {
      const target = event.target;
      if (target.closest('.slide-select')) {
        const li = target.closest('li');
        if (li && li.dataset.index) {
          setCurrentIndex(parseInt(li.dataset.index, 10));
        }
      }
      if (target.dataset.action === 'up' || target.dataset.action === 'down') {
        const li = target.closest('li');
        if (!li || !li.dataset.index) return;
        const index = parseInt(li.dataset.index, 10);
        moveSlide(index, target.dataset.action === 'up' ? -1 : 1);
      }
    });

    els.exportBtn.addEventListener('click', () => {
      const html = updatePreview();
      const fileName = slugify(state.meta.title) + '.html';
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    });

    els.copyHtmlBtn.addEventListener('click', async () => {
      try {
        const html = updatePreview();
        await navigator.clipboard.writeText(html);
        els.copyHtmlBtn.textContent = 'Copied!';
        setTimeout(() => {
          els.copyHtmlBtn.textContent = 'Copy HTML';
        }, 1500);
      } catch (error) {
        alert('Copy failed. Try exporting instead.');
      }
    });
  }

  function init() {
    populateEditor();
    renderSlideList();
    bindEvents();
    updatePreview();
    persistState();
  }

  const BASE_STYLES = String.raw`
:root{
  --bg: #0b0c10;
  --card: #111318;
  --text: #e8edf3;
  --muted: #a7b1c2;
  --accent: #5aa9e6;
  --accent-2: #b8f7d4;
  --shadow: 0 10px 30px rgba(0,0,0,.35);
  --radius: 18px;
  --border: 1px solid rgba(255,255,255,.08);
}
[data-theme="light"]{
  --bg: #f6f8fb;
  --card: #ffffff;
  --text: #0f172a;
  --muted: #475569;
  --accent: #0ea5e9;
  --accent-2: #16a34a;
  --shadow: 0 12px 28px rgba(2,6,23,.12);
  --border: 1px solid rgba(2,6,23,.06);
}
html,body{height:100%}
body{
  margin:0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
  color:var(--text);
  background:radial-gradient(1200px 600px at 80% 0%, rgba(90,169,230,.12), transparent 60%),
             radial-gradient(800px 500px at 10% 100%, rgba(184,247,212,.1), transparent 60%),
             var(--bg);
  letter-spacing:.2px;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
.deck{height:100vh; display:grid; grid-template-rows:auto 1fr auto;}
header.nav{
  display:flex; align-items:center; justify-content:space-between; padding:14px 18px; position:sticky; top:0;
  backdrop-filter: blur(12px); background: linear-gradient(to bottom, rgba(0,0,0,.18), rgba(0,0,0,0))
}
.brand{display:flex; align-items:center; gap:10px; font-weight:700}
.brand .dot{width:10px; height:10px; border-radius:50%; background:var(--accent); box-shadow:0 0 0 6px rgba(90,169,230,.18)}
.controls{display:flex; align-items:center; gap:8px}
button.icon{
  appearance:none; border:none; background:var(--card); color:var(--text); padding:10px 12px; border-radius:12px;
  cursor:pointer; box-shadow: var(--shadow); border:var(--border); transition: transform .15s ease, background .2s;
}
button.icon:active{ transform: translateY(1px)}
button.icon[data-variant="ghost"]{ background:transparent; border:var(--border)}
.progress{height:4px; width:100%; background:linear-gradient(90deg, var(--accent), var(--accent-2)); border-radius:999px; box-shadow: var(--shadow)}
main{position:relative; overflow:hidden}
.slides{ height:100%; width:100%; position:relative}
section.slide{ position:absolute; inset:0; display:grid; place-items:center; padding:4vw; opacity:0; transform: translateX(60px) scale(.98);
  transition: transform .45s cubic-bezier(.2,.8,.2,1), opacity .45s ease;}
section.slide.current{ opacity:1; transform: translateX(0) scale(1)}
.card{ background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.00)), var(--card); border:var(--border);
  box-shadow: var(--shadow); border-radius: var(--radius); padding: min(4vh,32px) min(5vw,40px); max-width:1100px; width: min(92vw, 1100px)}
.subtitle{ color: var(--muted); font-size: clamp(14px, 1.6vw, 16px); text-transform: uppercase; letter-spacing: .18em}
h1{ font-size: clamp(32px, 5.5vw, 64px); line-height:1.05; margin:.2em 0 .3em}
h2{ font-size: clamp(24px, 3vw, 40px); line-height:1.15; margin:.2em 0 .5em}
h3{ font-size: clamp(20px, 2.4vw, 28px); margin:.6em 0 .4em}
p{ font-size: clamp(16px, 1.5vw, 19px); color: var(--text); opacity:.9}
.muted{ color: var(--muted)}
.grid{ display:grid; gap:18px}
.grid.cols-2{ grid-template-columns: repeat(2, minmax(0,1fr))}
.grid.cols-3{ grid-template-columns: repeat(3, minmax(0,1fr))}
@media (max-width: 960px){ .grid.cols-2,.grid.cols-3{ grid-template-columns: 1fr } }
.chip{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; border:var(--border); background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.0)), var(--card); font-size:14px}
.kbd{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; border:var(--border); padding:2px 6px; border-radius:6px; background:rgba(255,255,255,.05)}
ul.check{ list-style: none; margin:0; padding:0; display:grid; gap:10px}
ul.check li{ position:relative; padding-left:26px}
ul.check li:before{ content:""; width:12px; height:12px; border-radius:3px; position:absolute; left:0; top:.4em; background: linear-gradient(90deg, var(--accent), var(--accent-2)); box-shadow: 0 0 0 3px rgba(90,169,230,.18)}
.pill{ font-weight:600; padding:6px 10px; border-radius:8px; background: linear-gradient(90deg, rgba(90,169,230,.18), rgba(184,247,212,.18))}
.footer{ display:flex; align-items:center; justify-content:space-between; gap:14px; padding:12px 18px; opacity:.9}
.overview{ position:absolute; inset:0; background: rgba(0,0,0,.6); backdrop-filter: blur(6px); display:none; padding:4vh 5vw; overflow:auto}
.overview.open{ display:block}
.grid-ov{ display:grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap:18px}
.thumb{ border-radius:14px; background: var(--card); border:var(--border); box-shadow: var(--shadow); padding:14px; cursor:pointer;}
.thumb h3{ font-size:16px; margin:.3em 0}
.content-block{display:grid; gap:12px}
.content-block > p{margin:0}
.content-block ul{margin:0; padding:0; display:grid; gap:8px}
.content-block ul li{list-style:none}
ol{padding-left:24px}
ol li{margin-bottom:6px}
@media print{
  header.nav, .footer, .overview{ display:none !important}
  section.slide{ position:static; opacity:1; transform:none; page-break-inside:avoid; margin: 0 0 12mm 0}
  body{ background:white; color:black}
  .card{ box-shadow:none; border:1px solid #e5e7eb}
}
  `;

  const BASE_SCRIPT = String.raw`
(function(){
  const deck = document.getElementById('deck');
  const slides = Array.from(document.querySelectorAll('section.slide'));
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const progress = document.getElementById('progress');
  const overview = document.getElementById('overview');
  const overviewBtn = document.getElementById('overviewBtn');
  const toggleTheme = document.getElementById('toggleTheme');
  let index = 0;

  function show(i){
    index = Math.max(0, Math.min(i, slides.length - 1));
    slides.forEach(function(s, n){
      s.classList.toggle('current', n === index);
    });
    const pct = ((index + 1) / slides.length) * 100;
    if (progress) {
      progress.style.background = 'linear-gradient(90deg, var(--accent) ' + pct + '%, rgba(255,255,255,.15) ' + pct + '%)';
    }
    if (typeof history !== 'undefined' && history.replaceState) {
      history.replaceState(null, '', '#' + index);
    }
    const currentSlide = slides[index];
    if (currentSlide) {
      currentSlide.setAttribute('tabindex', '-1');
      if (currentSlide.focus) {
        currentSlide.focus({ preventScroll: true });
      }
    }
  }

  function next(){ show(index + 1); }
  function prev(){ show(index - 1); }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  window.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
    if (e.key && e.key.toLowerCase() === 'o') toggleOverview();
  });

  if (location.hash){
    const n = parseInt(location.hash.replace('#',''), 10);
    if (!isNaN(n)) show(n);
  }

  function buildOverview(){
    const grid = document.getElementById('ovGrid');
    if (!grid) return;
    grid.innerHTML = '';
    slides.forEach(function(s, n){
      const t = s.dataset.title || ('Слайд ' + (n + 1));
      const el = document.createElement('div');
      el.className = 'thumb';
      el.innerHTML = '<div class="subtitle">' + String(n + 1).padStart(2,'0') + '</div><h3>' + t + '</h3>';
      el.addEventListener('click', function(){
        show(n);
        toggleOverview(false);
      });
      grid.appendChild(el);
    });
  }

  function toggleOverview(force){
    if (!overview) return;
    if (force === true) { overview.classList.add('open'); }
    else if (force === false) { overview.classList.remove('open'); }
    else { overview.classList.toggle('open'); }
  }

  if (overviewBtn) {
    overviewBtn.addEventListener('click', function(){
      buildOverview();
      toggleOverview();
    });
  }

  function setTheme(mode){
    if (!deck) return;
    deck.setAttribute('data-theme', mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('deck-theme', mode);
    }
  }

  if (toggleTheme) {
    toggleTheme.addEventListener('click', function(){
      if (!deck) return;
      const cur = deck.getAttribute('data-theme');
      setTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('deck-theme');
    if (saved) setTheme(saved);
  }

  document.addEventListener('click', function(e){
    const tag = e.target.tagName.toLowerCase();
    const clickable = ['button','a','input','textarea','select','label'];
    if (clickable.indexOf(tag) === -1) {
      next();
    }
  });

  show(index);
})();
  `;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
