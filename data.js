export const triggerPoints = [
  {
    id:"trap-upper-left", muscle:"Trapèze supérieur", label:"Trapèze supérieur", side:"gauche",
    position:[-0.34,1.44,0.10], painZones:["nuque","tempe","épaule"],
    referral:"Nuque, région temporale et sommet de l’épaule.",
    location:"Partie supérieure du trapèze, entre la base du cou et l’épaule.",
    care:"Pression progressive et confortable pendant quelques dizaines de secondes.",
    caution:"Éviter une pression profonde sur le côté antérieur du cou."
  },
  {
    id:"trap-upper-right", muscle:"Trapèze supérieur", label:"Trapèze supérieur", side:"droit",
    position:[0.34,1.44,0.10], painZones:["nuque","tempe","épaule"],
    referral:"Nuque, région temporale et sommet de l’épaule.",
    location:"Partie supérieure du trapèze, entre la base du cou et l’épaule.",
    care:"Pression progressive et confortable pendant quelques dizaines de secondes.",
    caution:"Éviter une pression profonde sur le côté antérieur du cou."
  },
  {
    id:"scm-left", muscle:"Sterno-cléido-mastoïdien", label:"SCM", side:"gauche",
    position:[-0.15,1.72,0.18], painZones:["tempe","nuque","mâchoire"],
    referral:"Tempe, derrière l’oreille, mâchoire et parfois front.",
    location:"Bande musculaire sur le côté antérieur du cou.",
    care:"Très douce pression digitale, sur une courte durée.",
    caution:"Zone sensible du cou : rester très prudent et ne jamais comprimer fortement."
  },
  {
    id:"scm-right", muscle:"Sterno-cléido-mastoïdien", label:"SCM", side:"droit",
    position:[0.15,1.72,0.18], painZones:["tempe","nuque","mâchoire"],
    referral:"Tempe, derrière l’oreille, mâchoire et parfois front.",
    location:"Bande musculaire sur le côté antérieur du cou.",
    care:"Très douce pression digitale, sur une courte durée.",
    caution:"Zone sensible du cou : rester très prudent et ne jamais comprimer fortement."
  },
  {
    id:"masseter-left", muscle:"Masséter", label:"Masséter", side:"gauche",
    position:[-0.14,1.95,0.21], painZones:["mâchoire","tempe","visage"],
    referral:"Mâchoire, joue et parfois région temporale.",
    location:"Angle de la mâchoire, sur le muscle de serrage.",
    care:"Massage léger, bouche relâchée.",
    caution:"Éviter si douleur dentaire aiguë ou trouble ATM sévère sans avis adapté."
  },
  {
    id:"masseter-right", muscle:"Masséter", label:"Masséter", side:"droit",
    position:[0.14,1.95,0.21], painZones:["mâchoire","tempe","visage"],
    referral:"Mâchoire, joue et parfois région temporale.",
    location:"Angle de la mâchoire, sur le muscle de serrage.",
    care:"Massage léger, bouche relâchée.",
    caution:"Éviter si douleur dentaire aiguë ou trouble ATM sévère sans avis adapté."
  },
  {
    id:"suprasp-left", muscle:"Supra-épineux", label:"Supra-épineux", side:"gauche",
    position:[-0.31,1.42,-0.09], painZones:["épaule","bras"],
    referral:"Épaule latérale et parfois bras.",
    location:"Au-dessus de l’épine de l’omoplate.",
    care:"Balle contre le mur avec charge progressive.",
    caution:"Prudence en cas de lésion récente de l’épaule."
  },
  {
    id:"suprasp-right", muscle:"Supra-épineux", label:"Supra-épineux", side:"droit",
    position:[0.31,1.42,-0.09], painZones:["épaule","bras"],
    referral:"Épaule latérale et parfois bras.",
    location:"Au-dessus de l’épine de l’omoplate.",
    care:"Balle contre le mur avec charge progressive.",
    caution:"Prudence en cas de lésion récente de l’épaule."
  },
  {
    id:"infra-left", muscle:"Infra-épineux", label:"Infra-épineux", side:"gauche",
    position:[-0.30,1.24,-0.15], painZones:["épaule","bras","avant-bras"],
    referral:"Épaule antérieure, bras et parfois avant-bras.",
    location:"Face postérieure de l’omoplate, sous l’épine de la scapula.",
    care:"Balle contre un mur avec pression modérée.",
    caution:"Ne pas comprimer directement une articulation traumatisée."
  },
  {
    id:"infra-right", muscle:"Infra-épineux", label:"Infra-épineux", side:"droit",
    position:[0.30,1.24,-0.15], painZones:["épaule","bras","avant-bras"],
    referral:"Épaule antérieure, bras et parfois avant-bras.",
    location:"Face postérieure de l’omoplate, sous l’épine de la scapula.",
    care:"Balle contre un mur avec pression modérée.",
    caution:"Ne pas comprimer directement une articulation traumatisée."
  },
  {
    id:"levator-left", muscle:"Élévateur de la scapula", label:"Élévateur de la scapula", side:"gauche",
    position:[-0.22,1.45,-0.04], painZones:["nuque","épaule"],
    referral:"Nuque et angle supérieur de l’omoplate.",
    location:"Entre côté du cou et angle supérieur de l’omoplate.",
    care:"Pression douce, souvent très sensible.",
    caution:"Éviter si la zone du cou est irritable ou neurologique."
  },
  {
    id:"levator-right", muscle:"Élévateur de la scapula", label:"Élévateur de la scapula", side:"droit",
    position:[0.22,1.45,-0.04], painZones:["nuque","épaule"],
    referral:"Nuque et angle supérieur de l’omoplate.",
    location:"Entre côté du cou et angle supérieur de l’omoplate.",
    care:"Pression douce, souvent très sensible.",
    caution:"Éviter si la zone du cou est irritable ou neurologique."
  },
  {
    id:"pec-left", muscle:"Grand pectoral", label:"Grand pectoral", side:"gauche",
    position:[-0.23,1.25,0.26], painZones:["épaule","thorax","bras"],
    referral:"Devant de l’épaule, thorax antérieur et parfois bras.",
    location:"Région antérieure thoracique, en dehors du sternum.",
    care:"Auto-massage doux, respiration relâchée.",
    caution:"Consulter rapidement en cas de vraie douleur thoracique suspecte."
  },
  {
    id:"pec-right", muscle:"Grand pectoral", label:"Grand pectoral", side:"droit",
    position:[0.23,1.25,0.26], painZones:["épaule","thorax","bras"],
    referral:"Devant de l’épaule, thorax antérieur et parfois bras.",
    location:"Région antérieure thoracique, en dehors du sternum.",
    care:"Auto-massage doux, respiration relâchée.",
    caution:"Consulter rapidement en cas de vraie douleur thoracique suspecte."
  },
  {
    id:"ql-left", muscle:"Carré des lombes", label:"Carré des lombes", side:"gauche",
    position:[-0.18,0.54,-0.12], painZones:["lombaires","hanche","fesse"],
    referral:"Bas du dos, crête iliaque et parfois fesse.",
    location:"Zone lombaire latérale, entre dernière côte et bassin.",
    care:"Pression douce contre un mur plutôt qu’au sol.",
    caution:"Urgence médicale si faiblesse, fièvre, anesthésie en selle ou traumatisme important."
  },
  {
    id:"ql-right", muscle:"Carré des lombes", label:"Carré des lombes", side:"droit",
    position:[0.18,0.54,-0.12], painZones:["lombaires","hanche","fesse"],
    referral:"Bas du dos, crête iliaque et parfois fesse.",
    location:"Zone lombaire latérale, entre dernière côte et bassin.",
    care:"Pression douce contre un mur plutôt qu’au sol.",
    caution:"Urgence médicale si faiblesse, fièvre, anesthésie en selle ou traumatisme important."
  },
  {
    id:"glutemed-left", muscle:"Moyen fessier", label:"Moyen fessier", side:"gauche",
    position:[-0.22,0.16,-0.12], painZones:["fesse","hanche","lombaires"],
    referral:"Fesse, hanche latérale et parfois région lombaire.",
    location:"Partie supérieure et externe de la fesse.",
    care:"Balle au mur ou au sol avec charge modérée.",
    caution:"Stopper en cas d’irradiation neurologique nette."
  },
  {
    id:"glutemed-right", muscle:"Moyen fessier", label:"Moyen fessier", side:"droit",
    position:[0.22,0.16,-0.12], painZones:["fesse","hanche","lombaires"],
    referral:"Fesse, hanche latérale et parfois région lombaire.",
    location:"Partie supérieure et externe de la fesse.",
    care:"Balle au mur ou au sol avec charge modérée.",
    caution:"Stopper en cas d’irradiation neurologique nette."
  },
  {
    id:"piriformis-left", muscle:"Piriforme", label:"Piriforme", side:"gauche",
    position:[-0.14,-0.02,-0.14], painZones:["fesse","hanche","jambe"],
    referral:"Fesse profonde avec possible irradiation vers l’arrière de la cuisse.",
    location:"Partie profonde de la fesse, vers le centre.",
    care:"Balle douce, progression lente.",
    caution:"Prudence si sciatalgie forte ou déficit neurologique."
  },
  {
    id:"piriformis-right", muscle:"Piriforme", label:"Piriforme", side:"droit",
    position:[0.14,-0.02,-0.14], painZones:["fesse","hanche","jambe"],
    referral:"Fesse profonde avec possible irradiation vers l’arrière de la cuisse.",
    location:"Partie profonde de la fesse, vers le centre.",
    care:"Balle douce, progression lente.",
    caution:"Prudence si sciatalgie forte ou déficit neurologique."
  },
  {
    id:"ham-left", muscle:"Ischio-jambiers", label:"Ischio-jambiers", side:"gauche",
    position:[-0.12,-0.48,-0.08], painZones:["cuisse","genou"],
    referral:"Arrière de la cuisse et parfois derrière le genou.",
    location:"Partie postérieure de la cuisse.",
    care:"Rouleau ou pression douce manuelle.",
    caution:"Ne pas forcer en cas de claquage récent."
  },
  {
    id:"ham-right", muscle:"Ischio-jambiers", label:"Ischio-jambiers", side:"droit",
    position:[0.12,-0.48,-0.08], painZones:["cuisse","genou"],
    referral:"Arrière de la cuisse et parfois derrière le genou.",
    location:"Partie postérieure de la cuisse.",
    care:"Rouleau ou pression douce manuelle.",
    caution:"Ne pas forcer en cas de claquage récent."
  },
  {
    id:"gastroc-left", muscle:"Gastrocnémien", label:"Gastrocnémien", side:"gauche",
    position:[-0.12,-1.10,-0.05], painZones:["mollet","cheville","plante du pied"],
    referral:"Mollet, arrière de la cheville et parfois plante du pied.",
    location:"Masse musculaire postérieure du mollet.",
    care:"Compression douce avec les doigts ou une balle.",
    caution:"Ne pas masser un mollet rouge, chaud ou gonflé."
  },
  {
    id:"gastroc-right", muscle:"Gastrocnémien", label:"Gastrocnémien", side:"droit",
    position:[0.12,-1.10,-0.05], painZones:["mollet","cheville","plante du pied"],
    referral:"Mollet, arrière de la cheville et parfois plante du pied.",
    location:"Masse musculaire postérieure du mollet.",
    care:"Compression douce avec les doigts ou une balle.",
    caution:"Ne pas masser un mollet rouge, chaud ou gonflé."
  },
  {
    id:"tibant-left", muscle:"Tibial antérieur", label:"Tibial antérieur", side:"gauche",
    position:[-0.10,-1.08,0.15], painZones:["jambe","cheville","pied"],
    referral:"Devant de la jambe, cheville et dos du pied.",
    location:"Face antéro-latérale de la jambe.",
    care:"Massage longitudinal doux.",
    caution:"Éviter si douleur osseuse ou gonflement inexpliqué."
  },
  {
    id:"tibant-right", muscle:"Tibial antérieur", label:"Tibial antérieur", side:"droit",
    position:[0.10,-1.08,0.15], painZones:["jambe","cheville","pied"],
    referral:"Devant de la jambe, cheville et dos du pied.",
    location:"Face antéro-latérale de la jambe.",
    care:"Massage longitudinal doux.",
    caution:"Éviter si douleur osseuse ou gonflement inexpliqué."
  }
];

export const painAreas = [
  "tempe","nuque","mâchoire","visage","épaule","bras","avant-bras","thorax","lombaires","hanche","fesse","jambe","cuisse","genou","mollet","cheville","pied","plante du pied"
];
