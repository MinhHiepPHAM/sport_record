from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict
import math

class SessionPagination(PageNumberPagination):
    page_size = 5
    max_page_size = 1000
    page_query_param = 'page'
    
    def get_paginated_response(self, data):
        if self.page.paginator.count <= self.page_size:
            num_page = 0
        else:
            num_page = math.ceil(self.page.paginator.count/self.page_size)
        return OrderedDict([
            ('count', self.page.paginator.count),
            ('num_page', num_page),
            ('page_size', self.get_page_size(self.request)),
            ('data', data)
        ])