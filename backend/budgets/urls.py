from django.urls import path
from rest_framework import routers
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('signup/', views.RegistrationView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('users/<int:pk>/budgets/create/', views.CreateNewBudget.as_view(), name='create_new_budget'),
    path('users/<int:pk>/budgets/all/', views.AllBudgets.as_view({'get':'retrieve'}), name='all_budgets'),
    path('users/<int:pk>/budgets/<str:title>/detail/', views.BudgetInfoView.as_view({'get':'retrieve'}), name='budget_info'),
    path('users/<int:pk>/budgets/<str:title>/add/member/', views.AddNewMemberView.as_view(), name='add_new_member'),
    path('users/<int:pk>/budgets/<str:title>/add/session/', views.AddNewSessionView.as_view(), name='add_new_session'),
    path('users/<int:pk>/budgets/<str:title>/delete/session/', views.DeleteSessionView.as_view(), name='delete_session'),
    path('users/<int:pk>/budgets/<str:title>/balance/', views.GetBalanceView.as_view(), name='get_balance'),
    path('users/<int:pk>/budgets/<str:title>/balance/save/', views.SaveBalanceMilestone.as_view(), name='save_balance_milestone'),
]