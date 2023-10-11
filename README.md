# ModuleMeteoLPS25HB
<p align="center">
  <img src="./res/logo.png" width="400" title="hover text">
</p>

-----------------

# Лицензия
////

# Описание
<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px; color: #555">

Модуль предназначен для работы с метеодатчиком на базе чипа [LPS25HB](https://github.com/AlexGlgr/ModuleMeteoLPS25HB/blob/fork-Alexander/res/lps25hb.pdf). Модуль является неотъемлемой частью фреймворка EcoLite. Датчик на базе чипа LPS25HB позволяет получить данные о температуре, атмосферном давлении и относительной высоте. Модуль работает по интерфейсу I2C. Модуль имеет следующие архитектурные решения фреймворка EcoLite:
- является потомком класса [ClassMiddleSensor](https://github.com/Nicktonious/ModuleSensorArchitecture/blob/main/README.md);
- создаёт шину через глобальный объект [I2Cbus](https://github.com/AlexGlgr/ModuleBaseI2CBus/blob/fork-Alexander/README.md);
- при проверке валидности данных использует ошибку класса [Error](https://github.com/Konkery/ModuleAppError/blob/main/README.md);
- при проверке переменной на целочисленное использует класс [NumIs](https://github.com/Konkery/ModuleAppMath/blob/main/README.md).
 
 Количество каналов для снятия данных - 3. Типовая погрешность измерений датчика: 10 Pa для давления (см. документацию).

### Конструктор
Конструктор принимает один объект типа **SensorOptsType** и один объект типа [**SensorOptsType**](https://github.com/Nicktonious/ModuleSensorArchitecture/blob/main/README.md).
```js
let _sensor_props = {
    name: "LPS25HB",
    type: "sensor",
    channelNames: ['temperature', 'pressure'],
    typeInSignal: "analog",
    typeOutSignal: "digital",
    quantityChannel: 3,
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

### Поля
- <mark style="background-color: lightblue">_name</mark> - имя класса в строковом виде;
- <mark style="background-color: lightblue">_sensor</mark> - объект базового класса;
- <mark style="background-color: lightblue">_minPeriod</mark> - минимальная частота опроса датчика - 1000 мс;
- <mark style="background-color: lightblue">_usedChannels</mark> - используемые каналы данных по нотации архитектуры фреймворка EcoLite;
- <mark style="background-color: lightblue">_calPressure</mark> - установленное атмосферное давление на нуле метров над уровнем моря;
- <mark style="background-color: lightblue">_interval</mark> - функция SetInterval для опроса датчика.

### Методы
- <mark style="background-color: lightblue">Init(_sensor_props)</mark> - необходим для первоначальной настройки датчика;
- <mark style="background-color: lightblue">Start(_num_channel, _period)</mark> - запускает циклический опрос заданного канала датчика. Переданное значение периода сверяется с минимальным значением хранящимся в поле *_minPeriod* и, если требуется, регулируется;
- <mark style="background-color: lightblue">SetDefaultPressure(pressure)</mark> - устанавливает значение поля _calPressure;
- <mark style="background-color: lightblue">ChangeFreq(_num_channel, _period)</mark> - останавливает опрос заданного канала и запускает его вновь с уже новой частотой;
- <mark style="background-color: lightblue">Stop(_num_channel)</mark> - прекращает считывание значений с заданного канала.

### Возвращаемые данные
Модуль предоставляет данные об атмосферном давлении в **килопаскалях**. Для перевода этих значений в другие метрики можно воспользоваться следующим формулам:
- В мм рт ст: p = p0 * 7,501;
- В Бары: p = p0 / 100;


### Примеры
Фрагмент кода для вывода данных о давлении и температуре в консоль раз в одну секунду. Предполагается, что все необходимые модули уже загружены в систему:
```js
//Подключение необходимых модулей
const ClassI2CBus = require("ClassBaseI2CBus.js");
const err = require("ModuleAppError.js");
const NumIs = require("ModuleAppMath.js");
     NumIs.is(); //добавить функцию проверки целочисленных чисел в Number

//Создание I2C шины
let I2Cbus = new ClassI2CBus();
let bus = I2Cbus.AddBus({sda: B9, scl: B8, bitrate: 400000}).IDbus;

//Настройка передаваемых объектов
const Lps = require("ClassLPS25HB.js");
let opts = {pins: [B9, B8], bus: bus, address: 0x5C, quantityChannel: 3};
let sensor_props = {
    name: "LPS25HB",
    type: "sensor",
    channelNames: ['temperature', 'pressure'],
    typeInSignal: "analog",
    typeOutSignal: "digital",
    quantityChannel: 3,
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
const ch2 = baro.GetChannel(2);

//Создание каналов
ch0.Start(1000);
ch1.Start(1000);
ch2.Start(1000);

//Вывод данных
setInterval(() => {
  console.log(`Temperature: ${(ch0.Value).toFixed(2)} C    Pressure: ${(ch1.Value).toFixed(3)} kPa    Altitude: ${sum.toFixed(2)} m`);
}, 1000);
```
Вывод данных в консоль:
<p align="left">
  <img src="./res/output.png" title="hover text">
</p>

# Зависимости
- <mark style="background-color: lightblue">[**ClassBaseI2CBus**](https://github.com/AlexGlgr/ModuleBaseI2CBus/blob/fork-Alexander/README.md)</mark>
- <mark style="background-color: lightblue">[**ModuleAppError**](https://github.com/Konkery/ModuleAppError/blob/main/README.md)</mark>
- <mark style="background-color: lightblue">[**ModuleAppMath**](https://github.com/Konkery/ModuleAppMath/blob/main/README.md)</mark>
</div>