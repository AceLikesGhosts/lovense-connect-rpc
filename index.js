const readline = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const APP_ID = '1203106909880848505';
const ICON_ID = 'icon';

const TOY_NAME = 'Max 2';

const joinSecret = '3an9g4mmpna4tg39v';
const matchSecret = 'xyzzy';

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

const partyId = generateUUID();

const rpc = require('discord-rpc');
const client = new rpc.Client({ transport: 'ipc' });

rpc.register(APP_ID);

function setActivity() {
    client.setActivity({
        joinSecret,
        largeImageKey: ICON_ID,
        largeImageText: 'App v1.2.2',
        startTimestamp: new Date(),
        partyId,
        partySize: 1,
        partyMax: 2,
        instance: true,
        matchSecret,
        details: 'Controlling '.concat(TOY_NAME),
    });
}

client.on('ready', () => {
    console.log('ready');

    client.subscribe('ACTIVITY_JOIN').catch(console.log);
    client.subscribe('ACTIVITY_JOIN_REQUEST').catch(console.log);

    setTimeout(() => {
        setActivity();
    }, 500);
});

// discord doesnt emit this unless you let them extort you its fucking gay
// tldr you have to pay for their actual RPC thing for games
// and its a deprecated feature 😭
client.on('GAME_JOIN', (args) => {
    console.log('ACTIVITY_JOIN');
    console.log(args);
    console.log('------');
});

client.on('ACTIVITY_JOIN_REQUEST', ({user}) => {
    // client.closeJoinRequest(user);
    console.log(user);
    readline.question(`${user.username}#${user.discriminator} (${user.global_name}) requested to join deny?`, (answer) => {
        answer = answer.toLowerCase();
        if(!answer || answer === 'no' || answer === 'n' || answer === 'd' || answer === 'deny') {
            client.closeJoinRequest(user.id);
            console.log(`Denied ${user.global_name}'s join request`);
            return;
        }

        if(answer === 'yes' || answer === 'y' || answer === 'yeah') {
            client.sendJoinInvite(user.id).catch(console.log);
            console.log(`Accepted ${user.global_name}'s request to join`);
        }
    });
});

client.login({ clientId: APP_ID });
