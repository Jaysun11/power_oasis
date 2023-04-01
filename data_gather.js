var guages_drawn = false;

//GAUGES
var opts = {
    fontSize: 40,
    angle: 0.15, // The span of the gauge arc
    lineWidth: 0.44, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
      length: 0.6, // // Relative to gauge radius
      strokeWidth: 0.035, // The thickness
      color: '#000000' // Fill color
    },
    limitMax: false,     // If false, max value increases automatically if value > maxValue
    limitMin: false,     // If true, the min value of the gauge will be fixed
    colorStart: '#F04339',   // Colors
    colorStop: '#F04339',    // just experiment with them
    strokeColor: '#8F8F8F',  // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true,     // High resolution support
    
  };

var batteryopts = {
    staticZones: [
        {strokeStyle: "#F03E3E", min: 0, max: 20}, // Red from 100 to 130
        {strokeStyle: "#FFDD00", min: 20, max: 40}, // Yellow
        {strokeStyle: "#30B32D", min: 40, max: 100}, // Green
     ],
    angle: 0, // The span of the gauge arc
    lineWidth: 0.44, // The line thickness
    radiusScale: 1, // Relative radius
    fontSize: 40,
    pointer: {
      length: 0.6, // // Relative to gauge radius
      strokeWidth: 0.035, // The thickness
      color: '#000000' // Fill color
    },
    limitMax: false,     // If false, max value increases automatically if value > maxValue
    limitMin: false,     // If true, the min value of the gauge will be fixed
    colorStart: '#F04339',   // Colors
    colorStop: '#F04339',    // just experiment with them
    strokeColor: '#8F8F8F',  // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true,     // High resolution support
    staticLabels: {
        font: "10px sans-serif",  // Specifies font
        labels: [0, 20, 40, 60, 80, 100],  // Print labels at these values
        color: "#FFFFFF",  // Optional: Label text color
        fractionDigits: 0  // Optional: Numerical precision. 0=round off.
      },
};

var ac_gauge;
var pv_gauge;
var battery_gauge;
var output_gauge;

//END GAUGES

function loadConfig(){

    var xhr2 = new XMLHttpRequest();
    xhr2.onreadystatechange = function() {
      if (xhr2.readyState === XMLHttpRequest.DONE && xhr2.status === 200) {
        const configText = xhr2.responseText;
        const configVariables = parseConfigFile(configText);

        var {
          PLANT_ID,
          TOKEN,
          GRID_CONNECTION_STATUS,
          shelly_ip,
          generator_SOC_Start,
          generator_SOC_Stop,
          generator_Voltage_Start,
          generator_Voltage_Stop,
          send_to_cloud_frequency
        } = configVariables;    

        var generator_SOC_Start = parseFloat(generator_SOC_Start);
        var generator_SOC_Stop = parseFloat(generator_SOC_Stop);
        var generator_Voltage_Start = parseFloat(generator_Voltage_Start);
        var generator_Voltage_Stop = parseFloat(generator_Voltage_Stop);
        var send_to_cloud_frequency = parseFloat(send_to_cloud_frequency);

        const generator_SOC_Start_Element = document.getElementById("generator_SOC_Start");
        generator_SOC_Start_Element.value = generator_SOC_Start;

        const generator_SOC_Stop_Element = document.getElementById("generator_SOC_Stop");
        generator_SOC_Stop_Element.value = generator_SOC_Stop;

        const generator_Voltage_Start_Element = document.getElementById("generator_Voltage_Start");
        generator_Voltage_Start_Element.value = generator_Voltage_Start;

        const generator_Voltage_Stop_Element = document.getElementById("generator_Voltage_Stop");
        generator_Voltage_Stop_Element.value = generator_Voltage_Stop;

        const grid_status_Element = document.getElementById("Grid_connected_status");
        grid_status_Element.value = GRID_CONNECTION_STATUS;

        const shelly_ip_Element = document.getElementById("shelly_ip");
        shelly_ip_Element.value = shelly_ip;

        const plant_id_element = document.getElementById("plant_id");
        plant_id_element.value = PLANT_ID;

        const token_element = document.getElementById("token");
        token_element.value = TOKEN;

      }
  };
  xhr2.open("GET", "/config.txt");
  xhr2.send();
  }

  function parseConfigFile(configText) {
    const configLines = configText.split('\n');

    const configVariables = {};

    configLines.forEach(line => {
      const [key, value] = line.split('=').map(str => str.trim());

      if (key && value) {
        if (value === 'True' || value === 'False') {
          configVariables[key] = value === 'True';
        } else if (!isNaN(value)) {
          configVariables[key] = parseFloat(value);
        } else {
          configVariables[key] = value;
        }
      }
    });

    return configVariables;
  }

  function getData(){
    
    if(!guages_drawn){

        var ac_target = document.getElementById('ac_source_gauge'); // your canvas element
        ac_gauge = new Gauge(ac_target).setOptions(opts); // create sexy gauge!

        ac_gauge.maxValue = 50; // set max gauge value
        ac_gauge.setMinValue(-50);  // Prefer setter over gauge.minValue = 0
        ac_gauge.animationSpeed = 15; // set animation speed (32 is default value)
        
        var pv_target = document.getElementById('pv_gauge'); // your canvas element
        pv_gauge = new Gauge(pv_target).setOptions(opts); // create sexy gauge!
        pv_gauge.maxValue = 100; // set max gauge value
        pv_gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
        pv_gauge.animationSpeed = 15; // set animation speed (32 is default value)

        var battery_target = document.getElementById('battery_gauge'); // your canvas element
        battery_gauge = new Gauge(battery_target).setOptions(batteryopts); // create sexy gauge!
        battery_gauge.maxValue = 100; // set max gauge value
        battery_gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
        battery_gauge.animationSpeed = 15; // set animation speed (32 is default value)

        var output_target = document.getElementById('output_gauge'); // your canvas element
        output_gauge = new Gauge(output_target).setOptions(opts); // create sexy gauge!
        pv_gauge.maxValue = 50; // set max gauge value
        pv_gauge.setMinValue(-50);  // Prefer setter over gauge.minValue = 0
        pv_gauge.animationSpeed = 15; // set animation speed (32 is default value)



        guages_drawn = true;
    }  

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        // Parse the JSON object and extract the value of Total_AC_SOURCE_POWER
        var data = JSON.parse(xhr.responseText);

        //BATTERY DATA

        var battery_SOC = parseFloat(data.SOC  * 100);

        var battery_watts = parseFloat(data.battery_data.Battery_Watts / -1000);
        var battery_watts_element = document.getElementById("Battery_Watts");
        battery_watts_element.textContent = battery_watts + "KW";

        var battery_voltage = parseFloat(data.battery_data.Battery_Voltage);
        var battery_voltage_element = document.getElementById("Battery_Voltage");
        battery_voltage_element.textContent = "Volts: " + battery_voltage + "V";

        var battery_current = parseFloat(data.battery_data.Battery_Current);
        var battery_current_element = document.getElementById("Battery_Current");
        battery_current_element.textContent = "Amps: " +battery_current + "A";

        //SOLAR DATA
        var solar_watts = parseFloat(data.Solar_Data.Solar_Watts / 1000);
        var solar_watts_element = document.getElementById("Solar_Watts");
        solar_watts_element.textContent = solar_watts + "KW";

        var solary_voltage = parseFloat(data.Solar_Data.Solar_Volts);
        var solar_voltage_element = document.getElementById("Solar_Volts");
        solar_voltage_element.textContent = "Volts: " + solary_voltage + "V";

        var solar_current = parseFloat(data.Solar_Data.Solar_Current);
        var solar_current_element = document.getElementById("Solar_Current");
        solar_current_element.textContent = "Amps: " + solar_current + "A";

        //GRID / GENERATOR DATA

        //L1 Data
        var AC_SOURCE_L1_WATTS = parseFloat(data.AC_Source_Data.AC_SOURCE_L1.AC_SOURCE_L1_Watts);
        var AC_SOURCE_L1_WATTS_element = document.getElementById("Source_L1_Watts");
        AC_SOURCE_L1_WATTS_element.textContent = "Watts: " + AC_SOURCE_L1_WATTS + "KW";

        var AC_SOURCE_L1_Voltage = parseFloat(data.AC_Source_Data.AC_SOURCE_L1.AC_SOURCE_L1_Voltage);
        var AC_SOURCE_L1_Voltage_element = document.getElementById("Source_L1_Volts");
        AC_SOURCE_L1_Voltage_element.textContent = "Volts: " + AC_SOURCE_L1_Voltage + "V";

        var AC_SOURCE_L1_Current = parseFloat(data.AC_Source_Data.AC_SOURCE_L1.AC_SOURCE_L1_Current);
        var AC_SOURCE_L1_Current_element = document.getElementById("Source_L1_Current");
        AC_SOURCE_L1_Current_element.textContent = "Amps: " + AC_SOURCE_L1_Current + "A";

        //L2 Data
        var AC_SOURCE_L2_WATTS = parseFloat(data.AC_Source_Data.AC_SOURCE_L2.AC_SOURCE_L2_Watts);
        var AC_SOURCE_L2_WATTS_element = document.getElementById("Source_L2_Watts");
        AC_SOURCE_L2_WATTS_element.textContent = "Watts: " + AC_SOURCE_L2_WATTS + "KW";

        var AC_SOURCE_L2_Voltage = parseFloat(data.AC_Source_Data.AC_SOURCE_L2.AC_SOURCE_L2_Voltage);
        var AC_SOURCE_L2_Voltage_element = document.getElementById("Source_L2_Volts");
        AC_SOURCE_L2_Voltage_element.textContent = "Volts: " + AC_SOURCE_L2_Voltage + "V";

        var AC_SOURCE_L2_Current = parseFloat(data.AC_Source_Data.AC_SOURCE_L2.AC_SOURCE_L2_Current);
        var AC_SOURCE_L2_Current_element = document.getElementById("Source_L2_Current");
        AC_SOURCE_L2_Current_element.textContent = "Amps: " + AC_SOURCE_L2_Current + "A";

        //L2 Data
        var AC_SOURCE_L3_WATTS = parseFloat(data.AC_Source_Data.AC_SOURCE_L3.AC_SOURCE_L3_Watts);
        var AC_SOURCE_L3_WATTS_element = document.getElementById("Source_L3_Watts");
        AC_SOURCE_L3_WATTS_element.textContent = "Watts: " + AC_SOURCE_L3_WATTS + "KW";

        var AC_SOURCE_L3_Voltage = parseFloat(data.AC_Source_Data.AC_SOURCE_L3.AC_SOURCE_L3_Voltage);
        var AC_SOURCE_L3_Voltage_element = document.getElementById("Source_L3_Volts");
        AC_SOURCE_L3_Voltage_element.textContent = "Volts: " + AC_SOURCE_L3_Voltage + "V";

        var AC_SOURCE_L3_Current = parseFloat(data.AC_Source_Data.AC_SOURCE_L3.AC_SOURCE_L3_Current);
        var AC_SOURCE_L3_Current_element = document.getElementById("Source_L3_Current");
        AC_SOURCE_L3_Current_element.textContent = "Amps: " + AC_SOURCE_L3_Current + "A";

        //Collective Data

        var AC_SOURCE_TOTAL_WATTS = parseFloat(data.AC_Source_Data.Total_AC_SOURCE_POWER  / 1000);
        var Total_AC_SOURCE_POWER_element = document.getElementById("TOTAL_AC_SOURCE_POWER");
        Total_AC_SOURCE_POWER_element.textContent = AC_SOURCE_TOTAL_WATTS + "KW";

        var AC_SOURCE_FREQUENCY = parseFloat(data.AC_Source_Data.Ac_Source_Frequency);
        var AC_SOURCE_FREQUENCY_element = document.getElementById("AC_SOURCE_FREQUENCY");
        AC_SOURCE_FREQUENCY_element.textContent = "Frequency: " + AC_SOURCE_FREQUENCY  + "HZ";


        //LOAD DATA

        //L1 Data
        var LOAD_L1_WATTS = parseFloat(data.Load_Data.LOAD_L1.LOAD_L1_Power);
        var LOAD_L1_WATTS_element = document.getElementById("Load_L1_Watts") ;
        LOAD_L1_WATTS_element.textContent = "Watts: " + LOAD_L1_WATTS + "KW";

        var LOAD_L1_Voltage = parseFloat(data.Load_Data.LOAD_L1.LOAD_L1_Voltage);
        var LOAD_L1_Voltage_element = document.getElementById("Load_L1_Volts");
        LOAD_L1_Voltage_element.textContent = "Volts: " + LOAD_L1_Voltage + "V";

        var LOAD_L1_Current = parseFloat(data.Load_Data.LOAD_L1.LOAD_L1_Current);
        var LOAD_L1_Current_element = document.getElementById("Load_L1_Current");
        LOAD_L1_Current_element.textContent = "Amps: " + LOAD_L1_Current + "A";

        //L2 Data
        var LOAD_L2_WATTS = parseFloat(data.Load_Data.LOAD_L2.LOAD_L2_Power);
        var LOAD_L2_WATTS_element = document.getElementById("Load_L2_Watts");
        LOAD_L2_WATTS_element.textContent = "Watts: " + LOAD_L2_WATTS + "KW";

        var LOAD_L2_Voltage = parseFloat(data.Load_Data.LOAD_L2.LOAD_L2_Voltage);
        var LOAD_L2_Voltage_element = document.getElementById("Load_L2_Volts");
        LOAD_L2_Voltage_element.textContent = "Volts: " + LOAD_L2_Voltage + "V";

        var LOAD_L2_Current = parseFloat(data.Load_Data.LOAD_L2.LOAD_L2_Current);
        var LOAD_L2_Current_element = document.getElementById("Load_L2_Current");
        LOAD_L2_Current_element.textContent = "Amps: " + LOAD_L2_Current + "A";

        //L3 Data
        var LOAD_L3_WATTS = parseFloat(data.Load_Data.LOAD_L3.LOAD_L3_Power);
        var LOAD_L3_WATTS_element = document.getElementById("Load_L3_Watts");
        LOAD_L3_WATTS_element.textContent = "Watts: " + LOAD_L3_WATTS + "KW";

        var LOAD_L3_Voltage = parseFloat(data.Load_Data.LOAD_L3.LOAD_L3_Voltage);
        var LOAD_L3_Voltage_element = document.getElementById("Load_L3_Volts");
        LOAD_L3_Voltage_element.textContent = "Volts: " + LOAD_L3_Voltage + "V";

        var LOAD_L3_Current = parseFloat(data.Load_Data.LOAD_L3.LOAD_L3_Current);
        var LOAD_L3_Current_element = document.getElementById("Load_L3_Current");
        LOAD_L3_Current_element.textContent = "Amps: " + LOAD_L3_Current + "A";

        //Collective Data

        var LOAD_TOTAL_WATTS = parseFloat(data.Load_Data.Total_Load_POWER / 1000);
        var LOAD_TOTAL_WATTS_element = document.getElementById("TOTAL_LOAD_POWER");
        LOAD_TOTAL_WATTS_element.textContent = LOAD_TOTAL_WATTS + "KW";

        var LOAD_FREQUENCY = parseFloat(data.Load_Data.Load_Frequency);
        var LOAD_FREQUENCY_element = document.getElementById("LOAD_FREQUENCY");
        LOAD_FREQUENCY_element.textContent = "Frequency: " + LOAD_FREQUENCY  + "HZ";

        drawGauges(AC_SOURCE_TOTAL_WATTS, solar_watts, battery_SOC, LOAD_TOTAL_WATTS)

      }
  };
  xhr.open("GET", "/data.txt");
  xhr.send();



  function drawGauges(AC_SOURCE, PV_INPUT, BATTERY_WATTS, LOAD_WATTS){

        ac_gauge.set(AC_SOURCE); // set actual value
        pv_gauge.set(PV_INPUT); // set actual value
        battery_gauge.set(21); // set actual value
        output_gauge.set(LOAD_WATTS); // set actual value
  }



  }