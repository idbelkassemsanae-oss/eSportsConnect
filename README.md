# eSportsConnect

Plateforme de gestion d'un club de sport électronique (eSport)

# Description

eSportsConnect est une plateforme web complète dédiée à la gestion d'un club de sport électronique. Elle permet aux joueurs, coaches et administrateurs de gérer l'ensemble des activités eSport :

-Tournois et compétitions : Création, inscription, génération automatique des matchs, saisie des scores
-Cours en ligne : Création, inscription, approbation par le coach, suivi de la progression
-Classement global : Points, médailles (Or/Argent/Bronze), badges de niveau
-Messagerie interne : Communication entre membres avec modération automatique
-Ressources éducatives : Guides, tutoriels, articles sur l'eSport
-Streaming en direct : Intégration Twitch, suivi des streamers
-Module IA : Chatbot Gemini, recommandations personnalisées, analyse des performances
-Interface immersive : Thème cyberpunk néon, animations, responsive


# Technologies utilisées

# Pour le Backend
Django =>  Framework web 
Django REST Framework => API REST 
JWT => Authentification 
PostgreSQL => Base de données 
Python => Langage de programmation 

# Pour le Frontend

React => Interface utilisateur 
Tailwind CSS => Design et style 
Chart.js => Graphiques Dashboard IA 
Lucide React => Icônes 

# Pour L'Intelligence Artificielle

Google Gemini => Chatbot IA 
scikit-learn => Analyse des performances 
pandas => Traitement et analyse des données (DataService) |
numpy => Calculs numériques (utilisé par scikit-learn) |
Flask => API REST du module IA (port 5000) |

# Pour le Streaming

Twitch API => Diffusion en direct 


# Prérequis
Avant d'installer le projet, assurez-vous d'avoir :
-Python 3.10 ou plus
-Node.js 18 ou plus
-PostgreSQL 14 ou plus
-Git (optionnel, pour le clonage)


# Pour L'Installation

  # 1. Cloner le projet

git clone https://github.com/idbelkassemsanae-oss/eSportsConnect.git
cd eSportsConnect
  # 2. Installer le backend
# Créer un environnement virtuel
python -m venv venv
# Activer l'environnement
# Sur Windows :
venv\Scripts\activate
# Sur Mac/Linux :
source venv/bin/activate
# Installer les dépendances
pip install -r requirements.txt

  # 3.Configurer la base de données PostgreSQL
# Créer la base de données
CREATE DATABASE esportsconnect_db;
# Créer l'utilisateur
CREATE USER esports_user WITH PASSWORD 'votre_mot_de_passe';
# Accorder les privilèges
GRANT ALL PRIVILEGES ON DATABASE esportsconnect_db TO esports_user;
  # 4.Configurer les variables d'environnement
# Django
SECRET_KEY=your_secret_key_here
DEBUG=True
# Base de données
DB_NAME=esportsconnect_db
DB_USER=your_db_user_here
DB_PASSWORD=your_db_password_here
DB_HOST=localhost
DB_PORT=5432
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here
  # 5. Lancer les migrations Django 
cd backend
python manage.py makemigrations
python manage.py migrate
  # 6. Créer un superutilisateur
python manage.py createsuperuser 
  # 7. Installer le frontend
cd frontend
npm install
  # 8. Lancer les serveurs 
- Démarrer le backend Django
cd backend
python manage.py runserver
- Démarrer le frontend React
cd frontend
npm start
npm run build-CSS

Guide d'utilisation
1. Authentification
  + Inscription
Accédez à la page d'inscription (/register)
Choisissez votre rôle : Joueur ou Coach
Remplissez le formulaire (username, email, password)
Cliquez sur "S'inscrire"
  + Connexion
Accédez à la page de connexion (/login)
Saisissez votre nom d'utilisateur et votre mot de passe
Cliquez sur "Se connecter"

2. Profil utilisateur
  + Joueur
Consulter et modifier ses informations personnelles
Gérer ses jeux préférés et son niveau
Suivre sa progression (statistiques, badges)
Consulter son classement
  + Coach
Créer et gérer des cours
Créer et gérer des tournois
Générer les matchs des tournois
Saisir les scores
Approuver les inscriptions aux cours
  + Administrateur
Gérer tous les utilisateurs
Gérer tous les tournois et cours
Modérer la plateforme
Gérer les ressources

3. Gestion des tournois
  + Créer un tournoi (Coach)
Aller dans la section "Tournois"
Cliquer sur "Créer un tournoi"
Remplir le formulaire :
. Nom du tournoi
. Description
. Jeu (Valorant, LoL, etc.)
. Format (BO1, BO3, BO5)
. Date de début
. Nombre maximum de participants
Cliquer sur "Créer"
  + S'inscrire à un tournoi (Joueur)
Consulter la liste des tournois
Sélectionner un tournoi
Cliquer sur "S'inscrire"
  + Générer les matchs (Coach)
Ouvrir les détails du tournoi
Cliquer sur "Générer les matchs"
Les matchs sont créés automatiquement
  + Saisir les scores (Coach)
Ouvrir les détails du tournoi
Aller dans la section "Matchs"
Cliquer sur "Saisir les scores"
Entrer les scores pour chaque manche
Cliquer sur "Valider"

4. Gestion des cours
  + Créer un cours (Coach)
Aller dans la section "Cours"
Cliquer sur "Créer un cours"
Remplir le formulaire :
. Titre
. Description
. Type (FPS, MOBA, Battle Royale, etc.)
. Niveau
. Vidéo (URL ou fichier)
Cliquer sur "Créer"
  + S'inscrire à un cours (Joueur)
Consulter la liste des cours
Sélectionner un cours
Cliquer sur "S'inscrire"
Le coach doit approuver l'inscription
  + Suivre la progression
Accéder à "Mes cours"
Voir la progression pour chaque cours
Suivre les vidéos pour avancer

5. Classement
Aller dans la section "Classement"
Consulter le classement global des joueurs
Visualiser les médailles (Or/Argent/Bronze)
Filtrer par jeu ou région

6. Messagerie interne
Aller dans la section "Messages"
Sélectionner une conversation
Envoyer un message
Les messages toxiques sont automatiquement modérés

7. Module IA
  + Chatbot
Cliquer sur l'icône du chatbot (en bas à droite)
Poser une question (ex: "Comment m'inscrire à un tournoi ?")
Obtenir une réponse automatique
  + Dashboard IA
Aller dans la section "Statistiques IA"
Consulter :
. Statistiques globales (victoires, défaites, win rate)
. Compétences (Agilité, Endurance, Précision, Stratégie)
. Forces et faiblesses détectées
. Recommandations personnalisées

8. Streaming
  + Connecter Twitch
Aller dans la section "Streaming"
Cliquer sur "Connecter Twitch"
Entrer votre nom d'utilisateur Twitch
Valider
  + Suivre un streamer
Consulter la liste des streamers
Cliquer sur "Suivre"
Recevoir des notifications quand il est en direct

9. Ressources éducatives
Aller dans la section "Ressources"
Consulter les guides, tutoriels et articles
Filtrer par type ou catégorie
Cliquer sur une ressource pour la lire

Comptes de test
Pour tester l'application, vous pouvez utiliser les comptes suivants :

-Compte Joueur
Username : sanae1234
Password : agadir1234

Compte Coach
Username : zineb1234
Password : casa1234

Compte Administrateur
Username : sanae
Password : sanae2005

Contact
Auteur : Idbelkassem Sanae
Encadrante : AIT BENNACER Sara
Établissement : École Marocaine des Sciences de l'Ingénieur (EMSI)
Année universitaire : 2025/2026

Licence
Ce projet est réalisé dans le cadre d'un projet académique. Tous droits réservés.
© 2026 eSportsConnect - Plateforme de gestion d'un club eSport