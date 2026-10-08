import logging
import traceback
from rest_framework import generics, permissions, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Conversation, Message, ModerationLog
from .serializers import ConversationSerializer, MessageSerializer
from tournaments.models import Notification

logger = logging.getLogger(__name__)
User = get_user_model()

# Import du modérateur avec fallback
try:
    from ai_assistant.moderation import moderator
    print("✅ Modérateur IA chargé avec succès")
except ImportError as e:
    print(f"⚠️ Modérateur IA non trouvé: {e}")
    class DummyModerator:
        def moderate_content(self, content):
            return False, 0.0, []
        def get_moderation_message(self, is_toxic, flagged_words):
            return "Message autorisé"
    moderator = DummyModerator()
    print("⚠️ Modérateur factice utilisé")


# ============================================
# CONVERSATIONS
# ============================================

class ConversationListView(generics.ListAPIView):
    """Liste des conversations de l'utilisateur connecté"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            return Conversation.objects.filter(
                participants=self.request.user
            ).order_by('-updated_at')
        except Exception as e:
            logger.error(f"ConversationListView error: {e}")
            return Conversation.objects.none()


class ConversationCreateView(generics.CreateAPIView):
    """Créer une nouvelle conversation"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            print("\n" + "="*60)
            print("🔍 [CREATE CONVERSATION]")
            print("="*60)
            print(f"👤 Utilisateur: {request.user.username} (ID: {request.user.id})")
            print(f"📩 Données reçues: {request.data}")

            participants_ids = request.data.get('participants_ids', [])
            if not participants_ids:
                return Response(
                    {"error": "participants_ids est requis."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Ajouter l'utilisateur courant
            if request.user.id not in participants_ids:
                participants_ids.append(request.user.id)
            print(f"👥 Participants finaux: {participants_ids}")

            # Récupérer les utilisateurs
            participants = User.objects.filter(id__in=participants_ids)
            if not participants.exists():
                return Response(
                    {"error": "Aucun utilisateur trouvé avec ces IDs."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Créer la conversation
            conversation = Conversation.objects.create(is_group=False)
            conversation.participants.set(participants)
            print(f"✅ Conversation créée avec ID: {conversation.id}")

            # Sérialiser la réponse
            serializer = ConversationSerializer(conversation, context={'request': request})
            print("="*60 + "\n")
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Erreur création conversation: {e}")
            traceback.print_exc()
            return Response(
                {"error": f"Erreur serveur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détails, mise à jour ou suppression d'une conversation"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

    def perform_destroy(self, instance):
        instance.participants.clear()
        instance.save()


# ============================================
# MESSAGES
# ============================================

class MessageListView(generics.ListCreateAPIView):
    """Liste des messages + envoi de nouveau message"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_pk')
        try:
            return Message.objects.filter(
                conversation_id=conversation_id,
                conversation__participants=self.request.user
            ).order_by('timestamp')
        except Exception as e:
            logger.error(f"Erreur get_queryset messages: {e}")
            return Message.objects.none()

    def create(self, request, *args, **kwargs):
        try:
            print("\n" + "="*60)
            print("📩 [CREATE MESSAGE]")
            print("="*60)
            print(f"👤 Utilisateur: {request.user.username} (ID: {request.user.id})")
            print(f"📩 Données reçues: {request.data}")

            conversation_id = self.kwargs.get('conversation_pk')
            print(f"📌 Conversation ID: {conversation_id}")

            # Vérifier que la conversation existe et que l'utilisateur est participant
            conversation = get_object_or_404(
                Conversation,
                id=conversation_id,
                participants=request.user
            )
            print(f"✅ Conversation trouvée: {conversation.id}")

            # Récupérer et valider le contenu
            content = request.data.get('content', '').strip()
            if not content:
                return Response(
                    {"content": "Le message ne peut pas être vide."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            print(f"📝 Contenu: {content[:50]}...")

            # Modération IA
            try:
                is_toxic, toxic_score, flagged_words = moderator.moderate_content(content)
                print(f"🤖 Modération: is_toxic={is_toxic}, score={toxic_score}")
            except Exception as e:
                print(f"⚠️ Erreur modération: {e}")
                is_toxic, toxic_score, flagged_words = False, 0.0, []

            # Création du message
            message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=content,
                is_toxic=is_toxic
            )
            print(f"✅ Message créé avec ID: {message.id}")

            # Journal de modération
            try:
                ModerationLog.objects.create(
                    message=message,
                    user=request.user,
                    content=content,
                    toxic_score=toxic_score,
                    flag_reason=', '.join(flagged_words) if flagged_words else None,
                    action_taken='blocked' if is_toxic else 'allowed'
                )
                print("✅ ModerationLog créé")
            except Exception as e:
                print(f"⚠️ Erreur ModerationLog: {e}")

            # Si toxique, modifier le contenu
            if is_toxic:
                message.content = (
                    f"⚠️ [Message modéré par l'IA] - "
                    f"{moderator.get_moderation_message(is_toxic, flagged_words)}"
                )
                message.save()
                print("🔄 Contenu modifié (toxique)")

            # Mettre à jour la date de la conversation
            conversation.updated_at = timezone.now()
            conversation.save()
            print("🔄 Date de conversation mise à jour")

            # Notifications pour les autres participants
            try:
                for participant in conversation.participants.exclude(id=request.user.id):
                    Notification.objects.create(
                        user=participant,
                        message=(
                            f"💬 Nouveau message de {request.user.username} "
                            f"dans {conversation.title or 'une conversation'}"
                        ),
                        icon='💬',
                        link=f"/inbox/{conversation_id}"
                    )
                print(f"✅ Notifications créées pour {conversation.participants.count()-1} participants")
            except Exception as e:
                print(f"⚠️ Erreur notifications: {e}")

            # Sérialiser la réponse
            serializer = self.get_serializer(message)
            print("✅ Message envoyé avec succès")
            print("="*60 + "\n")
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("❌" + "="*58)
            print("ERREUR DANS MESSAGELISTVIEW.CREATE")
            traceback.print_exc()
            print("="*60)
            logger.error(f"Erreur MessageListView.create: {e}")
            return Response(
                {"error": f"Erreur serveur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================
# ACTIONS SUR LES MESSAGES
# ============================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_message_read(request, pk):
    try:
        message = get_object_or_404(Message, id=pk)
        if request.user not in message.conversation.participants.all():
            return Response(
                {'error': 'Vous n\'êtes pas autorisé.'},
                status=status.HTTP_403_FORBIDDEN
            )
        message.is_read = True
        message.save()
        return Response({'status': 'marked_as_read'})
    except Exception as e:
        logger.error(f"mark_message_read error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================
# UTILITAIRES
# ============================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_messages(request):
    try:
        messages = Message.objects.filter(
            conversation__participants=request.user,
            is_read=False
        ).exclude(sender=request.user).order_by('-timestamp')[:20]

        data = [{
            'id': m.id,
            'sender_username': m.sender.username,
            'content': m.content[:100],
            'timestamp': m.timestamp,
            'conversation_id': m.conversation.id,
            'is_read': m.is_read,
        } for m in messages]
        return Response(data)
    except Exception as e:
        logger.error(f"unread_messages error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_messages_count(request):
    try:
        count = Message.objects.filter(
            conversation__participants=request.user,
            is_read=False
        ).exclude(sender=request.user).count()
        return Response({'unread_count': count})
    except Exception as e:
        logger.error(f"unread_messages_count error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_users(request):
    try:
        query = request.GET.get('q', '').strip()
        if len(query) < 2:
            return Response([])

        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).exclude(id=request.user.id)[:20]

        return Response([{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar': user.avatar.url if user.avatar else None
        } for user in users])
    except Exception as e:
        logger.error(f"search_users error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)