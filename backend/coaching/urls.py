from django.urls import path
from .views import (
    CourseListCreateView,
    MyCoursesListAPIView,
    MyCoursesAPIView,
    CourseRetrieveUpdateDeleteView,
    enroll_course,
    my_enrollment_status,
    list_enrollments,
    approve_enrollment,
    reject_enrollment,
    upload_diploma,
    delete_diploma,
    CourseResourcesAPIView,
    CourseResourceDetailView,
    CourseCommentsAPIView,
    CourseCommentDetailView,
    LiveSessionsAPIView,
    LiveSessionDetailView,
    SportCategoryListView,
    GameListView,
    CoachStatsView,
    update_progress,
    mark_completed,
    CourseReviewsView,
    CourseSimilarView,
)

urlpatterns = [
    # Catalogue global
    path('courses/', CourseListCreateView.as_view(), name='course-list'),

    # Mes cours (Coach)
    path('courses/mine/', MyCoursesListAPIView.as_view(), name='my-courses'),

    # Mes cours (Joueur)
    path('courses/my-courses/', MyCoursesAPIView.as_view(), name='player-my-courses'),

    # Détail, modification, suppression
    path('courses/<int:pk>/', CourseRetrieveUpdateDeleteView.as_view(), name='course-detail'),

    # Inscription
    path('courses/register/<int:pk>/', enroll_course, name='enroll-course'),
    path('courses/<int:pk>/my-enrollment/', my_enrollment_status, name='my-enrollment-status'),

    # Demandes (Coach)
    path('courses/<int:course_pk>/enrollments/', list_enrollments, name='list-enrollments'),
    path('courses/<int:course_pk>/enrollments/<int:enrollment_pk>/approve/', approve_enrollment, name='approve-enrollment'),
    path('courses/<int:course_pk>/enrollments/<int:enrollment_pk>/reject/', reject_enrollment, name='reject-enrollment'),

    # Ressources
    path('courses/<int:course_pk>/resources/', CourseResourcesAPIView.as_view(), name='course-resources'),
    path('resources/<int:pk>/', CourseResourceDetailView.as_view(), name='resource-detail'),

    # Commentaires
    path('courses/<int:course_pk>/comments/', CourseCommentsAPIView.as_view(), name='course-comments'),
    path('comments/<int:pk>/', CourseCommentDetailView.as_view(), name='comment-detail'),

    # Sessions live
    path('courses/<int:course_pk>/live-sessions/', LiveSessionsAPIView.as_view(), name='course-live-sessions'),
    path('live-sessions/<int:pk>/', LiveSessionDetailView.as_view(), name='live-session-detail'),

    # Diplômes
    path('diplomas/upload/', upload_diploma, name='upload-diploma'),
    path('diplomas/delete/<int:pk>/', delete_diploma, name='delete-diploma'),

    # Catégories et jeux
    path('categories/', SportCategoryListView.as_view(), name='sport-categories'),
    path('games/', GameListView.as_view(), name='games'),

    # Statistiques coach
    path('coach-stats/', CoachStatsView.as_view(), name='coach-stats'),

    # Progression
    path('courses/<int:course_pk>/progress/', update_progress, name='update-progress'),
    path('courses/<int:course_pk>/complete/', mark_completed, name='mark-completed'),

    # ===== NOUVEAUX ENDPOINTS =====
    path('courses/<int:course_pk>/reviews/', CourseReviewsView.as_view(), name='course-reviews'),
    path('courses/<int:course_pk>/similar/', CourseSimilarView.as_view(), name='course-similar'),
]