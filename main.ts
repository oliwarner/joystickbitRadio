//% color=#0fbc11 icon="\uf11b"
//% block="JoystickBit Radio"
namespace joystickbitRadio {

    let _x = 0
    let _y = 0

    let _c = false
    let _d = false
    let _e = false
    let _f = false

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

    //% block="decode joystick %value"
    export function decode(value: number): void {

        _x = value & 0xFF
        _y = (value >> 8) & 0xFF

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
}