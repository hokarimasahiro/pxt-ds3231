/**
 * makecode RTC(DS3231) Package.
 */
enum clockData {
    // % block="年"
    year = 0,
    // % block="月"
    month = 1,
    // % block="日"
    day = 2,
    // % block="曜日"
    weekday = 3,
    // % block="時"
    hour = 4,
    // % block="分"
    minute = 5,
    // % block="秒"
    second = 6
}

/**
 * RTC block
 */
//% weight=10 color=#800080 icon="\uf017" block="DS3231"
namespace ds3231 {

    let I2C_ADDR = 0x68
    let REG_CTRL = 0x0e
    let REG_SECOND = 0x00
    let dateTime=[0,0,0,0,0,0,0];     // year,month,day,weekday,hour,minute,second
    let initFlag=0;
    /**
     * set reg
     */
    function setReg(reg: number, dat: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = dat;
        pins.i2cWriteBuffer(I2C_ADDR, buf);
    }

    /**
     * get reg
     */
    function getReg(reg: number): number {
        pins.i2cWriteNumber(I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(I2C_ADDR, NumberFormat.UInt8BE);
    }

    /**
     * convert a BCD data to Dec
     */
    function HexToDec(dat: number): number {
        return (dat >> 4) * 10 + (dat & 0x0f);
    }

    /**
     * convert a Dec data to BCD
     */
    function DecToHex(dat: number): number {
        return Math.trunc(dat / 10) << 4 | (dat % 10)
    }

    /**
     * init device
     */
    //% blockId="initDevice" block="init device"
    export function initDevice(): void {

		if (initFlag == 0){
	        setReg(REG_CTRL, 0x1c)
	        initFlag=1;
		}
    }
    /**
     * set clock
     */
    //% blockId="setClock" block="set clock"
    export function setClock(): void {

        initDevice();
    
        let buf = pins.createBuffer(8);
    
        buf[0] = REG_SECOND;
        buf[1] = DecToHex(dateTime[6]);
        buf[2] = DecToHex(dateTime[5]);
        buf[3] = DecToHex(dateTime[4]);
        buf[4] = DecToHex(dateTime[3] + 1);
        buf[5] = DecToHex(dateTime[2]);
        buf[6] = DecToHex(dateTime[1]);
        buf[7] = DecToHex(dateTime[0] % 100);

        pins.i2cWriteBuffer(I2C_ADDR, buf)
    }
    /**
     * get clock
     */
    //% blockId="getClock" block="get clock"
    export function getClock(): void {

        initDevice();
        
        pins.i2cWriteNumber(I2C_ADDR, REG_SECOND, NumberFormat.UInt8BE);
        let buf = pins.i2cReadBuffer(I2C_ADDR, 8);

        dateTime[0] = HexToDec(buf[6])            	// year
        dateTime[1] = HexToDec(buf[5] & 0x1f)    	// month
        dateTime[2] = HexToDec(buf[4] & 0x3f)       // day
        dateTime[3] = HexToDec(buf[3] & 0x07) - 1;	// weekday
        dateTime[4] = HexToDec(buf[2] & 0x3f)     	// hour
        dateTime[5] = HexToDec(buf[1] & 0x7f)   	// minute
        dateTime[6] = HexToDec(buf[0] & 0x7f)   	// second
    }

    /**
     * setClockData
     * @param dt clockData
     * @param n data, eg:8
     */
    //% blockId="setClockData" block="set %clockData to %n"
    export function setClockData(dt: clockData,n:number): void {
        dateTime[dt]=n;
    }

    /**
     * getClockData
     * @param dt clockData
     */
    //% blockId="getClockData" block="%clockData"
    export function getClockData(dt: clockData): number {
        return dateTime[dt];
    }
}
