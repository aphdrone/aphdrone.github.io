// APH Drone — Check-list Météo Pré-vol
// Réception des données + génération PDF + envoi email
// À coller dans Extensions → Apps Script du Google Sheet

var EMAIL_FORMATEUR = "aph.moreau@gmail.com";
var NOM_FORMATEUR = "Arnaud MOREAU — APH Drone SARL";

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // 1. Enregistrer dans le Sheet
    sheet.appendRow([
      data.date,
      data.heure,
      data.nom,
      data.prenom,
      data.email,
      data.drone || "—",
      data.lieu || "—",
      data.score,
      "✅ Signé"
    ]);
    
    // 2. Générer et envoyer le PDF
    try {
      envoyerPDF(data);
    } catch(emailErr) {
      Logger.log("Erreur email: " + emailErr.toString());
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "OK" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ERREUR", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function envoyerPDF(data) {
  
  // Créer le contenu HTML du PDF
  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"/>';
  htmlContent += '<style>';
  htmlContent += 'body { font-family: Arial, sans-serif; margin: 20px; color: #1a1a1a; }';
  htmlContent += 'h1 { color: #7a8fa5; font-size: 18px; border-bottom: 2px solid #7a8fa5; padding-bottom: 8px; }';
  htmlContent += 'h2 { color: #7a8fa5; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 20px; border-bottom: 1px solid #e8edf2; padding-bottom: 4px; }';
  htmlContent += '.header { background: #7a8fa5; color: white; padding: 16px 20px; margin-bottom: 20px; }';
  htmlContent += '.header h1 { color: white; border: none; margin: 0; }';
  htmlContent += '.header p { margin: 4px 0 0; font-size: 11px; opacity: 0.8; }';
  htmlContent += '.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }';
  htmlContent += '.info-item { background: #f5f7fa; padding: 8px 12px; }';
  htmlContent += '.info-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; }';
  htmlContent += '.info-val { font-size: 13px; font-weight: bold; margin-top: 2px; }';
  htmlContent += '.section-title { background: #7a8fa5; color: white; padding: 6px 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin: 12px 0 4px; }';
  htmlContent += '.item { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px; }';
  htmlContent += '.item:last-child { border: none; }';
  htmlContent += '.check { color: #43a047; font-weight: bold; font-size: 14px; }';
  htmlContent += '.verdict { margin-top: 16px; padding: 12px 16px; border-radius: 4px; font-weight: bold; font-size: 14px; }';
  htmlContent += '.verdict.ok { background: #e8f5e9; color: #2e7d32; border-left: 4px solid #43a047; }';
  htmlContent += '.verdict.warn { background: #fff3e0; color: #e65100; border-left: 4px solid #fb8c00; }';
  htmlContent += '.verdict.stop { background: #ffebee; color: #c62828; border-left: 4px solid #e53935; }';
  htmlContent += '.sig-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; border-top: 1px solid #e8edf2; padding-top: 16px; }';
  htmlContent += '.sig-box { font-size: 11px; color: #6b7280; }';
  htmlContent += '.sig-name { font-weight: bold; color: #1a1a1a; font-size: 13px; margin-bottom: 4px; }';
  htmlContent += '.sig-line { border-bottom: 1px solid #1a1a1a; margin-top: 40px; }';
  htmlContent += '.footer { background: #7a8fa5; color: white; padding: 8px 20px; margin-top: 20px; font-size: 9px; opacity: 0.9; }';
  htmlContent += '</style></head><body>';
  
  // En-tête
  htmlContent += '<div class="header">';
  htmlContent += '<h1>✅ Check-list Météo Pré-vol</h1>';
  htmlContent += '<p>APH Drone SARL — 44 rue Georges Moulimard — 70300 Luxeuil-les-Bains</p>';
  htmlContent += '</div>';
  
  // Infos mission
  htmlContent += '<div class="info-grid">';
  htmlContent += '<div class="info-item"><div class="info-label">Date</div><div class="info-val">' + (data.date || '—') + '</div></div>';
  htmlContent += '<div class="info-item"><div class="info-label">Heure</div><div class="info-val">' + (data.heure || '—') + '</div></div>';
  htmlContent += '<div class="info-item"><div class="info-label">Télépilote</div><div class="info-val">' + (data.prenom || '') + ' ' + (data.nom || '') + '</div></div>';
  htmlContent += '<div class="info-item"><div class="info-label">Email</div><div class="info-val">' + (data.email || '—') + '</div></div>';
  htmlContent += '<div class="info-item"><div class="info-label">Drone</div><div class="info-val">' + (data.drone || '—') + '</div></div>';
  htmlContent += '<div class="info-item"><div class="info-label">Lieu de vol</div><div class="info-val">' + (data.lieu || '—') + '</div></div>';
  htmlContent += '</div>';
  
  // Score et verdict
  var scoreText = data.score || '—';
  var verdictClass = 'ok';
  var verdictText = '✅ Vol autorisé';
  if (scoreText.indexOf('Sous conditions') > -1) { verdictClass = 'warn'; verdictText = '⚠️ Sous conditions'; }
  if (scoreText.indexOf('Reporté') > -1) { verdictClass = 'stop'; verdictText = '🚫 Vol reporté'; }
  
  htmlContent += '<div class="info-item" style="margin-bottom:8px"><div class="info-label">Score</div><div class="info-val">' + scoreText + '</div></div>';
  htmlContent += '<div class="verdict ' + verdictClass + '">' + verdictText + '</div>';
  
  // Points vérifiés
  var items = data.items || [];
  if (items.length > 0) {
    var sections = [
      { titre: "☁ Conditions générales", ids: [0,1,2,3,4] },
      { titre: "☀ Activité atmosphérique & solaire", ids: [5,6,7] },
      { titre: "⚖ Réglementation & documentation", ids: [8,9,10,11] },
      { titre: "🗺 Cartes aéronautiques Aéroweb", ids: [12,13] }
    ];
    
    sections.forEach(function(sec) {
      htmlContent += '<div class="section-title">' + sec.titre + '</div>';
      sec.ids.forEach(function(i) {
        if (items[i]) {
          htmlContent += '<div class="item"><span class="check">' + (items[i].checked ? '✓' : '○') + '</span><span>' + items[i].label + '</span></div>';
        }
      });
    });
  }
  
  // Signatures
  htmlContent += '<div class="sig-section">';
  htmlContent += '<div class="sig-box"><div class="sig-label">Signature du télépilote</div><div class="sig-name">' + (data.prenom || '') + ' ' + (data.nom || '') + '</div><div class="sig-line"></div></div>';
  htmlContent += '<div class="sig-box"><div class="sig-label">Visa responsable opération</div><div class="sig-name">Arnaud MOREAU — APH Drone SARL</div><div style="font-size:10px;color:#6b7280;margin-top:4px">Signé électroniquement le ' + (data.date || '') + '</div></div>';
  htmlContent += '</div>';
  
  // Pied de page
  htmlContent += '<div class="footer">APH Drone SARL — aphdrone@gmail.com — 06 95 39 07 76 | Document généré automatiquement</div>';
  htmlContent += '</body></html>';
  
  // Convertir HTML en PDF via Google Docs
  var blob = Utilities.newBlob(htmlContent, 'text/html', 'checklist.html');
  var file = DriveApp.createFile(blob);
  
  // Convertir en PDF
  var pdfBlob = DriveApp.getFileById(file.getId()).getAs('application/pdf');
  pdfBlob.setName('APH_Drone_Checklist_Meteo_' + (data.nom || 'stagiaire') + '_' + (data.date || '').replace(/\//g, '-') + '.pdf');
  
  // Supprimer le fichier temporaire
  file.setTrashed(true);
  
  // Sujet email
  var sujet = 'Check-list Météo — ' + (data.prenom || '') + ' ' + (data.nom || '') + ' — ' + (data.date || '');
  
  // Corps email formateur
  var corpsFormateur = 'Bonjour,\n\n';
  corpsFormateur += 'Une nouvelle check-list météo pré-vol a été validée.\n\n';
  corpsFormateur += 'Télépilote : ' + (data.prenom || '') + ' ' + (data.nom || '') + '\n';
  corpsFormateur += 'Date : ' + (data.date || '—') + ' à ' + (data.heure || '—') + '\n';
  corpsFormateur += 'Lieu : ' + (data.lieu || '—') + '\n';
  corpsFormateur += 'Drone : ' + (data.drone || '—') + '\n';
  corpsFormateur += 'Score : ' + (data.score || '—') + '\n\n';
  corpsFormateur += 'Le PDF est joint à cet email.\n\n';
  corpsFormateur += 'APH Drone SARL';
  
  // Envoyer au formateur
  GmailApp.sendEmail(
    EMAIL_FORMATEUR,
    sujet,
    corpsFormateur,
    { attachments: [pdfBlob], name: NOM_FORMATEUR }
  );
  
  // Envoyer une copie au stagiaire si email fourni
  if (data.email && data.email.indexOf('@') > -1) {
    var corpsStagiaire = 'Bonjour ' + (data.prenom || '') + ',\n\n';
    corpsStagiaire += 'Votre check-list météo pré-vol du ' + (data.date || '') + ' a bien été enregistrée.\n\n';
    corpsStagiaire += 'Score : ' + (data.score || '—') + '\n\n';
    corpsStagiaire += 'Le PDF de votre check-list est joint à cet email.\n\n';
    corpsStagiaire += 'Bons vols !\n\n';
    corpsStagiaire += 'Arnaud MOREAU\nAPH Drone SARL\n06 95 39 07 76';
    
    GmailApp.sendEmail(
      data.email,
      'Votre check-list météo — APH Drone',
      corpsStagiaire,
      { attachments: [pdfBlob], name: NOM_FORMATEUR }
    );
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "APH Drone Check-list Météo OK" }))
    .setMimeType(ContentService.MimeType.JSON);
}
