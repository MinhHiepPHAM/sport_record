from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
from django.utils.translation import gettext_lazy as _
from datetime import datetime
from django.utils import timezone
    

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField("email address", unique=True)
    username = models.CharField(max_length=30,unique=True)

    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    telephone = models.CharField(max_length=20, blank=True)
    street = models.CharField(max_length=250, blank=True)
    street_number = models.CharField(max_length=10, blank=True)
    city = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.CharField(max_length=250, blank=True)
    job_title = models.CharField(max_length=250, default='')
    
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ['email'] 
    objects = UserManager()

    def __repr__(self) -> str:
        return f'{self.email}, {self.username}'
    
class GroupUser(models.Model):
    name = models.CharField(max_length=250)
    members = models.ManyToManyField(CustomUser, related_name='member_of_groups')
    admins = models.ManyToManyField(CustomUser, related_name='admin_of_groups')
    
class Activity(models.Model):
    class ActType(models.TextChoices):
        RUNNING = 'RUN', _('Running')
        SWIMMING = 'SWIM', _('Swimming')
        BICYCLE = 'BIKE', _('Bicycle')
    
    type = models.CharField(max_length=4, choices=ActType.choices)
    title = models.CharField(max_length=250)
    users = models.ManyToManyField(CustomUser, related_name='activities')
    createdby = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    distance = models.IntegerField(default=0)
    created_time = models.DateTimeField()
    start = models.DateTimeField()
    terminate = models.DateTimeField()
    description = models.CharField(max_length=255)
    updated = models.DateTimeField()

class Action(models.Model):
    date = models.DateTimeField()
    distance = models.IntegerField(default=0)
    in_activity = models.ForeignKey(Activity, related_name='actions', on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
class Award(models.Model):
    class Medal(models.TextChoices):
        GOLD = 'GOLD', _('Gole Medal')
        SILVER = 'SILVER', _('Silver Medal')
        COPPER = 'COPPER', _('Copper Medal')
        PARITCIPANT = 'PARTI', _('Participant Certificat')
    title = models.CharField(max_length=250)
    medal = models.CharField(max_length=6, choices=Medal.choices, default=Medal.PARITCIPANT)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    users = models.ManyToManyField(CustomUser, related_name='awards')
    


