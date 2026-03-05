import numpy as np

def ofdm_transmit(symbols):

    return np.fft.ifft(symbols)


def ofdm_receive(signal):

    return np.fft.fft(signal)