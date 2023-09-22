const ClassI2CBus = require("https://raw.githubusercontent.com/AlexGlgr/ModuleBaseI2CBus/fork-Alexander/js/module/ClassBaseI2CBus.min.js");
const err = require('https://raw.githubusercontent.com/Konkery/ModuleAppError/main/js/module/ModuleAppError.min.js');
const NumIs = require('https://raw.githubusercontent.com/Konkery/ModuleAppMath/main/js/module/ModuleAppMath.min.js');
     NumIs.is(); //добавить функцию проверки целочисленных чисел в Number

let I2Cbus = new ClassI2CBus();
let bus = I2Cbus.AddBus({sda: B9, scl: B8, bitrate: 400000}).IDbus;

const Lps = require("ClassLPS25HB");
let opts = {pins: [B9, B8], bus: bus, address: 0x5C, quantityChannel: 2};
let sensor_props = {
    name: "LPS25HB",
    type: "sensor",
    channelNames: ['temperature', 'pressure'],
    typeInSignal: "analog",
    typeOutSignal: "digital",
    quantityChannel: 2,
    busType: [ "i2c" ],
    manufacturingData: {
        IDManufacturing: [
            {
                "Placeholder01": "1234"
            }
        ],
        IDsupplier: [
            {
                "GimmeModule": "BB553"
            }
        ],
        HelpSens: "LPS25HB pressure sensor"
    }
};
let baro = new Lps(opts, sensor_props);

const ch0 = baro.GetChannel(0);
const ch1 = baro.GetChannel(1);

ch0.Start(1000);
ch1.Start(1000);

setInterval(() => {
  console.log((ch0.Value).toFixed(2) + " C");
  console.log((ch1.Value).toFixed(2) + " Pa");
}, 1000);