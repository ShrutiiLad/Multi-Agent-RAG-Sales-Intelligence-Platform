import logging
from django.http import HttpResponse
from authE.models import EchoUser

#from authE.models import User
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from .serializers import UserSerializer
from rest_framework import generics
import dotenv
import os

dotenv.load_dotenv()

logging.basicConfig(level=logging.DEBUG)

def index(request):
    return HttpResponse("This is still work in progress. Please check back later!")


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # This line allows unauthenticated access
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    firstName = request.data.get('firstName') if request.data.get('firstName') else ''
    lastName = request.data.get('lastName') if request.data.get('lastName') else ''
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if EchoUser.objects.filter(email=email).exists():
        return Response({'error': 'Email is already registered'}, status=status.HTTP_400_BAD_REQUEST)
    
    if EchoUser.objects.filter(username=username).exists():
        return Response({'error': 'Username is already taken'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not email.endswith('@dataentrega.com'):
        return Response({'error': 'Email domain is not allowed'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = EchoUser.objects.create_user(username=username, password=password, email=email, first_name = firstName, last_name = lastName)
    userObj = UserSerializer(user)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'user': userObj.data}, status=status.HTTP_201_CREATED)

    


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        if not user.email.endswith('@dataentrega.com'):
            return Response({'error': 'Email domain is not allowed'}, status=status.HTTP_400_BAD_REQUEST)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})
    else:
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
def logout(request):
    request.auth.delete()
    return Response({"success": True},status=status.HTTP_200_OK)


class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EchoUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        user = self.request.user
        return EchoUser.objects.filter(id=user.id)


from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed
class CheckTokenValidation(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        # Existing logic to return success response
        return Response({"success": True}, status=status.HTTP_200_OK)

    def check_token_validity(self, token_key):
        """
        Checks if the provided token key is valid.
        Returns True if valid, False otherwise.
        """
        try:
            token = Token.objects.get(key=token_key)
            if not token.user.is_active:
                raise AuthenticationFailed("User inactive or deleted.")
            return True
        except Token.DoesNotExist:
            raise AuthenticationFailed("Invalid token.")
        except Exception as e:
            raise AuthenticationFailed(str(e))