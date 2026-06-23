/**
 * APH Drone SARL — Création automatique de l'arborescence Google Drive
 * Coller ce script dans Google Apps Script et cliquer sur Exécuter
 */

function creerArborescenceAPHDrone() {

  // Dossier racine — sera créé dans Mon Drive
  var racine = DriveApp.createFolder("📁 APH Drone SARL");

  // ── 01 ADMINISTRATIF ──────────────────────────────────────
  var admin = racine.createFolder("01 — ADMINISTRATIF");
  var juridique = admin.createFolder("Juridique");
  juridique.createFolder("Statuts SARL");
  juridique.createFolder("Kbis");
  juridique.createFolder("Assurances");
  var compta = admin.createFolder("Comptabilité");
  compta.createFolder("2024");
  compta.createFolder("2025");
  compta.createFolder("2026");
  var devis = admin.createFolder("Devis & Factures");
  devis.createFolder("2024");
  devis.createFolder("2025");
  devis.createFolder("2026");
  admin.createFolder("Contrats");

  // ── 02 RÉGLEMENTATION & CERTIFICATIONS ───────────────────
  var reglementation = racine.createFolder("02 — RÉGLEMENTATION & CERTIFICATIONS");
  var dgac = reglementation.createFolder("DGAC");
  dgac.createFolder("Déclarations opérateur");
  dgac.createFolder("Autorisations de vol");
  dgac.createFolder("Correspondances DGAC");
  var certifs = reglementation.createFolder("Certifications télépilote");
  certifs.createFolder("Open A2");
  certifs.createFolder("STS-01");
  certifs.createFolder("Autres certifications");
  reglementation.createFolder("Certiphyto & DIA Nuisibles");
  var manex = reglementation.createFolder("MANEX");
  manex.createFolder("Partie A — Généralités");
  manex.createFolder("Partie B — Organisation");
  manex.createFolder("Partie C — Opérations");
  manex.createFolder("Partie D — Maintenance");
  manex.createFolder("Partie E — Activités spécifiques");
  manex.createFolder("Partie F — Formation");

  // ── 03 ÉQUIPEMENTS ────────────────────────────────────────
  var equipements = racine.createFolder("03 — ÉQUIPEMENTS");
  var mini4 = equipements.createFolder("DJI Mini 4 Pro");
  mini4.createFolder("Manuel");
  mini4.createFolder("Maintenance");
  mini4.createFolder("Immatriculation DGAC");
  var mavic3 = equipements.createFolder("DJI Mavic 3 Multispectral");
  mavic3.createFolder("Manuel");
  mavic3.createFolder("Maintenance");
  mavic3.createFolder("Immatriculation DGAC");
  var agras = equipements.createFolder("DJI AGRAS T100");
  agras.createFolder("Manuel");
  agras.createFolder("Maintenance");
  agras.createFolder("Immatriculation DGAC");

  // ── 04 OPÉRATIONS ─────────────────────────────────────────
  var operations = racine.createFolder("04 — OPÉRATIONS");
  operations.createFolder("Journal de vol");
  var sora = operations.createFolder("Dossiers SORA");
  sora.createFolder("Par mission");
  var missions = operations.createFolder("Missions réalisées");
  missions.createFolder("2024");
  missions.createFolder("2025");
  missions.createFolder("2026");
  operations.createFolder("Photos & vidéos missions");

  // ── 05 COMMERCIAL ─────────────────────────────────────────
  var commercial = racine.createFolder("05 — COMMERCIAL");
  commercial.createFolder("Prospection");
  commercial.createFolder("Clients");
  commercial.createFolder("Partenaires");
  commercial.createFolder("Communication & site web");

  // ── 06 FORMATIONS ─────────────────────────────────────────
  var formations = racine.createFolder("06 — FORMATIONS");

  // Documents communs
  var commun = formations.createFolder("COMMUN — Documents types");
  commun.createFolder("Règlement intérieur");
  commun.createFolder("Formulaire satisfaction (vierge)");
  commun.createFolder("Formulaire réclamation (vierge)");
  commun.createFolder("Formulaire CRESUS (vierge)");
  commun.createFolder("Modèle attestation de présence");

  // Supports de cours
  var supports = formations.createFolder("SUPPORTS DE COURS");
  supports.createFolder("Initiation A1/A3");
  supports.createFolder("BAPD A2");
  supports.createFolder("CATS STS-01/02");
  supports.createFolder("Vol de nuit");
  supports.createFolder("Thermographie");
  supports.createFolder("Agriculture de précision");
  supports.createFolder("Cartographie & 3D");
  supports.createFolder("Inspection technique");
  supports.createFolder("Sécurité Recherche & Secours");
  supports.createFolder("Maîtrise opérationnelle");
  supports.createFolder("Sylviculture & biodiversité");
  supports.createFolder("Données & géolocalisation");
  supports.createFolder("Mise à niveau réglementaire");
  supports.createFolder("SORA & PDRA");
  supports.createFolder("Changer de carrière");

  // Stagiaires
  var stagiaires = formations.createFolder("STAGIAIRES");
  var salif = stagiaires.createFolder("SC2024 — Salif Coulibaly");
  salif.createFolder("CATS STS-01/02");
  salif.createFolder("Règlement intérieur");
  salif.createFolder("Formulaire satisfaction");
  salif.createFolder("Formulaire réclamation");
  salif.createFolder("Formulaire CRESUS");
  salif.createFolder("Attestation de présence");

  // ── 07 SDIS 70 ────────────────────────────────────────────
  var sdis = racine.createFolder("07 — SDIS 70");
  var fmpa = sdis.createFolder("FMPA Drone");
  fmpa.createFolder("Documents de cours");
  fmpa.createFolder("Scénarios opérationnels");
  fmpa.createFolder("RETEX");
  sdis.createFolder("Missions drone SDIS");

  // Message de confirmation
  Logger.log("✅ Arborescence APH Drone créée avec succès !");
  Logger.log("📁 Dossier racine : " + racine.getName());
  Logger.log("🔗 Lien : " + racine.getUrl());
}
