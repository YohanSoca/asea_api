import json
import threading

import serial
from flask import Flask, render_template, request
from flask import jsonify

import time

app = Flask(__name__)

count = 0

class SerialInterface:
    def __init__(self):
        self.baudrate = 19200
        self.port = 'COM4'
        self.cmds = [
            {'Shore recuency': ':MEASure:SP1:FREQuency'},
            {'Shore L1 voltage': ':MEASure:SP1:VLL1 '},
            {'Shore L2 voltage': ':MEASure:SP1:VLL2'},
            {'Shore L3 voltage': ':MEASure:SP1:VLL3'},
            {'Shore currenct L1': ':MEASure:SP1:CURRent1'},
            {'Shore current L2': ':MEASure:SP1:CURRent2'},
            {'Shore current L3': ':MEASure:SP1:CURRent3'},
            {'G1 status': ':STATus:G1'},
            {'G2 status': ':STATus:G2'},
            {'Error': ':SYST:ERR'},
            {'Shore L1 kw': ':MEASure:SP1:POWer1'},
            {'Shore L2 kw': ':MEASure:SP1:POWer2'},
            {'Shore L3 kw': ':MEASure:SP1:POWer3'},
            {'Converter output frecuency': ':MEASure:CONVerter:FREQuency'},
            {'Converter output L1 voltage': ':MEASure:CONVerter:VOLTage1'},
            {'Converter output L2 voltage': ':MEASure:CONVerter:VOLTage2'},
            {'Converter output L3 voltage': ':MEASure:CONVerter:VOLTage3'},
            {'Converter output L1 current': ':MEASure:CONVerter:CURRent1'},
            {'Converter output L2 current': ':MEASure:CONVerter:CURRent2'},
            {'Converter output L3 current': ':MEASure:CONVerter:CURRent3'},
            {'Converter output L1 kw': ':MEASure:CONVerter:POWer1'},
            {'Converter output L2 kw': ':MEASure:CONVerter:POWer2'},
            {'Converter output L3 kw': ':MEASure:CONVerter:POWer3'},
            {'Generator 1 frecuency': ':MEASure:GENerator1:FREQuency'},
            {'Generator 1 L1 voltage': ':MEASure:GENerator1:VOLTage1'},
            {'Generator 1 L2 voltage': ':MEASure:GENerator1:VOLTage2'},
            {'Generator 1 L3 voltage': ':MEASure:GENerator1:VOLTage3'},
            {'Generator 2 frecuency': ':MEASure:GENerator2:FREQuency'},
            {'Generator 2 L1 voltage': ':MEASure:GENerator2:VOLTage1'},
            {'Generator 2 L2 voltage': ':MEASure:GENerator2:VOLTage2'},
            {'Generator 3 L3 voltage': ':MEASure:GENerator2:VOLTage3'}
        ];
        self.values = []
        threading.Thread(target=self.execute).start()

    def initSerial(self):
        self.ser = serial.Serial(self.port, self.baudrate, timeout=1)
        if self.ser.isOpen():
            print(self.ser.name + ' is open...')   

    def execute(self):
        while True:
            values = []
            for cmd in self.cmds:
                for key in cmd.keys():
                    if key == 'one time':
                        try:
                            try:
                                self.ser.write(cmd[key].encode('ascii') + '\r\n'.encode())
                                time.sleep(0.1)
                            except:
                                pass
                            try:
                                self.cmds.remove(cmd)
                            except:
                                pass
                        except:
                            pass
                        continue
                    try:
                        self.ser.write(cmd[key].encode('ascii') + '\r\n'.encode())
                        res = self.ser.readline()
                        res = res.decode('ascii').split("\r")[0]
                        values.append({f"{key}": f"{res}"})
                        time.sleep(0.1)
                    except:
                        values.append({f"{key}": f"{0}"})
                        time.sleep(0.1)

            self.values = values

    def add_cmd(self, cmd):
        self.cmds.append(cmd)

ser_interface = SerialInterface()
ser_interface.initSerial()

@app.route('/push_cmd', methods=['POST'])
def push_smd():
    global ser_interface

    content = request.json
    for cmd in content['cmds']:
        ser_interface.add_cmd({'one time': f"{cmd}"})
    return jsonify({'echo': 'putos'})

@app.route('/get_status', methods=['POST', 'GET'])
def get_status():
    global ser_interface

    data = ser_interface.values

    data_to_send = {}
    for value in data:
        for name in value.keys():
            data_to_send[name] = value[name]

    return json.dumps(data_to_send)

@app.route('/')
def hello_world():
    return render_template('index2.html')


if __name__ == '__main__':
    app.run()
