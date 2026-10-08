from django.db import models
from django.conf import settings
from django.utils.text import slugify

class ResourceCategory(models.Model):
    """Catégorie de ressource (ex: Stratégie, Technique, Actualité)"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    icon = models.CharField(max_length=50, blank=True, null=True)  # emoji ou nom d'icône

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Resource(models.Model):
    """Ressource éducative (guide, tutoriel, article, vidéo, podcast)"""
    TYPE_CHOICES = [
        ('guide', 'Guide de jeu'),
        ('tutoriel', 'Tutoriel'),
        ('article', 'Article'),
        ('video', 'Vidéo'),
        ('podcast', 'Podcast'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    content = models.TextField(blank=True, null=True)  # contenu texte (pour articles/tutoriels)
    resource_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='article')
    category = models.ForeignKey(ResourceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources')
    
    # Liens externes ou fichiers
    url = models.URLField(blank=True, null=True)  # lien vers vidéo, podcast ou article externe
    file = models.FileField(upload_to='resources/', blank=True, null=True)  # PDF, etc.
    
    # Métadonnées
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources')
    views = models.IntegerField(default=0)
    likes = models.IntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Tags (pour filtrage)
    tags = models.CharField(max_length=255, blank=True, null=True, help_text="Séparés par des virgules")

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_type_icon(self):
        icons = {
            'guide': '📖',
            'tutoriel': '🎓',
            'article': '📰',
            'video': '🎬',
            'podcast': '🎙️',
        }
        return icons.get(self.resource_type, '📄')


class ResourceComment(models.Model):
    """Commentaire sur une ressource"""
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.username} - {self.resource.title[:30]}"