import pandas as pd
import random as rand
from shapely.geometry import Point, shape
import json
from randomtimestamp import randomtimestamp


data_path = './static/data'
n_samples = 5000

picture = ["scan0014_small.jpg",
           "scan0017_small.jpg",
           "images.jpg",
           "hornbillthumb.jpg",
           "Cap0169_small.jpg",
           "leopardthumb.jpg",
           "baboon.jpg",
           "giraffe.jpg"
           ]

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
    return Point(round(rand.uniform(minx, maxx), 4), round(rand.uniform(miny, maxy), 4))

def get_random_location(geojson):
    record = rand.choice(geojson['features'])
    polygon = shape(record['geometry'])
    return record['properties']['NAME_1'], generate_random_point(polygon)


def random_date_time():
    timestamp = randomtimestamp(start_year=2015, text=True)
    date, time = timestamp.split()
    return [date, time]

with open(data_path + '/geojson/district/india_district.geojson') as data_file:
    district_json = json.load(data_file)

with open(data_path + '/geojson/state/india_telengana.geojson') as data_file:
    state_json = json.load(data_file)

with open(data_path + '/geojson/taluk/india_taluk.geojson') as data_file:
    taluk_json = json.load(data_file)


def main():

    list_of_records = []
    for x in range(n_samples):
        data = dict()

        data['UniqueSurveyID'] = rand.randint(1,100000)
        date_time = random_date_time()
        data['Date'] = date_time[0]
        data['Time'] = date_time[1]
        state, latlag = get_random_location(district_json)
        data['Latitude'] = latlag.y
        data['Longitude'] = latlag.x
        data['State'] = state
        data['Habitat'] = rand.choice(['Aquatic_Marine',
                                        'Aquatic_Freshwater',
                                        'Aquatic_Estuarine',
                                        'Terrestrial_Forest_PA',
                                        'Terrestrial_Forest_Outside_PA',
                                        'Terrestrial_Grassland',
                                        'Terrestrial_Shurb',
                                        'Terrestrial_Agriculture',
                                        'Terrestrial_Horticulture',
                                        'Terrestrial_Human_Habitation'])
        data['Entomofauna'] = rand.choice(['Yes', 'No'])
        data['OtherInvertebrate'] = rand.choice(['Yes', 'No'])
        data['Vertebrate'] = rand.choice(['Yes', 'No'])
        data['Temperature'] = rand.randint(5, 50)
        data['Humidity'] = rand.randint(45, 75)

        data['ImageAnimal'] = rand.choice(picture)
        data['ImageHabitat'] = None
        data['ImageHost'] = None

        list_of_records.append(data)

    df = pd.DataFrame(list_of_records)
    df.to_csv('./static/data/Documents/Records.csv')


if __name__ == '__main__':
    main()
