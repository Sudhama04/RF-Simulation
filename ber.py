import numpy as np

def calculate_ber(original,received):

    errors = np.sum(original != received)

    return errors/len(original)