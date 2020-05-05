""" Final Version 3 """

import pandas as pd
from shapely.geometry import Point, shape
import os
from flask import Flask, send_from_directory
from flask import render_template
import json

data_path = './static/data'
placeholder = './static/images/placeholder_square.png'


def check_file(x):
    if os.path.exists(x):
        return x
    else:
        return placeholder


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

app = Flask(__name__)


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/data")
def get_data():
    df = pd.read_csv(data_path + '/Documents/Records.csv')
    prefix = f'{data_path}/Pictures/'

    # Add image dir to pictures
    df.loc[df['ImageAnimal'].notna(), 'ImageAnimal'] = prefix + df.loc[df['ImageAnimal'].notna(), 'ImageAnimal']
    df.loc[df['ImageHabitat'].notna(), 'ImageHabitat'] = prefix + df.loc[df['ImageHabitat'].notna(), 'ImageHabitat']
    df.loc[df['ImageHost'].notna(), 'ImageHost'] = prefix + df.loc[df['ImageHost'].notna(), 'ImageHost']

    # Group the Temp and Humidity
    df['Temperature'] = df['Temperature'].apply(find_range)
    df['Humidity'] = df['Humidity'].apply(find_range)

    df['ImageAnimal'] = df['ImageAnimal'].fillna(placeholder).astype(str).apply(check_file)
    df['ImageHabitat'] = df['ImageHabitat'].fillna(placeholder).astype(str).apply(check_file)
    df['ImageHost'] = df['ImageHost'].fillna(placeholder).astype(str).apply(check_file)

    return df.to_json(orient='records')


if __name__ == "__main__":
    app.run(debug=True)
