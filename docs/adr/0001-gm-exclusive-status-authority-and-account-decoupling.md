# 0001 - Autorité exclusive du GM sur les statuts de candidature et découplage des comptes

## Contexte
Dans le système de recrutement JSC HR, les officiers participent activement à l'instruction des dossiers (notes d'officiers, création de candidatures manuelles, vote consultatif). On pourrait naturellement s'attendre à ce que les officiers puissent également valider ou rejeter les candidatures, ou que l'acceptation d'une candidature accorde automatiquement les droits de membre au compte du postulant.

## Décision
1. **Autorité exclusive du GM** : Seul le Maître de Guilde (`gm`) détient l'autorité pour modifier le statut d'une candidature (`pending`, `waitlist`, `accepted`, `rejected`). Les officiers instruisent et conseillent, mais ne tranchent pas le statut dans l'application.
2. **Découplage strict Candidat / Membre** : L'acceptation d'une candidature (`status: accepted`) ne promeut pas automatiquement le compte utilisateur en rôle `member`. L'accès au rôle membre dans l'application reste un processus découplé, attribué manuellement ou synchronisé une fois la période d'essai et l'intégration effective en jeu confirmées.
3. **Clôture du scrutin** : Dès qu'une candidature passe au statut `accepted` ou `rejected`, le scrutin est gelé (votes désactivés sur le Web et sur Discord) pour figer la décision.
