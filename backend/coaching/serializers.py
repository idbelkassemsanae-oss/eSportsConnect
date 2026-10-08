from rest_framework import serializers
from .models import Course, SportCategory, Game, CoachProfile, CoachDiploma, CourseEnrollment, CourseResource, CourseComment, LiveSession, Review

class SportCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SportCategory
        fields = ['id', 'name', 'description']

class GameSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Game
        fields = ['id', 'name', 'category', 'category_name']

class CoachDiplomaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachDiploma
        fields = ['id', 'title', 'file', 'uploaded_at']

class CoachProfileSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = CoachProfile
        fields = ['id', 'user', 'user_username', 'bio', 'specialty', 'experience', 'rating']

class CourseResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseResource
        fields = ['id', 'title', 'file', 'link', 'description', 'created_at']

class CourseCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    replies = serializers.SerializerMethodField()
    parent_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = CourseComment
        fields = ['id', 'author', 'author_username', 'content', 'created_at', 'parent', 'parent_id', 'replies']
        read_only_fields = ['author', 'created_at', 'parent']

    def get_replies(self, obj):
        if obj.parent is None:
            return CourseCommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []

class LiveSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveSession
        fields = ['id', 'title', 'description', 'scheduled_at', 'duration', 'stream_url', 'recorded_url', 'is_active']
        extra_kwargs = {
            'stream_url': {'required': True},
        }

class CourseEnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = CourseEnrollment
        fields = ['id', 'student', 'student_username', 'course', 'status', 'progress', 'completed', 'enrolled_at']
        read_only_fields = ['progress', 'completed', 'enrolled_at']

class CourseSerializer(serializers.ModelSerializer):
    coach_username = serializers.CharField(source='coach.username', read_only=True)
    game_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    # ✅ NOUVEAU CHAMP : Nombre d'étudiants inscrits (approuvés)
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'game', 'game_name', 'program',
            'course_type', 'video_url', 'video_file',
            'content', 'duration', 'difficulty_level', 'price', 'is_active',
            'coach', 'coach_username', 'created_at',
            'students_count'  # ✅ AJOUT DU CHAMP
        ]
        read_only_fields = ['coach', 'created_at']
        extra_kwargs = {
            'category': {'required': False, 'allow_null': True},
            'game': {'required': False, 'allow_null': True},
            'video_url': {'required': False, 'allow_null': True},
            'content': {'required': False, 'allow_null': True},
            'video_file': {'required': False, 'allow_null': True},
        }

    def get_game_name(self, obj):
        return obj.game.name if obj.game else None

    def get_category_name(self, obj):
        return obj.category if obj.category else None

    # ✅ MÉTHODE POUR COMPTER LES ÉTUDIANTS
    def get_students_count(self, obj):
        # Compte les inscriptions avec le statut 'approved'
        return CourseEnrollment.objects.filter(course=obj, status='approved').count()

class ReviewSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'course', 'author', 'author_username', 'rating', 'comment', 'created_at']
        read_only_fields = ['course', 'author', 'created_at']