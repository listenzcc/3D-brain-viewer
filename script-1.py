# %%
from vedo import show
from toolbox.setup import *

# %%
LOGGER.info('The project starts.')

# %%
extents = ['.html', '.nii.gz', '.mgz']
digger = Digger(ROOT_PATH.joinpath('private'))
files = digger.walk_through(extents=extents)

LOGGER.debug('Found {} files'.format(len(files)))

files = pd.DataFrame(files, columns=['pathlib'])
files['filename'] = files['pathlib'].map(lambda e: e.name.strip())
files['extent'] = files['pathlib'].map(lambda e: ''.join(e.suffixes))
files['parent'] = files['pathlib'].map(
    lambda e: e.relative_to(digger.root).parent.as_posix())
files = files[['extent', 'filename', 'parent', 'pathlib']]
files

# %%
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

# %%


def load_img(path):
    # ------------------------------------------------
    # Load the image
    img = nibabel.load(path)
    affine = img.affine
    array_3d = img.get_fdata()
    print(path, affine, array_3d.shape)

    # ------------------------------------------------
    # Plot the image
    im = plt.imshow(array_3d[int(array_3d.shape[0]/2)], cmap='gray')
    plt.colorbar(im)
    plt.show()

    # ------------------------------------------------
    # Build the dataFrame
    # The index space
    mat = array_3d
    i, j, k = np.meshgrid(range(mat.shape[0]), range(
        mat.shape[1]), range(mat.shape[2]))
    i = i.ravel()
    j = j.ravel()
    k = k.ravel()
    value = mat[i, j, k]

    # Computation
    ijk1 = np.array([i, j, k, k])
    ijk1[-1] = 1
    xyz1 = np.matmul(affine, ijk1)

    # Build the dataFrame
    df = pd.DataFrame(value, columns=['value'])
    df[['x', 'y', 'z']] = xyz1[:3].transpose()
    df[['i', 'j', 'k']] = ijk1[:3].transpose()

    # ------------------------------------------------
    # Compute the hull mesh
    vol = Volume(array_3d)
    mesh = vol.isosurface(np.linspace(np.min(array_3d), np.max(array_3d), 5))
    mesh.apply_transform(affine, reset=True)
    print(vol, mesh)

    return dict(
        path=path,
        img=img,
        affine=affine,
        array_3d=array_3d,
        df=df,
        vol=vol,
        mesh=mesh
    )


# %%
fsaverage_path = mgz.iloc[0]['pathlib']
fsaverage_dct = load_img(fsaverage_path)
fsaverage_dct

# %%
stat_path = nii.iloc[0]['pathlib']
stat_dct = load_img(stat_path)
stat_dct

# %%
rec = fsaverage_dct['mesh'].write('fsaverage.obj')
rec = stat_dct['mesh'].write('stat.obj')

# %%
mesh = fsaverage_dct['mesh']
vertices = np.array(mesh.vertices())
cells = np.array(mesh.cells())
vertices.shape, cells.shape

# %%
mesh1 = stat_dct['mesh']
vertices1 = np.array(mesh1.vertices())
cells1 = np.array(mesh1.cells())
vertices1.shape, cells1.shape

# %%
print([e for e in mesh.pointdata.keys()])
d = mesh.pointdata['input_scalars']
d, d.shape, np.unique(d)

# %%

show(mesh.clone().bc(1).lc(1).opacity(0.1), __doc__,
     zoom=1, axes=1, interactive=False)  # .add_cutter_tool(mesh)

# %%
d_unique = np.unique(d)
print(d_unique)

lst = []
n = len(d_unique)
for j, opacity in zip(range(n), np.linspace(0.01, 0.1, n)):
    if j == 0:
        d0 = 0
    else:
        d0 = d_unique[j-1]
    d1 = d_unique[j]
    mc = mesh.clone().cut_with_plane(origin=(100, -100, 100), normal=(-1, 0, 0)
                                     ).threshold('input_scalars', d0, d1).bc(j).lc(j).opacity(0.1)
    # mc.cut_with_plane(normal=(1,1,1))
    # mc.crop(left=100)

    lst.append(mc)
    show(mc,
         __doc__,
         title='Single surface: {}-{}'.format(d0, d1),
         viewup='y',
         zoom=1,
         axes=1,
         interactive=False)

# %%
show(lst,
     __doc__,
     viewup='y',
     title='Single surface: {}-{}'.format(d0, d1),
     zoom=1, axes=1, interactive=False)

# %%
mesh

# %%
# fig = go.Figure(data=[
#     go.Mesh3d(
#         opacity=0.2,
#         # vertices
#         x=vertices[:, 0],
#         y=vertices[:, 1],
#         z=vertices[:, 2],
#         colorbar_title='z',
#         colorscale=[[0, 'gold'],
#                     [0.5, 'mediumturquoise'],
#                     [1, 'magenta']],
#         # Intensity of each vertex, which will be interpolated and color-coded
#         intensity=np.linspace(0, 1, 2, endpoint=True),
#         # i, j and k give the vertices of triangles
#         i=cells[:, 0],
#         j=cells[:, 1],
#         k=cells[:, 2],
#         name='fsaverage',
#         showscale=True
#     ),
#     go.Mesh3d(
#         opacity=1.0,
#         # vertices
#         x=vertices1[:, 0],
#         y=vertices1[:, 1],
#         z=vertices1[:, 2],
#         colorbar_title='z',
#         colorscale=[[0, 'red'],
#                     [0.5, 'mediumturquoise'],
#                     [1, 'magenta']],
#         # Intensity of each vertex, which will be interpolated and color-coded
#         intensity=np.linspace(0, 1, 2, endpoint=True),
#         # i, j and k give the vertices of triangles
#         i=cells1[:, 0],
#         j=cells1[:, 1],
#         k=cells1[:, 2],
#         name='stat',
#         showscale=True
#     )
# ])

# fig.show()

# %%
