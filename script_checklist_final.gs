// APH Drone — Check-list Météo Pré-vol
// Reçoit le PDF généré côté client et l'envoie par email
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
    
    // 2. Envoyer le PDF par email
    try {
      if (data.pdf) {
        envoyerEmail(data);
      }
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

function envoyerEmail(data) {
  // Décoder le PDF base64
  var pdfBytes = Utilities.base64Decode(data.pdf);
  var pdfBlob = Utilities.newBlob(pdfBytes, 'application/pdf', 
    'APH_Drone_Checklist_' + (data.nom||'') + '_' + (data.date||'').replace(/\//g,'-') + '.pdf');

  var sujet = 'Check-list Météo — ' + (data.prenom||'') + ' ' + (data.nom||'') + ' — ' + (data.date||'');
  
  // Email formateur
  var corps = 'Bonjour,\n\n';
  corps += 'Une nouvelle check-list météo pré-vol a été validée et signée.\n\n';
  corps += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  corps += 'Télépilote : ' + (data.prenom||'') + ' ' + (data.nom||'') + '\n';
  corps += 'Email      : ' + (data.email||'—') + '\n';
  corps += 'Date       : ' + (data.date||'—') + ' à ' + (data.heure||'—') + '\n';
  corps += 'Lieu       : ' + (data.lieu||'—') + '\n';
  corps += 'Drone      : ' + (data.drone||'—') + '\n';
  corps += 'Score      : ' + (data.score||'—') + '\n';
  corps += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  corps += 'Le PDF complet avec signature est joint à cet email.\n\n';
  corps += 'APH Drone SARL\n06 95 39 07 76';

  GmailApp.sendEmail(
    EMAIL_FORMATEUR,
    sujet,
    corps,
    { attachments: [pdfBlob], name: NOM_FORMATEUR }
  );

  // Copie stagiaire
  if (data.email && data.email.indexOf('@') > -1 && data.email !== EMAIL_FORMATEUR) {
    var corpsStagiaire = 'Bonjour ' + (data.prenom||'') + ',\n\n';
    corpsStagiaire += 'Votre check-list météo pré-vol du ' + (data.date||'') + ' a bien été enregistrée et signée.\n\n';
    corpsStagiaire += 'Score : ' + (data.score||'—') + '\n\n';
    corpsStagiaire += 'Votre check-list complète avec votre signature est jointe en PDF.\n\n';
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
    .createTextOutput(JSON.stringify({ status: "APH Drone Check-list OK" }))
    .setMimeType(ContentService.MimeType.JSON);
}
