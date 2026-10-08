from django.http import JsonResponse

def home(request):
    """Vue de la racine de l'API (Retourne du JSON pour le Frontend React)"""
    return JsonResponse({
        "message": "Bienvenue sur l'API eSportsConnect !",
        "documentation": "Rendez-vous sur /api/docs/ pour tester les endpoints.",
        "status": "active"
    })