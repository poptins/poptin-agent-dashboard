// Company navigation is a view of the existing product inventory, never a new agent registry.
(() => {
  const departments = [
    {id: 'content', name: 'Content & SEO', icon: '↗', agents: ['seo', 'update-blog', 'alternatives', 'optimization', 'quarterly-benchmark']},
    {id: 'education', name: 'Education', icon: '▤', agents: ['academy', 'glossary']},
    {id: 'social', name: 'Social & Community', icon: '◎', agents: ['social', 'quora']},
    {id: 'video', name: 'Video', icon: '▷', agents: ['youtube-shorts', 'youtube-video', 'tutorial-video', 'instagram-reels', 'instagram-stories', 'facebook-reels', 'facebook-stories']},
    {id: 'partnerships', name: 'Partnerships & Affiliates', icon: '◇', agents: ['partners-agencies', 'agency-followup', 'marketing-consultant-outreach', 'marketing-consultant-followup', 'listicle-outreach', 'listicle-followup', 'affiliate-outreach', 'affiliate-followup', 'competitor-affiliate-outreach', 'competitor-affiliate-followup']},
    {id: 'conversion', name: 'Sales & Conversion', icon: '⌁', agents: ['buying-intent', 'buying-intent-followup', 'ecommerce-cro', 'ecommerce-cro-followup']}
  ];
  // Explicit responsibility relationships; never infer a parent by name alone.
  const followupParents = {
    'agency-followup': 'partners-agencies',
    'marketing-consultant-followup': 'marketing-consultant-outreach',
    'listicle-followup': 'listicle-outreach',
    'affiliate-followup': 'affiliate-outreach',
    'competitor-affiliate-followup': 'competitor-affiliate-outreach',
    'buying-intent-followup': 'buying-intent',
    'ecommerce-cro-followup': 'ecommerce-cro'
  };
  const agentType = agent => agent.activityGroupId || agent.id;
  const sameProduct = (left, right) => (left.productId || '') === (right.productId || '');
  function parentOf(agent, agents = data.agents) {
    const type = followupParents[agentType(agent)];
    return type ? agents.find(candidate => agentType(candidate) === type && sameProduct(candidate, agent)) : undefined;
  }
  const workflowReferences = [
    {
      id: 'interviews', product: 'poptin', department: 'content', title: 'Interview Publishing',
      summary: 'Reviewed interviews · per-interview publishing', modes: ['manual'],
      description: 'Existing per-interview workflows publish reviewed content. The current Abhay Mirchandani workflow is started manually; it is not a recurring or integrated interview-production agent.',
      triggerNote: 'Current workflow: manual dispatch. No recurring schedule configured. Enabled state not verified.',
      links: [
        {label: 'View current interview workflow', url: 'https://github.com/poptins/poptin-agents/blob/main/.github/workflows/publish-abhay-mirchandani-interview.yml'},
        {label: 'View published Abhay interview', url: 'https://www.poptin.com/blog/beyond-the-click-abhay-mirchandani-conversions-follow-up-ai/'}
      ]
    },
    {
      id: 'monthly-updates', product: 'poptin', department: 'content', title: 'Monthly Product Updates',
      summary: 'Product-update blog and video · separate reviewed workflows', modes: ['manual', 'event'],
      description: 'The existing September blog and video were produced through separate, reviewed workflows. This reference does not represent a reusable end-to-end monthly agent or an automatic monthly schedule. Video history remains with the YouTube Video Agent.',
      triggerNote: 'September blog: GitHub push changing .github/poptin-september-2026-operation.json. Video: manual dispatch on the reviewed publication branch. Enabled state not verified.',
      links: [
        {label: 'View September blog workflow', url: 'https://github.com/poptins/poptin-agents/blob/main/.github/workflows/publish-september-2026-product-update.yml'},
        {label: 'View September video workflow', url: 'https://github.com/poptins/poptin-agents/blob/publish/september-updates-20261003/.github/workflows/shorts-preview.yml'},
        {label: 'View published September update', url: 'https://www.poptin.com/blog/poptin-product-updates-september-2026/'},
        {label: 'View published September video', url: 'https://www.youtube.com/watch?v=Xm2pNFWOxuU'}
      ]
    }
  ];
  const labels = {disabled: ['Ⅱ', 'Not enabled'], scheduled: ['◷', 'Scheduled'], manual: ['▷', 'On demand'], event: ['ϟ', 'Event-triggered'], paused: ['Ⅱ', 'Paused'], unknown: ['?', 'Not verified']};
  const collapsed = new Map();
  let previousAgent = null;
  let lastQuery = '';
  let searchCollapsed = new Set();
  const html = value => escapeHtml(String(value ?? ''));
  const productId = () => document.querySelector('[data-product].active')?.dataset.product || sessionStorage.getItem('marketingBoardProduct') || 'poptin';
  const productName = () => productId() === 'all' ? 'All products' : document.querySelector('[data-product].active')?.textContent.trim() || 'Poptin';
  const metadataFor = agent => window.AGENT_TRIGGER_METADATA?.[agent.productId || productId()]?.[agent.activityGroupId || agent.id] || {
    modes: [], paused: false, enabledState: 'unverified', schedules: [], events: [], sources: [], note: 'Trigger configuration has not been verified for this agent.'
  };
  const badges = agent => {
    const meta = metadataFor(agent);
    const modes = meta.enabledState === 'disabled' ? ['disabled'] : meta.paused ? ['paused'] : meta.modes.length ? meta.modes : ['unknown'];
    return `<span class="trigger-badges">${modes.map(mode => {
      const [icon, label] = labels[mode] || labels.unknown;
      const note = mode === 'disabled' ? 'No active schedule or publisher' : mode === 'paused' ? 'Execution explicitly paused in the workflow' : mode === 'unknown' ? 'Trigger configuration not verified' : `${label} trigger configured; workflow enabled state not verified`;
      return `<span class="trigger-badge" data-trigger="${html(mode)}" title="${html(note)}"><span aria-hidden="true">${icon}</span> ${label}</span>`;
    }).join('')}</span>`;
  };
  function groups(query = '') {
    const match = agent => `${agent.name} ${agent.role}`.toLowerCase().includes(query);
    const matched = new Set(data.agents.filter(match).map(agent => agent.id));
    const visible = new Set(matched);
    // Keep a matching follow-up with its actual parent. Parent matches also reveal
    // their follow-ups, so searching never turns a family into unrelated cards.
    for (const agent of data.agents) {
      const parent = parentOf(agent);
      if (!parent) continue;
      if (matched.has(agent.id)) visible.add(parent.id);
      if (matched.has(parent.id)) visible.add(agent.id);
    }
    const known = new Set(departments.flatMap(department => department.agents));
    const result = departments.map(department => ({
      ...department,
      members: data.agents.filter(agent => department.agents.includes(agentType(agent)) && visible.has(agent.id)),
      references: workflowReferences.filter(reference => reference.department === department.id &&
        (productId() === reference.product || productId() === 'all') &&
        `${reference.title} ${reference.summary}`.toLowerCase().includes(query))
    })).filter(department => department.members.length || department.references.length);
    const other = data.agents.filter(agent => !known.has(agentType(agent)) && visible.has(agent.id));
    if (other.length) result.push({id: 'other', name: 'Other responsibilities', icon: '•', members: other, references: []});
    return result;
  }
  function render(query = '') {
    const tree = document.querySelector('#companyTree');
    if (!tree) return;
    const normalized = query.trim().toLowerCase();
    if (normalized !== lastQuery) {searchCollapsed = new Set(); lastQuery = normalized;}
    const grouped = groups(normalized);
    const product = productId();
    if (!collapsed.has(product)) collapsed.set(product, new Set());
    const hiddenDepartments = normalized ? searchCollapsed : collapsed.get(product);
    const count = grouped.reduce((sum, department) => sum + department.members.length, 0);
    const referenceCount = grouped.reduce((sum, department) => sum + department.references.length, 0);
    document.querySelector('#agentCount').textContent = count;
    const agentCard = agent => `<button type="button" class="company-agent${agent.id === selectedAgentId ? ' active' : ''}" data-agent-id="${html(agent.id)}" aria-pressed="${agent.id === selectedAgentId}" aria-controls="agentDetail">
      <span class="avatar" style="${avatarStyle(agent)}" aria-hidden="true">${html(agent.initials)}</span>
      <span class="company-agent-copy"><strong>${html(agent.name)}</strong><small>${html(agent.role)}</small>${badges(agent)}</span>
    </button>`;
    const familyCards = members => members.filter(agent => !parentOf(agent, members)).map(agent => {
      const children = members.filter(child => parentOf(child, members)?.id === agent.id);
      if (!children.length) return agentCard(agent);
      return `<div class="agent-family" data-parent-agent="${html(agent.id)}">${agentCard(agent)}
        <ul class="followup-list" role="list" aria-label="Follow-ups for ${html(agent.name)}">${children.map(child => `<li class="followup-node"><span class="followup-label">Follow-up</span>${agentCard(child)}</li>`).join('')}</ul>
      </div>`;
    }).join('');
    const referenceCards = references => references.length ? `<div class="workflow-references"><p class="reference-eyebrow">Publishing workflows · Poptin</p>${references.map(reference => `<details class="workflow-reference-card" data-workflow-reference="${reference.id}">
      <summary><strong>${html(reference.title)}</strong><small>${html(reference.summary)}</small><span class="reference-label">Workflow reference</span><span class="trigger-badges">${reference.modes.map(mode => `<span class="trigger-badge" data-trigger="${mode}"><span aria-hidden="true">${labels[mode][0]}</span> ${labels[mode][1]}</span>`).join('')}</span></summary>
      <div class="workflow-reference-content"><p>${html(reference.description)}</p><p>${html(reference.triggerNote)}</p>${reference.links.filter(link => safeExternalUrl(link.url)).map(link => `<a class="asset-link" href="${html(safeExternalUrl(link.url))}" target="_blank" rel="noopener">${html(link.label)} ↗</a>`).join('')}</div>
    </details>`).join('')}</div>` : '';
    tree.innerHTML = `<button type="button" class="company-root${selectedAgentId == null ? ' active' : ''}" id="companyRoot" aria-pressed="${selectedAgentId == null}" aria-controls="agentDetail">
      <span class="avatar" aria-hidden="true">PP</span><span class="company-root-copy"><strong>Poptimus Prime</strong><small>Company overview · ${html(productName())}</small></span><span aria-hidden="true">↗</span>
    </button>
    <div class="department-grid">${grouped.map(department => {
      const expanded = !hiddenDepartments.has(department.id);
      return `<section class="department" aria-labelledby="department-title-${department.id}">
        <button type="button" class="department-toggle" data-department="${department.id}" aria-expanded="${expanded}" aria-controls="department-${department.id}">
          <span class="department-icon" aria-hidden="true">${department.icon}</span><span class="department-copy"><strong id="department-title-${department.id}">${department.name}</strong><small>${department.members.length} ${department.members.length === 1 ? 'agent' : 'agents'}${department.references.length ? ` · ${department.references.length} ${department.references.length === 1 ? 'workflow' : 'workflows'}` : ''}</small></span><span class="department-chevron" aria-hidden="true">${expanded ? '−' : '+'}</span>
        </button><div class="department-agents" id="department-${department.id}"${expanded ? '' : ' hidden'}>${familyCards(department.members)}${referenceCards(department.references)}</div>
      </section>`;
    }).join('')}</div>${count || referenceCount ? '' : '<div class="empty-state" role="status">No agents match that search. Try another name or responsibility.</div>'}`;
  }
  function updateSidebar(agent) {
    const back = document.querySelector('#companyBack');
    if (back) back.hidden = !agent;
    const context = document.querySelector('#sidebarContext');
    if (context) context.textContent = agent ? `${productName()} / Agent details` : `${productName()} / Company overview`;
    const sidebar = document.querySelector('#companySidebar');
    if (sidebar) sidebar.setAttribute('aria-label', agent ? `${agent.name} details and activity` : 'Company overview and activity');
  }
  function renderRootDetail() {
    updateSidebar(null);
    const grouped = groups();
    document.querySelector('#agentDetail').innerHTML = `<div class="company-overview"><span class="overview-mark" aria-hidden="true">PP</span><p class="eyebrow">POPTIMUS PRIME</p><h2>Your company, connected.</h2><p class="overview-copy">${html(productName())} has ${data.agents.length} agents across ${grouped.length} ${grouped.length === 1 ? 'department' : 'departments'}. Choose an agent in the tree to see its responsibilities, triggers and activity.</p><div class="overview-departments">${grouped.map(group => `<span>${group.name}<strong>${group.members.length}</strong></span>`).join('')}</div></div>`;
  }
  function scheduleDescription(schedule) {
    const [minute, hour, day, month, weekday] = schedule.cron.split(' ');
    const time = h => `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    let description;
    if (minute !== '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') description = `Hourly at minute ${minute}`;
    else if (/^[\d,]+$/.test(hour) && /^\d+$/.test(minute) && month === '*') {
      const times = hour.split(',').map(time).join(', ');
      if (weekday === '*' && day === '*') description = `Daily at ${times}`;
      else if (weekday === '*' && /^[\d,]+$/.test(day)) description = `Days ${day.replaceAll(',', ', ')} of each month at ${times}`;
      else if (weekday === '0' && day === '*') description = `Sundays at ${times}`;
    }
    return `${description || `Cron ${schedule.cron}`} (${schedule.timezone})`;
  }
  function renderTriggers(agent) {
    const meta = metadataFor(agent);
    const sourceLinks = (meta.sources || []).filter(url => /^https:\/\/github\.com\/poptins\//.test(url)).map((url, i) => `<a class="asset-link" href="${html(url)}" target="_blank" rel="noopener">View trigger source${meta.sources.length > 1 ? ` ${i + 1}` : ''} ↗</a>`).join(' ');
    return `<details class="trigger-details"><summary>How this agent starts ${badges(agent)}</summary><div class="trigger-detail-content">
      <ul class="trigger-detail-list">${(meta.schedules || []).map(schedule => `<li><strong>Scheduled:</strong> ${html(scheduleDescription(schedule))}<small>Cron: ${html(schedule.cron)} · ${html(schedule.timezone)}</small></li>`).join('')}
      ${meta.modes.includes('manual') ? '<li><strong>On demand:</strong> Started manually through the reviewed workflow.</li>' : ''}
      ${(meta.events || []).map(event => `<li><strong>Event-triggered:</strong> GitHub ${html(event.event)}${event.paths?.length ? ` when ${event.paths.map(path => `<span class="trigger-path">${html(path)}</span>`).join(', ')} changes` : ''}.</li>`).join('')}</ul>
      <p class="trigger-note">${html(meta.note)}</p><p class="trigger-state">${meta.enabledState === 'disabled' ? 'Execution and publishing are not enabled.' : meta.paused ? 'Paused in the inspected workflow.' : 'Workflow enabled state: not verified.'}${meta.verifiedAt ? ` Configuration checked ${html(new Date(meta.verifiedAt).toISOString().slice(0, 10))}.` : ''}</p>${sourceLinks}
    </div></details>`;
  }
  function selectAgent(id, {focus = true} = {}) {
    if (id != null && !data.agents.some(agent => agent.id === id)) return;
    if (id != null) previousAgent = id;
    selectedAgentId = id;
    activityProductFilter = productId();
    const selected = data.agents.find(agent => agent.id === id);
    activityAgentFilter = id == null ? 'all' : activityProductFilter === 'all' ? selected.activityGroupId || id : id;
    const filter = document.querySelector('#activityProductFilter');
    if (filter) filter.value = activityProductFilter;
    renderDashboard();
    const sidebar = document.querySelector("#companySidebar");
    if (sidebar) sidebar.scrollTop = 0;
    if (focus) {
      const target = id == null ? document.querySelector('#companyRoot') : document.querySelector('#agentDetail');
      target?.focus({preventScroll: true});
      if (id != null && window.matchMedia?.('(max-width: 1050px)').matches) (sidebar || target)?.scrollIntoView?.({block: 'start'});
    }
  }
  function backToCompany() {
    const prior = previousAgent;
    selectAgent(null, {focus: false});
    const candidate = [...document.querySelectorAll('#companyTree [data-agent-id]')].find(button => button.dataset.agentId === prior && !button.closest('[hidden]'));
    const target = candidate || document.querySelector('#companyRoot');
    target?.focus({preventScroll: true});
    if (window.matchMedia?.('(max-width: 1050px)').matches) target?.scrollIntoView?.({block: 'center'});
  }
  document.querySelector('#companyBack')?.addEventListener('click', backToCompany);
  document.querySelector('#companyTree')?.addEventListener('click', event => {
    const agent = event.target.closest('[data-agent-id]');
    if (agent) return selectAgent(agent.dataset.agentId);
    if (event.target.closest('#companyRoot')) return selectAgent(null);
    const toggle = event.target.closest('[data-department]');
    if (!toggle) return;
    const id = toggle.dataset.department;
    const state = lastQuery ? searchCollapsed : collapsed.get(productId());
    if (state.has(id)) state.delete(id); else state.add(id);
    render(document.querySelector('#agentSearch').value);
    document.querySelector(`[data-department="${id}"]`)?.focus({preventScroll: true});
  });
  document.querySelector('#companyTree')?.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selectedAgentId != null) {event.preventDefault(); return backToCompany();}
    const button = event.target.closest('button');
    if (!button || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const buttons = [...document.querySelectorAll('#companyTree button')].filter(item => !item.closest('[hidden]'));
    const current = buttons.indexOf(button);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1)));
    event.preventDefault(); buttons[next]?.focus();
  });
  document.querySelector('#companySidebar')?.addEventListener('keydown', event => {
    // Do not consume Escape inside an input or an expanded native select.
    if (event.key === 'Escape' && selectedAgentId != null && !event.target.matches('input, textarea, select')) {event.preventDefault(); backToCompany();}
  });
  window.companyTree = {departments, followupParents, workflowReferences, render, selectAgent, renderRootDetail, updateSidebar, renderTriggers, getTriggerMetadata: metadataFor};
})();
