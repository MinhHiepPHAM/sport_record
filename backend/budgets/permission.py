from rest_framework import permissions
from .models import CustomUser


# Only the user who creates the budget can view and modify it
class IsBelongToUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        has_perm = super().has_permission(request, view)
        user = request.user.username
        other = CustomUser.objects.get(pk=view.kwargs['pk']).username
        return has_perm and (user == other)