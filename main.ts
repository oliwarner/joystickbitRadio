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

    // These are the actual centre readings of the joystick.
    let _centerX = 130
    let _centerY = 130

    // tank controls
    let _leftTrack = 0
    let _rightTrack = 0


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
        if (value < center - _deadzone) {
            return Math.round(Math.map(
                value,
                0,
                center - _deadzone,
                _mapMax,
                outputCenter
            ))
        }

        // Upper half of the physical joystick range.
        return Math.round(Math.map(
            value,
            center + _deadzone,
            255,
            outputCenter,
            _mapMin
        ))
    }

    function toMotorValue(value: number): number {
        let center = (_mapMin + _mapMax) / 2
        if (value < center)
            return Math.round(Math.map(value, _mapMin, center, -255, 0))
        return Math.round(Math.map(value, center, _mapMax, 0, 255))
    }

    function updateTracks(x: number, y: number): void {
        let turn = toMotorValue(x)
        let drive = toMotorValue(y)

        let left = drive + turn
        let right = drive - turn

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
        updateTracks(_x, _y)

        _c = (value & (1 << 16)) != 0
        _d = (value & (1 << 17)) != 0
        _e = (value & (1 << 18)) != 0
        _f = (value & (1 << 19)) != 0
    }

    //% block="joystick X"
    export function x(): number { return _x }

    //% block="joystick Y"
    export function y(): number { return _y }

    //% block="button C"
    export function c(): boolean { return _c }

    //% block="button D"
    export function d(): boolean { return _d }

    //% block="button E"
    export function e(): boolean { return _e }

    //% block="button F"
    export function f(): boolean { return _f }

    //% block="left track speed"
    export function leftTrack(): number {
        return _leftTrack
    }

    //% block="right track speed"
    export function rightTrack(): number {
        return _rightTrack
    }
}