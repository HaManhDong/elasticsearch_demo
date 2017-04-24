# -*- coding: utf-8 -*-
"""
Created on 2016-07-18 10:17:00

@author: Cuong Tran <tranhuucuong91@gmail.com>

"""
import glob
import time

import elasticsearch
from elasticsearch_dsl import Search, DocType, Date, Text
from elasticsearch_dsl import Index, analyzer, token_filter
from elasticsearch_dsl.query import MultiMatch
from elasticsearch_dsl.connections import connections
from sqlalchemy import create_engine

count = 0
INDEX_NAME = 'news'
TYPE_NAME = 'news'


class IndexEngine(object):
    def __init__(self, elastic_urls=['127.0.0.1:9200'], sqlite_db=None):
        self.elastic_urls = elastic_urls
        self.es_client = elasticsearch.Elasticsearch(self.elastic_urls)
        self.engine = create_engine(sqlite_db)

    def select_from_news(self, limit=1000, offset=0):
        conn = self.engine.connect()
        if limit:
            result = conn.execute(""" SELECT * FROM news LIMIT {offset}, {limit}""".format(limit=limit, offset=offset))
        else:
            result = conn.execute("""SELECT * FROM news""")
        return result.fetchall()

    def count_all(self):
        conn = self.engine.connect()
        result = conn.execute("""SELECT count(*) FROM news""")
        return result.fetchone()

    def indexing_bulk_news(self, chunk_size=1000):
        global count
        bulk_data = []
        # logger.info('Indexing news data...')
        print('Indexing news data...')
        t_start = time.time()
        for i in range(0, self.count_all()[0] // 1000 + 2):
            count += 1000
            for new in self.select_from_news(limit=1000, offset=i * 1000):  # lay tung row trong db
                op_dict = {
                    "index": {
                        "_index": INDEX_NAME,
                        "_type": TYPE_NAME,
                        "_id": new[0]
                    }
                }
                data = dict()
                data['url'] = new['url']
                data['title'] = new['title']
                data['type'] = new['type']
                data['content'] = new['content']
                data['time'] = new['time']
                bulk_data.append(op_dict)
                bulk_data.append(data)

                if len(bulk_data) == chunk_size:
                    res = self.es_client.bulk(index=INDEX_NAME, body=bulk_data, refresh=True)
                    bulk_data = []
                    print('Indexing 1000')
        if len(bulk_data):
            count += len(bulk_data)
            res = self.es_client.bulk(index=INDEX_NAME, body=bulk_data, refresh=True)  # index o day

        t_end = time.time()
        # logger.info('Index bulk data in: {:.2f} seconds'.format(t_end - t_start))
        print('Index bulk data in: {:.2f} seconds'.format(t_end - t_start))

    def search_news(self, query, fields):
        q = MultiMatch(query=query, fields=fields)
        search = Search(using=self.es_client, index=INDEX_NAME).query(q)
        return search[1:10].execute().hits.hits


def setting_index():
    connections.create_connection(hosts=['localhost'])
    news = Index(INDEX_NAME)

    # define custom settings
    news.settings(
        number_of_shards=1,
        number_of_replicas=1
    )

    # can also be used as class decorator when defining the DocType
    @news.doc_type
    class News(DocType):
        title = Text(analyzer='custom_analyzer', fields={'std': Text()})
        content = Text(analyzer='custom_analyzer', fields={'std': Text()})
        type = Text()
        time = Date()
        url = Text()

    # register a doc_type with the index
    news.doc_type(News)
    # You can attach custom analyzers to the index

    english_stop = token_filter('english_stop', type='stop', stopwords='_english_')

    custom_analyzer = analyzer('custom_analyzer',
                               tokenizer="classic",
                               filter=["standard", "lowercase", "snowball", english_stop],
                               char_filter=["html_strip"]
                               )
    news.analyzer(custom_analyzer)

    # delete the index, ignore if it doesn't exist
    news.delete(ignore=404)

    # create the index in elasticsearch
    news.create()


if __name__ == '__main__':
    t_start = time.time()
    setting_index()
    list_data = glob.glob('db/*.sqlite')
    for db in list_data:
        ie = IndexEngine(sqlite_db='sqlite:///{}'.format(db))
        ie.indexing_bulk_news()
    print(count)
    t_end = time.time()
    print('Finished in {:.2f} seconds'.format(t_end - t_start))
