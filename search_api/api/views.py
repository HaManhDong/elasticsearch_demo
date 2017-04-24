from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.views import APIView
from . import models
from .utils import restrict_search

# Create your views here.
class NewsSearchView(APIView):
    def get(self, request):
        print request
        fields = [['summary', 'title', 'content'],'title','content']
        # fields = [['title', 'content'],'title','content']
        query = request.GET.get("q", "")
        fieldID = request.GET.get("fieldID", 0)
        fieldID = int(fieldID)
        time_filter = request.GET.get('timeFilter', "")
        match_phrase = request.GET.get("match_phrase", False)
        if match_phrase == 'True':
            match_phrase = True
        else:
            match_phrase = False
        # es_query = models.search_news(query, ['title'], match_phrase=match_phrase)
        es_query = models.search_news(query, fields[fieldID], match_phrase=match_phrase, time_filter = time_filter)
        return restrict_search(request, "news", es_query)

def index(request):
    return render(request, 'api/index.html')