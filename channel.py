import numpy as np

def awgn(signal,snr):

    noise_power = 1/(10**(snr/10))

    noise = np.sqrt(noise_power/2) * np.random.randn(len(signal))

    return signal + noise


def rayleigh(signal):

    fading = np.random.rayleigh(scale=1,size=len(signal))

    return signal * fading


def urban_5g(signal):

    fading = np.random.normal(0.8,0.2,len(signal))

    multipath = np.convolve(signal,fading,"same")

    return multipath