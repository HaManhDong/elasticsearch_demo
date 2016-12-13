from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.NewsSearchView.as_view(), name='es_search'),
]
