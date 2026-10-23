# 0003 - Gestion des besoins de recrutement et autorité du GM

## Contexte
Les besoins de recrutement (`recruitment_needs`) étaient initialement conçus pour être alimentés automatiquement par scraping WowProgress via un workflow n8n et Puppeteer. Cependant, le scraping externe est fragile (protections antibot/Cloudflare de WowProgress, modifications de structure HTML) et peut échouer silencieusement, laissant les besoins figés ou erronés.

## Décision
1. **Autorité de gestion directe pour le GM** : L'application doit offrir au GM une interface d'administration directe pour modifier et forcer les priorités de recrutement (`high`, `medium`, `low`, `closed`) par classe et spécialisation.
2. **Synchronisation WowProgress optionnelle** : Le scraping WowProgress via n8n reste un mécanisme d'appoint déclenchable, mais ne constitue pas la source de vérité absolue.
3. **Périmètre d'impact** : Les besoins de recrutement pilotent l'affichage public et déclenchent l'avertissement de "Candidature Spontanée" lorsque la spécialisation choisie est `closed`.
