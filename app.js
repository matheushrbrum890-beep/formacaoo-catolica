(() => {
  'use strict';

  const DATA = window.FORMATION_DATA;
  const main = document.getElementById('main-content');
  const searchInput = document.getElementById('global-search');
  const breadcrumbs = document.getElementById('breadcrumbs');
  const searchForm = document.getElementById('search-form');
  const topicById = new Map(DATA.topics.map(topic => [topic.id, topic]));
  const presentationTopics = DATA.topics.filter(topic => topic.kind === 'presentation');
  const seminar = DATA.topics.find(topic => topic.kind === 'document');
  let currentView = { type: 'home' };
  let activeFilter = 'all';

  const liturgicalIds = new Set(['tempo-comum', 'quaresma', 'semana-santa', 'tempo-pascal']);
  const devotionalIds = new Set(['mes-mariano', 'mes-vocacional']);
  const categoryLabel = id => liturgicalIds.has(id) ? 'Tempos litúrgicos' : devotionalIds.has(id) ? 'Devoção & vocação' : 'Formação sacramental';
  const iconFor = topic => topic.icon || '✦';

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function normalize(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function allTextOfBlocks(blocks) {
    return (blocks || []).map(block => {
      if (block.type === 'table') return (block.rows || []).flat().join(' ');
      if (block.type === 'video') return block.title || '';
      return block.text || '';
    }).join('\n');
  }
  function totalText(topic) {
    const videoText = (topic.videos || []).map(video => [video.title, video.channel, video.note].join(' ')).join('\n');
    if (topic.kind === 'presentation') return [topic.title, topic.description, videoText, ...(topic.slides || []).map(slide => slide.title + '\n' + allTextOfBlocks(slide.blocks) + '\n' + (slide.videos || []).join('\n'))].join('\n');
    return [topic.title, topic.description, videoText, ...(topic.chapters || []).map(ch => ch.title + '\n' + ch.blocks.map(p => p.text).join('\n'))].join('\n');
  }
  function firstImage(topic) {
    return topic.images && topic.images.length ? topic.images[0].src : '';
  }
  function imageHtml(topic, altText = '') {
    const src = firstImage(topic);
    return src ? `<img src="${esc(src)}" alt="${esc(altText || topic.images[0].alt || topic.title)}" loading="lazy">` : '';
  }
  function setBreadcrumb(title = 'Início') {
    breadcrumbs.innerHTML = `<span>Biblioteca</span><span class="crumb-separator">/</span><strong>${esc(title)}</strong>`;
  }
  function setActiveNav(id = '') {
    document.querySelectorAll('.nav-link').forEach(button => {
      button.classList.toggle('is-active', (id && button.dataset.topic === id) || (!id && button.hasAttribute('data-home')));
    });
  }
  function renderSidebar() {
    const groups = [
      { element: 'nav-liturgico', ids: ['tempo-comum', 'quaresma', 'semana-santa', 'tempo-pascal'] },
      { element: 'nav-devocao', ids: ['mes-mariano', 'mes-vocacional'] },
      { element: 'nav-formacao', ids: ['santa-missa'] },
    ];
    groups.forEach(group => {
      const container = document.getElementById(group.element);
      if (!container) return;
      container.innerHTML = group.ids.map(id => {
        const topic = topicById.get(id);
        if (!topic) return '';
        return `<button class="nav-link" type="button" data-topic="${esc(topic.id)}"><span class="nav-symbol">${esc(iconFor(topic))}</span><span>${esc(topic.title.replace(' — Mês das Vocações',' Vocacional'))}</span></button>`;
      }).join('');
    });
  }

  function topicCard(topic, index) {
    const image = firstImage(topic);
    const meta = topic.kind === 'presentation' ? `${topic.slideCount} slides · ${(topic.videos || []).length} vídeos · ${(topic.images || []).length} imagens` : `${topic.paragraphCount} parágrafos · ${(topic.videos || []).length} vídeos · ${(topic.images || []).length} imagens`;
    return `
      <article class="topic-card" tabindex="0" role="button" data-topic="${esc(topic.id)}" aria-label="Abrir ${esc(topic.title)}">
        <div class="topic-card-media">
          ${image ? `<img src="${esc(image)}" alt="${esc(topic.images[0].alt || topic.title)}" loading="lazy">` : '<div class="no-image-pattern"></div>'}
          <span class="card-number">${String(index + 1).padStart(2, '0')}</span>
          <span class="card-icon" aria-hidden="true">${esc(iconFor(topic))}</span>
        </div>
        <div class="topic-card-body">
          <span class="topic-eyebrow">${esc(topic.eyebrow)}</span>
          <h3>${esc(topic.title)}</h3>
          <p>${esc(topic.description)}</p>
          <div class="topic-card-footer"><span>${esc(meta)} · ${esc(categoryLabel(topic.id))}</span><span class="open-arrow" aria-hidden="true">↗</span></div>
        </div>
      </article>`;
  }

  function renderHome() {
    currentView = { type: 'home' };
    setBreadcrumb('Início');
    setActiveNav('');
    const slidesTotal = presentationTopics.reduce((sum, topic) => sum + topic.slideCount, 0);
    const heroImage = topicById.get('semana-santa')?.images?.find(image => image.src.includes('semana-santa-image5'))?.src || firstImage(topicById.get('semana-santa'));
    main.innerHTML = `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <span class="eyebrow">Biblioteca de formação católica</span>
          <h1 id="hero-title">A fé que se aprende,<br>se celebra e <em>se vive.</em></h1>
          <p class="hero-lede">Um espaço de estudo para aprofundar a liturgia, compreender os tempos da Igreja e transformar conhecimento em vida de oração, serviço e comunhão.</p>
          <div class="hero-actions">
            <button class="btn btn-gold" type="button" id="explore-library">Explorar os materiais <span aria-hidden="true">↘</span></button>
            <button class="btn btn-outline" type="button" data-topic="santa-missa">Começar pela Santa Missa <span aria-hidden="true">→</span></button>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true">
          ${heroImage ? `<img src="${esc(heroImage)}" alt="" fetchpriority="high">` : ''}
          <div class="hero-badge"><span>Formação • oração • liturgia</span><strong>Conhecer para<br>viver melhor a fé.</strong></div>
        </div>
      </section>

      <section class="stats-row" aria-label="Resumo da biblioteca">
        <div class="stat"><span class="stat-icon" aria-hidden="true">✦</span><span><strong>${DATA.topics.length}</strong><small>materiais organizados</small></span></div>
        <div class="stat"><span class="stat-icon" aria-hidden="true">▤</span><span><strong>${slidesTotal}</strong><small>slides das apresentações</small></span></div>
        <div class="stat"><span class="stat-icon" aria-hidden="true">⛪</span><span><strong>1</strong><small>seminário detalhado</small></span></div>
      </section>

      <section id="biblioteca" class="library-section" aria-labelledby="library-title">
        <div class="section-head">
          <div><span class="section-kicker">Acervo de formação</span><h2 id="library-title">Escolha uma trilha de estudo</h2><p>Sete materiais reunidos em uma biblioteca única, com conteúdo consultável e organizado por assunto.</p></div>
          <button class="text-link" type="button" id="reset-filter">Ver biblioteca completa ↗</button>
        </div>
        <div class="library-tools">
          <div class="filter-pills" role="group" aria-label="Filtrar materiais">
            <button class="filter-pill is-active" type="button" data-filter="all">Todos os temas</button>
            <button class="filter-pill" type="button" data-filter="liturgical">Tempos litúrgicos</button>
            <button class="filter-pill" type="button" data-filter="devotional">Devoção & vocação</button>
            <button class="filter-pill" type="button" data-filter="sacramental">Santa Missa</button>
          </div>
          <span class="library-count" id="library-count">${DATA.topics.length} materiais</span>
        </div>
        <div class="topic-grid" id="topic-grid">${DATA.topics.map(topicCard).join('')}</div>
      </section>

      <section class="quote-strip" aria-label="Mensagem de formação">
        <span class="quote-mark" aria-hidden="true">✧</span>
        <p>“A formação não termina quando a gente aprende uma informação; ela começa quando aquilo aprendido passa a orientar a vida.”<small>Um convite para estudar, rezar e colocar a fé em prática</small></p>
      </section>
    `;
    bindHomeControls();
  }

  function bindHomeControls() {
    document.getElementById('explore-library')?.addEventListener('click', () => document.getElementById('biblioteca')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    document.getElementById('reset-filter')?.addEventListener('click', () => applyFilter('all'));
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
    const grid = document.getElementById('topic-grid');
    grid?.querySelectorAll('.topic-card').forEach(card => {
      const open = () => openTopic(card.dataset.topic);
      card.addEventListener('click', open);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
      });
    });
  }

  function applyFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll('[data-filter]').forEach(button => button.classList.toggle('is-active', button.dataset.filter === filter));
    const grid = document.getElementById('topic-grid');
    if (!grid) return;
    const topics = DATA.topics.filter(topic => {
      if (filter === 'all') return true;
      if (filter === 'liturgical') return liturgicalIds.has(topic.id);
      if (filter === 'devotional') return devotionalIds.has(topic.id);
      if (filter === 'sacramental') return topic.id === 'santa-missa';
      return true;
    });
    grid.innerHTML = topics.length ? topics.map(topicCard).join('') : '<div class="no-results">Nenhum material nesta categoria.</div>';
    document.getElementById('library-count').textContent = `${topics.length} ${topics.length === 1 ? 'material' : 'materiais'}`;
    grid.querySelectorAll('.topic-card').forEach(card => {
      const open = () => openTopic(card.dataset.topic);
      card.addEventListener('click', open);
      card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
    });
  }

  function renderBlock(block, topic) {
    if (block.type === 'table') {
      const rows = block.rows || [];
      return `<div class="source-table-wrap"><table class="source-table"><tbody>${rows.map((row, index) => `<tr>${row.map(cell => index === 0 ? `<th>${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    if (block.type === 'video') return renderVideo(block.title, topic);
    const text = block.text || '';
    if (!text.trim()) return '';
    if (block.type === 'notes') return `<div class="source-text is-note">${esc(text)}</div>`;
    return `<p class="source-text">${esc(text)}</p>`;
  }

  function renderVideo(title, topic) {
    const video = (topic?.videos || []).find(item => item.id);
    if (!video) return `<div class="inline-video-card"><span class="video-icon" aria-hidden="true">▷</span><div><strong>${esc(title)}</strong><p>Não há vídeo complementar cadastrado para este trecho.</p></div></div>`;
    return `<div class="inline-video-card is-playable"><div class="inline-video-copy"><span class="video-icon" aria-hidden="true">▷</span><div><strong>${esc(title || video.title)}</strong><p>Vídeo complementar: ${esc(video.title)} — ${esc(video.channel)}.</p><a href="${esc(video.url)}" target="_blank" rel="noopener noreferrer">Abrir no YouTube ↗</a></div></div></div>`;
  }

  function renderVideos(topic) {
    if (!topic.videos || !topic.videos.length) return '';
    return `<section class="visual-assets video-assets" aria-label="Vídeos educativos complementares"><div class="section-head"><div><span class="section-kicker">Aprofundamento audiovisual</span><h2>Vídeos para estudar</h2><p>Seleção de aulas e materiais educativos em português, incorporados do YouTube para assistir nesta página.</p></div></div><div class="material-videos">${topic.videos.map((video, index) => `<figure class="material-video"><div class="video-frame"><iframe src="${esc(video.embed)}" title="${esc(video.title)} — ${esc(video.channel)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><figcaption><span class="video-order">VÍDEO ${String(index + 1).padStart(2,'0')}</span><strong>${esc(video.title)}</strong><small>Canal: ${esc(video.channel)}</small><p>${esc(video.note || '')}</p><a href="${esc(video.url)}" target="_blank" rel="noopener noreferrer">Ver no YouTube ↗</a></figcaption></figure>`).join('')}</div><p class="video-rights-note"><strong>Direitos e disponibilidade:</strong> o player é fornecido pelo YouTube. Os vídeos não foram baixados nem republicados; os direitos permanecem com cada canal/publicador. A reprodução depende da disponibilidade e das configurações de incorporação do vídeo.</p></section>`;
  }

  function renderSlide(slide, topic) {
    const blocks = slide.blocks || [];
    const content = blocks.map(block => renderBlock(block, topic)).join('');
    const hasImageContent = slide.videos && slide.videos.length && !blocks.some(block => block.type === 'video');
    const videos = hasImageContent ? slide.videos.map(title => renderVideo(title, topic)).join('') : '';
    return `<details class="content-chapter" id="slide-${esc(topic.id)}-${slide.number}">
      <summary><span class="chapter-count">${String(slide.number).padStart(2, '0')}</span><span class="chapter-summary-copy"><strong>${esc(slide.title)}</strong><small>Slide ${slide.number} de ${topic.slideCount}${slide.blocks.length ? ' · conteúdo original' : ' · capa ou elemento visual'}</small></span><span class="chapter-chevron" aria-hidden="true">⌄</span></summary>
      <div class="chapter-content">${content || '<p class="source-text">Este slide não contém texto extraível; o elemento visual correspondente está na galeria deste material.</p>'}${videos}</div>
    </details>`;
  }

  function renderDocBlock(block) {
    const text = esc(block.text);
    switch (block.display) {
      case 'heading': return `<h3 class="doc-heading">${text}</h3>`;
      case 'subheading': return `<h4 class="doc-subheading">${text}</h4>`;
      case 'eyeline': return `<p class="doc-eyeline">${text}</p>`;
      case 'callout': return `<p class="source-text is-note">${text}</p>`;
      case 'listline': return `<p class="source-text doc-listline"><span aria-hidden="true">›</span> ${text}</p>`;
      default: return `<p class="source-text">${text}</p>`;
    }
  }

  function renderImages(topic) {
    if (!topic.images || !topic.images.length) return '';
    return `<section class="visual-assets licensed-image-assets" aria-label="Imagens com fonte e licença identificadas"><div class="section-head"><div><span class="section-kicker">Apoio visual com crédito</span><h2>Galeria de imagens licenciadas</h2><p>Imagens selecionadas em repositórios com termos de reutilização identificados. Confira a fonte e a licença individual antes de reutilizar em outro contexto.</p></div></div><div class="material-images">${topic.images.map(image => `<figure class="material-image"><a class="image-open" href="${esc(image.source)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir fonte da imagem: ${esc(image.label || image.alt)}"><img src="${esc(image.src)}" alt="${esc(image.alt)}" loading="lazy"></a><figcaption><strong>${esc(image.label || image.alt)}</strong><span class="image-credit">Autor: ${esc(image.author)}</span><span class="license-tag">${esc(image.license)}</span><span class="image-links"><a href="${esc(image.source)}" target="_blank" rel="noopener noreferrer">Fonte ↗</a><a href="${esc(image.licenseUrl)}" target="_blank" rel="noopener noreferrer">Licença ↗</a></span></figcaption></figure>`).join('')}</div><p class="media-method-note">As imagens são carregadas do Wikimedia Commons. Algumas exigem atribuição e/ou compartilhamento pela mesma licença; os links acima levam à ficha de cada arquivo e aos termos aplicáveis.</p></section>`;
  }

  function renderTopic(topic) {
    currentView = { type: 'topic', topicId: topic.id };
    setBreadcrumb(topic.title);
    setActiveNav(topic.id);
    const heroImage = firstImage(topic);
    const totalUnits = topic.kind === 'presentation' ? `${topic.slideCount} slides` : `${topic.paragraphCount} parágrafos transcritos`;
    const unitLabel = topic.kind === 'presentation' ? 'Apresentação original' : 'Documento Word';
    let contents = '';
    if (topic.kind === 'presentation') {
      contents = `<div class="chapter-list">${topic.slides.map(slide => renderSlide(slide, topic)).join('')}</div>`;
    } else {
      contents = `<div class="chapter-list">${topic.chapters.map((chapter, index) => `<details class="content-chapter" id="chapter-${esc(topic.id)}-${esc(chapter.id)}"><summary><span class="chapter-count">${String(index + 1).padStart(2, '0')}</span><span class="chapter-summary-copy"><strong>${esc(chapter.title)}</strong><small>${esc(chapter.subtitle)} · ${chapter.paragraphCount} blocos de texto</small></span><span class="chapter-chevron" aria-hidden="true">⌄</span></summary><div class="chapter-content">${chapter.blocks.map(renderDocBlock).join('')}</div></details>`).join('')}</div>`;
    }

    main.innerHTML = `
      <section class="reader-hero ${heroImage ? 'has-image' : ''}" ${heroImage ? `style="--reader-image:url('${esc(heroImage)}')"` : ''}>
        <span class="eyebrow">${esc(topic.eyebrow)}</span>
        <h1>${esc(topic.title)}</h1>
        <p>${esc(topic.description)}</p>
        <div class="reader-meta"><span class="meta-pill">${esc(unitLabel)}</span><span class="meta-pill">${esc(totalUnits)}</span><span class="meta-pill">${esc(topic.filename)}</span></div>
      </section>
      <section class="reader-tools">
        <div><h2>Conteúdo do material</h2><p>${topic.kind === 'presentation' ? 'Cada item corresponde à sequência do PowerPoint.' : 'O documento foi organizado em capítulos para facilitar a leitura; os parágrafos seguem a ordem do Word.'}</p></div>
        <div class="reader-actions"><button type="button" class="small-btn" data-expand-all>＋ Expandir tudo</button><button type="button" class="small-btn" data-collapse-all>− Recolher tudo</button><button type="button" class="small-btn" data-home>← Biblioteca</button></div>
      </section>
      ${renderImages(topic)}
      ${renderVideos(topic)}
      <section class="reader-content">${contents}</section>
      <div class="transcript-note"><span class="note-symbol" aria-hidden="true">ⓘ</span><div><strong>Nota sobre a transcrição</strong><br>O texto foi extraído e organizado a partir de <em>${esc(topic.filename)}</em>. A redação, a terminologia e eventuais inconsistências do arquivo original foram mantidas, sem revisão doutrinal ou correção automática. A galeria visual é independente das imagens presentes nos arquivos de origem e usa mídias selecionadas com licença/fonte indicada. Os vídeos complementares são incorporados do YouTube.</div></div>
    `;
    document.querySelectorAll('[data-expand-all]').forEach(button => button.addEventListener('click', () => main.querySelectorAll('details.content-chapter').forEach(detail => detail.open = true)));
    document.querySelectorAll('[data-collapse-all]').forEach(button => button.addEventListener('click', () => main.querySelectorAll('details.content-chapter').forEach(detail => detail.open = false)));
  }

  function getSearchItems() {
    const items = [];
    for (const topic of DATA.topics) {
      if (topic.kind === 'presentation') {
        for (const slide of topic.slides) {
          const text = `${topic.title}\n${slide.title}\n${allTextOfBlocks(slide.blocks)}\n${(slide.videos || []).join('\n')}`;
          items.push({ topicId: topic.id, targetId: `slide-${topic.id}-${slide.number}`, label: topic.eyebrow, title: `${topic.title} — ${slide.title}`, text, category: topic.title });
        }
      } else {
        for (const chapter of topic.chapters) {
          const text = `${chapter.title}\n${chapter.subtitle}\n${chapter.blocks.map(block => block.text).join('\n')}`;
          items.push({ topicId: topic.id, targetId: `chapter-${topic.id}-${chapter.id}`, label: 'Seminário de Inverno · Santa Missa', title: `${topic.title} — ${chapter.title}`, text, category: chapter.title });
        }
      }
    }
    return items;
  }
  const searchItems = getSearchItems();

  function snippetFor(text, query) {
    const raw = String(text || '').replace(/\s+/g, ' ').trim();
    const normalizedRaw = normalize(raw);
    const normalizedQuery = normalize(query);
    const index = normalizedRaw.indexOf(normalizedQuery);
    if (index < 0) return raw.slice(0, 190) + (raw.length > 190 ? '…' : '');
    const start = Math.max(0, index - 75);
    const end = Math.min(raw.length, index + query.length + 110);
    return `${start > 0 ? '…' : ''}${raw.slice(start, end)}${end < raw.length ? '…' : ''}`;
  }
  function highlight(text, query) {
    const safe = esc(text);
    const words = String(query || '').trim().split(/\s+/).filter(Boolean).sort((a,b) => b.length - a.length);
    if (!words.length) return safe;
    let result = safe;
    // Escape search text first and highlight each query token without using regex on HTML.
    words.forEach(word => {
      const escapedWord = esc(word);
      if (!escapedWord) return;
      try {
        const re = new RegExp(`(${escapedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
        result = result.replace(re, '<mark>$1</mark>');
      } catch { /* If a token cannot be interpreted as a regex, leave the snippet intact. */ }
    });
    return result;
  }

  function renderSearch(query) {
    const q = String(query || '').trim();
    currentView = { type: 'search', query: q };
    setBreadcrumb('Busca');
    setActiveNav('');
    if (!q) { renderHome(); return; }
    const nq = normalize(q);
    const terms = nq.split(/\s+/).filter(Boolean);
    const matches = searchItems.map(item => {
      const nText = normalize(item.title + '\n' + item.text);
      let score = 0;
      for (const term of terms) {
        if (nText.includes(term)) score += nText.split(term).length - 1;
        if (normalize(item.title).includes(term)) score += 5;
      }
      return { ...item, score };
    }).filter(item => item.score > 0).sort((a,b) => b.score - a.score).slice(0, 50);
    main.innerHTML = `
      <section class="search-page-head"><span class="section-kicker">Busca na biblioteca</span><h1>Resultados para “${esc(q)}”</h1><p>${matches.length ? `${matches.length} resultado${matches.length===1?'':'s'} encontrado${matches.length===1?'':'s'} nos textos dos materiais.` : 'Não encontrei esse termo nos textos extraídos. Experimente outra palavra ou expressão.'}</p></section>
      ${matches.length ? `<div class="search-results">${matches.map((item, index) => `<button type="button" class="search-result" data-search-topic="${esc(item.topicId)}" data-search-target="${esc(item.targetId)}"><span class="search-result-label">${esc(item.label)} · ${esc(item.category)}</span><strong>${highlight(item.title, q)}</strong><p>${highlight(snippetFor(item.text, q), q)}</p></button>`).join('')}</div>` : `<div class="search-empty"><h2>Nenhum resultado encontrado</h2><p>Tente buscar por “Quaresma”, “Rosário”, “vocação”, “Eucaristia” ou “Círio Pascal”.</p></div>`}
    `;
    main.querySelectorAll('[data-search-topic]').forEach(button => button.addEventListener('click', () => {
      const topicId = button.dataset.searchTopic;
      const targetId = button.dataset.searchTarget;
      openTopic(topicId, targetId);
    }));
  }

  function openTopic(id, targetId = '') {
    const topic = topicById.get(id);
    if (!topic) return;
    searchInput.value = '';
    renderTopic(topic);
    history.replaceState(null, '', `#${encodeURIComponent(id)}`);
    if (targetId) {
      const target = document.getElementById(targetId);
      if (target && target.tagName.toLowerCase() === 'details') target.open = true;
      requestAnimationFrame(() => {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  function openHome() {
    searchInput.value = '';
    history.replaceState(null, '', location.pathname + location.search);
    renderHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', event => {
    const topicButton = event.target.closest('[data-topic]');
    if (topicButton) { event.preventDefault(); openTopic(topicButton.dataset.topic); return; }
    if (event.target.closest('[data-home]')) { event.preventDefault(); openHome(); return; }
  });
  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    renderSearch(searchInput.value);
    history.replaceState(null, '', `#buscar=${encodeURIComponent(searchInput.value.trim())}`);
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.getElementById('back-to-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); searchInput.focus();
    }
    if (event.key === 'Escape' && document.activeElement === searchInput && searchInput.value) {
      searchInput.value = ''; searchInput.blur();
    }
  });

  renderSidebar();
  // Reopen a topic when a deep link is loaded directly.
  const initialHash = decodeURIComponent(location.hash.slice(1));
  if (initialHash.startsWith('buscar=')) {
    const q = initialHash.slice(7);
    searchInput.value = q;
    renderSearch(q);
  } else if (topicById.has(initialHash)) {
    renderTopic(topicById.get(initialHash));
  } else {
    renderHome();
  }
})();
