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
   console.log('loaded')
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

   let shore_on = document.getElementById('shore_on');
   let shore_off = document.getElementById('shore_off');
   let turn_on = document.getElementById('turn_on');
   let turn_off = document.getElementById('turn_off');
   let transfer_to_gen = document.getElementById('transfer_to_gen');
   let transfer_to_shore = document.getElementById('transfer_to_shore');
   let port_master = document.getElementById('port_master');
   let stbd_master = document.getElementById('stbd_master');

   shore_on.addEventListener('click', function () {
      (async () => {
         const rawResponse = await fetch('/push_cmd', {
           method: 'POST',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({'cmds': [':SHORe:ON']})
         });
         const content = await rawResponse.json();
       })();
   });
   shore_off.addEventListener('click', function () {
      (async () => {
         const rawResponse = await fetch('/push_cmd', {
           method: 'POST',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({'cmds': [':SHORe:OFF']})
         });
         const content = await rawResponse.json();
       })();
   });
   turn_on.addEventListener('click', function () {
      (async () => {
         const rawResponse = await fetch('/push_cmd', {
           method: 'POST',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({'cmds': [':CONVerter:ON']})
         });
         const content = await rawResponse.json();
       })();
   });
   turn_off.addEventListener('click', function () {
      (async () => {
         const rawResponse = await fetch('/push_cmd', {
           method: 'POST',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({'cmds': [':CONVerter:OFF']})
         });
         const content = await rawResponse.json();
       })();
   });
   transfer_to_gen.addEventListener('click', function () {
      (async () => {
         const rawResponse = await fetch('/push_cmd', {
           method: 'POST',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({'cmds': [':TS:GENerator:ON']})
         });
         const content = await rawResponse.json();
       })();
   });
   transfer_to_shore.addEventListener('click', function () {
      (async () => {
         const rawResponse = await fetch('/push_cmd', {
           method: 'POST',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({'cmds': [':TS:CONVerter:ON']})
         });
         const content = await rawResponse.json();
       })();
   });
   port_master.addEventListener('click', function () {
      (async () => {
         const rawResponse = await fetch('/push_cmd', {
           method: 'POST',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({'cmds': [':TS:G1:MASTer']})
         });
         const content = await rawResponse.json();
       })();
   });
   stbd_master.addEventListener('click', function () {
      (async () => {
         const rawResponse = await fetch('/push_cmd', {
           method: 'POST',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({'cmds': [':TS:G2:MASTer']})
         });
         const content = await rawResponse.json();
       })();
   });

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

}

// window.onload = init;
//
// function init() {
//   var bMobile =   // will be true if running on a mobile device
//   navigator.userAgent.indexOf( "Mobile" ) !== -1 ||
//   navigator.userAgent.indexOf( "iPhone" ) !== -1 ||
//   navigator.userAgent.indexOf( "iPad" ) !== -1 ||
//   navigator.userAgent.indexOf( "Android" ) !== -1 ||
//   navigator.userAgent.indexOf( "Windows Phone" ) !== -1 ;
//
//   let switch_pos = 0;
//   const main_panel = document.querySelector('.main_container');
//   const shore_switch = document.querySelector('#shore_switch');
//   const port_switch = document.querySelector('#port_switch');
//   const stbd_switch = document.querySelector('#stbd_switch');
//
//   setInterval(function() {
//     if(bMobile) {
//       if(!(window.innerHeight > window.innerWidth)){
//     main_panel.style.height = '40vw';
// } else {
//         main_panel.style.height = '180vw';
//       }
//     }
//     if(!bMobile) {
//       let rel = main_panel.offsetWidth;
//       main_panel.style.height = `${1/rel * 53082}vw`;
//     }
//     if(switch_pos < 91) {
//       if(switch_pos < 20) {
//         shore_switch.style.backgroundColor = 'green';
//       } else {
//         shore_switch.style.backgroundColor = 'white';
//       }
//       switch_pos++;
//       shore_switch.style.transform = `rotate(${`${switch_pos}deg`})`;
//       port_switch.style.transform = `rotate(${`${switch_pos}deg`})`;
//       stbd_switch.style.transform = `rotate(${`${switch_pos}deg`})`;
//     } else {
//       switch_pos = 0;
//     }
//
//   }, 100);
//
//
// }