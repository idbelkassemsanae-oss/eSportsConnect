from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Resource, ResourceCategory, ResourceComment
from .serializers import (
    ResourceSerializer, ResourceDetailSerializer,
    ResourceCategorySerializer, ResourceCommentSerializer
)


# ============================================
# CATÉGORIES
# ============================================

class CategoryListView(generics.ListAPIView):
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ============================================
# RESSOURCES
# ============================================

class ResourceListView(generics.ListCreateAPIView):
    """Liste des ressources avec filtres et recherche"""
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Resource.objects.filter(is_published=True)
        
        # Filtres
        resource_type = self.request.query_params.get('type')
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(tags__icontains=search)
            )
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détails d'une ressource (sans incrémentation automatique des vues)"""
    queryset = Resource.objects.filter(is_published=True)
    serializer_class = ResourceDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # ✅ PLUS D'INCRÉMENTATION ICI — on utilise un endpoint POST séparé


class ResourceByTypeView(generics.ListAPIView):
    """Ressources filtrées par type"""
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        resource_type = self.kwargs.get('type')
        return Resource.objects.filter(resource_type=resource_type, is_published=True)


# ============================================
# COMMENTAIRES
# ============================================

class ResourceCommentListView(generics.ListCreateAPIView):
    """Liste des commentaires d'une ressource + ajout"""
    serializer_class = ResourceCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        resource_id = self.kwargs.get('resource_pk')
        return ResourceComment.objects.filter(resource_id=resource_id)

    def perform_create(self, serializer):
        resource_id = self.kwargs.get('resource_pk')
        resource = get_object_or_404(Resource, id=resource_id, is_published=True)
        serializer.save(user=self.request.user, resource=resource)


# ============================================
# LIKES
# ============================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def like_resource(request, pk):
    resource = get_object_or_404(Resource, pk=pk)
    resource.likes += 1
    resource.save(update_fields=['likes'])
    return Response({'likes': resource.likes})


# ============================================
# ✅ ENDPOINT POUR INCRÉMENTER LES VUES (POST)
# ============================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def increment_view(request, pk):
    resource = get_object_or_404(Resource, pk=pk)
    resource.views += 1
    resource.save(update_fields=['views'])
    return Response({'views': resource.views})