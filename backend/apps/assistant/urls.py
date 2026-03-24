from django.urls import path

from .views import ConversationListView, ConversationMessageView

urlpatterns = [
    path('conversations/',                         ConversationListView.as_view()),
    path('conversations/<int:conversation_id>/',   ConversationMessageView.as_view()),
]