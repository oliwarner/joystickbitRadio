//% color=#0fbc11 icon="\uf11b"
//% block="JoystickBit Radio"
//% groups='["Transmitter", "Receiver"]'
namespace joystickbitRadio {

    let _x = 0
    let _y = 0

    let _c = false
    let _d = false
    let _e = false
    let _f = false

    let _deadzone = 10
    let _centerX = 130
    let _centerY = 130

    // tank controls
    let _leftTrack = 0
    let _rightTrack = 0

    // event
    const EVENT_SOURCE = 9876  // should be unique?!
    let _previousC = false
    let _previousD = false
    let _previousE = false
    let _previousF = false

    export enum Button {
        //% block="C"
        C = 1,
        //% block="D"
        D = 2,
        //% block="E"
        E = 3,
        //% block="F"
        F = 4
    }

    /**
     * Returns the current joystick state as a packed integer.
     */
    //% group="Transmitter"
    //% block="joystick bitmask"
    export function bitmask(): number {
        let value = 0

        value |= Math.idiv(joystickbit.getRockerValue(joystickbit.rockerType.X), 4)
        value |= Math.idiv(joystickbit.getRockerValue(joystickbit.rockerType.Y), 4) << 8

        if (joystickbit.getButton(joystickbit.JoystickBitPin.P12))
            value |= 1 << 16

        if (joystickbit.getButton(joystickbit.JoystickBitPin.P13))
            value |= 1 << 17

        if (joystickbit.getButton(joystickbit.JoystickBitPin.P14))
            value |= 1 << 18

        if (joystickbit.getButton(joystickbit.JoystickBitPin.P15))
            value |= 1 << 19

        return value
    }

    //% block="initialize joystick receiver with deadzone $deadzone"
    //% group="Receiver"
    //% weight=1
    //% deadzone.defl=10
    export function initialize(deadzone: number): void {
        _deadzone = deadzone
    }

    //% block="decode joystick radio packet $value"
    //% group="Receiver"
    //% weight=2
    export function decode(value: number): void {
        _x = value & 0xFF
        _y = (value >> 8) & 0xFF
        _c = (value & (1 << 16)) != 0
        _d = (value & (1 << 17)) != 0
        _e = (value & (1 << 18)) != 0
        _f = (value & (1 << 19)) != 0

        if (_c && !_previousC) control.raiseEvent(EVENT_SOURCE, Button.C)
        if (_d && !_previousD) control.raiseEvent(EVENT_SOURCE, Button.D)
        if (_e && !_previousE) control.raiseEvent(EVENT_SOURCE, Button.E)
        if (_f && !_previousF) control.raiseEvent(EVENT_SOURCE, Button.F)

        _previousC = _c
        _previousD = _d
        _previousE = _e
        _previousF = _f
    }

    //% block="with coordinates"
    //% group="Receiver"
    //% weight=10
    //% handlerStatement
    //% draggableParameters="reporter"
    export function withCoordinates(handler: (x: number, y: number) => void) {
        handler(_x, _y);
    }

    function translateAxis(value: number, min: number, max: number, center: number): number {
        let outputCenter = (min + max) / 2

        if (Math.abs(value - center) <= _deadzone)
            return Math.round(outputCenter)

        if (value < center - _deadzone)
            return Math.round(Math.map(value, 0, center - _deadzone, max, outputCenter))

        return Math.round(Math.map(value, center + _deadzone, 255, outputCenter, min))
    }

    //% block="with translated coordinates x $xMin to $xMax y $yMin to $yMax"
    //% group="Receiver"
    //% weight=11
    //% handlerStatement
    //% draggableParameters="reporter"
    //% xMin.defl=0
    //% xMax.defl=100
    //% yMin.defl=0
    //% yMax.defl=100
    export function withTranslatedCoordinates(xMin: number, xMax: number, yMin: number, yMax: number, handler: (x: number, y: number) => void) {
        handler(
            translateAxis(_x, xMin, xMax, _centerX),
            translateAxis(_y, yMin, yMax, _centerY)
        )
    }

    function toMotorValue(value: number, center: number): number {
        if (Math.abs(value - center) <= _deadzone)
            return 0

        if (value < center - _deadzone)
            return Math.round(Math.map(value, 0, center + _deadzone, -255, 0))

        return Math.round(Math.map(value, center - _deadzone, 255, 0, 255))
    }

    //% block="with tank tracks"
    //% group="Receiver"
    //% weight=12
    //% handlerStatement
    //% draggableParameters="reporter"
    export function withTrackSpeeds(handler: (left: number, right: number) => void) {
        let turn = toMotorValue(_x, _centerX)
        let drive = toMotorValue(_y, _centerY)
        let left = (drive - turn)
        let right = (drive + turn)
        let maximum = Math.max(Math.abs(left), Math.abs(right))

        if (maximum > 255) {
            left = Math.idiv(left * 255, maximum)
            right = Math.idiv(right * 255, maximum)
        }

        handler(left, right)
    }

    //% block="on joystick button $button pressed"
    //% weight=20
    export function onButtonPressed(button: Button, handler: () => void): void {
        control.onEvent(EVENT_SOURCE, button, handler)
    }

    //% block="joystick button $button is pressed"
    //% weight=21
    export function button(button: Button): boolean {
        if (button == Button.C) return _c
        if (button == Button.D) return _d
        if (button == Button.E) return _e
        return _f
    }
}