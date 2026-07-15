/* ═══════════════════════════════════════════════════════════════
   Sidebar partagée — identique sur /gestion/*.html et /office/index.html
   Usage : <div class="sidebar" id="sidebar"><script src="/assets/js/sidebar.js"></script></div>
   ═══════════════════════════════════════════════════════════════ */
(function(){

  const SECTIONS = [
    {
      key: 'pilotage', label: 'Pilotage', collapsible: false,
      links: [
        { label: 'Tableau de bord', href: '/gestion/index.html' },
        { label: 'Statistiques', href: '/gestion/statistiques.html' }
      ]
    },
    {
      key: 'facturation', label: 'Facturation', collapsible: true,
      links: [
        { label: 'Devis', href: '/gestion/devis.html' },
        { label: 'Factures', href: '/gestion/factures.html', dotId: 'dot-factures' },
        { label: 'Avoirs', href: '/gestion/avoirs.html' }
      ]
    },
    {
      key: 'clients', label: 'Clients', collapsible: true,
      links: [
        { label: 'Liste des clients', href: '/gestion/clients.html' }
      ]
    },
    {
      key: 'catalogue', label: 'Catalogue', collapsible: true,
      links: [
        { label: 'Prestations & tarifs', href: '/gestion/catalogue.html' }
      ]
    },
    {
      key: 'comptabilite', label: 'Comptabilité', collapsible: true,
      links: [
        { label: 'Plan comptable', href: '/gestion/comptabilite.html#plan' },
        { label: 'Écritures', href: '/gestion/comptabilite.html#ecritures' },
        { label: 'Grand livre', href: '/gestion/comptabilite.html#grand-livre' },
        { label: 'Balance', href: '/gestion/comptabilite.html#balance' },
        { label: 'Rapprochement bancaire', href: '/gestion/comptabilite.html#rapprochement' },
        { label: 'Immobilisations', href: '/gestion/comptabilite.html#immo' },
        { label: 'Déclaration TVA', href: '/gestion/comptabilite.html#tva' },
        { label: 'Export FEC', href: '/gestion/comptabilite.html#fec' }
      ]
    },
    {
      key: 'site', label: 'Site web', collapsible: true,
      links: [
        { label: "Vue d'ensemble", href: '/office/index.html#panel-dashboard' },
        { label: 'Clients (site)', href: '/office/index.html#panel-clients' },
        { label: 'Stagiaires', href: '/office/index.html#panel-stagiaires' },
        { label: 'Publications', href: '/office/index.html#panel-publication' },
        { label: 'Outils', href: '/office/index.html#panel-outils' },
        { label: 'Visibilité', href: '/office/index.html#panel-visibilite' },
        { label: 'Documents', href: '/office/index.html#panel-documents', dotId: 'nav-alert-documents' },
        { label: 'Émargements', href: '/office/index.html#panel-emargements' }
      ]
    },
    {
      key: 'configuration', label: 'Configuration', collapsible: true,
      links: [
        { label: 'Paramètres', href: '/gestion/parametres.html' }
      ]
    }
  ];

  function cheminActuel(){
    return location.pathname.replace(/\/+$/, '') || '/';
  }

  function estActif(href){
    const [chemin, hash] = href.split('#');
    const cheminNormalise = chemin.replace(/\/+$/, '');
    if(cheminActuel() !== cheminNormalise) return false;
    if(hash) return location.hash === '#' + hash;
    return true; // lien sans hash : actif dès qu'on est sur la bonne page (peu importe le hash courant)
  }

  function sectionContientActif(section){
    return section.links.some(l => estActif(l.href));
  }

  function construireHTML(){
    let html = `
      <div class="brand">
        <img src="/assets/logo.jpg" alt="APH Drone" onerror="this.style.display='none'">
        <div class="brand-text">Gestion<span>APH Drone</span></div>
      </div>
      <div class="nav">`;

    SECTIONS.forEach(section => {
      const ouverte = !section.collapsible || sectionContientActif(section);
      if(!section.collapsible){
        html += `<div class="menu-section-label">${section.label}</div>`;
      } else {
        html += `
          <button type="button" class="menu-group-toggle${ouverte ? ' open' : ''}" data-group="${section.key}">
            <span>${section.label}</span>
            <svg class="chevron" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>`;
      }
      html += `<div class="menu-group-body${section.collapsible ? '' : ' always-open'}"${ouverte ? '' : ' style="display:none;"'} data-group-body="${section.key}">`;
      section.links.forEach(link => {
        const active = estActif(link.href);
        html += `<a class="menu-link${active ? ' active' : ''}" href="${link.href}">${link.label}`;
        if(link.dotId) html += `<span class="nav-alert-dot" id="${link.dotId}" style="display:none;"></span>`;
        html += `</a>`;
      });
      html += `</div>`;
    });

    html += `
      </div>
      <div class="foot">
        <div class="foot-email" id="user-email"></div>
        <button class="logout-btn" id="btn-sidebar-logout">Déconnexion</button>
      </div>`;

    return html;
  }

  function injecterStyle(){
    if(document.getElementById('sidebar-shared-style')) return;
    const style = document.createElement('style');
    style.id = 'sidebar-shared-style';
    style.textContent = `
      .sidebar .brand{display:flex;align-items:center;gap:10px;padding:0 24px 24px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:8px;}
      .sidebar .brand img{width:36px;height:36px;border-radius:50%;}
      .sidebar .brand-text{font-size:.85rem;font-weight:700;line-height:1.3;color:white;}
      .sidebar .brand-text span{display:block;font-size:.68rem;font-weight:500;color:rgba(255,255,255,.5);}
      .sidebar .nav{flex:1;display:flex;flex-direction:column;padding:8px 0;overflow-y:auto;}
      .sidebar .menu-section-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.38);font-weight:700;padding:0 24px;margin:16px 0 6px;}
      .sidebar .menu-group-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.38);font-weight:700;padding:0 24px;margin:16px 0 6px;text-align:left;}
      .sidebar .menu-group-toggle:hover{color:rgba(255,255,255,.7);}
      .sidebar .menu-group-toggle .chevron{transition:.2s;flex-shrink:0;}
      .sidebar .menu-group-toggle.open .chevron{transform:rotate(180deg);}
      .sidebar .menu-group-body{display:flex;flex-direction:column;}
      .sidebar .menu-link{display:block;padding:7px 24px;font-size:.86rem;color:rgba(255,255,255,.78);text-decoration:none;border-left:3px solid transparent;transition:.15s;position:relative;}
      .sidebar .menu-link:hover{color:white;background:rgba(255,255,255,.05);}
      .sidebar .menu-link.active{color:white;font-weight:600;border-left-color:var(--accent);background:rgba(255,255,255,.06);}
      .sidebar .nav-alert-dot{position:absolute;top:9px;right:16px;width:7px;height:7px;border-radius:50%;background:#dc2626;}
      .sidebar .foot{padding:16px 24px 0;border-top:1px solid rgba(255,255,255,.1);margin-top:16px;}
      .sidebar .foot-email{font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:10px;word-break:break-all;}
      .sidebar .logout-btn{font-size:.78rem;color:rgba(255,255,255,.65);background:none;border:1px solid rgba(255,255,255,.15);border-radius:7px;padding:8px 12px;cursor:pointer;width:100%;transition:.15s;font-family:'Inter',sans-serif;}
      .sidebar .logout-btn:hover{background:rgba(255,255,255,.08);color:white;}
    `;
    document.head.appendChild(style);
  }

  function mettreAJourEtatsActifs(){
    document.querySelectorAll('.sidebar .menu-link').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', estActif(href));
    });
    document.querySelectorAll('.sidebar .menu-group-toggle').forEach(btn => {
      const section = SECTIONS.find(s => s.key === btn.dataset.group);
      if(section && sectionContientActif(section) && !btn.classList.contains('open')){
        btn.classList.add('open');
        document.querySelector('.menu-group-body[data-group-body="' + section.key + '"]').style.display = 'flex';
      }
    });
  }

  function attacherEvenements(racine){
    racine.querySelectorAll('.menu-group-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const body = racine.querySelector('.menu-group-body[data-group-body="' + btn.dataset.group + '"]');
        const ouverte = btn.classList.toggle('open');
        body.style.display = ouverte ? 'flex' : 'none';
      });
    });
    const btnLogout = racine.querySelector('#btn-sidebar-logout');
    if(btnLogout){
      btnLogout.addEventListener('click', () => {
        if(typeof window.doLogout === 'function') window.doLogout();
      });
    }
  }

  const scriptCourant = document.currentScript;
  const racine = scriptCourant ? scriptCourant.parentElement : document.getElementById('sidebar');
  if(racine){
    injecterStyle();
    racine.innerHTML = construireHTML();
    attacherEvenements(racine);
    window.addEventListener('hashchange', mettreAJourEtatsActifs);
  }

})();
