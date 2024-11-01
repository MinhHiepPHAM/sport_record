from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict
import math

class UserPagination(PageNumberPagination):
    page_size = 32
    max_page_size = 1000
    page_query_param = 'p'
    page_size_query_param = 'size'
    
    def get_paginated_response(self, data):
        if self.page.paginator.count <= self.page_size:
            num_page = 0
        else:
            num_page = math.ceil(self.page.paginator.count/self.page_size)
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('num_page', num_page),
            ('page_size', self.get_page_size(self.request)),
            ('data', data)
        ]))