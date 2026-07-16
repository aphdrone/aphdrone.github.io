/* APH Drone — Générateur de document commercial partagé (devis, factures, avoirs)
   Utilisé par gestion/devis.html, gestion/factures.html et gestion/avoirs.html
   pour garantir un visuel identique et professionnel sur les trois types de documents.

   Usage :
   <script src="document-template.js"></script>
   ...
   document.getElementById('print-area').innerHTML = construireDocumentHTML(doc);

   Format attendu de `doc` :
   {
     typeDoc: 'devis' | 'facture' | 'avoir',
     numero: 'F-02655346',
     dateEmission: '2026-07-08',
     dateValidite: '2026-08-08',      // devis uniquement
     dateEcheance: '2026-08-08',      // facture uniquement
     factureOrigineNumero: 'F-02655340', // avoir uniquement (facture corrigée)
     client: {
       type: 'particulier'|'professionnel'|'collectivite'|'association',
       nomAffichage, adresseRue, adresseCP, adresseVille,
       siret, tvaIntra, email, telephone
     },
     lignes: [ { designation, quantite, prixUnitaireHT, tvaTaux } ],
     notes: 'texte libre optionnel'
   }
*/

const APH_ENTREPRISE = {
  nom: 'APH Drone',
  formeJuridique: 'SASU',
  dirigeant: 'Arnaud MOREAU',
  adresse: '44, rue Georges Moulimard',
  cp: '70300',
  ville: 'Luxeuil-les-Bains',
  siret: '[SIRET à compléter]',
  tva: '[N° TVA à compléter]',
  telephone: '06 95 39 07 76',
  email: 'contact@aphdrone.fr',
  iban: '',
  bic: ''
};

// Permet à Paramètres de mettre à jour ces informations une fois chargées depuis Firestore,
// sans avoir à modifier ce fichier à chaque changement (SIRET, IBAN, etc.).
window.definirEntrepriseInfo = function(infos){
  Object.keys(infos).forEach(k => {
    if(infos[k] !== undefined && infos[k] !== null && infos[k] !== '') APH_ENTREPRISE[k] = infos[k];
  });
};

// Palette strictement noir / gris (aucune couleur) — le type de document se distingue
// uniquement par son intitulé texte ("DEVIS" / "FACTURE" / "AVOIR"), pas par une couleur.
const DOC_LABELS = {
  devis: { titre: 'Devis' },
  facture: { titre: 'Facture' },
  avoir: { titre: 'Avoir' }
};

const NOIR = '#111111';
const GRIS_FONCE = '#333333';
const GRIS = '#666666';
const GRIS_CLAIR = '#999999';
const GRIS_TRES_CLAIR = '#f4f4f4';
const BORDURE = '#dddddd';

function formaterMontantDoc(n){
  return (n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function formaterDateDoc(iso){
  if(!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

function calculerTotauxDoc(lignes){
  let totalHT = 0;
  let totalRemises = 0;
  const tvaParTaux = {};
  (lignes || []).forEach(l => {
    const montantBrut = (l.quantite || 0) * (l.prixUnitaireHT || 0);
    const remisePct = l.remisePct || 0;
    const montantRemise = montantBrut * (remisePct / 100);
    const montantLigneHT = montantBrut - montantRemise;
    totalHT += montantLigneHT;
    totalRemises += montantRemise;
    const taux = l.tvaTaux != null ? l.tvaTaux : 20;
    tvaParTaux[taux] = (tvaParTaux[taux] || 0) + montantLigneHT * (taux / 100);
  });
  const totalTVA = Object.values(tvaParTaux).reduce((a, b) => a + b, 0);
  return { totalHT, totalRemises, tvaParTaux, totalTVA, totalTTC: totalHT + totalTVA };
}

function construireBlocClient(client){
  if(!client) return `<div style="font-size:11.5px;color:${GRIS_CLAIR};">Client non renseigné</div>`;
  const lignesIdentite = [];
  if(client.type === 'professionnel'){
    lignesIdentite.push(client.raisonSociale || client.nomAffichage);
    if(client.siret) lignesIdentite.push('SIRET : ' + client.siret);
    if(client.tvaIntra) lignesIdentite.push('TVA intracom. : ' + client.tvaIntra);
  } else if(client.type === 'collectivite'){
    lignesIdentite.push(client.nomCollectivite || client.nomAffichage);
    if(client.service) lignesIdentite.push(client.service);
    if(client.siret) lignesIdentite.push('SIRET : ' + client.siret);
  } else if(client.type === 'association'){
    lignesIdentite.push(client.nomAssociation || client.nomAffichage);
    if(client.siretRna) lignesIdentite.push('SIRET/RNA : ' + client.siretRna);
  } else {
    lignesIdentite.push(client.nomAffichage);
  }

  const adresse = [client.adresseRue, [client.adresseCP, client.adresseVille].filter(Boolean).join(' ')].filter(Boolean).join('<br>');

  return `
    <div style="font-size:12.5px;font-weight:700;color:${NOIR};margin-bottom:4px;">${lignesIdentite[0] || ''}</div>
    ${lignesIdentite.slice(1).map(l => '<div style="font-size:11px;color:' + GRIS + ';">' + l + '</div>').join('')}
    ${adresse ? '<div style="font-size:11px;color:' + GRIS + ';margin-top:4px;">' + adresse + '</div>' : ''}
    ${client.email ? '<div style="font-size:11px;color:' + GRIS + ';margin-top:4px;">' + client.email + '</div>' : ''}
  `;
}

function construireDocumentHTML(doc){
  const meta = DOC_LABELS[doc.typeDoc] || DOC_LABELS.devis;
  const totaux = calculerTotauxDoc(doc.lignes);

  const lignesHTML = (doc.lignes || []).map(l => {
    const montantBrut = (l.quantite || 0) * (l.prixUnitaireHT || 0);
    const remisePct = l.remisePct || 0;
    const montantNet = montantBrut - montantBrut * (remisePct / 100);
    return `
      <tr>
        <td style="padding:8px 6px;border-bottom:1px solid ${BORDURE};font-size:11px;color:${GRIS_FONCE};">
          ${l.designation || ''}
          ${remisePct > 0 ? '<div style="font-size:9.5px;color:' + GRIS + ';font-style:italic;margin-top:2px;">Remise ' + remisePct + '%' + (l.motifRemise ? ' — ' + l.motifRemise : '') + '</div>' : ''}
        </td>
        <td style="padding:8px 6px;border-bottom:1px solid ${BORDURE};font-size:11px;color:${GRIS_FONCE};text-align:center;">${l.quantite || 0}</td>
        <td style="padding:8px 6px;border-bottom:1px solid ${BORDURE};font-size:11px;color:${GRIS_FONCE};text-align:right;">${formaterMontantDoc(l.prixUnitaireHT)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid ${BORDURE};font-size:11px;color:${GRIS_FONCE};text-align:right;">${l.tvaTaux != null ? l.tvaTaux : 20}%</td>
        <td style="padding:8px 6px;border-bottom:1px solid ${BORDURE};font-size:11px;color:${NOIR};font-weight:700;text-align:right;">${formaterMontantDoc(montantNet)}</td>
      </tr>
    `;
  }).join('');

  const tvaDetailHTML = Object.entries(totaux.tvaParTaux).map(([taux, montant]) => `
    <div style="display:flex;justify-content:space-between;font-size:11px;color:${GRIS};padding:3px 0;">
      <span>TVA ${taux}%</span><span>${formaterMontantDoc(montant)}</span>
    </div>
  `).join('');

  let dateSecondaireLabel = '';
  let dateSecondaireValeur = '';
  if(doc.typeDoc === 'devis'){
    dateSecondaireLabel = 'Valable jusqu\'au';
    dateSecondaireValeur = formaterDateDoc(doc.dateValidite);
  } else if(doc.typeDoc === 'facture'){
    dateSecondaireLabel = 'Échéance';
    dateSecondaireValeur = formaterDateDoc(doc.dateEcheance);
  } else if(doc.typeDoc === 'avoir'){
    dateSecondaireLabel = 'Facture concernée';
    dateSecondaireValeur = doc.factureOrigineNumero || '—';
  }

  const piedLegal = doc.typeDoc === 'facture'
    ? `<div style="font-size:9px;color:${GRIS};line-height:1.6;">
        ${APH_ENTREPRISE.iban ? '<div style="margin-bottom:6px;font-size:10px;color:' + NOIR + ';font-weight:600;">Règlement par virement — IBAN : ' + APH_ENTREPRISE.iban + (APH_ENTREPRISE.bic ? ' · BIC : ' + APH_ENTREPRISE.bic : '') + '</div>' : ''}
        En cas de retard de paiement, une indemnité forfaitaire de 40 € pour frais de recouvrement est due (art. L441-10 du Code de commerce), ainsi que des pénalités de retard calculées au taux d'intérêt de la BCE majoré de 10 points. Pas d'escompte pour paiement anticipé.
      </div>`
    : doc.typeDoc === 'devis'
    ? `<div style="font-size:9px;color:${GRIS};line-height:1.6;">
        Devis valable jusqu'à la date indiquée ci-dessus. Bon pour accord à retourner signé pour validation de la commande.
      </div>
      <div style="margin-top:24px;display:flex;justify-content:flex-end;">
        <div style="border:1px solid ${BORDURE};border-radius:8px;padding:14px 18px;width:220px;text-align:center;">
          <div style="font-size:10px;color:${GRIS};margin-bottom:30px;">Bon pour accord — date et signature</div>
        </div>
      </div>`
    : `<div style="font-size:9px;color:${GRIS};line-height:1.6;">
        Cet avoir annule et remplace partiellement ou totalement la facture référencée ci-dessus.
      </div>`;

  return `
    <div style="font-family:'Inter',sans-serif;color:${GRIS_FONCE};flex:1;display:flex;flex-direction:column;min-height:0;">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${NOIR};padding-bottom:16px;margin-bottom:22px;">
          <div style="display:flex;align-items:flex-start;gap:14px;">
            <img src="/assets/logo.jpg" alt="APH Drone" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0;filter:grayscale(100%);" onerror="this.style.display='none'">
            <div>
              <div style="font-size:16px;font-weight:800;color:${NOIR};">${APH_ENTREPRISE.nom}</div>
              <div style="font-size:10px;color:${GRIS};margin-top:2px;">${APH_ENTREPRISE.formeJuridique} — ${APH_ENTREPRISE.dirigeant}</div>
              <div style="font-size:10px;color:${GRIS};">${APH_ENTREPRISE.adresse}, ${APH_ENTREPRISE.cp} ${APH_ENTREPRISE.ville}</div>
              <div style="font-size:10px;color:${GRIS};">SIRET : ${APH_ENTREPRISE.siret}</div>
              ${APH_ENTREPRISE.tva && APH_ENTREPRISE.tva !== '[N° TVA à compléter]' ? '<div style="font-size:10px;color:' + GRIS + ';">TVA intracom. : ' + APH_ENTREPRISE.tva + '</div>' : ''}
              <div style="font-size:10px;color:${GRIS};">${APH_ENTREPRISE.telephone} · ${APH_ENTREPRISE.email}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:20px;font-weight:800;color:${NOIR};text-transform:uppercase;letter-spacing:.04em;">${meta.titre}</div>
            <div style="font-size:13px;font-weight:700;color:${NOIR};margin-top:2px;">${doc.numero || ''}</div>
            <div style="font-size:10.5px;color:${GRIS};margin-top:6px;">Date d'émission : ${formaterDateDoc(doc.dateEmission)}</div>
            ${dateSecondaireLabel ? '<div style="font-size:10.5px;color:' + GRIS + ';">' + dateSecondaireLabel + ' : ' + dateSecondaireValeur + '</div>' : ''}
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;margin-bottom:22px;">
          <div style="background:${GRIS_TRES_CLAIR};border-radius:8px;padding:12px 16px;min-width:230px;">
            <div style="font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${GRIS};margin-bottom:6px;">Adressé à</div>
            ${construireBlocClient(doc.client)}
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
          <thead>
            <tr style="background:${GRIS_TRES_CLAIR};">
              <th style="padding:8px 6px;text-align:left;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:${GRIS};">Désignation</th>
              <th style="padding:8px 6px;text-align:center;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:${GRIS};">Qté</th>
              <th style="padding:8px 6px;text-align:right;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:${GRIS};">PU HT</th>
              <th style="padding:8px 6px;text-align:right;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:${GRIS};">TVA</th>
              <th style="padding:8px 6px;text-align:right;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:${GRIS};">Total HT</th>
            </tr>
          </thead>
          <tbody>${lignesHTML}</tbody>
        </table>

        <div style="display:flex;justify-content:flex-end;margin-bottom:22px;">
          <div style="width:240px;">
            ${totaux.totalRemises > 0 ? '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:' + GRIS + ';font-style:italic;padding:3px 0;"><span>Dont remises accordées</span><span>-' + formaterMontantDoc(totaux.totalRemises) + '</span></div>' : ''}
            <div style="display:flex;justify-content:space-between;font-size:11.5px;color:${NOIR};padding:5px 0;border-bottom:1px solid ${BORDURE};">
              <span>Total HT</span><span>${formaterMontantDoc(totaux.totalHT)}</span>
            </div>
            ${tvaDetailHTML}
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;color:${NOIR};padding:8px 0 0;margin-top:4px;border-top:1.5px solid ${NOIR};">
              <span>Total TTC</span><span>${formaterMontantDoc(totaux.totalTTC)}</span>
            </div>
          </div>
        </div>

        ${doc.notes ? '<div style="font-size:10.5px;color:' + GRIS_FONCE + ';margin-bottom:18px;line-height:1.6;"><strong>Notes :</strong> ' + doc.notes + '</div>' : ''}
      </div>

      <div style="margin-top:auto;">
        ${piedLegal}
        <div style="margin-top:20px;padding-top:8px;border-top:1px solid ${BORDURE};font-size:8.5px;color:${GRIS_CLAIR};text-align:center;">
          ${APH_ENTREPRISE.nom} ${APH_ENTREPRISE.formeJuridique} — ${APH_ENTREPRISE.adresse}, ${APH_ENTREPRISE.cp} ${APH_ENTREPRISE.ville} — SIRET ${APH_ENTREPRISE.siret}
        </div>
      </div>
    </div>
  `;
}
