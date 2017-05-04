from django.conf import settings
from elasticsearch_dsl import Search, Q
from elasticsearch_dsl.query import MultiMatch, MatchPhrase
from .configs import ES

client = settings.ES_CLIENT


def search_news(query, fields, match_phrase=False, time_filter=''):
    if match_phrase:
        q = MultiMatch(query=query, fields=fields, type="phrase")
    else:
        if fields == ['summary', 'title', 'content']:
            q = MultiMatch(query=query, fields=['title^3', 'title.std', 'content^2', 'content.std'], type="most_fields")
        elif fields == 'title':
            q = MultiMatch(query=query, fields=['title', 'title.std'], type="most_fields")
        else:
            q = MultiMatch(query=query, fields=['content', 'content.std'], type="most_fields")

    if time_filter:
        print '***********'
        print time_filter
        return Search(using=client, index="news") \
            .filter('range', time={'gte': time_filter}) \
            .highlight('title', 'content').query(q)

    return Search(using=client, index="news").highlight('title', 'content').query(q)
