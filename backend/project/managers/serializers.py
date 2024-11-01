from .models import *
from rest_framework import serializers
import pprint

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = [
            'email', 'first_name', 'last_name', 'username', 'is_active', 'bio', 
            'telephone', 'street', 'street_number', 'city', 'country', 'avatar', 'job_title', 'id'
        ]

class ProfileEditingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'first_name', 'last_name', 'avatar', 'telephone', 'bio',
            'street', 'street_number', 'city', 'country', 'job_title'
        ]

    def handle_update_field(self, instance, validated_data, name):
        value = validated_data.get(name, None)
        if value:
            setattr(instance,name,value)

    def update(self, instance, validated_data):
        # pprint.pprint(validated_data)
        fields = [
            'first_name', 'last_name', 'avatar', 'telephone', 'bio',
            'street', 'street_number', 'city', 'country', 'job_title'
        ]
        for name in fields:
            self.handle_update_field(instance, validated_data, name)

        instance.save()
        return instance
    

class GroupSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True)
    admins = UserSerializer(many=True)
    
    class Meta:
        model = GroupUser
        fields = ['members', 'admins', 'name']

class ActivitySerializer(serializers.ModelSerializer):
    users = UserSerializer(many=True)
    createdby = UserSerializer()

    class Meta:
        model = Activity
        fields = ['type', 'title', 'users', 'start', 'terminate', 'description', 'createdby', 'distance','created_time', 'updated','id']

class ActionSerializer(serializers.ModelSerializer):
    in_activity = ActivitySerializer()
    user = UserSerializer()
    class Meta:
        model = Action
        fields = ['date', 'distance', 'in_activity', 'user']

class AwardSerializer(serializers.ModelSerializer):
    users = UserSerializer(many=True)
    activity = ActionSerializer()

    class Meta:
        model = Award
        fields = ['title', 'medal', 'activity', 'users']

class RegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)


    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password1', 'password2']
