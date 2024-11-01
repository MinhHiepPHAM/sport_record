from rest_framework import generics, permissions
from rest_framework import status
from . import serializers, models
import re
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
import datetime
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q
from .pagination import SessionPagination
from .permission import IsBelongToUser


class RegistrationView(generics.CreateAPIView):
    serializer_class = serializers.RegisterSerializer
    permission_classes = [permissions.AllowAny]
    def _is_valid_email(self, email):
        regex = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
        return re.match(regex, email)
    
    def post(self, request):
        username = request.data.get("username")
        if models.CustomUser.objects.filter(username=username):
            return Response({'error': 'Username is already used'}, status=status.HTTP_400_BAD_REQUEST)
        email = request.data.get("email")
        if not self._is_valid_email(email):
            return Response({'error': 'Email is invalid'}, status=status.HTTP_400_BAD_REQUEST)

        password1 = request.data.get("password1")
        password2 = request.data.get("password2")
        if password1 != password2:
             return Response({'error': 'Passwords are not identical'}, status=status.HTTP_400_BAD_REQUEST)
        if models.CustomUser.objects.filter(email=request.data['email']).exists():
            return Response({'error': 'Email is already registered'}, status=status.HTTP_400_BAD_REQUEST)

        user = models.CustomUser.objects.create_user(
            username = username,
            password = password1,
            email = email,
        )
        user.save()

        return Response({'username':username}, status=status.HTTP_201_CREATED)   
    
class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        username, password = request.data['username'], request.data['password']
        user = authenticate(username=username, password=password)
        if user:
            token,_ = Token.objects.get_or_create(user=user)
            uid = models.CustomUser.objects.get(username=username).pk
            return Response({'token': token.key, 'uid':uid}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid user or password'}, status=status.HTTP_401_UNAUTHORIZED)
        
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            token = Token.objects.get(pk=request.data['token'])
            token.delete()
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except KeyError:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

class CreateNewBudget(APIView):
    permission_classes = [IsBelongToUser]

    def post(self, request, *args, **kwargs):
        participantInfos = request.data.get('userInfos')
        title = request.data.get('title')
        user = request.user
        isTitleInUsed = user.budgets.exists() and user.budgets.filter(title=title).exists()
        
        if isTitleInUsed:
            return Response(status=status.HTTP_409_CONFLICT)

        if not participantInfos: return Response(status=status.HTTP_200_OK)
        budget = models.Budget.objects.create(
            title = title,
            start = datetime.date.today(),
            owner = user,
            last_updated = datetime.date.today(),
            start_base = datetime.date.today()
        )
        
        budget.save()

        participants = []
        for info in participantInfos:
            new_participant = models.Participant.objects.create(
                username = info['username'],
                email = info['email'],
                payed = 0,
                in_budget = budget,
            )
            new_participant.save()
            participants.append(new_participant)
        
        return Response(status=status.HTTP_201_CREATED)
    
class AllBudgets(ModelViewSet):
    permission_classes = [IsBelongToUser]
    serializer_class = serializers.BudgetSerializer

    def retrieve(self, request, *args, **kwargs):
        budgets = request.user.budgets
        response = [
            {
                'amount': budget.get_budget_amount(),
                'participants': budget.get_participant_names(),
                'budget': self.serializer_class(budget).data
            }
            for budget in budgets.all()
        ]

        return Response(response, status=status.HTTP_200_OK)
    
class BudgetInfoView(ModelViewSet):
    permission_classes = [IsBelongToUser]
    serializer_class = serializers.BudgetSerializer
    pagination_class = SessionPagination

    def retrieve(self, request, *args, **kwargs):
        title = kwargs['title']
        budget = request.user.budgets.get(title=title)

        # request.query_params is QueryDict. Need to convert to dict to get all selected names
        selected_names = dict(request.query_params.lists()).get('name', [])
        start = request.query_params.get('start', None)
        end = request.query_params.get('end', None)

        start_date = datetime.datetime.strptime(start, "%a %b %d %Y").date() if start else None
        end_date = datetime.datetime.strptime(end, "%a %b %d %Y").date() if end else None

        sessions = budget.sessions.order_by('-date')
        # print(id, sessions[0].id, sessions[0].__dict__)
        
        if start_date: sessions = sessions.filter(date__gte=start_date)
        if end_date: sessions = sessions.filter(date__lte=end_date)

        updated_sessions = []
        for session in sessions:
            participant_names = set((participant.username for participant in session.participants.all()))
            exist = False
            for name in selected_names:
                if name in participant_names:
                    exist = True
                    break
            # add all session if selected names is empty
            if not exist and selected_names: continue
            updated_sessions.append({
                'date': session.date,
                'participants':[participant.username for participant in session.participants.all()],
                'cost': session.get_session_cost(),
                'id': session.id
            })
    
        updated_sessions = self.paginate_queryset(updated_sessions)

        response = {
            'amount': budget.get_budget_amount(),
            'participants': budget.get_participant_names(),
            'budget': self.serializer_class(budget).data,
            'sessions': self.get_paginated_response(updated_sessions),
            'categories': [category.name for category in budget.categories.all()],
        }

        return Response(response, status=status.HTTP_200_OK)

class AddNewMemberView(APIView):
    permission_classes = [IsBelongToUser]

    def post(self, request, *args, **kwargs):
        title = kwargs['title']
        budget = request.user.budgets.get(title=title)
        new_member = request.data.get('newMember','N/A')
        new_email = request.data.get('newEmail','N/A')
        if not new_email: new_email = 'N/A'

        budget.participants.add(
            models.Participant.objects.create(
                username = new_member,
                email = new_email,
                payed = 0,
                in_budget = budget
            )
        )
        budget.last_updated = datetime.date.today()
        budget.save()

        return Response(status=status.HTTP_201_CREATED)

class AddNewSessionView(APIView):
    permission_classes = [IsBelongToUser]

    def post(self, request, *args, **kwargs):
        title = kwargs['title']
        budget = request.user.budgets.get(title=title)
        date = request.data['date']
        outcomes = request.data['outcomes']
        newCategories = request.data['newCategories']
        members = request.data['participants']
        date = datetime.datetime.strptime(date, "%a %b %d %Y").date()

        participants = [
            budget.participants.get(username=participant)
            for participant in members
        ]

        for category in newCategories:
            models.Category.objects.create(name=category, in_budget=budget)

        new_outcomes = [
            models.Outcome.objects.create(
                cost=outcome['cost'],
                category=models.Category.objects.get(name=outcome['category'])
            )
            for outcome in outcomes
        ]

        session = models.Session.objects.create(
            date = date,
            in_budget = budget,
        )
        for outcome in new_outcomes:
            session.outcomes.add(outcome)
        
        for participant in participants:
            session.participants.add(participant)
        
        session.save()

        budget.last_updated = datetime.date.today()

        budget.save()

        
        return Response(status=status.HTTP_201_CREATED)
    
class DeleteSessionView(APIView):
    permission_classes = [IsBelongToUser]
    def delete(self, request, *args, **kwargs):
        ids = dict(request.query_params).get('id', [])
        for id in ids:
            models.Session.objects.get(pk=id).delete()

        return Response(status=status.HTTP_200_OK)
    
class GetBalanceView(APIView):
    permission_classes = [IsBelongToUser]
    
    def get(self, request, *args, **kwargs):
        title = kwargs['title']
        budget = models.Budget.objects.get(title=title)
        participant_names = [ participant.username for participant in budget.participants.all() ]
        cost_by_name = dict(zip(sorted(participant_names), [0]*len(participant_names)))

        start = request.query_params.get('start', None)
        if start: start = datetime.datetime.strptime(start, "%a %b %d %Y").date()
        
        end = request.query_params.get('end', None)
        if end: end = datetime.datetime.strptime(end, "%a %b %d %Y").date()

        sessions = budget.sessions.order_by('-date')

        if start: sessions = sessions.filter(date__gte=start)
        if end: sessions = sessions.filter(date__lte=end)

        first_session = sessions[len(sessions)-1].date if sessions else budget.start
        last_session = sessions[0].date if sessions else budget.start
        
        for session in sessions:
            session_cost = session.get_session_cost()
            nParticipant = len(session.participants.all())
            cost = session_cost/nParticipant
            for participant in session.participants.all():
                cost_by_name[participant.username] += cost

        balances = [ {'name': name, 'cost': cost} for name, cost in cost_by_name.items() ]

        
        milestones = serializers.BalanceSerializer(budget.milestones.order_by('-date'), many=True).data
        
        selected_participants = dict(request.query_params.lists()).get('name', [])

        filter_balances = [ {'name': name, 'cost': cost_by_name[name]} for name in sorted(selected_participants)]

        response = {
            'balances': filter_balances if selected_participants else balances,
            'milestones': milestones,
            'participants': participant_names,
            'first': first_session,
            'last': last_session
        }

        return Response(response, status=status.HTTP_200_OK)

class SaveBalanceMilestone(APIView):
    permission_classes = [IsBelongToUser]
    
    def post(self, request, *args, **kwargs):
        title = kwargs['title']
        budget = models.Budget.objects.get(title=title)
        start = request.data['start']
        end = request.data['end']
        sessions = budget.sessions.order_by('date')
        if end:
            end = datetime.datetime.strptime(end, "%a %b %d %Y").date()
        else:
            end = sessions[len(sessions)-1].date
        
        if start:
            start = datetime.datetime.strptime(start, "%a %b %d %Y").date()
        else:
            start = sessions[0].date

        models.BalanceMilestone.objects.create(
            date = datetime.date.today(),
            start = start,
            terminate = end,
            in_budget = budget, 
        )

        return Response(status=status.HTTP_201_CREATED)

        












 
