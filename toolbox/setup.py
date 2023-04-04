'''
File: setup.py
Author: Chuncheng Zhang
Purpose:
    Import necessary modules and setup constants
'''

# %%
# The common modules
import numpy as np
import pandas as pd
import plotly.express as px  # Used for interactive plotting
import plotly.graph_objects as go
import matplotlib.pyplot as plt  # Used for efficient plotting

from pathlib import Path
from tqdm.auto import tqdm

# %%
# The special modules
import nibabel
import imio.load
from vedo import Volume


# %%
# The local modules
from .digger import Digger
from .logger import generate_logger, default_logging_kwargs

# %%
PROJECT_NAME = 'CH-PROJECT-CHECKOUT'
ROOT_PATH = Path(__file__).parent.parent

# %%

log_folder = ROOT_PATH.joinpath('log/{}.log'.format(PROJECT_NAME))
log_folder.parent.mkdir(exist_ok=True)

default_logging_kwargs['name'] = PROJECT_NAME
default_logging_kwargs['filepath'] = log_folder

LOGGER = generate_logger(**default_logging_kwargs)

# %%

# %%
