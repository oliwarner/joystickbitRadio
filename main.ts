//% color=#0fbc11 icon="\uf11b"
//% block="JoystickBit Radio"
namespace joystickbitRadio {

    let _x = 0
    let _y = 0

    let _c = false
    let _d = false
    let _e = false
    let _f = false

    let _mapMin = 0
    let _mapMax = 4
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
    const BUTTON_C = 16
    const BUTTON_D = 17
    const BUTTON_E = 18
    const BUTTON_F = 19

    export enum Button {
        //% block="C"
        C = 0,
        //% block="D"
        D = 1,
        //% block="E"
        E = 2,
        //% block="F"
        F = 3
    }


    /**
     * Returns the current joystick state as a packed integer.
     */
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

    /**
     * Configure the translated joystick range and centre deadzone.
     *
     * For example:
     * initialize(0, 4, 10)
     *
     * gives a 5x5 grid from 0 to 4, with a deadzone
     * of 10 raw joystick units around the centre.
     */
    //% block="initialize joystick mapping from $min to $max with deadzone $deadzone"
    //% min.defl=0 max.defl=4 deadzone.defl=10
    export function initialize(min: number, max: number, deadzone: number): void {
        _mapMin = min
        _mapMax = max
        _deadzone = deadzone
    }

    function translateAxis(value: number, center: number): number {
        let outputCenter = (_mapMin + _mapMax) / 2

        // Centre deadzone always returns the exact centre value.
        if (Math.abs(value - center) <= _deadzone)
            return Math.round(outputCenter)

        // Lower half of the physical joystick range.
        if (value < center - _deadzone)
            return Math.round(Math.map(value, 0, center - _deadzone, _mapMax, outputCenter))

        // Upper half of the physical joystick range.
        return Math.round(Math.map(value, center + _deadzone, 255, outputCenter, _mapMin))
    }

    function toMotorValue(value: number, center: number): number {
        if (Math.abs(value - center) <= _deadzone)
            return 0

        if (value < center - _deadzone)
            return Math.round(Math.map(value, 0, center + _deadzone, -255, 0))

        return Math.round(Math.map(value, center - _deadzone, 255, 0, 255))
    }

    function updateTracks(rawX: number, rawY: number): void {
        let turn = toMotorValue(rawX, _centerX)
        let drive = toMotorValue(rawY, _centerY)
        let left = (drive - turn)
        let right = (drive + turn)
        let maximum = Math.max(Math.abs(left), Math.abs(right))

        if (maximum > 255) {
            left = Math.idiv(left * 255, maximum)
            right = Math.idiv(right * 255, maximum)
        }

        _leftTrack = left
        _rightTrack = right
    }

    /**
     * Decode a packed joystick value.
     */
    //% block="decode joystick $value"
    export function decode(value: number): void {
        let rawX = value & 0xFF
        let rawY = (value >> 8) & 0xFF

        _x = translateAxis(rawX, _centerX)
        _y = translateAxis(rawY, _centerY)
        updateTracks(rawX, rawY)

        _c = (value & (1 << 16)) != 0
        _d = (value & (1 << 17)) != 0
        _e = (value & (1 << 18)) != 0
        _f = (value & (1 << 19)) != 0


        if (c && !_previousC) control.raiseEvent(EVENT_SOURCE, Button.C)
        if (d && !_previousD) control.raiseEvent(EVENT_SOURCE, Button.D)
        if (e && !_previousE) control.raiseEvent(EVENT_SOURCE, Button.E)
        if (f && !_previousF) control.raiseEvent(EVENT_SOURCE, Button.F)

        _previousC = c
        _previousD = d
        _previousE = e
        _previousF = f
    }

    //% block="joystick X"
    export function x(): number { return _x }

    //% block="joystick Y"
    export function y(): number { return _y }

    //% block="joystick button $button is pressed"
    export function button(button: Button): boolean {
        if (button == Button.C) return _c
        if (button == Button.D) return _d
        if (button == Button.E) return _e

        return _f
    }

    //% block="left track speed"
    export function leftTrack(): number { return _leftTrack }

    //% block="right track speed"
    export function rightTrack(): number { return _rightTrack }

    //% block="on joystick button $button pressed"
    export function onButtonPressed(button: Button, handler: () => void): void {
        control.onEvent(EVENT_SOURCE, button, handler)
    }
}