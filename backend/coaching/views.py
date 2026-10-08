from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum
from rest_framework import generics, status, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from .models import (
    Course, CourseEnrollment, CoachProfile, CoachDiploma,
    CourseResource, CourseComment, LiveSession, SportCategory, Game, Review
)
from .serializers import (
    CourseSerializer, CourseEnrollmentSerializer,
    CoachDiplomaSerializer, CourseResourceSerializer,
    CourseCommentSerializer, LiveSessionSerializer,
    SportCategorySerializer, GameSerializer, ReviewSerializer
)
from tournaments.models import Notification

# ============================================================
# PAGINATION
# ============================================================
class CoursePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

class IsCoach(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'coach'

# ============================================================
# 1. CATALOGUE GLOBAL
# ============================================================
class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        queryset = Course.objects.filter(is_active=True)
        search = self.request.GET.get('search')
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
        category = self.request.GET.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.role != 'coach':
            raise permissions.PermissionDenied("Seul un coach peut créer des cours.")
        if 'video_file' in self.request.FILES:
            serializer.save(coach=self.request.user, video_file=self.request.FILES['video_file'])
        else:
            serializer.save(coach=self.request.user)

# ============================================================
# 2. MES COURS (Coach)
# ============================================================
class MyCoursesListAPIView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Course.objects.filter(coach=self.request.user)

# ============================================================
# 3. DÉTAIL, MODIFICATION, SUPPRESSION
# ============================================================
class CourseRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'coach':
            return Course.objects.filter(coach=user)
        return Course.objects.all()

# ============================================================
# 4. INSCRIPTION
# ============================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request, pk):
    course = get_object_or_404(Course, pk=pk)
    if request.user.role == 'coach':
        return Response({"error": "Un coach ne peut pas s'inscrire à un cours"}, status=400)
    enrollment, created = CourseEnrollment.objects.get_or_create(
        student=request.user, course=course,
        defaults={'status': 'pending'}
    )
    if created:
        Notification.objects.create(
            user=course.coach,
            message=f"📚 Le joueur {request.user.username} demande à s'inscrire à votre cours '{course.title}'."
        )
        return Response({"message": "Demande envoyée ! En attente de confirmation.", "status": "pending"}, status=201)
    return Response({"message": "Demande déjà envoyée.", "status": enrollment.status}, status=200)

# ============================================================
# 5. STATUT D'INSCRIPTION
# ============================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_enrollment_status(request, pk):
    course = get_object_or_404(Course, pk=pk)
    enrollment = CourseEnrollment.objects.filter(student=request.user, course=course).first()
    if enrollment:
        return Response({"status": enrollment.status, "progress": enrollment.progress, "completed": enrollment.completed})
    return Response({"status": None, "progress": 0, "completed": False})

# ============================================================
# 6. LISTE DES DEMANDES (Coach)
# ============================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_enrollments(request, course_pk):
    course = get_object_or_404(Course, pk=course_pk, coach=request.user)
    enrollments = CourseEnrollment.objects.filter(course=course)
    serializer = CourseEnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)

# ============================================================
# 7. APPROUVER / REFUSER
# ============================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_enrollment(request, course_pk, enrollment_pk):
    course = get_object_or_404(Course, pk=course_pk, coach=request.user)
    enrollment = get_object_or_404(CourseEnrollment, pk=enrollment_pk, course=course)
    enrollment.status = 'approved'
    enrollment.save()
    Notification.objects.create(
        user=enrollment.student,
        message=f"🎉 Félicitations ! Vous avez été accepté au cours '{course.title}'."
    )
    return Response({"message": "Joueur approuvé !"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_enrollment(request, course_pk, enrollment_pk):
    course = get_object_or_404(Course, pk=course_pk, coach=request.user)
    enrollment = get_object_or_404(CourseEnrollment, pk=enrollment_pk, course=course)
    enrollment.status = 'rejected'
    enrollment.save()
    Notification.objects.create(
        user=enrollment.student,
        message=f"❌ Votre demande d'inscription au cours '{course.title}' a été refusée."
    )
    return Response({"message": "Demande refusée."})

# ============================================================
# 8. RESSOURCES
# ============================================================
class CourseResourcesAPIView(generics.ListCreateAPIView):
    serializer_class = CourseResourceSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return CourseResource.objects.none()
        course_pk = self.kwargs.get('course_pk')
        return CourseResource.objects.filter(course_id=course_pk)

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs.get('course_pk'))
        if self.request.user != course.coach and not self.request.user.is_staff:
            raise permissions.PermissionDenied("Non autorisé.")
        serializer.save(course=course)

class CourseResourceDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = CourseResourceSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return CourseResource.objects.filter(course__coach=self.request.user)

# ============================================================
# 9. COMMENTAIRES
# ============================================================
class CourseCommentsAPIView(generics.ListCreateAPIView):
    serializer_class = CourseCommentSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return CourseComment.objects.none()
        course_pk = self.kwargs.get('course_pk')
        return CourseComment.objects.filter(course_id=course_pk, parent__isnull=True)

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs.get('course_pk'))
        parent_id = self.request.data.get('parent_id')
        parent = None
        if parent_id:
            parent = get_object_or_404(CourseComment, pk=parent_id, course=course)
        serializer.save(course=course, author=self.request.user, parent=parent)

class CourseCommentDetailView(generics.DestroyAPIView):
    serializer_class = CourseCommentSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return CourseComment.objects.filter(course__coach=self.request.user) | CourseComment.objects.filter(author=self.request.user)

# ============================================================
# 10. SESSIONS LIVE
# ============================================================
class LiveSessionsAPIView(generics.ListCreateAPIView):
    serializer_class = LiveSessionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return LiveSession.objects.none()
        course_pk = self.kwargs.get('course_pk')
        return LiveSession.objects.filter(course_id=course_pk, is_active=True).order_by('scheduled_at')

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs.get('course_pk'))
        if self.request.user != course.coach and not self.request.user.is_staff:
            raise permissions.PermissionDenied("Non autorisé.")
        serializer.save(course=course)

class LiveSessionDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = LiveSessionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return LiveSession.objects.filter(course__coach=self.request.user)

# ============================================================
# 11. DIPLÔMES
# ============================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_diploma(request):
    if request.user.role != 'coach':
        return Response({"error": "Seul un coach peut ajouter un diplôme"}, status=403)
    coach_profile, _ = CoachProfile.objects.get_or_create(user=request.user)
    file = request.FILES.get('file')
    title = request.data.get('title', 'Diplôme')
    if not file:
        return Response({"error": "Aucun fichier reçu"}, status=400)
    diploma = CoachDiploma.objects.create(coach_profile=coach_profile, title=title, file=file)
    return Response(CoachDiplomaSerializer(diploma).data, status=201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_diploma(request, pk):
    diploma = get_object_or_404(CoachDiploma, pk=pk, coach_profile__user=request.user)
    diploma.file.delete(save=False)
    diploma.delete()
    return Response({"message": "Diplôme supprimé"}, status=200)

# ============================================================
# 12. MES COURS (Joueur) - VERSION CORRIGÉE
# ============================================================
class MyCoursesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Récupère toutes les inscriptions de l'utilisateur
        enrollments = CourseEnrollment.objects.filter(student=request.user)
        data = []
        for enrollment in enrollments:
            course = enrollment.course
            # Sérialise le cours
            course_data = CourseSerializer(course).data
            # Ajoute le statut de l'inscription
            course_data['status'] = enrollment.status  # 'pending', 'approved', 'rejected'
            data.append(course_data)
        return Response(data)

# ============================================================
# 13. CATÉGORIES ET JEUX
# ============================================================
class SportCategoryListView(generics.ListAPIView):
    queryset = SportCategory.objects.all()
    serializer_class = SportCategorySerializer
    permission_classes = [permissions.AllowAny]

class GameListView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]

# ============================================================
# 14. STATISTIQUES DU COACH
# ============================================================
class CoachStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if user.role != 'coach':
            return Response({"error": "Vous n'êtes pas un coach."}, status=403)

        courses = Course.objects.filter(coach=user)
        total_courses = courses.count()
        enrollments = CourseEnrollment.objects.filter(course__in=courses)
        total_students = enrollments.values('student').distinct().count()
        total_revenue = sum(c.price for c in courses if c.price)

        courses_stats = []
        for course in courses:
            students_count = CourseEnrollment.objects.filter(course=course, status='approved').count()
            courses_stats.append({
                'id': course.id,
                'title': course.title,
                'students_count': students_count,
                'price': float(course.price) if course.price else 0,
                'is_active': course.is_active,
            })

        recent_enrollments = enrollments.order_by('-enrolled_at')[:5]
        recent_data = [{
            'student': e.student.username,
            'course': e.course.title,
            'status': e.status,
            'date': e.enrolled_at,
        } for e in recent_enrollments]

        return Response({
            'total_courses': total_courses,
            'total_students': total_students,
            'total_revenue': total_revenue,
            'courses_stats': courses_stats,
            'recent_enrollments': recent_data,
        })

# ============================================================
# 15. PROGRESSION
# ============================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_progress(request, course_pk):
    enrollment = get_object_or_404(CourseEnrollment, course_id=course_pk, student=request.user)
    progress = request.data.get('progress')
    if progress is None:
        return Response({"error": "progress required"}, status=400)
    try:
        enrollment.progress = min(100, max(0, float(progress)))
    except ValueError:
        return Response({"error": "progress must be a number"}, status=400)
    enrollment.completed = enrollment.progress >= 100
    enrollment.save()
    return Response({"progress": enrollment.progress, "completed": enrollment.completed})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_completed(request, course_pk):
    enrollment = get_object_or_404(CourseEnrollment, course_id=course_pk, student=request.user)
    enrollment.progress = 100
    enrollment.completed = True
    enrollment.save()
    return Response({"progress": 100, "completed": True})

# ============================================================
# 16. AVIS (Reviews) - GET et POST
# ============================================================
class CourseReviewsView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk)
        reviews = Review.objects.filter(course=course).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, course_pk):
        if not request.user.is_authenticated:
            return Response({"error": "Vous devez être connecté"}, status=401)

        course = get_object_or_404(Course, pk=course_pk)

        # Vérifier si l'utilisateur a déjà donné un avis
        if Review.objects.filter(course=course, author=request.user).exists():
            return Response({"error": "Vous avez déjà laissé un avis pour ce cours"}, status=400)

        data = request.data.copy()
        data['course'] = course.id
        data['author'] = request.user.id
        serializer = ReviewSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=201)
            except Exception as e:
                print(f"❌ Erreur lors de l'enregistrement: {e}")
                return Response({"error": str(e)}, status=500)
        else:
            print("❌ Erreurs de validation:", serializer.errors)
            return Response(serializer.errors, status=400)

# ============================================================
# 17. COURS SIMILAIRES
# ============================================================
class CourseSimilarView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk)
        similar = Course.objects.filter(game=course.game).exclude(pk=course.pk)[:4]
        serializer = CourseSerializer(similar, many=True)
        return Response(serializer.data)