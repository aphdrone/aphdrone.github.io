/* APH Drone — Injection automatique du header et du footer communs
   Utilisation : ajouter dans chaque page (avant </body>) :
   <div id="header-placeholder"></div>  (juste après <body>)
   <div id="footer-placeholder"></div>  (à l'endroit du footer)
   <script src="/assets/include.js"></script>
*/
(function () {
  var partialsLoaded = 0;

  function loadPartial(url, placeholderId, callback) {
    var el = document.getElementById(placeholderId);
    if (!el) { partialsLoaded++; return; }
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Erreur chargement ' + url);
        return res.text();
      })
      .then(function (html) {
        el.outerHTML = html;
        if (callback) callback();
      })
      .catch(function (err) {
        console.error(err);
      })
      .finally(function () {
        partialsLoaded++;
        if (partialsLoaded === 2) hideInactiveNavLinks();
      });
  }

  function initHeaderBehavior() {
    document.querySelectorAll('#site-header .has-dropdown').forEach(function (item) {
      var dd = item.querySelector('.dropdown');
      if (!dd) return;
      item.addEventListener('mouseenter', function () { dd.style.display = 'block'; });
      item.addEventListener('mouseleave', function () { dd.style.display = 'none'; });
    });

    window.toggleMobileMenu = function () {
      var menu = document.getElementById('mobile-menu');
      if (!menu) return;
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    };

    function checkMobile() {
      var burger = document.getElementById('burger-btn');
      if (!burger) return;
      if (window.innerWidth <= 768) {
        burger.style.display = 'flex';
      } else {
        burger.style.display = 'none';
        var m = document.getElementById('mobile-menu');
        if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
      }
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Marquer le lien de navigation actif selon l'URL courante
    var current = window.location.pathname;
    document.querySelectorAll('#site-header nav a, .mobile-menu-sub a').forEach(function (a) {
      if (a.getAttribute('href') === '#') return;
      try {
        var linkPath = new URL(a.href).pathname;
        if (linkPath === current) {
          a.classList.add('active-link');
        }
      } catch (e) {}
    });
  }

  // ── Masque les liens de menu (header + footer) des formations/prestations/pages
  //    désactivées depuis l'admin (onglet "Visibilité"), et bloque la page
  //    elle-même si elle est de type "page" et désactivée. ──
  var KNOWN_PAGES = ['apropos', 'hebergement', 'partenaires', 'actualites', 'recrutement', 'reglementation', 'preparation-vol'];

  function getCurrentPageInfo() {
    var path = window.location.pathname;
    var m = path.match(/\/pages\/(?:outils\/)?([a-z0-9-]+)\.html$/i);
    if (m && KNOWN_PAGES.indexOf(m[1]) !== -1) {
      return { type: 'page', slug: m[1] };
    }
    return null;
  }

  function showGenericUnavailable() {
    var header = document.getElementById('site-header');
    var mobileMenu = document.getElementById('mobile-menu');
    var anchor = mobileMenu || header;
    Array.prototype.forEach.call(document.body.children, function (child) {
      if (child === header || child === mobileMenu || child.tagName === 'SCRIPT' || child.tagName === 'FOOTER') return;
      child.style.display = 'none';
    });

    var block = document.createElement('div');
    block.style.cssText = 'max-width:640px;margin:110px auto 100px;padding:0 24px;text-align:center;';
    block.innerHTML =
      '<div style="width:64px;height:64px;border-radius:50%;background:#eef1f6;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a94a3" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
      '</div>' +
      '<h1 style="font-family:\'Inter\',sans-serif;font-size:1.6rem;font-weight:700;color:#0B1F3A;margin-bottom:12px;">Page temporairement indisponible</h1>' +
      '<p style="font-family:\'Inter\',sans-serif;font-size:.95rem;color:#666;line-height:1.7;margin-bottom:28px;">Cette page n\'est pas accessible pour le moment. Merci de revenir un peu plus tard.</p>' +
      '<a href="/index.html" style="display:inline-flex;align-items:center;gap:8px;background:#1F5FAF;color:white;padding:12px 26px;border-radius:8px;font-family:\'Inter\',sans-serif;font-size:14px;font-weight:600;text-decoration:none;">Retour à l\'accueil</a>';

    if (anchor) { anchor.insertAdjacentElement('afterend', block); }
    else { document.body.appendChild(block); }
  }

  function hideInactiveNavLinks() {
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js').then(function (appMod) {
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js').then(function (fsMod) {
        var firebaseConfig = {
          apiKey: "AIzaSyAV5NQWfp8n9RkTrHSwqssBJ4R9lNAuYK8",
          authDomain: "aph-drone.firebaseapp.com",
          projectId: "aph-drone",
          storageBucket: "aph-drone.firebasestorage.app",
          messagingSenderId: "316810168380",
          appId: "1:316810168380:web:66cb916cec4fdc00b9db39"
        };
        try {
          var app = appMod.initializeApp(firebaseConfig, 'NavStatus-' + Date.now());
          var db = fsMod.getFirestore(app);
          var currentPage = getCurrentPageInfo();
          fsMod.getDocs(fsMod.collection(db, 'pageStatus')).then(function (snap) {
            snap.forEach(function (docSnap) {
              var d = docSnap.data();
              if (d.active === false) {
                document.querySelectorAll(
                  'a[data-type="' + d.type + '"][data-slug="' + d.slug + '"]'
                ).forEach(function (a) {
                  var li = a.closest('li');
                  if (li) { li.style.display = 'none'; } else { a.style.display = 'none'; }
                });
                if (currentPage && d.type === currentPage.type && d.slug === currentPage.slug) {
                  showGenericUnavailable();
                }
              }
            });
          });
        } catch (e) {
          console.warn('nav-status:', e.message);
        }
      });
    });
  }

  // ── Bandeau d'annonce flottant (piloté depuis l'admin → siteConfig/bandeau) ──
  function renderAnnounceBanner(cfg) {
    if (!cfg || cfg.active !== true) return;
    if (sessionStorage.getItem('aph_banner_closed_' + (cfg.updatedAt || '')) === '1') return;

    var style = document.createElement('style');
    style.textContent =
      '@keyframes aphBannerIn{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}' +
      '@keyframes aphBadgePulse{0%,100%{box-shadow:0 0 0 0 rgba(224,49,49,.55)}50%{box-shadow:0 0 0 6px rgba(224,49,49,0)}}' +
      '#aph-banner{animation:aphBannerIn .5s ease-out;position:fixed;top:0;left:0;width:100%;box-sizing:border-box;z-index:10000;background:#0B1F3A;color:#fff;padding:9px 44px 9px 16px;display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;font-family:"Inter",sans-serif;}' +
      '#aph-banner .aph-badge{background:#E03131;color:#fff;font-size:11px;font-weight:600;letter-spacing:.03em;padding:3px 11px;border-radius:20px;animation:aphBadgePulse 1.8s ease-in-out infinite;white-space:nowrap;}' +
      '#aph-banner .aph-msg{font-size:13px;}' +
      '#aph-banner .aph-cta{background:#4A90E2;color:#fff;font-size:12px;font-weight:600;padding:6px 14px;border-radius:20px;text-decoration:none;white-space:nowrap;}' +
      '#aph-banner .aph-close{position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;color:rgba(255,255,255,.65);font-size:18px;line-height:1;background:none;border:none;padding:4px;}' +
      '#aph-banner .aph-close:hover{color:#fff;}' +
      '@media(max-width:600px){#aph-banner{font-size:12px;padding:8px 40px 8px 12px;}}';
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'aph-banner';
    bar.innerHTML =
      (cfg.badge ? '<span class="aph-badge">' + cfg.badge + '</span>' : '') +
      '<span class="aph-msg">' + (cfg.message || '') + '</span>' +
      (cfg.linkUrl ? '<a class="aph-cta" href="' + cfg.linkUrl + '">' + (cfg.linkLabel || 'Découvrir') + '</a>' : '') +
      '<button class="aph-close" aria-label="Fermer">&times;</button>';

    document.body.insertBefore(bar, document.body.firstChild);

    // Le menu (#site-header) est en position fixed collé en haut, et body a déjà
    // un padding-top pour compenser sa hauteur. On repousse le menu sous le bandeau
    // (fixed lui aussi) et on ajoute la hauteur du bandeau au padding existant.
    function repositionHeader() {
      var h = bar.offsetHeight;
      var header = document.getElementById('site-header');
      if (header) {
        if (!header.dataset.aphOrigTop) {
          header.dataset.aphOrigTop = header.style.top || '0px';
        }
        if (!header.dataset.aphOrigPad) {
          var cs = window.getComputedStyle(document.body);
          header.dataset.aphOrigPad = parseFloat(cs.paddingTop) || 0;
        }
        header.style.top = h + 'px';
        document.body.style.paddingTop = (h + parseFloat(header.dataset.aphOrigPad)) + 'px';
      }
    }
    repositionHeader();
    window.addEventListener('resize', repositionHeader);

    bar.querySelector('.aph-close').addEventListener('click', function () {
      sessionStorage.setItem('aph_banner_closed_' + (cfg.updatedAt || ''), '1');
      bar.remove();
      var header = document.getElementById('site-header');
      if (header) {
        header.style.top = header.dataset.aphOrigTop || '0px';
        document.body.style.paddingTop = header.dataset.aphOrigPad ? header.dataset.aphOrigPad + 'px' : '';
      }
      window.removeEventListener('resize', repositionHeader);
    });
  }

  function loadAnnounceBanner() {
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js').then(function (appMod) {
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js').then(function (fsMod) {
        var firebaseConfig = {
          apiKey: "AIzaSyAV5NQWfp8n9RkTrHSwqssBJ4R9lNAuYK8",
          authDomain: "aph-drone.firebaseapp.com",
          projectId: "aph-drone",
          storageBucket: "aph-drone.firebasestorage.app",
          messagingSenderId: "316810168380",
          appId: "1:316810168380:web:66cb916cec4fdc00b9db39"
        };
        try {
          var app = appMod.initializeApp(firebaseConfig, 'Banner-' + Date.now());
          var db = fsMod.getFirestore(app);
          fsMod.getDoc(fsMod.doc(db, 'siteConfig', 'bandeau')).then(function (snap) {
            if (snap.exists()) renderAnnounceBanner(snap.data());
          });
        } catch (e) {
          console.warn('announce-banner:', e.message);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadPartial('/partials/header.html', 'header-placeholder', initHeaderBehavior);
    loadPartial('/partials/footer.html', 'footer-placeholder');
    loadAnnounceBanner();

    // Bandeau de consentement cookies (RGPD), chargé une seule fois sur toute page
    if (!document.querySelector('script[src="/assets/cookies.js"]')) {
      var cookieScript = document.createElement('script');
      cookieScript.src = '/assets/cookies.js';
      document.body.appendChild(cookieScript);
    }
  });
})();
