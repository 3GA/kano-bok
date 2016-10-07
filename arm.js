"use strict";
const usb = require('usb');

const VENDOR_ID = 0x1267;
const PRODUCT_ID = 0x000;
const REQUEST_TYPE = 0x40;
const REQUEST = 6;
const W_VALUE = 0x100;
const W_INDEX = 0;

const CMD_MAP = {
    BASE_CCW: [0, 1, 0],
    BASE_CW: [0, 2, 0],
    SHOULDER_UP: [64, 0, 0],
    SHOULDER_DOWN: [128, 0, 0],
    ELBOW_UP: [16, 0, 0],
    ELBOW_DOWN: [32, 0, 0],
    WRIST_UP: [4, 0, 0],
    WRIST_DOWN: [8, 0, 0],
    GRIP_OPEN: [2, 0, 0],
    GRIP_CLOSE: [1, 0, 0],
    LIGHT_ON: [0, 0, 1],
    LIGHT_OFF: [0, 0, 0]
}


class OWIArm {
    
    constructor () {

    }

    connect () {
        this.driver = usb.findByIds(VENDOR_ID, PRODUCT_ID);
        this.driver.open();
    }

    _wait (d) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, d);
        });
    }

    _sendCmd (cmd) {
        return new Promise((resolve, reject) => {
            let arr = new Uint8Array(3);
            arr[0] = cmd[0];
            arr[1] = cmd[1];
            arr[2] = cmd[2];
            const buffer = Buffer.from(arr);
            this.driver.controlTransfer(REQUEST_TYPE, REQUEST, W_VALUE, W_VALUE, buffer, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    stop () {
        return this._sendCmd([0, 0, 0]);
    }

    run (cmds, d) {
        cmds = Array.isArray(cmds) ? cmds : [cmds];
        let arr;
        const cmd = cmds.reduce((acc, cmd) => {
            arr = CMD_MAP[cmd];
            acc[0] += arr[0];
            acc[1] += arr[1];
            acc[2] += arr[2];
            return acc;
        }, [0, 0, 0]);
        return this._sendCmd(cmd)
            .then(this._wait.bind(this, d))
            .then(this.stop.bind(this));
    }
}

module.exports = OWIArm;