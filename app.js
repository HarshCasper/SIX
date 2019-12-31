const SocketServer = require('ws').Server;
const express = require('express');
const path = require('path');
var cid = 1;
const PORT = process.env.PORT || 3000;
var messages = [];

const app = express()
  .use(express.static("./public"))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server:app });

wss.on('connection', function(ws) {
  ws.send('<span class="serv-label">Server> </span>You are inside the SIX Chat Room.');
  ws.send("<span class='serv-label'>Server> </span>Please Set your 'username:&lt;nick&gt;' to set an anonymous alias else your default alias will be anon(id)");
  ws.send("<span class='serv-label'>Server> </span>Use Shift+Enter if you are writing a multiline message.");
  ws.send("<span class='serv-label'>Server> </span>Use 'exit' to disconnect from the Server.");
  ws.send("<span class='serv-label'>Server> </span>The Chat Log is cleared every 10 Minutes. None of your messages will be stored with us 😊");
  ws.id = 'anon' + cid;
  cid++;
  messages.forEach(function(msg) {
    ws.send(msg);
  });
  ws.on('message', function(message) {
    if (message === 'exit') {
      messages.push(`Client ${ws.id} Disconnected`);
      sendToAll(`Client ${ws.id} Disconnected`);
      ws.close();
    } else if (message.indexOf('username:') != -1) {
      var prev = ws.id;
      ws.id = message.split(':')[1];
      messages.push(`Client ${prev} changed nickname to ${ws.id}`);
      sendToAll(`Client ${prev} changed nickname to ${ws.id}`);
    }else {
      messages.push(`<span class="label">${ws.id}> </span><pre class="usr-msg">${message}</pre>`);
      sendToAll(`<span class="label">${ws.id}> </span><pre class="usr-msg">${message}</pre>`);
    }
  });
  setInterval(()=>{
    messages=[];
    wss.clients.forEach(function(client) {
      client.send('clear');
      ws.send('<span class="serv-label">Server> </span>You are inside the SIX Chat Room.');
      ws.send("<span class='serv-label'>Server> </span>Please Set your 'username:&lt;nick&gt;' to set an anonymous alias else your default alias will be anon(id)");
      ws.send("<span class='serv-label'>Server> </span>Use Shift+Enter if you are writing a multiline message.");
      ws.send("<span class='serv-label'>Server> </span>Use 'exit' to disconnect from the Server.");
      ws.send("<span class='serv-label'>Server> </span>The Chat Log is cleared every 10 Minutes. None of your messages will be stored with us 😊");
    });
  },600000);
});

function sendToAll(message) {
  wss.clients.forEach(function(client) {
    client.send(message);
  });
}
