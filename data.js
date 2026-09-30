const baseTriggerPoints = [
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
  },
  {
    id:"deltoid-left", muscle:"Deltoïde", label:"Deltoïde", side:"gauche",
    position:[-0.48,1.30,0.02], painZones:["épaule","bras"],
    referral:"Douleur locale de l’épaule pouvant s’étendre au bras.",
    location:"Masse musculaire latérale de l’épaule.",
    care:"Pression modérée ou balle contre le mur.",
    caution:"Prudence après traumatisme ou chirurgie récente de l’épaule."
  },
  {
    id:"deltoid-right", muscle:"Deltoïde", label:"Deltoïde", side:"droit",
    position:[0.48,1.30,0.02], painZones:["épaule","bras"],
    referral:"Douleur locale de l’épaule pouvant s’étendre au bras.",
    location:"Masse musculaire latérale de l’épaule.",
    care:"Pression modérée ou balle contre le mur.",
    caution:"Prudence après traumatisme ou chirurgie récente de l’épaule."
  },
  {
    id:"lat-left", muscle:"Grand dorsal", label:"Grand dorsal", side:"gauche",
    position:[-0.34,0.82,-0.10], painZones:["dos","aisselle","bras"],
    referral:"Dos latéral, région axillaire et parfois bras.",
    location:"Grande nappe musculaire latérale du dos.",
    care:"Balle contre le mur ou auto-massage doux.",
    caution:"Éviter une pression excessive sur les côtes."
  },
  {
    id:"lat-right", muscle:"Grand dorsal", label:"Grand dorsal", side:"droit",
    position:[0.34,0.82,-0.10], painZones:["dos","aisselle","bras"],
    referral:"Dos latéral, région axillaire et parfois bras.",
    location:"Grande nappe musculaire latérale du dos.",
    care:"Balle contre le mur ou auto-massage doux.",
    caution:"Éviter une pression excessive sur les côtes."
  },
  {
    id:"rhomboid-left", muscle:"Rhomboïdes", label:"Rhomboïdes", side:"gauche",
    position:[-0.18,1.18,-0.14], painZones:["omoplate","dos"],
    referral:"Bord interne de l’omoplate et haut du dos.",
    location:"Entre colonne thoracique et bord médial de l’omoplate.",
    care:"Balle contre le mur avec pression progressive.",
    caution:"Éviter une pression directe sur les apophyses vertébrales."
  },
  {
    id:"rhomboid-right", muscle:"Rhomboïdes", label:"Rhomboïdes", side:"droit",
    position:[0.18,1.18,-0.14], painZones:["omoplate","dos"],
    referral:"Bord interne de l’omoplate et haut du dos.",
    location:"Entre colonne thoracique et bord médial de l’omoplate.",
    care:"Balle contre le mur avec pression progressive.",
    caution:"Éviter une pression directe sur les apophyses vertébrales."
  },
  {
    id:"glutemax-left", muscle:"Grand fessier", label:"Grand fessier", side:"gauche",
    position:[-0.15,0.08,-0.14], painZones:["fesse","sacrum","cuisse"],
    referral:"Fesse, région sacrée et parfois haut de cuisse.",
    location:"Masse principale de la fesse.",
    care:"Balle ou rouleau avec pression progressive.",
    caution:"Stopper en cas de douleur neurologique ou traumatisme récent."
  },
  {
    id:"glutemax-right", muscle:"Grand fessier", label:"Grand fessier", side:"droit",
    position:[0.15,0.08,-0.14], painZones:["fesse","sacrum","cuisse"],
    referral:"Fesse, région sacrée et parfois haut de cuisse.",
    location:"Masse principale de la fesse.",
    care:"Balle ou rouleau avec pression progressive.",
    caution:"Stopper en cas de douleur neurologique ou traumatisme récent."
  },
  {
    id:"glutemin-left", muscle:"Petit fessier", label:"Petit fessier", side:"gauche",
    position:[-0.24,0.12,-0.05], painZones:["hanche","fesse","jambe"],
    referral:"Hanche latérale, fesse et parfois face latérale de la jambe.",
    location:"Plan profond de la région fessière latérale.",
    care:"Pression douce et précise.",
    caution:"Éviter les pressions profondes si irradiation neurologique."
  },
  {
    id:"glutemin-right", muscle:"Petit fessier", label:"Petit fessier", side:"droit",
    position:[0.24,0.12,-0.05], painZones:["hanche","fesse","jambe"],
    referral:"Hanche latérale, fesse et parfois face latérale de la jambe.",
    location:"Plan profond de la région fessière latérale.",
    care:"Pression douce et précise.",
    caution:"Éviter les pressions profondes si irradiation neurologique."
  },
  {
    id:"soleus-left", muscle:"Soléaire", label:"Soléaire", side:"gauche",
    position:[-0.12,-1.15,-0.04], painZones:["mollet","cheville","talon"],
    referral:"Mollet profond, cheville et talon.",
    location:"Sous le gastrocnémien, dans la partie postérieure de la jambe.",
    care:"Compression douce et progressive.",
    caution:"Ne pas masser un mollet rouge, chaud ou gonflé."
  },
  {
    id:"soleus-right", muscle:"Soléaire", label:"Soléaire", side:"droit",
    position:[0.12,-1.15,-0.04], painZones:["mollet","cheville","talon"],
    referral:"Mollet profond, cheville et talon.",
    location:"Sous le gastrocnémien, dans la partie postérieure de la jambe.",
    care:"Compression douce et progressive.",
    caution:"Ne pas masser un mollet rouge, chaud ou gonflé."
  },
  {
    id:"psoas-left", muscle:"Psoas-iliaque", label:"Psoas-iliaque", side:"gauche",
    position:[-0.10,0.46,0.10], painZones:["aine","hanche","lombaires"],
    referral:"Aine, hanche antérieure et région lombaire.",
    location:"Plan profond de la hanche et de l’abdomen.",
    care:"Ne pas pratiquer d’auto-pression profonde.",
    caution:"Zone profonde contenant des structures abdominales : travail manuel spécialisé recommandé."
  },
  {
    id:"psoas-right", muscle:"Psoas-iliaque", label:"Psoas-iliaque", side:"droit",
    position:[0.10,0.46,0.10], painZones:["aine","hanche","lombaires"],
    referral:"Aine, hanche antérieure et région lombaire.",
    location:"Plan profond de la hanche et de l’abdomen.",
    care:"Ne pas pratiquer d’auto-pression profonde.",
    caution:"Zone profonde contenant des structures abdominales : travail manuel spécialisé recommandé."
  },
  {
    id:"adductors-left", muscle:"Adducteurs", label:"Adducteurs", side:"gauche",
    position:[-0.10,-0.30,0.02], painZones:["aine","cuisse","genou"],
    referral:"Aine, face interne de cuisse et parfois genou.",
    location:"Face interne de la cuisse.",
    care:"Pression modérée ou rouleau très progressif.",
    caution:"Éviter en cas de lésion musculaire aiguë."
  },
  {
    id:"adductors-right", muscle:"Adducteurs", label:"Adducteurs", side:"droit",
    position:[0.10,-0.30,0.02], painZones:["aine","cuisse","genou"],
    referral:"Aine, face interne de cuisse et parfois genou.",
    location:"Face interne de la cuisse.",
    care:"Pression modérée ou rouleau très progressif.",
    caution:"Éviter en cas de lésion musculaire aiguë."
  },
  {
    id:"rectusfem-left", muscle:"Droit fémoral", label:"Droit fémoral", side:"gauche",
    position:[-0.16,-0.35,0.12], painZones:["cuisse","genou"],
    referral:"Face antérieure de cuisse et région du genou.",
    location:"Partie centrale du quadriceps.",
    care:"Rouleau ou pression douce.",
    caution:"Éviter sur lésion aiguë ou hématome."
  },
  {
    id:"rectusfem-right", muscle:"Droit fémoral", label:"Droit fémoral", side:"droit",
    position:[0.16,-0.35,0.12], painZones:["cuisse","genou"],
    referral:"Face antérieure de cuisse et région du genou.",
    location:"Partie centrale du quadriceps.",
    care:"Rouleau ou pression douce.",
    caution:"Éviter sur lésion aiguë ou hématome."
  },
  {
    id:"vastuslat-left", muscle:"Vaste latéral", label:"Vaste latéral", side:"gauche",
    position:[-0.20,-0.42,0.08], painZones:["cuisse","genou"],
    referral:"Face latérale de cuisse et genou.",
    location:"Partie externe du quadriceps.",
    care:"Rouleau ou pression progressive.",
    caution:"Éviter une pression excessive près du genou."
  },
  {
    id:"vastuslat-right", muscle:"Vaste latéral", label:"Vaste latéral", side:"droit",
    position:[0.20,-0.42,0.08], painZones:["cuisse","genou"],
    referral:"Face latérale de cuisse et genou.",
    location:"Partie externe du quadriceps.",
    care:"Rouleau ou pression progressive.",
    caution:"Éviter une pression excessive près du genou."
  },
  {
    id:"tfl-left", muscle:"Tenseur du fascia lata", label:"Tenseur du fascia lata", side:"gauche",
    position:[-0.25,0.05,0.06], painZones:["hanche","cuisse"],
    referral:"Hanche latérale et haut de cuisse.",
    location:"Face antéro-latérale de la hanche.",
    care:"Pression douce et localisée.",
    caution:"Éviter de rouler agressivement sur la bandelette ilio-tibiale."
  },
  {
    id:"tfl-right", muscle:"Tenseur du fascia lata", label:"Tenseur du fascia lata", side:"droit",
    position:[0.25,0.05,0.06], painZones:["hanche","cuisse"],
    referral:"Hanche latérale et haut de cuisse.",
    location:"Face antéro-latérale de la hanche.",
    care:"Pression douce et localisée.",
    caution:"Éviter de rouler agressivement sur la bandelette ilio-tibiale."
  },
  {
    id:"scalene-left", muscle:"Scalènes", label:"Scalènes", side:"gauche",
    position:[-0.12,1.66,0.08], painZones:["cou","épaule","bras"],
    referral:"Cou, épaule et parfois membre supérieur.",
    location:"Plan latéral profond du cou.",
    care:"Pas d’auto-pression profonde.",
    caution:"Zone vasculo-nerveuse sensible : manipulation profonde déconseillée."
  },
  {
    id:"scalene-right", muscle:"Scalènes", label:"Scalènes", side:"droit",
    position:[0.12,1.66,0.08], painZones:["cou","épaule","bras"],
    referral:"Cou, épaule et parfois membre supérieur.",
    location:"Plan latéral profond du cou.",
    care:"Pas d’auto-pression profonde.",
    caution:"Zone vasculo-nerveuse sensible : manipulation profonde déconseillée."
  },
  {
    id:"temporalis-left", muscle:"Temporal", label:"Temporal", side:"gauche",
    position:[-0.16,2.02,0.10], painZones:["tempe","tête","mâchoire"],
    referral:"Tempe, région crânienne latérale et mâchoire.",
    location:"Région temporale, au-dessus de l’arcade zygomatique.",
    care:"Massage très léger avec les doigts.",
    caution:"Éviter une pression forte en cas de céphalée inhabituelle."
  },
  {
    id:"temporalis-right", muscle:"Temporal", label:"Temporal", side:"droit",
    position:[0.16,2.02,0.10], painZones:["tempe","tête","mâchoire"],
    referral:"Tempe, région crânienne latérale et mâchoire.",
    location:"Région temporale, au-dessus de l’arcade zygomatique.",
    care:"Massage très léger avec les doigts.",
    caution:"Éviter une pression forte en cas de céphalée inhabituelle."
  }
];

const pointVariants = {
  "trap-upper-left":[
    {suffix:"-1",label:"Trapèze supérieur — point latéral",view:"back",anchor:[0.58,0.72,0.05]},
    {suffix:"-2",label:"Trapèze supérieur — point médial",view:"back",anchor:[0.42,0.50,0.05]}
  ],
  "trap-upper-right":[
    {suffix:"-1",label:"Trapèze supérieur — point latéral",view:"back",anchor:[0.42,0.72,0.05]},
    {suffix:"-2",label:"Trapèze supérieur — point médial",view:"back",anchor:[0.58,0.50,0.05]}
  ],
  "scm-left":[
    {suffix:"-1",label:"SCM — point supérieur",view:"left",anchor:[0.50,0.72,0.86]},
    {suffix:"-2",label:"SCM — point inférieur",view:"left",anchor:[0.50,0.35,0.86]}
  ],
  "scm-right":[
    {suffix:"-1",label:"SCM — point supérieur",view:"right",anchor:[0.50,0.72,0.86]},
    {suffix:"-2",label:"SCM — point inférieur",view:"right",anchor:[0.50,0.35,0.86]}
  ],
  "infra-left":[
    {suffix:"-1",label:"Infra-épineux — point supérieur",view:"back",anchor:[0.52,0.66,0.04]},
    {suffix:"-2",label:"Infra-épineux — point inférieur",view:"back",anchor:[0.54,0.36,0.04]}
  ],
  "infra-right":[
    {suffix:"-1",label:"Infra-épineux — point supérieur",view:"back",anchor:[0.48,0.66,0.04]},
    {suffix:"-2",label:"Infra-épineux — point inférieur",view:"back",anchor:[0.46,0.36,0.04]}
  ],
  "pec-left":[
    {suffix:"-1",label:"Grand pectoral — point supérieur",view:"front",anchor:[0.58,0.68,0.96]},
    {suffix:"-2",label:"Grand pectoral — point moyen",view:"front",anchor:[0.60,0.42,0.96]}
  ],
  "pec-right":[
    {suffix:"-1",label:"Grand pectoral — point supérieur",view:"front",anchor:[0.42,0.68,0.96]},
    {suffix:"-2",label:"Grand pectoral — point moyen",view:"front",anchor:[0.40,0.42,0.96]}
  ],
  "ql-left":[
    {suffix:"-1",label:"Carré des lombes — point supérieur",view:"back",anchor:[0.56,0.70,0.04]},
    {suffix:"-2",label:"Carré des lombes — point inférieur",view:"back",anchor:[0.58,0.30,0.04]}
  ],
  "ql-right":[
    {suffix:"-1",label:"Carré des lombes — point supérieur",view:"back",anchor:[0.44,0.70,0.04]},
    {suffix:"-2",label:"Carré des lombes — point inférieur",view:"back",anchor:[0.42,0.30,0.04]}
  ],
  "glutemed-left":[
    {suffix:"-1",label:"Moyen fessier — point antérieur",view:"back",anchor:[0.66,0.62,0.04]},
    {suffix:"-2",label:"Moyen fessier — point moyen",view:"back",anchor:[0.52,0.48,0.04]},
    {suffix:"-3",label:"Moyen fessier — point postérieur",view:"back",anchor:[0.38,0.38,0.04]}
  ],
  "glutemed-right":[
    {suffix:"-1",label:"Moyen fessier — point antérieur",view:"back",anchor:[0.34,0.62,0.04]},
    {suffix:"-2",label:"Moyen fessier — point moyen",view:"back",anchor:[0.48,0.48,0.04]},
    {suffix:"-3",label:"Moyen fessier — point postérieur",view:"back",anchor:[0.62,0.38,0.04]}
  ],
  "piriformis-left":[
    {suffix:"-1",label:"Piriforme — point médial",view:"back",anchor:[0.60,0.54,0.04]},
    {suffix:"-2",label:"Piriforme — point latéral",view:"back",anchor:[0.40,0.46,0.04]}
  ],
  "piriformis-right":[
    {suffix:"-1",label:"Piriforme — point médial",view:"back",anchor:[0.40,0.54,0.04]},
    {suffix:"-2",label:"Piriforme — point latéral",view:"back",anchor:[0.60,0.46,0.04]}
  ],
  "ham-left":[
    {suffix:"-1",label:"Ischio-jambiers — point proximal",view:"back",anchor:[0.50,0.68,0.04]},
    {suffix:"-2",label:"Ischio-jambiers — point moyen",view:"back",anchor:[0.50,0.40,0.04]}
  ],
  "ham-right":[
    {suffix:"-1",label:"Ischio-jambiers — point proximal",view:"back",anchor:[0.50,0.68,0.04]},
    {suffix:"-2",label:"Ischio-jambiers — point moyen",view:"back",anchor:[0.50,0.40,0.04]}
  ],
  "gastroc-left":[
    {suffix:"-1",label:"Gastrocnémien — point supérieur",view:"back",anchor:[0.50,0.66,0.04]},
    {suffix:"-2",label:"Gastrocnémien — point inférieur",view:"back",anchor:[0.50,0.38,0.04]}
  ],
  "gastroc-right":[
    {suffix:"-1",label:"Gastrocnémien — point supérieur",view:"back",anchor:[0.50,0.66,0.04]},
    {suffix:"-2",label:"Gastrocnémien — point inférieur",view:"back",anchor:[0.50,0.38,0.04]}
  ],
  "tibant-left":[
    {suffix:"-1",label:"Tibial antérieur — point supérieur",view:"front",anchor:[0.50,0.65,0.96]},
    {suffix:"-2",label:"Tibial antérieur — point moyen",view:"front",anchor:[0.50,0.42,0.96]}
  ],
  "tibant-right":[
    {suffix:"-1",label:"Tibial antérieur — point supérieur",view:"front",anchor:[0.50,0.65,0.96]},
    {suffix:"-2",label:"Tibial antérieur — point moyen",view:"front",anchor:[0.50,0.42,0.96]}
  ]
};

export const triggerPoints = baseTriggerPoints.flatMap(point => {
  const variants = pointVariants[point.id];
  if (!variants) {
    const defaultView = ["Masséter"].includes(point.muscle)
      ? (point.side === "gauche" ? "left" : "right")
      : ["Supra-épineux","Élévateur de la scapula"].includes(point.muscle) ? "back" : "front";
    return [{...point, view:defaultView, anchor:[0.50,0.50,defaultView==="front"?0.96:0.04]}];
  }
  return variants.map(v => ({...point, id:point.id+v.suffix, label:v.label, view:v.view, anchor:v.anchor}));
});

export const painAreas = [
  "tempe","tête","nuque","cou","mâchoire","visage","épaule","omoplate","bras","avant-bras","thorax","dos","aisselle","lombaires","aine","hanche","fesse","sacrum","jambe","cuisse","genou","mollet","cheville","talon","pied","plante du pied"
];
