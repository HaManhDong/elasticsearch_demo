from django.shortcuts import render
from rest_framework.views import APIView
from . import models
from .utils import restrict_search

# Create your views here.
class NewsSearchView(APIView):
    def get(self, request):
        query = request.GET.get("q", "")
        match_phrase = request.GET.get("match_phrase", False)
        if match_phrase == 'True':
            match_phrase = True
        else:
            match_phrase = False
        es_query = models.search_news(query, ['summary', 'title', 'content'], match_phrase=match_phrase)
        return restrict_search(request, "news", es_query)