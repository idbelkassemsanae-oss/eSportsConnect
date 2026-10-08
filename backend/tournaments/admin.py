from django.contrib import admin
from .models import Tournament, TournamentRegistration, Team, Match, LeaderboardEntry

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'status', 'start_date', 'end_date', 'prize_pool', 'organizer')
    list_filter = ('status',)
    search_fields = ('name', 'description')
    date_hierarchy = 'start_date'

@admin.register(TournamentRegistration)
class TournamentRegistrationAdmin(admin.ModelAdmin):
    list_display = ('id', 'tournament', 'player', 'registered_at')
    list_filter = ('tournament',)

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'tournament')
    filter_horizontal = ('members',)

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'tournament', 'match_number', 'team1', 'team2', 'winner_team', 'score_team1', 'score_team2', 'played_at')
    list_filter = ('tournament',)

@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'tournament', 'team', 'points', 'rank')
    list_filter = ('tournament',)