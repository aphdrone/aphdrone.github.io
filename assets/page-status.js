/* APH Drone — Vérifie si la page (formation ou prestation) est active,
   et si un message ("Nouveauté", "Promo"...) doit être affiché.
   Le type et le slug sont déduits automatiquement du chemin de l'URL
   (/pages/formations/xxx.html ou /pages/prestations/xxx.html) :
   aucune configuration à faire page par page.
   Si la page a été désactivée depuis l'admin (panel "Visibilité"),
   le contenu est masqué et remplacé par un message "indisponible".

   Compatible avec les deux templates du site : les pages de prestations
   utilisent la classe ".page-hero" + un conteneur ".main" ; les pages de
   formations utilisent ".formation-hero" et plusieurs sections indépendantes
   (pas de conteneur unique). Le masquage du contenu se fait donc de façon
   générique (tous les enfants directs du <body>, hors header/footer/scripts),
   pour fonctionner sur les deux templates sans distinction.

   À inclure juste avant </body> sur chaque page individuelle :
   <script type="module" src="/assets/page-status.js"></script>
*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(async function () {
  var path = window.location.pathname;
  var m = path.match(/\/pages\/(formations|prestations)\/([a-z0-9-]+)\.html/i);
  if (!m) return; // pas une page individuelle formation/prestation

  var type = m[1] === 'formations' ? 'formation' : 'prestation';
  var slug = m[2];
  var docId = type + '__' + slug;

  var firebaseConfig = {
    apiKey: "AIzaSyAV5NQWfp8n9RkTrHSwqssBJ4R9lNAuYK8",
    authDomain: "aph-drone.firebaseapp.com",
    projectId: "aph-drone",
    storageBucket: "aph-drone.firebasestorage.app",
    messagingSenderId: "316810168380",
    appId: "1:316810168380:web:66cb916cec4fdc00b9db39"
  };

  try {
    var app = initializeApp(firebaseConfig, 'PageStatus-' + Date.now());
    var db = getFirestore(app);
    var snap = await getDoc(doc(db, 'pageStatus', docId));
    if (snap.exists()) {
      var data = snap.data();
      if (data.active === false) {
        showUnavailable(type);
      } else if (data.badge && data.badge.enabled && data.badge.text) {
        showBadge(data.badge.text);
      }
    }
  } catch (e) {
    console.warn('page-status:', e.message);
  }

  function getHero() {
    return document.querySelector('.page-hero, .formation-hero');
  }

  function showBadge(text) {
    // Ruban incliné, position fixe à l'écran : reste visible en permanence,
    // même pendant le scroll, peu importe le template de la page.
    var ribbon = document.createElement('div');
    ribbon.textContent = text;
    ribbon.style.cssText =
      'position:fixed;top:150px;left:-52px;z-index:500;' +
      'width:200px;padding:9px 0;text-align:center;' +
      'transform:rotate(-45deg);transform-origin:center;' +
      'background:rgba(16,150,105,.82);color:white;' +
      "font-family:'Inter',sans-serif;font-size:13px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;" +
      'box-shadow:0 6px 18px rgba(0,0,0,.28);pointer-events:none;';
    document.body.appendChild(ribbon);
  }

  function showUnavailable(type) {
    // Masquage générique : on cache tout le contenu de la page (hero + sections),
    // sans dépendre du nom des classes CSS, qui diffère entre formations et prestations.
    var header = document.getElementById('site-header');
    var mobileMenu = document.getElementById('mobile-menu');
    var anchor = mobileMenu || header;

    Array.prototype.forEach.call(document.body.children, function (child) {
      if (child === header || child === mobileMenu || child.tagName === 'SCRIPT' || child.tagName === 'FOOTER') return;
      child.style.display = 'none';
    });

    var backHref = type === 'formation' ? '../../formations.html' : '../../prestations.html';
    var backLabel = type === 'formation' ? 'formations' : 'prestations';

    var block = document.createElement('div');
    block.style.cssText = 'max-width:640px;margin:110px auto 100px;padding:0 24px;text-align:center;';
    block.innerHTML =
      '<div style="width:64px;height:64px;border-radius:50%;background:#eef1f6;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a94a3" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
      '</div>' +
      '<h1 style="font-family:\'Inter\',sans-serif;font-size:1.6rem;font-weight:700;color:#0B1F3A;margin-bottom:12px;">Offre temporairement indisponible</h1>' +
      '<p style="font-family:\'Inter\',sans-serif;font-size:.95rem;color:#666;line-height:1.7;margin-bottom:28px;">Cette page n\'est pas accessible pour le moment. Contactez-nous pour en savoir plus ou découvrez nos autres ' + backLabel + '.</p>' +
      '<a href="' + backHref + '" style="display:inline-flex;align-items:center;gap:8px;background:#1F5FAF;color:white;padding:12px 26px;border-radius:8px;font-family:\'Inter\',sans-serif;font-size:14px;font-weight:600;text-decoration:none;">Voir toutes les ' + backLabel + '</a>';

    if (anchor) {
      anchor.insertAdjacentElement('afterend', block);
    } else {
      document.body.appendChild(block);
    }
  }
})();
