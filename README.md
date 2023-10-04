# ModuleMeteoLPS25HB
<p align="center">
  <img src="./res/logo.png" width="400" title="hover text">
</p>

-----------------

# Лицензия
////

# Описание
<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px; color: #555">

Модуль реализует базовые функции метеодатчика на базе чипа [LPS25HB](https://github.com/AlexGlgr/ModuleMeteoLPS25HB/blob/fork-Alexander/res/LPS331AP_STMicroelectronics.pdf), возращающего данные о температуре и атмосферном давлении. Модуль работает по протоколу I2C, является частью фреймворка EcoLite и потомком класса [ClassMiddleSensor](https://github.com/Nicktonious/ModuleSensorArchitecture/blob/main/README.md). Количество каналов для снятия данных - 2. Типовая погрешность измерений датчика: 10 Pa для давления (см. документацию).

### **Конструктор**
Конструктор принимает один объект типа **SensorOptsType** и один объект типа [**SensorOptsType**](https://github.com/Nicktonious/ModuleSensorArchitecture/blob/main/README.md).
```js
let _sensor_props = {
    name: "LPS25HB",
    type: "sensor",
    channelNames: ['temperature', 'pressure'],
    typeInSignal: "analog",
    typeOutSignal: "digital",
    quantityChannel: 2,
    busType: [ "i2c" ],
};
let _opts = {
    bus: i2c_bus,
    address: 0x5c,
}
sensor = new LPS25HDClass (_opts, _sensor_props)
```
- <mark style="background-color: lightblue">bus</mark> - объект класса I2C, возвращаемый диспетчером I2C шин - [I2Cbus](https://github.com/AlexGlgr/ModuleBaseI2CBus/blob/fork-Alexander/README.md);
- <mark style="background-color: lightblue">address</mark> - адрес датчика на шине;

### **Поля**
- <mark style="background-color: lightblue">_name</mark> - имя класса в строковом виде;
- <mark style="background-color: lightblue">_sensor</mark> - объект базового класса;
- <mark style="background-color: lightblue">_minPeriod</mark> - минимальная частота опроса датчика - 1000 мс;
- <mark style="background-color: lightblue">_usedChannels</mark> - используемые каналы данных по нотации архитектуры фреймворка EcoLite;
- <mark style="background-color: lightblue">_interval</mark> - функция SetInterval для опроса датчика.

### **Методы**
- <mark style="background-color: lightblue">Init(_sensor_props)</mark> - необходим для первоначальной настройки датчика;
- <mark style="background-color: lightblue">Start(_num_channel, _period)</mark> - запускает циклический опрос заданного канала датчика. Переданное значение периода сверяется с минимальным значением хранящимся в поле *_minPeriod* и, если требуется, регулируется;
- <mark style="background-color: lightblue">ChangeFreq(_num_channel, _period)</mark> - останавливает опрос заданного канала и запускает его вновь с уже новой частотой.
- <mark style="background-color: lightblue">Stop(_num_channel)</mark> - прекращает считывание значений с заданного канала.

### **Возвращаемые данные**
Модуль предоставляет данные об атмосферном давлении в **килопаскалях**. Для перевода этих значений в другие метрики можно воспользоваться следующим формулам:
- В мм рт ст: p = p0 * 7,501;
- В Бары: p = p0 / 100;


### **Примеры**
Фрагмент кода для вывода данных о давлении и температуре в консоль раз в одну секунду:
```js
//Подключение необходимых модулей
const ClassI2CBus = require("https://raw.githubusercontent.com/AlexGlgr/ModuleBaseI2CBus/fork-Alexander/js/module/ClassBaseI2CBus.min.js");
const err = require('https://raw.githubusercontent.com/Konkery/ModuleAppError/main/js/module/ModuleAppError.min.js');
const NumIs = require('https://raw.githubusercontent.com/Konkery/ModuleAppMath/main/js/module/ModuleAppMath.min.js');
     NumIs.is(); //добавить функцию проверки целочисленных чисел в Number

//Создание I2C шины
let I2Cbus = new ClassI2CBus();
let bus = I2Cbus.AddBus({sda: B9, scl: B8, bitrate: 400000}).IDbus;

//Настройка передаваемых объектов
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
//Создание объекта класса
let baro = new Lps(opts, sensor_props);

const ch0 = baro.GetChannel(0);
const ch1 = baro.GetChannel(1);

//Создание каналов
ch0.Start(1000);
ch1.Start(1000);

//Вывод данных
setInterval(() => {
  console.log((ch0.Value).toFixed(2) + " C");
  console.log((ch1.Value).toFixed(2) + " kPa");
}, 1000);
```
</div>