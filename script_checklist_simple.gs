// APH Drone — Check-list Météo Pré-vol
// Version simple — enregistrement Sheet + email de notification

var EMAIL_FORMATEUR = "aph.moreau@gmail.com";
var NOM_FORMATEUR = "Arnaud MOREAU — APH Drone SARL";

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Enregistrer dans le Sheet
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
    
    // Email de notification au formateur
    try {
      var sujet = 'Check-list Météo — ' + (data.prenom||'') + ' ' + (data.nom||'') + ' — ' + (data.date||'');
      var corps = 'Bonjour,\n\n';
      corps += 'Une nouvelle check-list météo pré-vol a été validée.\n\n';
      corps += 'Télépilote : ' + (data.prenom||'') + ' ' + (data.nom||'') + '\n';
      corps += 'Email      : ' + (data.email||'—') + '\n';
      corps += 'Date       : ' + (data.date||'—') + ' à ' + (data.heure||'—') + '\n';
      corps += 'Lieu       : ' + (data.lieu||'—') + '\n';
      corps += 'Drone      : ' + (data.drone||'—') + '\n';
      corps += 'Score      : ' + (data.score||'—') + '\n\n';
      corps += 'Le PDF a été téléchargé automatiquement sur l\'appareil du télépilote.\n\n';
      corps += 'APH Drone SARL';
      
      GmailApp.sendEmail(EMAIL_FORMATEUR, sujet, corps, { name: NOM_FORMATEUR });
      
      // Copie stagiaire
      if (data.email && data.email.indexOf('@') > -1) {
        var corpsStagiaire = 'Bonjour ' + (data.prenom||'') + ',\n\n';
        corpsStagiaire += 'Votre check-list météo du ' + (data.date||'') + ' a bien été enregistrée.\n\n';
        corpsStagiaire += 'Score : ' + (data.score||'—') + '\n\n';
        corpsStagiaire += 'Le PDF a été téléchargé sur votre appareil lors de la validation.\n\n';
        corpsStagiaire += 'Bons vols !\n\nArnaud MOREAU\nAPH Drone SARL\n06 95 39 07 76';
        GmailApp.sendEmail(data.email, 'Votre check-list météo — APH Drone', corpsStagiaire, { name: NOM_FORMATEUR });
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

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "OK" }))
    .setMimeType(ContentService.MimeType.JSON);
}
