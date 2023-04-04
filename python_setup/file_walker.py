'''
File: file_walker.py
Author: Chuncheng Zhang
Purpose:
    Define the FileWalker class.
    Dig into the given root path for its siblings iteratively.
'''

# %%
import time
from pathlib import Path

# %%
max_deep = 10
extents = ['.html', '.nii.gz', '.mgz']

# %%


class FileWalker(object):
    '''
    Dig into the given root path for its siblings iteratively.
    '''

    def __init__(self, root):
        '''
        Dig into the given root path for its siblings iteratively.

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

        t = time.time()

        while remain_folders:
            folder = remain_folders.pop()
            [remain_folders.append(e) for e in folder.iterdir() if e.is_dir()]
            [files.append(e) for e in folder.iterdir() if _use_file(e)]

        self._time_costing = time.time() - t

        return files

    @property
    def time_costing(self):
        '''
        Get the latest walk_through time cost.
        '''
        if hasattr(self, '_time_costing'):
            return self._time_costing
        else:
            return -1


# %%
