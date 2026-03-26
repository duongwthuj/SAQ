from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, LogoutSerializer, RegisterSerializer, StaffSerializer

Staff = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = Staff.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff = serializer.save()
        tokens = RefreshToken.for_user(staff)
        return Response(
            {
                "staff": StaffSerializer(staff).data,
                "tokens": {
                    "access": str(tokens.access_token),
                    "refresh": str(tokens),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if staff is None:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        tokens = RefreshToken.for_user(staff)
        return Response(
            {
                "staff": StaffSerializer(staff).data,
                "tokens": {"access": str(tokens.access_token), "refresh": str(tokens)},
            }
        )


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
        except TokenError:
            return Response(
                {"detail": "Token is invalid or already blacklisted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"detail": "Successfully logged out."})


class MeView(generics.RetrieveAPIView):
    serializer_class = StaffSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class InternalValidateStaffView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, pk):
        if request.headers.get("X-Internal-Token", "") != settings.INTERNAL_API_KEY:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        try:
            staff = Staff.objects.get(pk=pk, is_active=True)
        except Staff.DoesNotExist:
            return Response({"detail": "Staff not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(StaffSerializer(staff).data)
