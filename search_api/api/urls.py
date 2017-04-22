from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^search', views.NewsSearchView.as_view(), name='es_search'),
    url(r'^index', views.index, name='index'),
]
