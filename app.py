# -*- coding: utf-8 -*-

import pandas as pd
from shapely.geometry import Point, shape

from flask import Flask
from flask import render_template
import json


data_path = './static/data'


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


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/data")
def get_data():
    df = pd.read_csv(data_path + '/Documents/Records.csv')

    return df.to_json(orient='records')


if __name__ == "__main__":
    app.run(debug=True)