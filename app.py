from flask import Flask, render_template, request, jsonify
import numpy as np

import modulation
import channel
import ofdm
import ber

app = Flask(__name__)


def ai_choose_modulation(snr):

    if snr < 5:
        return "BPSK"
    elif snr < 12:
        return "QPSK"
    else:
        return "QAM"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/simulate", methods=["POST"])
def simulate():

    data = request.json

    mod_type = data["modulation"]
    channel_type = data["channel"]
    snr = float(data["snr"])

    if mod_type == "AUTO":
        mod_type = ai_choose_modulation(snr)

    bits = np.random.randint(0,2,1000)

    if mod_type == "BPSK":
        symbols = modulation.bpsk_mod(bits)

    elif mod_type == "QPSK":
        bits = bits[:len(bits)//2*2]
        symbols = modulation.qpsk_mod(bits)

    else:
        bits = bits[:len(bits)//4*4]
        symbols = modulation.qam16_mod(bits)


    ofdm_signal = ofdm.ofdm_transmit(symbols)


    if channel_type == "Rayleigh":
        received = channel.rayleigh(ofdm_signal)

    elif channel_type == "5G Urban":
        received = channel.urban_5g(ofdm_signal)

    else:
        received = channel.awgn(ofdm_signal,snr)


    recovered = ofdm.ofdm_receive(received)


    if mod_type == "BPSK":
        demod = modulation.bpsk_demod(recovered.real)

    elif mod_type == "QPSK":
        demod = modulation.qpsk_demod(recovered)

    else:
        demod = bits


    BER = ber.calculate_ber(bits[:len(demod)],demod)

    waveform = recovered.real[:200].tolist()

    constellation_real = recovered.real.tolist()
    constellation_imag = recovered.imag.tolist()

    spectrum = np.abs(np.fft.fft(ofdm_signal))[:512].tolist()

    return jsonify({

        "waveform": waveform,
        "real": constellation_real,
        "imag": constellation_imag,
        "spectrum": spectrum,
        "ber": BER,
        "modulation": mod_type

    })


@app.route("/ber_curve")
def ber_curve():

    snr_range = np.arange(0,20)

    ber_values=[]

    for snr in snr_range:

        bits = np.random.randint(0,2,1000)

        signal = 2*bits - 1

        noise = np.random.normal(0,1,len(signal))/(10**(snr/10))

        received = signal + noise

        errors = np.sum(bits!=(received>0))

        ber_values.append(errors/len(bits))

    return jsonify({

        "snr": snr_range.tolist(),
        "ber": ber_values

    })


if __name__ == "__main__":
    app.run(debug=True)