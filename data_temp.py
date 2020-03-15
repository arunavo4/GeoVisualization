import pandas as pd
from shapely.geometry import Point, shape
import os
import json

data_path = './static/data'


def find_range(x):
    r_x = round(x, -1)
    if x > r_x:
        return f'{r_x}-{r_x + 10}'
    else:
        return f'{r_x - 10}-{r_x}'


def get_location(longitude, latitude, provinces_json):
    point = Point(longitude, latitude)

    for record in provinces_json['features']:
        polygon = shape(record['geometry'])
        if polygon.contains(point):
            return record['properties']['name']
    return 'other'


with open(data_path + '/geojson/district/india_district.geojson') as data_file:
    district_json = json.load(data_file)

with open(data_path + '/geojson/state/india_telengana.geojson') as data_file:
    state_json = json.load(data_file)

with open(data_path + '/geojson/taluk/india_taluk.geojson') as data_file:
    taluk_json = json.load(data_file)


df = pd.read_csv(data_path + '/Documents/Records.csv')
prefix = f'{data_path}/Pictures/'

# Add image dir to pictures
df.loc[df['ImageAnimal'].notna(), 'ImageAnimal'] = prefix + df.loc[df['ImageAnimal'].notna(), 'ImageAnimal']
df.loc[df['ImageHabitat'].notna(), 'ImageHabitat'] = prefix + df.loc[df['ImageHabitat'].notna(), 'ImageHabitat']
df.loc[df['ImageHost'].notna(), 'ImageHost'] = prefix + df.loc[df['ImageHost'].notna(), 'ImageHost']

# Group the Temp and Humidity
df['Temperature'] = df['Temperature'].apply(find_range)
df['Humidity'] = df['Humidity'].apply(find_range)

out = df.to_json(orient='records')[1:-1].replace('},{', '} {')

with open('Records.json', 'w') as f:
    f.write(out)

