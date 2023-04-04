"""
File: app.py
Author: Chuncheng Zhang
Date: 2023-04-04
Functions:
    1. Imports
    2. Load resources
    3. Routes
    4. Startup flask application
    5. Pending
"""


# %% ---- 2023-04-04 ------------------------
# Imports
import flask

from python_setup.setup import *
from module.load_files import files
from module.mri_img import MRIImg



# %% ---- 2023-04-04 ------------------------
# Load resources
app = flask.Flask(PROJECT_NAME)

# %%

# Read two images

mgz = files.query('&'.join([
    'filename == "brain.mgz"',
    'parent == "template/fsaverage/mri"'
]))

nii = files.query('&'.join([
    'extent == ".nii.gz"',
    'filename == "zstat1.nii.gz"'
]))

# Align the stat image with the structure image
img1 = MRIImg(mgz.iloc[0]['pathlib'])
img2 = MRIImg(nii.iloc[0]['pathlib'])
img1.fill_from(img2)


# %% ---- 2023-04-04 ------------------------
# Routes static files
web_folder = Path('./web')

@app.route('/')
def index():
    return open(web_folder.joinpath('index.html')).read()

@app.route('/src/<src_path>')
def src_folder(src_path):
    return open(web_folder.joinpath(f'src/{src_path}')).read()

# %% ---- 2023-04-04 ------------------------
# Routes runtime data

def df2list(df):
    return [df.iloc[i].to_dict() for i in range(len(df))]

@app.route('/fetch/files.json')
def fetch_files():
    df = files.copy()
    for col in df.columns:
        df[col] = df[col].map(str)
    return df2list(df)

@app.route('/fetch/img_example.json')
def fetch_img_example():
    args = flask.request.args
    for k in args:
        print(k, '=', args[k])
    query = args.get('query', 'x == 0')

    df = img1.df.query('value > 0').query(query)
    print(df)
    return df2list(df[['x', 'y', 'z', 'value', 'filled_value']])



# %% ---- 2023-04-04 ------------------------
# Startup flask application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7788)



# %% ---- 2023-04-04 ------------------------
# Pending
