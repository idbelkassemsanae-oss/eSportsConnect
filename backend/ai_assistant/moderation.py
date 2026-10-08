import re
from typing import List, Tuple

TOXIC_WORDS = [
    'connard', 'connasse', 'pute', 'salope', 'enculé', 'bâtard',
    'merde', 'fdp', 'pd', 'nique', 'tue', 'mort', 'viol', 'stupide',
    'idiot', 'crétin', 'imbécile', 'abruti', 'trou du cul',
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'stupid',
    'moron', 'retard', 'nigger', 'faggot'
]

class ContentModerator:
    def moderate_content(self, content: str) -> Tuple[bool, float, List[str]]:
        if not content:
            return False, 0.0, []
        content_lower = content.lower()
        flagged_words = []
        toxic_score = 0.0
        for word in TOXIC_WORDS:
            if word in content_lower:
                flagged_words.append(word)
                toxic_score += 0.15
        toxic_score = min(toxic_score, 1.0)
        is_toxic = toxic_score >= 0.4
        return is_toxic, toxic_score, flagged_words

    def get_moderation_message(self, is_toxic: bool, flagged_words: List[str]) -> str:
        if not is_toxic:
            return "Message autorisé"
        return f"⚠️ Contenu inapproprié détecté : {', '.join(flagged_words[:3])}"

moderator = ContentModerator()