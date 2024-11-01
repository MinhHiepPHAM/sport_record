from django.urls import path,re_path
from rest_framework import routers
from . import views


urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('signup/', views.RegistrationView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('users/<int:pk>/editprofile/', views.ProfileEditingView.as_view(), name='profile_editing'),
    path('users/<int:pk>/', views.UserProfileView.as_view({'get':'retrieve'}), name='user_profile'),
    path('users/<int:pk>/activities/summary/', views.UserActivitySummaryView.as_view({'get':'retrieve'}), name='user_activities'),
    path('users/<int:pk>/activities/all/', views.UserActivityAllView.as_view({'get':'retrieve'}), name='user_activities_all'),
    path('users/<int:pk>/activities/running/', views.RunActivityView.as_view({'get':'retrieve'}), name='user_activities_running'),
    path('users/<int:pk>/activities/swimming/', views.SwimActivityView.as_view({'get':'retrieve'}), name='user_activities_swimming'),
    path('users/<int:pk>/activities/bicycle/', views.BikeActivityView.as_view({'get':'retrieve'}), name='user_activities_bicycle'),
    path('users/<int:pk>/activities/recent/', views.RecentActivitiesView.as_view({'get':'retrieve'}), name='user_activities_recent'),
    path('users/<int:pk>/activities/create/', views.CreateActivityView.as_view(), name='create_activities'),
    path('activities/<int:pk>/detail/', views.ActivityView.as_view({'get':'retrieve'}), name='activity_detail'),
    path('activities/<int:pk>/detail/usersaction/', views.AllUserActionInOneActivity.as_view(), name='user_action_in_activity'),
    path('activities/<int:pk>/create/', views.CreateNewActionView.as_view(), name='create_action'),
    path('activities/<int:pk>/adduser/', views.AddUserToActvity.as_view(), name='add_user'),
    path('users/', views.AllUserView.as_view({'get':'retrieve'}), name='all_users'),
    
]
 