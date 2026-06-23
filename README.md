# APH Drone — Site Web

Site institutionnel d'APH Drone SARL, opérateur drone professionnel certifié DGAC, basé à Luxeuil-les-Bains (Haute-Saône).

## Arborescence

```
aphdrone/
├── index.html                          ← Homepage (complète)
├── assets/
│   ├── css/
│   │   └── shared.css                  ← CSS commun à toutes les pages
│   ├── js/
│   │   └── main.js                     ← JS commun à toutes les pages
│   └── img/                            ← Images (logo, photos missions…)
│
└── pages/
    │
    ├── apropos.html                    ← À propos / présentation société
    ├── equipe.html                     ← L'équipe
    ├── certifications.html             ← Certifications DGAC
    ├── equipements.html                ← Parc matériel (DJI Mini 4 Pro, Mavic 3 MS, AGRAS T100)
    ├── zone-intervention.html          ← Carte & zone d'intervention
    ├── partenaires.html                ← Partenaires & clients
    ├── temoignages.html                ← Témoignages clients
    ├── recrutement.html                ← Recrutement
    ├── actualites.html                 ← Blog & actualités
    ├── contact.html                    ← Formulaire de contact
    ├── prestations.html                ← Page hub prestations
    ├── formations.html                 ← Catalogue formations
    ├── mentions-legales.html
    ├── confidentialite.html
    ├── cookies.html
    │
    ├── prestations/
    │   ├── cartographie.html           ← Cartographie & Modélisation 3D
    │   ├── surveillance.html           ← Surveillance & Sécurité
    │   ├── environnement.html          ← Environnement & biodiversité
    │   ├── agriculture.html            ← Agriculture de précision / pulvérisation
    │   ├── inspection.html             ← Inspection technique
    │   ├── thermographie.html          ← Thermographie
    │   ├── photo-video.html            ← Photo & vidéo aérienne
    │   ├── services-prestataires.html  ← Services aux prestataires drone
    │   ├── conseil-audit.html          ← Conseil & audit opérationnel
    │   ├── telepilote-mission.html     ← Télépilote en mission
    │   ├── formateur-agree.html        ← Formateur agréé
    │   ├── sora-pdra.html              ← Expert SORA / PDRA
    │   └── autres.html                 ← Index autres prestations
    │
    ├── formations/
    │   ├── initiation-a1a3.html        ← Initiation A1/A3 (290 € HT)
    │   ├── bapd-a2.html                ← BAPD catégorie A2
    │   ├── cats-sts.html               ← CATS STS-01/STS-02 (5 jours)
    │   ├── vol-nuit.html               ← Vol de nuit
    │   ├── sylviculture.html           ← Sylviculture & biodiversité
    │   ├── maitrise-pilotage.html      ← Maîtrise opérationnelle
    │   ├── thermographie.html          ← Thermographie
    │   ├── donnees-exploitables.html   ← Données exploitables & géolocalisation
    │   ├── inspection.html             ← Inspection technique
    │   ├── cartographie.html           ← Cartographie & 3D
    │   ├── agriculture.html            ← Agriculture & arboriculture
    │   ├── securite-secours.html       ← Sécurité, Recherche & Secours (SDIS)
    │   ├── maj-reglementaire.html      ← Mise à niveau réglementaire
    │   ├── sora-pdra.html              ← Catégorie spécifique SORA & PDRA
    │   ├── changer-carriere.html       ← Reconversion métiers du drone
    │   └── autres.html                 ← Index autres formations
    │
    └── outils/
        ├── reglementation.html         ← Réglementation drone (liens DGAC)
        ├── meteo.html                  ← Préparation météo (METAR/TAF)
        ├── preparation-vol.html        ← Check-list pré-vol
        ├── elearning.html              ← Ressources e-learning
        └── qcm.html                    ← QCM d'entraînement

```

## Total : 51 fichiers HTML (1 homepage + 50 pages)

## Palette & typographie
- Couleur principale : `#7a8fa5` (bleu-gris)
- Typographies : Raleway (titres) + Open Sans (corps)
- CSS partagé : `assets/css/shared.css`
- JS partagé : `assets/js/main.js`

## GitHub Pages
Activer dans **Settings → Pages → Branch: main / root**  
URL : `https://aphdrone.github.io/drone-aph/`

## Workflow d'alimentation
1. Ouvrir le fichier de la page à alimenter
2. Remplacer le bloc `<!-- PLACEHOLDER -->` par le contenu définitif
3. Commit + push → GitHub Pages met à jour automatiquement
