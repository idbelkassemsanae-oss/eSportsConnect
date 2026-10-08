from django.urls import path
from .views import (
    CategoryListView,
    ResourceListView,
    ResourceDetailView,
    ResourceByTypeView,
    ResourceCommentListView,
    like_resource,
    increment_view,
)

urlpatterns = [
    path('resources/<int:pk>/view/', increment_view, name='increment-view'),
    # Catégories
    path('categories/', CategoryListView.as_view(), name='category-list'),

    # Ressources
    path('resources/', ResourceListView.as_view(), name='resource-list'),
    path('resources/<int:pk>/', ResourceDetailView.as_view(), name='resource-detail'),
    path('resources/type/<str:type>/', ResourceByTypeView.as_view(), name='resource-by-type'),

    # Commentaires
    path('resources/<int:resource_pk>/comments/', ResourceCommentListView.as_view(), name='resource-comments'),

    # Likes
    path('resources/<int:pk>/like/', like_resource, name='like-resource'),
]