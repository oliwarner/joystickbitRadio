radio.setGroup(42)

basic.forever(function () {

    radio.sendNumber(joystickRadio.bitmask())

    basic.pause(20)
})

radio.onReceivedNumber(function (value) {

    joystickRadio.decode(value)

    serial.writeLine(
        "X=" + joystickRadio.x() +
        " Y=" + joystickRadio.y() +
        " C=" + joystickRadio.c() +
        " D=" + joystickRadio.d() +
        " E=" + joystickRadio.e() +
        " F=" + joystickRadio.f()
    )
})