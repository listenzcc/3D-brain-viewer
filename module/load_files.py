"""
File: load_files.py
Author: Chuncheng Zhang
Date: 2023-04-04
Functions:
    1. Imports
    2. Load files of interest
    3. Pending
    4. Pending
    5. Pending
"""


# %% ---- 2023-04-04 ----
# Imports
from python_setup.setup import *


# %% ---- 2023-04-04 ----
# Load files of interest

# Specific allowed extents
extents = ['.html', '.nii.gz', '.mgz']

# Find the files
walker = FileWalker(ROOT_PATH.joinpath('private'))
files = walker.walk_through(extents=extents)
LOGGER.debug('Found {} files in {} seconds'.format(
    len(files), walker.time_costing))

# Build the data frame
files = pd.DataFrame(files, columns=['pathlib'])
files['filename'] = files['pathlib'].map(lambda e: e.name.strip())


def _extent(p):
    for ext in extents:
        if p.name.endswith(ext):
            return ext
    return


def _parent(p):
    return p.relative_to(walker.root).parent.as_posix()


files['extent'] = files['pathlib'].map(_extent)
files['parent'] = files['pathlib'].map(_parent)

files = files[['extent', 'filename', 'parent', 'pathlib']]

# Count for each extent
for collect in files.groupby(by='extent'):
    name, df = collect
    LOGGER.debug('Found {:6d} files for extent {}'.format(len(df), name))


# %% ---- 2023-04-04 ----
# Pending


# %% ---- 2023-04-04 ----
# Pending


# %% ---- 2023-04-04 ----
# Pending
