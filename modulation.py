import numpy as np

def bpsk_mod(bits):
    return 2*bits - 1

def bpsk_demod(signal):
    return (signal > 0).astype(int)


def qpsk_mod(bits):
    bits = bits.reshape(-1,2)
    symbols = []

    for b in bits:
        real = 1 if b[0]==0 else -1
        imag = 1 if b[1]==0 else -1
        symbols.append(real + 1j*imag)

    return np.array(symbols)


def qpsk_demod(symbols):

    bits=[]

    for s in symbols:

        b1 = 0 if s.real>0 else 1
        b2 = 0 if s.imag>0 else 1

        bits.extend([b1,b2])

    return np.array(bits)


def qam16_mod(bits):

    bits = bits.reshape(-1,4)

    symbols=[]

    for b in bits:

        real = (2*b[0]+b[1])*2-3
        imag = (2*b[2]+b[3])*2-3

        symbols.append(real + 1j*imag)

    return np.array(symbols)