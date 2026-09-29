export const triggerPoints = [
  {
    id:"trap-upper",
    muscle:"Trapèze supérieur",
    label:"Trapèze supérieur",
    side:"gauche",
    position:[-0.46,1.72,0.02],
    painZones:["nuque","tempe","épaule"],
    referral:"Nuque, région temporale et sommet de l’épaule.",
    location:"Partie supérieure du trapèze, entre la base du cou et l’épaule.",
    care:"Pression progressive et confortable pendant quelques dizaines de secondes, sans rechercher une douleur intense.",
    caution:"Éviter une pression profonde sur le côté antérieur du cou. Stopper en cas de vertige, engourdissement ou douleur inhabituelle."
  },
  {
    id:"infraspinatus",
    muscle:"Infra-épineux",
    label:"Infra-épineux",
    side:"droit",
    position:[0.36,1.45,-0.23],
    painZones:["épaule","bras","avant-bras"],
    referral:"Épaule antérieure, bras et parfois avant-bras.",
    location:"Face postérieure de l’omoplate, sous l’épine de la scapula.",
    care:"Utiliser une balle contre un mur avec une pression modérée et contrôlée.",
    caution:"Ne pas comprimer directement une articulation douloureuse ou récemment traumatisée."
  },
  {
    id:"ql-left",
    muscle:"Carré des lombes",
    label:"Carré des lombes",
    side:"gauche",
    position:[-0.25,0.86,-0.12],
    painZones:["lombaires","hanche","fesse"],
    referral:"Bas du dos, crête iliaque et parfois région fessière.",
    location:"Zone lombaire latérale, entre dernière côte et bassin.",
    care:"Préférer une pression douce contre un mur plutôt qu’une pression directe très profonde.",
    caution:"Une douleur lombaire avec faiblesse, trouble sphinctérien, anesthésie en selle, fièvre ou traumatisme nécessite une évaluation médicale rapide."
  },
  {
    id:"glute-med",
    muscle:"Moyen fessier",
    label:"Moyen fessier",
    side:"droit",
    position:[0.29,0.49,-0.16],
    painZones:["fesse","hanche","lombaires"],
    referral:"Fesse, hanche latérale et parfois région lombaire.",
    location:"Partie supérieure et externe de la fesse.",
    care:"Balle contre le mur ou au sol avec charge modérée, en évitant toute douleur électrique.",
    caution:"Stopper en cas d’irradiation neurologique nette, perte de sensibilité ou faiblesse."
  },
  {
    id:"gastroc-left",
    muscle:"Gastrocnémien",
    label:"Gastrocnémien",
    side:"gauche",
    position:[-0.18,-0.62,-0.08],
    painZones:["mollet","cheville","plante du pied"],
    referral:"Mollet, arrière de la cheville et parfois plante du pied.",
    location:"Masse musculaire postérieure du mollet.",
    care:"Compression douce avec les doigts ou une balle, sans bloquer la circulation.",
    caution:"Ne pas masser un mollet brutalement douloureux, chaud, rouge ou gonflé : faire évaluer rapidement le risque vasculaire."
  }
];

export const painAreas = [
  "tempe","nuque","épaule","bras","avant-bras","lombaires","hanche","fesse","mollet","cheville","plante du pied"
];
