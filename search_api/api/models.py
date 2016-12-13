from django.conf import settings
from elasticsearch_dsl import Search, Q
from elasticsearch_dsl.query import MultiMatch, MatchPhrase
from .configs import ES

client = settings.ES_CLIENT

def search_news(query, fields, match_phrase=False):
    if match_phrase:
        q = MultiMatch(query=query, fields=fields, type="phrase")
    else:
        q = MultiMatch(query=query, fields=fields)
    return Search(using=client, index="news").highlight('title', 'content').query(q)