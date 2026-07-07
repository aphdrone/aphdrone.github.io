/* APH Drone — Vérifie si la page (formation ou prestation) est active.
   Le type et le slug sont déduits automatiquement du chemin de l'URL
   (/pages/formations/xxx.html ou /pages/prestations/xxx.html) :
   aucune configuration à faire page par page.
   Si la page a été désactivée depuis l'admin (panel "Visibilité"),
   le contenu est masqué et remplacé par un message "indisponible".

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
    if (snap.exists() && snap.data().active === false) {
      showUnavailable(type);
    }
  } catch (e) {
    console.warn('page-status:', e.message);
  }

  function showUnavailable(type) {
    var hero = document.querySelector('.page-hero');
    var main = document.querySelector('.main');
    if (hero) hero.style.display = 'none';
    if (main) main.style.display = 'none';

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

    var placeholder = document.getElementById('header-placeholder');
    if (placeholder) {
      placeholder.insertAdjacentElement('afterend', block);
    } else {
      document.body.insertBefore(block, document.body.firstChild);
    }
  }
})();
