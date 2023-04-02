# %%
import nibabel
import logging

from pathlib import Path

# %%
PROJECT_NAME = 'CH-PROJECT-CHECKOUT'
ROOT_PATH = Path(__file__).parent.parent

# %%


DEFAULT_LOGGING_KWARGS = dict(
    name=PROJECT_NAME,
    filepath=ROOT_PATH.joinpath('{}.log'.format(PROJECT_NAME)),
    level_file=logging.DEBUG,
    level_console=logging.DEBUG,
    format_file='%(asctime)s %(name)s %(levelname)-8s %(message)-40s {{%(filename)s:%(lineno)s:%(module)s:%(funcName)s}}',
    format_console='%(asctime)s %(name)s %(levelname)-8s %(message)-40s {{%(filename)s:%(lineno)s}}'
)


def GENERATE_LOGGER(name, filepath, level_file, level_console, format_file, format_console):
    '''
    Generate logger from inputs,
    the logger prints message both on the console and into the logging file.
    The DEFAULT_LOGGING_KWARGS is provided to automatically startup

    Args:
        :param:name: The name of the logger
        :param:filepath: The logging filepath
        :param:level_file: The level of logging into the file
        :param:level_console: The level of logging on the console
        :param:format_file: The format when logging on the console
        :param:format_console: The format when logging into the file
    '''

    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    file_handler = logging.FileHandler(filepath, encoding='utf-8')
    file_handler.setFormatter(logging.Formatter(format_file))
    file_handler.setLevel(level_file)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(format_console))
    console_handler.setLevel(level_console)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


LOGGER = GENERATE_LOGGER(**DEFAULT_LOGGING_KWARGS)

# %%
if __name__ == '__main__':
    LOGGER.debug('Test debug message')
    LOGGER.info('Test info message')
    LOGGER.warning('Test warning message')
    LOGGER.error('Test error message')
    LOGGER.critical('Test critical message')

# %%
