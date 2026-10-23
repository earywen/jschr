# JSC HR (Recrutement & Gestion de Guilde WoW)

Système de gestion des candidatures, des votes d'équipe et des besoins de recrutement pour la guilde World of Warcraft JSC.

## Language

### Acteurs & Rôles

**Candidat**:
Joueur extérieur postulant pour intégrer le roster de la guilde via un formulaire public ou une saisie manuelle.
_Avoid_: Postulant, applicant, recrue

**Membre**:
Joueur actif de la guilde disposant d'un compte authentifié et du droit de consultation et de vote consultatif sur les candidatures.
_Avoid_: User, utilisateur, joueur

**Officier**:
Membre du collège de direction en charge de l'évaluation des candidatures, des annotations privées et de la modération.
_Avoid_: Admin, modérateur

**Maître de Guilde (GM)**:
Responsable suprême de la guilde disposant des droits d'arbitrage final, de suppression et de configuration globale.
_Avoid_: Superadmin, owner

### Domaine Candidature & Recrutement

**Candidature**:
Dossier complet soumis par ou pour un candidat comprenant ses informations de personnage, liens logs et motivations.
_Avoid_: Dossier, fiche, application, postulation

**Statut de Candidature**:
État du cycle de vie du candidat parmi `pending` (en attente), `waitlist` (liste d'attente), `accepted` (retenu) et `rejected` (décliné). Seul le Maître de Guilde (GM) a l'autorité pour modifier ce statut.
_Avoid_: Phase, état de recrutement

**Vote**:
Avis consultatif exprimé par un membre (`Pour`, `Neutre`, `Contre`) sur une candidature en cours d'évaluation (`pending` ou `waitlist`). Le scrutin est définitivement gelé dès qu'un statut final est prononcé.
_Avoid_: Avis, réaction, sondage

**Vote à Bulletin Secret**:
Principe selon lequel un membre ne peut consulter que son propre vote et le décompte global ; le détail nominatif des votes est réservé aux Officiers et au GM pour synthèse.
_Avoid_: Vote anonyme, vote masqué

**Note d'Officier**:
Commentaire interne et confidentiel rédigé par un Officier ou le GM sur une fiche de candidature, invisible pour les membres réguliers et le candidat.
_Avoid_: Note interne, remarque, annotation privée

**Candidature Spontanée**:
Candidature déposée sur une spécialisation dont le besoin de recrutement est marqué `closed`, acceptée avec avertissement préalable au postulant.
_Avoid_: Candidature sauvage, candidature hors-besoin

**Spécialisation Secondaire (Off-spec)**:
Spécialisation(s) alternative(s) maîtrisée(s) par le candidat, déclarée(s) en complément de sa spécialisation principale pour attester de sa flexibilité en raid.
_Avoid_: Rôle secondaire, sous-classe, reroll

**Métriques de Performance (Logs)**:
Indicateurs chiffrés consolidés depuis WarcraftLogs (ilvl, Mythic+ score, percentile moyen, progression en raid) enrichissant la fiche du candidat.
_Avoid_: Parse, stat, score wlogs

**Besoin de Recrutement**:
Niveau de priorité (`closed`, `low`, `medium`, `high`) défini par spécialisation de classe guidant les candidatures attendues.
_Avoid_: Slot, recherche, offre
