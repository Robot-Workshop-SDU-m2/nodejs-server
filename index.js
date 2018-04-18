var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SerialPort = require('serialport');

var counter = 0;
var port;

var coords = [];//[[2000,0,0],[1950,0,0],[1900,0,0],[1850,0,0],[1800,0,0],[1750,0,0],[1700,0,0],[1750,0,0],[1800,0,0],[1850,0,0],[1900,0,0],[1950,0,0]];
var coord;
var pointer = 0;
//var clength = choords.length;

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
                        if(str[0] == 'O'){
                            coord = coords.shift()
                            if(coord !== undefined){
                                console.log("G0;" + coord[0] + ";" + coord[1] + ";" + coord[2] + ";\n");
                                port.write("G0;" + coord[0] + ";" + coord[1] + ";" + coord[2] + ";\n");
                            }
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

/*app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});*/
app.use(express.static('www'));

io.on('connection', function(socket){
    console.log("User connected");
    socket.on('chat message', function(msg){
        console.log(msg);
        port.write(msg + '\n');
    });
    socket.on('print', function(msg){
        coords = msg.data;
        coord = coords.shift()
        for(var i = 0; i <3; i++)
        if(coord !== undefined){
            console.log("G0;" + coord[0] + ";" + coord[1] + ";" + coord[2]);
            port.write("G0;" + coord[0] + ";" + coord[1] + ";" + coord[2] + ";\n");
        }
    });
});

http.listen(3000, function(){
console.log('listening on *:3000');
});

