window.onload = init;

class PowerSource {
   constructor(name, display) {
      this.display = display;
      this.name = name;
      this.running = false;
      this.online = false;
      this.frecuency = 0;
      this.voltage_l1 = 0;
      this.voltage_l2 = 0;
      this.voltage_l3 = 0;
      this.current_l1 = 0;
      this.current_l2 = 0;
      this.current_l3 = 0;
      this.kw_l1 = 0;
      this.kw_l2 = 0;
      this.kw_l3 = 0;
   }
   updateDisplay() {
      document.getElementById(this.display).innerHTML = `<h1">${this.name}</h1>
      <h2 id="${this.name + '_voltage'}">V: ${this.voltage_l1 === '' ? 0 : this.voltage_l1} volts</h2>
      <h2 id="${this.name + '_current'}">A: ${0} amps</h2>
      <h2 id="${this.name + '_frecuency'}">F: ${this.frecuency} Hz</h2>`;      
   }
}

function init() {
   let cmds = [
      ':SHORe:ON',
       ':SHORe:OFF',
       ':CONVerter:ON',
       ':CONVerter:OFF',
       ':TS:CONVerter:ON',
       ':TS:GENerator:ON',
       ':TS:G1:MASTer',
       ':TS:G2:MASTer'
      ];
   let generator1 = new PowerSource('Port gen', 'port_display');
   let generator2 = new PowerSource('STBD gen', 'stbd_display');
   let converter = new PowerSource('Converter', 'converter_display');

   setInterval(function() {
      const fetchPromise = fetch("/get_status");
      fetchPromise.then(response => {
         return response.json();
      }).then(payload => {
         console.log(payload)

         // Update Generator 1
         generator1.running = payload['G1 status'] === 1 ? true : false;
         generator1.frecuency = payload['Generator 1 frecuency'] ?? 0;
         generator1.voltage_l1 = payload['Generator 1 L1 voltage'] ?? 0;
         generator1.voltage_l2 = payload['Generator 1 L2 voltage'] ?? 0;
         generator1.voltage_l3 = payload['Generator 1 L3 voltage'] ?? 0;
         generator1.updateDisplay()

         // Update Generator 2
         generator2.running = payload['G2 status'] === 1 ? true : false;
         generator2.frecuency = payload['Generator 2 frecuency'] ?? 0;
         generator2.voltage_l1 = payload['Generator 2 L1 voltage'] ?? 0;
         generator2.voltage_l2 = payload['Generator 2 L2 voltage'] ?? 0;
         generator2.voltage_l3 = payload['Generator 2 L3 voltage'] ?? 0;
         generator2.updateDisplay()

         // Update Converter
         converter.voltage_l1 = payload['Converter output L1 voltage'] ?? 0;
         converter.voltage_l2 = payload['Converter output L2 voltage'] ?? 0;
         converter.voltage_l3 = payload['Converter output L3 voltage'] ?? 0;
         converter.current_l1 = payload['Converter output L1 current'] ?? 0;
         converter.current_l2 = payload['Converter output L2 current'] ?? 0;
         converter.current_l3 = payload['Converter output L3 current'] ?? 0;
         converter.kw_l1 = payload['Converter output L1 kw'] ?? 0;
         converter.kw_l2 = payload['Converter output L2 kw'] ?? 0;
         converter.kw_l3 = payload['Converter output L3 kw'] ?? 0;
         converter.updateDisplay()


      });
   }, 1000);
   setInterval(function() {
      (async () => {
         const rawResponse = await fetch('/push_cmd', {
           method: 'POST',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({'cmds': [':SHORe:ON', [':CONVerter:ON']]})
         });
         const content = await rawResponse.json();
       })();
   }, 3000)
}