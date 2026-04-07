# Application de Gestion et Suivi d'Interventions

Plateforme moderne de gestion technique avec séparation stricte des rôles (Admin/Employé) et dashboard analytique.

## 🚀 Fonctionnalités Clés

### 👷 Interface Employé (Technicien)
- **Dashboard Personnel** : Vue filtrée sur ses propres dossiers.
- **Formulaire Intelligent** : Saisie rapide (Mobile-First) avec validation Zod.
- **Statut en Temps Réel** : Suivi de l'état (A faire, En cours, Bloqué, Terminé).
- **Notifications Admin** : Indicateur visuel pour les retours non lus.

### 🛡️ Interface Administrateur
- **Gestion d'Équipe** : Contrôle total sur les comptes employés.
- **Vue Panoramique** : Accès global à toutes les interventions.
- **Dashboard Analytics** : 
  - Filtres temporels et par employé.
  - Statistiques automatiques par type d'article.
  - Exportation des données (CSV/Excel).
- **Feedback Direct** : Ajout de commentaires et modification de statut.

## 🛠️ Stack Technique
- **Framework** : Next.js 14+ (App Router)
- **Base de données** : PostgreSQL via Prisma
- **Styling** : Tailwind CSS + Shadcn/UI
- **Validation** : Zod + React Hook Form

## 🚦 Lancement du Projet

### 1. Installation des dépendances
```bash
npm install
# ou
yarn install
```

### 2. Configuration de l'environnement
Créez un fichier `.env` à la racine :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/suivi_db"
```

### 3. Initialisation de la base de données
```bash
npx prisma generate
npx prisma db push
```

### 4. Démarrage en mode développement
```bash
npm run dev
```

Accédez à l'application sur [http://localhost:3000](http://localhost:3000).
