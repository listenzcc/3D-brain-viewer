"""
File: mri_img.py
Author: Chuncheng Zhang
Date: 2023-04-04
Functions:
    1. Class of MRI Image workload
    2. Pending
    3. Pending
    4. Pending
    5. Pending
"""


# %% ---- 2023-04-04 ------------------------
# Imports

from python_setup.setup import *

# %% ---- 2023-04-04 ------------------------
# Class of MRI Image workload



class MRIImg(object):
    def __init__(self, path):
        '''
        Init the MRI Image object with given path,
        the path must be read by the nibabel.load.
        '''
        self.path = Path(path)
        self.read_file()
        self.match_ijk_xyz_space()
        LOGGER.debug('Created image %s', self.path)
        pass

    def read_file(self):
        '''
        Read the image from the file,
        and generate img, affine, array_3d and its shape.
        '''

        img = nibabel.load(self.path)
        affine = img.affine
        array_3d = img.get_fdata()

        self.img = img
        self.affine = affine
        self.array_3d = array_3d
        self.shape = array_3d.shape

        LOGGER.debug('Loaded image ({}:{}) with affine ({})'.format(
            self.path,
            array_3d.shape,
            affine))

        return img, affine, array_3d

    def match_ijk_xyz_space(self):
        '''
        Match the space between ijk index and xyz measures,
        and generate jik1, xyz1 and df: its data frame.
        '''
        # Parse the index space
        i, j, k = np.meshgrid(range(self.shape[0]),
                              range(self.shape[1]),
                              range(self.shape[2]))
        i = i.ravel()
        j = j.ravel()
        k = k.ravel()

        # Compute the xyz space
        ijk1 = np.array([i, j, k, k])
        ijk1[-1] = 1
        xyz1 = np.matmul(self.affine, ijk1)

        df = pd.DataFrame(ijk1[:3].transpose(), columns=['i', 'j', 'k'])
        df[['x', 'y', 'z']] = xyz1[:3].transpose()
        df['value'] = self.array_3d.ravel()
        df['filled_value'] = self.array_3d.ravel()
        
        self.ijk1 = ijk1
        self.xyz1 = xyz1
        self.df = df

        LOGGER.debug('Matched space from ijk({}) to xyz({}) of {}'.format(
            ijk1.shape,
            xyz1.shape,
            self.path,
        ))

        return ijk1, xyz1

    def fill_from(self, img):
        '''
        Fill the array_3d like array with the other img.
        The coming img may have different affine coordinates and dimensions.
        '''
        # Prepare the filled array_3d
        filled = self.array_3d.copy() * 0
        xyz11 = self.xyz1
        ijk11 = self.ijk1

        # Read the img
        m2 = img.array_3d.copy()
        m2[0, :, :] = 0
        m2[:, 0, :] = 0
        m2[:, :, 0] = 0

        affine2 = img.affine
        affine2_inv = np.linalg.inv(affine2)

        # Compute the ijk of the img,
        # and remove the unavailable points indexes
        ijk12 = np.matmul(affine2_inv, xyz11).astype(np.int32)

        for j in range(3):
            top = img.shape[j] - 1
            ijk12[j][ijk12[j] < 0] = 0
            ijk12[j][ijk12[j] > top] = 0

        # Fill the filled
        filled[ijk11[0], ijk11[1], ijk11[2]] = m2[ijk12[0], ijk12[1], ijk12[2]]

        self.filled_array_3d = filled
        self.df['filled_value'] = filled.ravel()

        LOGGER.debug('Fill {} -> {}, src img:{}, dst img: {}'.format(
            img.shape,
            filled.shape,
            img.path,
            self.path,
        ))

        return filled


# %% ---- 2023-04-04 ------------------------
# Pending



# %% ---- 2023-04-04 ------------------------
# Pending



# %% ---- 2023-04-04 ------------------------
# Pending



# %% ---- 2023-04-04 ------------------------
# Pending
