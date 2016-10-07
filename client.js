"use strict";
const io = require('socket.io-client');
const OWIArm = require('./arm.js');

const arm = new OWIArm();

arm.connect();

const socket = io('https://arm.paulvarache.ninja');

socket.on('connect', e => {
    console.log('connected');
});

function blink(interval) {
    arm.run('LIGHT_ON', interval)
        .then(arm.run.bind(arm, 'LIGHT_OFF', interval))
        .then(arm.run.bind(arm, 'LIGHT_ON', interval))
        .then(arm.run.bind(arm, 'LIGHT_OFF', interval))
        .then(arm.run.bind(arm, 'LIGHT_ON', interval))
        .then(arm.run.bind(arm, 'LIGHT_OFF', interval))
        .then(arm.run.bind(arm, 'LIGHT_ON', interval));
}

function wave() {
    arm.run('BASE_CCW', 800)
        .then(arm.run.bind(arm, 'BASE_CW', 800))
        .then(arm.run.bind(arm, 'BASE_CCW', 800));
}

function defaultAction() {
    arm.run('SHOULDER_UP', 1000)
        .then(arm.run.bind(arm, 'SHOULDER_DOWN', 1000))
        .then(arm.run.bind(arm, 'SHOULDER_UP', 1000));
}

socket.on('arm', d => {
    let action = d.params[0];
    switch (action) {
        case 'wave': {
            wave();
            break;
        }
        case 'blink': {
            blink(parseInt(d.params[1]));
            break;
        }
        case 'shoulder': {
            let direction = d.params[1] || 'down',
                duration = d.params[2] ? parseInt(d.params[2]) : 500;
            arm.run(`SHOULDER_${direction.toUpperCase()}`, duration).then();
            break;
        }
        case 'rotate': {
            let direction = d.params[1] === 'left' ? 'CCW' : 'CW',
                duration = d.params[2] ? parseInt(d.params[2]) : 500;
            arm.run(`BASE_${direction.toUpperCase()}`, duration).then();
            break;
        }
        case 'elbow': {
            let direction = d.params[1] === 'up' ? 'UP' : 'DOWN',
                duration = d.params[2] ? parseInt(d.params[2]) : 500;
            arm.run(`ELBOW_${direction.toUpperCase()}`, duration).then();
            break;
        }
        case 'wrist': {
            let direction = d.params[1] === 'up' ? 'UP' : 'DOWN',
                duration = d.params[2] ? parseInt(d.params[2]) : 500;
            arm.run(`WRIST_${direction.toUpperCase()}`, duration).then();
            break;
        }
        case 'extend': {
            let duration = d.params[2] ? parseInt(d.params[2]) : 500;
            arm.run(['ELBOW_DOWN', 'SHOULDER_DOWN'], duration).then();
            break;
        }
        case 'contract': {
            let duration = d.params[2] ? parseInt(d.params[2]) : 500;
            arm.run(['ELBOW_UP', 'SHOULDER_UP'], duration).then();
            break;
        }
        default: {
            defaultAction();
        }
    }
});

function stay () {
    setTimeout(stay, 2000);
}

stay();