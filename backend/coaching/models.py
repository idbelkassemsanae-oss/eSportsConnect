from django.db import models
from django.conf import settings

class SportCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name

class Game(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(SportCategory, on_delete=models.CASCADE, related_name='games')
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.name

class CoachProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coach_profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='coach_pictures/', blank=True, null=True)
    specialty = models.CharField(max_length=100, blank=True, null=True)
    mastered_games = models.CharField(max_length=200, blank=True, null=True)
    experience_years = models.IntegerField(blank=True, null=True)
    skill_level = models.CharField(max_length=20, choices=[('debutant', 'Débutant'), ('intermediaire', 'Intermédiaire'), ('avance', 'Avancé'), ('expert', 'Expert')], default='intermediaire', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    availability = models.TextField(blank=True, null=True, help_text="Jours séparés par des virgules")
    portfolio_links = models.TextField(blank=True, null=True)
    diploma = models.FileField(upload_to='diplomas_legacy/', blank=True, null=True)

    def __str__(self):
        return f"Coach {self.user.username}"

class CoachDiploma(models.Model):
    coach_profile = models.ForeignKey(CoachProfile, on_delete=models.CASCADE, related_name='diplomas')
    title = models.CharField(max_length=200, blank=True, null=True)
    file = models.FileField(upload_to='coach_diplomas/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Diplôme de {self.coach_profile.user.username}"

class Course(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Débutant'),
        ('intermediate', 'Intermédiaire'),
        ('advanced', 'Avancé'),
        ('expert', 'Expert'),
    ]
    COURSE_TYPES = [
        ('video', 'Vidéo'),
        ('text', 'Texte'),
    ]
    CATEGORY_CHOICES = [
        ('fps', 'FPS'),
        ('moba', 'MOBA'),
        ('sport', 'Jeux de sport'),
        ('battle_royale', 'Battle Royale'),
        ('combat', 'Jeux de combat'),
        ('strategie', 'Stratégie'),
        ('entrainement', 'Entraînement & Performance'),
        ('tactique', 'Stratégie & Tactique'),
        ('competition', 'Compétition eSport'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True, null=True)
    game = models.ForeignKey('Game', on_delete=models.SET_NULL, null=True, blank=True)
    coach = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coached_courses')
    program = models.JSONField(default=list, blank=True, null=True)

    course_type = models.CharField(max_length=10, choices=COURSE_TYPES, default='video')
    video_url = models.URLField(blank=True, null=True)
    video_file = models.FileField(upload_to='course_videos/', blank=True, null=True)
    content = models.TextField(blank=True, null=True)

    duration = models.IntegerField(default=0)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def get_program(self):
        if isinstance(self.program, list):
            return self.program
        return []

    def get_chapters_count(self):
        return len(self.get_program())

class Video(models.Model):
    title = models.CharField(max_length=100)
    url = models.URLField()
    duration = models.IntegerField(help_text="Durée en secondes")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')

    def __str__(self):
        return self.title

class CourseEnrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Refusé'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    progress = models.FloatField(default=0.0)
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} - {self.course.title} ({self.status})"

class CourseResource(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='course_resources/', blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class CourseComment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author.username} - {self.content[:30]}"

class LiveSession(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='live_sessions')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    stream_url = models.URLField()
    scheduled_at = models.DateTimeField()
    duration = models.IntegerField(default=60)
    recorded_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# ============================================================
# MODÈLE REVIEW (AVIS) - À AJOUTER SI ABSENT
# ============================================================
class Review(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'author')

    def __str__(self):
        return f"{self.author.username} - {self.course.title} ({self.rating})"