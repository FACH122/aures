# Aurès Céramique — site vitrine pour poterie & céramique traditionnelle

Site statique **sans build step** : HTML/CSS/JS + Supabase (catalogue, formulaire de
contact, administration). Pas de panier : les ventes passent par WhatsApp/téléphone.

## Démarrage rapide

1. **Aperçu immédiat** : ouvrez `index.html` ou servez le dossier
   (`python3 -m http.server`) — sans Supabase, le site tourne en **mode démo**.
2. **Connecter Supabase** :
   - créez un projet gratuit sur [supabase.com](https://supabase.com) ;
   - SQL Editor → collez tout `supabase/schema.sql` → Run ;
   - copiez Project URL + anon key dans `assets/js/config.js` ;
   - Authentication → Users → **Add user** (Auto Confirm) = propriétaire,
     puis désactivez l'inscription (Sign In / Providers → Email).
3. **Administration** : ouvrez `/admin.html`, connectez-vous.
   Onglets : Pièces, Catégories, Demandes (messages du formulaire), Boutique.

## Personnalisation

| Quoi | Où |
|---|---|
| Nom du site / branding | rechercher « Aurès Céramique » dans les `.html` + `i18n.js` |
| WhatsApp / téléphone / adresse | admin → Boutique (ou `config.js` en secours) |
| Hero image | admin → Boutique (`settings.hero`) ou `window.HERO_IMAGE` |
| Carte Google Maps | `window.MAP_QUERY` dans `config.js` |
| Couleurs / polices | variables CSS en tête de `assets/css/main.css` |

## Langues

FR / AR (RTL) / EN via `assets/js/i18n.js`. Les données produits et catégories sont
trilingues en base (`name_fr/name_ar/name_en`…). Le choix est mémorisé
(`localStorage.tc_lang`), le sélecteur se trouve dans l'en-tête.

## Déploiement (Netlify)

Glissez-déposez le dossier sur [app.netlify.com](https://app.netlify.com) ou
`netlify deploy`. `netlify.toml` fournit les jolies URLs et les en-têtes de sécurité.
Remplacez `YOUR-DOMAIN` dans `sitemap.xml` et renseignez `window.SITE_URL`.

## Sécurité

La clé anon est publique par conception ; toute la sécurité vit dans
`supabase/schema.sql` (RLS + fonctions SECURITY DEFINER). Les visiteurs ne peuvent
que lire le catalogue actif et envoyer des demandes via `submit_inquiry()`
(limité à 5/heure/numéro).
