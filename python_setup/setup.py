'''
File: setup.py
Author: Chuncheng Zhang
Purpose:
    Import necessary modules and setup constants
'''


# %%
# The local modules
from .required_modules import *
from .file_walker import FileWalker
from .logger import generate_logger, default_logging_kwargs

# %%
# Setup the PROJECT_NAME
PROJECT_NAME = 'CH-PROJECT-CHECKOUT'

# Setup the ROOT_PATH
ROOT_PATH = Path(__file__).parent.parent

# %%

log_folder = ROOT_PATH.joinpath('log/{}.log'.format(PROJECT_NAME))
log_folder.parent.mkdir(exist_ok=True)

default_logging_kwargs['name'] = PROJECT_NAME
default_logging_kwargs['filepath'] = log_folder

LOGGER = generate_logger(**default_logging_kwargs)

# %%

# %%
