"""
File: script-2.py
Author: Chuncheng Zhang
Date: 2023-04-04
Functions:
    1. Get files
    2. Read two images
    3. Align the stat image with the structure image
    4. Pending
    5. Pending
"""


# %% ---- 2023-04-04 ----
# Get files
from python_setup.setup import *
from module.load_files import files
from module.mri_img import MRIImg


# %% ---- 2023-04-04 ----
# Read two images

mgz = files.query('&'.join([
    'filename == "brain.mgz"',
    'parent == "template/fsaverage/mri"'
]))
mgz

# %%
nii = files.query('&'.join([
    'extent == ".nii.gz"',
    'filename == "zstat1.nii.gz"'
]))
nii


# %% ---- 2023-04-04 ----
# Align the stat image with the structure image
img1 = MRIImg(mgz.iloc[0]['pathlib'])
img2 = MRIImg(nii.iloc[0]['pathlib'])
img1.fill_from(img2)

# %%
slice = 100
slices = [100, 110, 90]

m1 = img1.filled_array_3d.copy()
m1[m1 < 3] = np.nan


def plot(ax, m0, m, s):
    ax.imshow(m0, cmap='gray')
    im = ax.imshow(m, cmap='hot', vmin=3, vmax=6)
    plt.colorbar(im)
    ax.set_title('Slice {}'.format(s))
    ax.axis('off')


fig, axes = plt.subplots(2, 2)

ax = axes[0, 0]
s = slices[0]
m0 = img1.array_3d[s].copy()
m = m1[s]
plot(ax, m0, m, s)

ax = axes[1, 0]
s = slices[1]
m0 = img1.array_3d[:, s].copy()
m = m1[:, s]
plot(ax, m0, m, s)

ax = axes[0, 1]
s = slices[2]
m0 = img1.array_3d[:, :, s].copy().transpose()
m = m1[:, :, s].transpose()
plot(ax, m0, m, s)

ax = axes[1, 1]
ax.axis('off')

plt.tight_layout()
plt.show()


# %%
img1.df

# %% ---- 2023-04-04 ----
# Pending


# %% ---- 2023-04-04 ----
# Pending
