'''
File: digger.py
Author: Chuncheng Zhang
Purpose:
    Define the Digger class.
    Dig into the given root path for its siblings iteratively.
'''

# %%
from pathlib import Path

# %%
max_deep = 10
extents = ['.html', '.nii.gz', '.mgz']

# %%


class Digger(object):
    '''
    Dig into the given root path for its siblings iteratively.
    '''

    def __init__(self, root):
        '''
        Init the object with the given root path,
        of course it is an existing and readable directory.
        '''

        self.root = Path(root)
        assert root.is_dir(), 'The root directory must be a directory, {}'.format(root)

    def walk_through(self, max_deep=max_deep, extents=extents):
        '''
        Walk through the root with iteration,
        the max_deep is the maximum depth of the iteration,
        the extents are the files to be selected.

        The output is a list of found files
        '''

        def _use_file(p):
            return p.is_file() and any([p.name.endswith(e) for e in extents])

        remain_folders = [self.root]

        files = []

        while remain_folders:
            folder = remain_folders.pop()
            [remain_folders.append(e) for e in folder.iterdir() if e.is_dir()]
            [files.append(e) for e in folder.iterdir() if _use_file(e)]

        return files

# %%
