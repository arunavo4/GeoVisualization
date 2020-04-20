"""
    Demo df_app prep basically take the stuff from app and add stuff from the actual df_app that was given to us.

"""
import math
import pandas as pd

import random as rand
from shapely.geometry import Point, shape
import json
from glob import glob
from randomtimestamp import randomtimestamp

df_app_path = './static/data'
n_samples = 5000

files = glob('./static/df_app/Pictures/*.*')
files = [path.split('\\')[-1] for path in files]

""" Random Location Generator within a polygon """


def generate_random_points(number, polygon):
    list_of_points = []
    minx, miny, maxx, maxy = polygon.bounds
    counter = 0
    while counter < number:
        pnt = Point(rand.uniform(minx, maxx), rand.uniform(miny, maxy))
        if polygon.contains(pnt):
            list_of_points.append(pnt)
            counter += 1
    return list_of_points


def generate_random_point(polygon):
    minx, miny, maxx, maxy = polygon.bounds
    return Point(round(rand.uniform(minx, maxx), 6), round(rand.uniform(miny, maxy), 6))


def get_random_location(geojson):
    record = rand.choice(geojson['features'])
    polygon = shape(record['geometry'])
    return record['properties']['NAME_1'], record['properties']['NAME_2'], generate_random_point(polygon)


def random_date_time():
    timestamp = randomtimestamp(start_year=2015, text=True)
    date, time = timestamp.split()
    return [date, time]


with open(df_app_path + '/geojson/district/india_district.geojson') as df_app_file:
    district_json = json.load(df_app_file)

with open(df_app_path + '/geojson/state/india_telengana.geojson') as df_app_file:
    state_json = json.load(df_app_file)

with open(df_app_path + '/geojson/taluk/india_taluk.geojson') as df_app_file:
    taluk_json = json.load(df_app_file)


def main():
    df_them = pd.read_excel('their_data.xlsx')
    df_app = pd.read_csv('Records.csv')

    df_app = df_app.iloc[0:0]

    df_app['UniqueSurveyID'] = df_them['Regn. No.']
    df_app['Serial_no'] = df_them['Sl.No']
    df_app['Locality'] = df_them['Locality']
    df_app['Collector'] = df_them['Collected By']
    df_app['ImageAnimal'] = [str(x) + '.jpg' if str(x) != 'nan' else '' for x in df_them['Image File Name']]
    df_app['Phylum'] = df_them['Phylum ']
    df_app['Class'] = df_them['Class']
    df_app['Order'] = df_them['Order']
    df_app['Family'] = df_them['Family']
    df_app['Genus'] = df_them['Genus']
    df_app['Species'] = df_them['Species']

    df_app['NoOfExamples'] = df_them['No. of exs.']

    # data generated per record

    df_app['Entomofauna'] = [rand.choice(['Yes', 'No']) for i in range(len(df_app))]

    df_app['OtherInvertebrate'] = [rand.choice(['Yes', 'No']) for i in range(len(df_app))]
    df_app['Vertebrate'] = [rand.choice(['Yes', 'No']) for i in range(len(df_app))]
    df_app['Temperature'] = [rand.randint(5, 50) for i in range(len(df_app))]
    df_app['Humidity'] = [rand.randint(45, 75) for i in range(len(df_app))]

    df_app['Habitat'] = [rand.choice(['Aquatic_Marine',
                                      'Aquatic_Freshwater',
                                      'Aquatic_Estuarine',
                                      'Terrestrial_Forest_PA',
                                      'Terrestrial_Forest_Outside_PA',
                                      'Terrestrial_Grassland',
                                      'Terrestrial_Shurb',
                                      'Terrestrial_Agriculture',
                                      'Terrestrial_Horticulture',
                                      'Terrestrial_Human_Habitation']) for i in range(len(df_app))]

    date_time = [random_date_time() for i in range(len(df_app))]
    df_app['Date'] = [d_t[0] for d_t in date_time]
    df_app['Time'] = [d_t[1] for d_t in date_time]
    data_loc = [get_random_location(district_json) for i in range(len(df_app))]
    latlag = [data[2] for data in data_loc]
    df_app['Latitude'] = [sh.y for sh in latlag]
    df_app['Longitude'] = [sh.x for sh in latlag]
    df_app['State'] = [data[0] for data in data_loc]
    df_app['District'] = [data[1] for data in data_loc]

    df_app.to_csv('./static/data/Documents/Records.csv')


if __name__ == '__main__':
    main()
