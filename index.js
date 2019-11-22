var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SerialPort = require('serialport');

var port;

var coords = [];
var coord;
var last_coord;

SerialPort.list().then(
    data => {
        for(var i = 0; i < data.length; i++){
            if(data[i].manufacturer == 'FTDI'){
                 port = new SerialPort(data[i].comName,{baudRate: 1000000}, function (err) {
                    if (err) {
                        return console.log('Error: ', err.message);
                    }
                });
                port.on('data', buf => {
                   strings = buf.toString().split('\n');
                   strings.forEach(str =>{
                    if(str.length != 0){
                        console.log( str );
                        if(str[0] == 'O'){
                            coord = coords.shift();
                            console.log(coord);
                            if(coord !== undefined){
                                //console.log("G0;" + coord[0] + ";" + coord[1] + ";" + coord[2]);
                                port.write(coord);
                            }
                            /*if(coords.length == 0){
                                port.write("G9\n");
                            }*/
                        }
                        if(str[0] == 'R'){
                            port.write(coord);
                        }
                    }
                   });
                });
            }
        }
        if(data.length = 0){
            console.log('No devices found');
        }
    }
);

app.use(express.static('www'));

io.on('connection', function(socket){
    console.log("User connected");
    socket.on('chat message', function(msg){
        console.log(msg);
        port.write(posToCode(msg.data));
    });
    socket.on('print', function(msg){
        console.log("Print job arrived")
        //console.log(msg)
        coords.length = 0;
        msg.data.forEach( c => {
            if(c.length === 3 && c != undefined) coords.push(posToCode(c));
        });
        //coords.push("G9\n");
        //console.log(coords)
        for(var i = 0; i <80; i++){
            coord = coords.shift();
            if(coord !== undefined){
                console.log(coord);
                port.write(coord);
            }else{
                break;
            }
        }
    });
});

function posToCode(c){
    buf = Buffer.alloc(9);
    buf.write("G0", 0);
    buf.writeInt16BE(c[0],2);
    buf.writeInt16BE(c[1],4);
    buf.writeInt16BE(c[2],6);
    buf.write('\n', 8);
    return buf;
}

http.listen(3000, function(){
    console.log('listening on *:3000');
});

