from django.contrib import admin
from .models import (
    SportCategory, Game, CoachProfile, CoachDiploma, Course, Video,
    CourseEnrollment, CourseResource, CourseComment, LiveSession
)

@admin.register(SportCategory)
class SportCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description')
    search_fields = ('name',)

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category')
    search_fields = ('name',)

@admin.register(CoachProfile)
class CoachProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'specialty', 'experience_years', 'hourly_rate')
    search_fields = ('user__username', 'specialty')

@admin.register(CoachDiploma)
class CoachDiplomaAdmin(admin.ModelAdmin):
    list_display = ('id', 'coach_profile', 'title', 'uploaded_at')
    search_fields = ('coach_profile__user__username', 'title')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'coach', 'course_type', 'difficulty_level', 'price', 'is_active')
    list_filter = ('course_type', 'difficulty_level', 'is_active')
    search_fields = ('title', 'coach__username')
    date_hierarchy = 'created_at'

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'course', 'duration')

@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'course', 'enrolled_at')
    list_filter = ('enrolled_at',)

@admin.register(CourseResource)
class CourseResourceAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'course', 'uploaded_at')

@admin.register(CourseComment)
class CourseCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'course', 'content', 'created_at')
    search_fields = ('author__username', 'content')

@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'course', 'scheduled_at', 'is_active')
    list_filter = ('is_active',)