// APH Drone — Réception des signatures règlement intérieur
// Coller dans Extensions → Apps Script du Google Sheet

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Ajouter une ligne
    sheet.appendRow([
      data.date,
      data.heure,
      data.nom,
      data.prenom,
      data.email,
      data.formation,
      data.signature,
      "✅ Signé"
    ]);
    
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
    .createTextOutput(JSON.stringify({ status: "APH Drone API OK" }))
    .setMimeType(ContentService.MimeType.JSON);
}
