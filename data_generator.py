import pandas as pd
import random as rand
from shapely.geometry import Point, shape
import json
from glob import glob
from randomtimestamp import randomtimestamp

data_path = './static/data'
n_samples = 5000

files = glob('./static/data/Pictures/*.*')
files = [path.split('\\')[-1] for path in files]

# Random bunch of data
phylum = ['Petalonamae ', ' Lophotrochozoa ', ' Deuterostome ', ' Chordate ', ' Echinoderm ',
          ' Annelid ', ' Cnidaria ', ' Flatworm ', ' Arthropod ', ]

class_fauna = ['Anthozoa', 'Gastropoda','Bivalvia','Ascidiacea','Aves','Insecta','Mammalia','Reptilia',
               'Malacostraca','Scyphozoa','Holothuroidea','Cephalopoda','Amphibia','Hydrozoa','Demospongiae',
               'Arachnida','Anthozoa','Turbellaria','Copepoda','Pisces','Tubellaria','Asteroidea','Actinopterygii']

order = ['Zoantharia','Archaeogastropoda','Mesogastropoda','Neogastropoda','Veneroida','Actiniaria',
         'Scleractinia','Pleurogona','Enterogona','Suliformes','Lepidoptera','Hymenoptera','Diptera',
         'Odonata','Passeriformes','Anseriformes','Gruiformes','Rodentia','Squamata','Decapoda',
         'Semaeostomeae','Rhizostomeae','Anthoathecata','Nudibranchia','Cephalaspedia','Aspidochirotida',
         'Cephalaspidea','Spirulida','Ciconiiformes','Anura','Anthoathecat','Littorinimorpha',
         'Systellommatophora','Apodida','Caenogastropoda','Octopoda','Columbiformes','Poeciloscerida',
         'Cycloneritimorpha','Arcoida','Limoida','Pterioda','Sacoglossa','Hemiptera','Coraciformes',
         'Anomura','Neoloricata']

family = ['Sphenopidae','Patellidae','Strombidae','Buccinidae','Psammobiidae','Actiniidae','Merulinidae',
          'Styelidae','Didemnidae','Fregatidae','Nymphalidae','Apidae','Culicidae','Libellulidae',
          'Muscicapinae','Anatidae','Rallidae','Sciuridae','Gekkonidae','Coenobitidae','Ulmaridae',
          'Mastigiidae','Porpitidae','Discodorididae','Haminoieidae','Holothuriidae','Bullidae',
          'Spirulidae','Ardeidae','Dicroglossidae','Milleporidae','Cypraeidae','Onchidiidae',
          'Synaptidae','Neritiidae','Octopodidae','Columbidae','Crellidae','Neritidae','Haliotidae',
          'Arcidae','Limidae','Pteriidae','Plakobranchidae','Alydidae','Meropidae','Porcellanidae',
          'Chitinonidae','Nephilidae','Plexauridae','Ellobidae','Pinnidae','Solenidae','Pseudocerotidae',
          'Tortanidae','Architectonicidae','Ellobidae','Aplustridae','Bullidae','Mullidae','Didemnidae',
          'Ascidiidae','Styelidae','Petrosiidae','Dictyonellidae','Thorectidae','Prosthiostomidae',
          'Buthidae','Charadriidae','Apodidae','Pteropodidae','Charadriidae','Littorinidae','Tetillidae']

genus = ['Palythoa','Patelloida','Strombus','Babylonia','Asaphis','Anthopleura','Hydnophora','Polycarpa',
         'Didemnum','Fregata','Parantica','Apis','Culex','Tholymis','Muscicapa','Dendrocygna','Gallinula',
         'Funambulus','Phelsuma','Coenobita','Aurelia','Mastigias','Porpita','Asteronotus','Haminoea',
         'Holothuria','Bulla','Spirula','Ixobrychus','Hoplobatrachus','Millepora','Erronea','Peronia',
         'Polyplectana','Nerita','Octopus','Acridotheres','Crella','Nerita','Haliotis','Barbatia','Lima',
         'Pinctada','Plakobranchus','liptocorisa','Merops','Lissoporcellana','Acanthopleura','Nephila',
         'Echinomuricea','Cassidula','Atrina','Solen','Pseudobiceros','Tortanus','Architectonica',
         'Pythia','Micromelo','Bulla','Parupeneus','Didemnum','Phallusia','Polycarpa','Xestospongia',
         'Stylissa','Carteriospongia','Prosthiostomum']


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

        data['UniqueSurveyID'] = rand.randint(1, 100000)
        date_time = random_date_time()
        data['Date'] = date_time[0]
        data['Time'] = date_time[1]
        state, district, latlag = get_random_location(district_json)
        data['Latitude'] = latlag.y
        data['Longitude'] = latlag.x
        data['State'] = state
        data['District'] = district
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

        data['ImageAnimal'] = rand.choice(files)
        data['ImageHabitat'] = rand.choice(files)
        data['ImageHost'] = rand.choice(files)

        data['Phylum'] = rand.choice(phylum)
        data['Class'] = rand.choice(class_fauna)
        data['Order'] = rand.choice(order)
        data['Family'] = rand.choice(family)
        data['Genus'] = rand.choice(genus)

        list_of_records.append(data)

    df = pd.DataFrame(list_of_records)
    df.to_csv('./static/data/Documents/Records.csv')


if __name__ == '__main__':
    main()
