from django.urls import path
from .views import signup, login, logout, UserRetrieveUpdateDestroyView, CheckTokenValidation

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('user/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
    path('validate-token/', CheckTokenValidation.as_view(), name='token-validation')
]