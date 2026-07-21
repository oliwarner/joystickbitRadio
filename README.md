# Joystick Radio

A MakeCode extension that packs the state of a Kitronik Joystick:Bit into a single integer for transmission over the micro:bit radio.

## Features

- Encode joystick X and Y positions
- Encode buttons C, D, E and F
- Decode a received radio number back into joystick values

## Sender

```blocks
radio.sendNumber(joystickRadio.bitmask())
```

## Receiver

```blocks
radio.onReceivedNumber(function (value) {
    joystickRadio.decode(value)

    if (joystickRadio.c()) {
        basic.showIcon(IconNames.Heart)
    }
})
```

Use

- `joystickRadio.x()`
- `joystickRadio.y()`
- `joystickRadio.c()`
- `joystickRadio.d()`
- `joystickRadio.e()`
- `joystickRadio.f()`

after calling `decode()`.

## License

MIT