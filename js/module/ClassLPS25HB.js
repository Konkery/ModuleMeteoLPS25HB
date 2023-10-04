const ClassMiddleSensor = require("ClassSensorArchitecture");
/**
 * @class
 * Модуль реализует базовые функции метеодатчика на базе чипа LPS25HB,
 * возращающего данные о температуре и атмосферном давлении
 */
class ClassLPS25HB extends ClassMiddleSensor {
    /**
     * @constructor
     * @param {Object} _opts   - Объект с параметрами по нотации ClassMiddleSensor
     */
    constructor(_opts, _sensor_props) {
        ClassMiddleSensor.apply(this, [_opts, _sensor_props]);
        this._name = 'BaseClassLPS25HB'; //переопределяем имя типа
		this._sensor = require("BaseClassLPS25HB").connect({i2c: _opts.bus, address: _opts.address});
        this._minPeriod = 1000;
        this._usedChannels = [];
        this._interval;
        this._calPressure;
        this.Init(_sensor_props);
    }
    /**
     * @method
     * Инициализирует датчик
     */
    Init(_sensor_props) {
        super.Init(_sensor_props);
        this._sensor.init();
        this._calPressure = this._sensor.pressure() * 10;
    }
    /**
     * @method
     * Запускает сбор данных с датчика и передачи их в каналы
     * @param {Number} _period          - частота опроса (минимум 1000 мс)
     * @param {Number} _num_channel     - номер канала
     */
    Start(_num_channel, _period) {
        let period = (typeof _period === 'number' & _period >= this._minPeriod) ? _period    //частота сверяется с минимальной
                 : this._minPeriod;

        if (!this._usedChannels.includes(_num_channel)) this._usedChannels.push(_num_channel); //номер канала попадает в список опрашиваемых каналов. Если интервал уже запущен с таким же периодои, то даже нет нужды его перезапускать 
        if (!this._interval) {          //если в данный момент не ведется ни одного опроса
            this._interval = setInterval(() => {
                if (this._usedChannels.includes(0)) this.Ch0_Value = this._sensor.temp();
                if (this._usedChannels.includes(1)) this.Ch1_Value = this._sensor.pressure();
                if (this._usedChannels.includes(2)) this.Ch2_Value = (1 - ((this.Ch1_Value * 10) / this._calPressure) ** 0.190263) * 44330.8;
            });
        }     
        this._currentPeriod = period;
    }

    /**
     * @method
     * Меняет частоту опроса датчика
     * @param {Number} freq     - новая частота опроса (минимум 1000 мс)
     */
    ChangeFreq(_num_channel, freq) {
        clearInterval(this._interval);
        setTimeout(() => this.Start(freq), this._minfrequency);
    }

    /**
     * @methhod
     * Останавливает сбор данных с датчика
     * @param {Number} _num_channel   - номер канала, в который должен быть остановлен поток данных
     */
    Stop(_num_channel) {
        if (_num_channel) this._usedChannels.splice(this._usedChannels.indexOf(_num_channel));
        else {
            this._usedChannels = [];
            clearInterval(this._interval);
            this._interval = null;
        }
    }
}
	

exports = ClassLPS25HB;