var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SerialPort = require('serialport');

var counter = 0;
var port;

var choords = [[2000,0,0],[1950,0,0],[1900,0,0],[1850,0,0],[1800,0,0],[1750,0,0],[1700,0,0],[1750,0,0],[1800,0,0],[1850,0,0],[1900,0,0],[1950,0,0]];
var pointer = 0;
var clength = choords.length;

SerialPort.list().then(
    data => {
        for(var i = 0; i < data.length; i++){
            if(data[i].manufacturer == 'FTDI'){
                 port = new SerialPort(data[i].comName,{baudRate: 500000}, function (err) {
                    if (err) {
                        return console.log('Error: ', err.message);
                    }
                });
                port.on('data', buf => {
                   strings = buf.toString().split('\n');
                   strings.forEach(str =>{
                    if(str.length != 0){
                        console.log(counter++ + " : " + str.length + " : " + str );
                        if(str == 'OK'){
                            pointer = (pointer+1)%clength;
                            console.log("G0;" + choords[pointer][0] + ";" + choords[pointer][1] + ";" + choords[pointer][2] + ";\n");
                            port.write("G0;" + choords[pointer][0] + ";" + choords[pointer][1] + ";" + choords[pointer][2] + ";\n");
                        }
                    }
                   });
                });
                /*port.write("G0;" + choords[pointer][0] + ";" + choords[pointer][1] + ";" + choords[pointer][2] + ";\n");
                pointer = (pointer+1)%clength;
                port.write("G0;" + choords[pointer][0] + ";" + choords[pointer][1] + ";" + choords[pointer][2] + ";\n");
                pointer = (pointer+1)%clength;
                port.write("G0;" + choords[pointer][0] + ";" + choords[pointer][1] + ";" + choords[pointer][2] + ";\n");*/
                
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

