from django.core.management.base import BaseCommand
from game_profiles.models import Game

class Command(BaseCommand):
    help = 'Ajoute les jeux recommandés dans la base de données'

    def handle(self, *args, **options):
        games = [
            {"name": "Valorant", "slug": "valorant", "icon": "🔫"},
            {"name": "League of Legends", "slug": "league-of-legends", "icon": "⚔️"},
            {"name": "CS:GO", "slug": "cs-go", "icon": "💣"},
            {"name": "Dota 2", "slug": "dota-2", "icon": "🗡️"},
            {"name": "Rocket League", "slug": "rocket-league", "icon": "🚗"},
            {"name": "Fortnite", "slug": "fortnite", "icon": "🪂"},
            {"name": "Overwatch 2", "slug": "overwatch-2", "icon": "🎯"},
            {"name": "Apex Legends", "slug": "apex-legends", "icon": "🦍"},
            {"name": "Call of Duty", "slug": "call-of-duty", "icon": "🎖️"},
            {"name": "Rainbow Six Siege", "slug": "rainbow-six-siege", "icon": "🛡️"},
            {"name": "PUBG", "slug": "pubg", "icon": "🪖"},
            {"name": "Mobile Legends", "slug": "mobile-legends", "icon": "📱"},
            {"name": "Wild Rift", "slug": "wild-rift", "icon": "🌊"},
            {"name": "FIFA", "slug": "fifa", "icon": "⚽"},
            {"name": "NBA 2K", "slug": "nba-2k", "icon": "🏀"},
            {"name": "Mortal Kombat", "slug": "mortal-kombat", "icon": "🥊"},
            {"name": "Street Fighter", "slug": "street-fighter", "icon": "👊"},
            {"name": "Tekken", "slug": "tekken", "icon": "🥋"},
            {"name": "Super Smash Bros", "slug": "super-smash-bros", "icon": "🎮"},
            {"name": "Minecraft", "slug": "minecraft", "icon": "⛏️"},
            {"name": "Among Us", "slug": "among-us", "icon": "🕵️"},
            {"name": "Fall Guys", "slug": "fall-guys", "icon": "🤖"},
            {"name": "Genshin Impact", "slug": "genshin-impact", "icon": "🌌"},
            {"name": "World of Warcraft", "slug": "world-of-warcraft", "icon": "🐉"},
            {"name": "StarCraft II", "slug": "starcraft-ii", "icon": "🚀"},
            {"name": "Hearthstone", "slug": "hearthstone", "icon": "🃏"},
            {"name": "Magic: The Gathering", "slug": "magic-the-gathering", "icon": "🪄"},
            {"name": "Pokémon", "slug": "pokemon", "icon": "⚡"},
            {"name": "Zelda", "slug": "zelda", "icon": "🗡️"},
            {"name": "Halo", "slug": "halo", "icon": "💀"},
            {"name": "Gears of War", "slug": "gears-of-war", "icon": "⚙️"},
            {"name": "God of War", "slug": "god-of-war", "icon": "🪓"},
            {"name": "Assassin's Creed", "slug": "assassins-creed", "icon": "🗡️"},
        ]

        created_count = 0
        for game_data in games:
            game, created = Game.objects.get_or_create(
                slug=game_data["slug"],
                defaults={
                    "name": game_data["name"],
                    "icon": game_data["icon"],
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"✅ Ajouté: {game.name}"))
            else:
                self.stdout.write(f"⏭️ Déjà existant: {game.name}")

        self.stdout.write(self.style.SUCCESS(f"\n🎮 {created_count} nouveaux jeux ajoutés !"))