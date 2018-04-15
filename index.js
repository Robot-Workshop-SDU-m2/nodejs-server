var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SerialPort = require('serialport');

var counter = 0;
var port;
SerialPort.list().then(
    data => {
        for(var i = 0; i < data.length; i++){
            if(data[i].manufacturer == 'FTDI'){
                 port = new SerialPort(data[i].comName,{baudRate: 115200}, function (err) {
                    if (err) {
                        return console.log('Error: ', err.message);
                    }
                });
                port.on('data', buf => {
                   strings = buf.toString().split('\n');
                   strings.forEach(str =>{
                    console.log(counter++ + " : " + str);
                   });
                });
            }
        }
        if(data.length = 0){
            console.log('No devices found');
        }
    }
);

app.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
console.log("User connected");
socket.on('chat message', function(msg){
    console.log(msg);
    io.emit("chat message", msg);
    port.write(msg + '\n');
});

});

http.listen(3000, function(){
console.log('listening on *:3000');
});

