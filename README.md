# APH Drone — Site Web

Site institutionnel d'APH Drone SASU, opérateur drone professionnel certifié DGAC, basé à Luxeuil-les-Bains (Haute-Saône).

Site en ligne : [aphdrone.fr](https://aphdrone.fr) — hébergé via GitHub Pages, publié depuis la branche `principal`.

## Arborescence (à jour au 03/07/2026)

```
aphdrone.github.io/
├── index.html                          ← Page d'accueil
├── formations.html                     ← Catalogue formations
├── prestations.html                    ← Page hub prestations
├── main.js                             ← JS commun (racine)
├── CNAME                               ← Domaine personnalisé (aphdrone.fr)
├── .nojekyll                           ← Désactive le traitement Jekyll de GitHub Pages
│
├── assets/                             ← Ressources statiques
│   ├── images/                         ← Photos, visuels
│   ├── logos/
│   ├── videos/
│   ├── logo.jpg                        ← Logo rond (utilisé notamment dans les PDF générés)
│   ├── style.css                       ← Feuille de style principale
│   ├── mobile.css                      ← Ajustements responsive
│   ├── include.js                      ← Injection des partials header/footer
│   └── cookies.js                      ← Bandeau consentement cookies
│
├── css/
│   └── shared.css
│
├── js/
│   └── main.js
│
├── partials/                           ← Fragments injectés sur chaque page (via include.js)
│   ├── header.html
│   └── footer.html
│
├── office/                             ← Panneau d'administration (accès réservé)
│   ├── index.html                      ← Tableau de bord admin (clients, stagiaires, outils)
│   └── admin-recrutement.html
│
└── pages/                              ← Toutes les pages de contenu et espaces personnels
    │
    ├── connexion.html                  ← Connexion stagiaire / client
    ├── espace-stagiaires.html          ← Espace personnel stagiaire (formations, émargement, documents)
    ├── espace-clients.html             ← Espace personnel client
    │
    ├── formulaire-satisfaction.html    ← Formulaire de satisfaction (signature manuscrite)
    ├── formulaire-reclamation.html     ← Formulaire de réclamation (signature manuscrite)
    ├── fiche-renseignements.html       ← Fiche de renseignements stagiaire (signature manuscrite)
    ├── reglement-interieur.html        ← Règlement intérieur (signature manuscrite)
    ├── attestation-zone-exclusion.html ← Attestation d'information zone d'exclusion des tiers (accès public, signature manuscrite)
    │
    ├── apropos.html
    ├── actualites.html                 ← Blog (contenu chargé depuis Firestore, collection `actualites`)
    ├── contact.html
    ├── partenaires.html
    ├── recrutement.html
    ├── hebergement.html
    ├── cgu.html
    ├── cgv.html
    ├── mentions-legales.html
    ├── confidentialite.html
    │
    ├── formations/                     ← Pages détaillées par formation
    ├── prestations/                    ← Pages détaillées par prestation
    ├── outils/                         ← Outils (météo, préparation vol, etc.)
    └── stagiaires/                     ← Ressources dédiées stagiaires
```

## Stack technique

- **Hébergement** : GitHub Pages (branche `principal`, domaine personnalisé `aphdrone.fr` via OVHcloud)
- **Base de données / Auth** : Firebase (projet `aph-drone`) — Firestore + Authentication
- **Génération de PDF** : jsPDF + jspdf-autotable (feuilles d'émargement), html2canvas (capture fidèle des formulaires signés)
- **Envoi d'emails** : Google Apps Script (un déploiement séparé par formulaire, voir liste ci-dessous) — remplace l'ancienne approche Cloud Functions Firebase (payante)

### Déploiements Google Apps Script actifs

Chaque formulaire avec signature envoie son PDF par email à `contact@aphdrone.fr` via un projet Apps Script dédié et indépendant (pour qu'une panne sur l'un n'affecte jamais les autres) :
- Formulaire de satisfaction
- Formulaire de réclamation
- Fiche de renseignements
- Attestation d'information (zone d'exclusion)
- Règlement intérieur
- Émargement (feuilles de présence)

Les URLs de déploiement sont codées en dur dans chaque fichier HTML correspondant (variable `APPS_SCRIPT_URL`).

## Sécurité

- La clé API Firebase visible dans le code est une clé de configuration publique par nature (documenté par Google) — la protection réelle des données repose sur les **règles de sécurité Firestore**, pas sur le secret de cette clé.
- La clé est restreinte par domaine (référents HTTP) dans Google Cloud Console pour éviter tout usage détourné sur d'autres sites.
- L'accès au panneau admin (`office/`) est contrôlé par Firebase Authentication + vérification de l'email admin, avec des règles Firestore appliquant ce même contrôle côté serveur.

## Notes de maintenance

- Ne jamais commiter de scripts Google Apps Script (`.gs`) à la racine du dépôt : ils s'exécutent sur script.google.com, pas sur GitHub Pages, et n'ont rien à y faire.
- Si le site se dépublie après plusieurs commits rapprochés, vérifier l'onglet Actions : un déploiement resté bloqué en file d'attente peut être débloqué en repassant la source Pages sur "Aucun" puis à nouveau sur la branche `principal` (Settings → Pages).
