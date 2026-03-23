from django.urls import path

from .views import ChatListView, ChatMessageView

urlpatterns = [
    path('',                      ChatListView.as_view()),
    path('<int:chat_id>/messages/', ChatMessageView.as_view()),
]
