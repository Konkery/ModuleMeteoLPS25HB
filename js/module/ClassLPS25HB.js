const ClassMiddleSensor = require('ClassSensorArchitecture');
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
        this._Name = 'BaseClassLPS25HB'; //переопределяем имя типа
		this._Sensor = require('BaseClassLPS25HB').connect({i2c: _opts.bus, address: _opts.address});
        this._MinPeriod = 125;
        this._UsedChannels = [];
        this._Interval;
        this._CalPressure;
        this.Init(_sensor_props);
    }
    /**
     * @method
     * Инициализирует датчик
     */
    Init(_sensor_props) {
        super.Init(_sensor_props);
        this._Sensor.init();
        this.SetDefaultPressure (this._Sensor.pressure());
    }
    /**
     * @method
     * Запускает сбор данных с датчика и передачи их в каналы
     * @param {Number} _period          - частота опроса (минимум 1000 мс)
     * @param {Number} _num_channel     - номер канала
     */
    Start(_num_channel, _period) {
        let period = (typeof _period === 'number' & _period >= this._MinPeriod) ? _period    //частота сверяется с минимальной
                 : this._MinPeriod;

        if (!this._UsedChannels.includes(_num_channel)) this._UsedChannels.push(_num_channel); //номер канала попадает в список опрашиваемых каналов. Если интервал уже запущен с таким же периодои, то даже нет нужды его перезапускать 
        if (!this._Interval) {          //если в данный момент не ведется ни одного опроса
            this._Interval = setInterval(() => {
                if (this._UsedChannels.includes(0)) this.Ch0_Value = this._Sensor.temp();
                if (this._UsedChannels.includes(1)) this.Ch1_Value = this._Sensor.pressure();
                if (this._UsedChannels.includes(2)) this.Ch2_Value = (this._CalPressure - (this.Ch1_Value * 7.501)) * 10.5;
            });
        }
    }

    SetDefaultPressure(pressure)
    {
        this._CalPressure = pressure * 7.501;
    }
    /**
     * @method
     * Меняет частоту опроса датчика
     * @param {Number} freq     - новая частота опроса (минимум 1000 мс)
     */
    ChangeFreq(_num_channel, freq) {
        clearInterval(this._Interval);
        setTimeout(() => this.Start(freq), this._Minfrequency);
    }
    /**
     * @methhod
     * Останавливает сбор данных с датчика
     * @param {Number} _num_channel   - номер канала, в который должен быть остановлен поток данных
     */
    Stop(_num_channel) {
        if (_num_channel) this._UsedChannels.splice(this._UsedChannels.indexOf(_num_channel));
        else {
            this._UsedChannels = [];
            clearInterval(this._Interval);
            this._Interval = null;
        }
    }
}
	

exports = ClassLPS25HB;