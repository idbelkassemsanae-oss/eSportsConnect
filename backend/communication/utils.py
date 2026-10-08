def moderate_message(text):
    """
    Fonction de modération IA ultra-légère.
    Détecte les messages toxiques en utilisant une liste de mots-clés.
    Cette méthode est idéale pour un prototype et ne provoque aucune erreur d'import.
    """
    toxic_keywords = ['pute', 'connard', 'insulte', 'haine', 'kill', 'idiot', 'tuer', 'merde', 'salaud', 'nique', 'bâtard']
    
    lower_text = text.lower()
    # Calcul d'un score de toxicité entre 0 et 1
    score = sum(1 for word in toxic_keywords if word in lower_text) / 5.0
    if score > 1.0:
        score = 1.0
        
    # Si le score dépasse 0.5, le message est considéré comme toxique
    return {"is_toxic": score > 0.5, "toxicity_score": score}