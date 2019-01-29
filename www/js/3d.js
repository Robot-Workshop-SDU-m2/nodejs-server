var canvas = document.getElementById("renderCanvas"); // Get the canvas element 

var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine


/******* Add the create scene function ******/
var createScene = function () {

    // Create the scene space
    var scene = new BABYLON.Scene(engine);

    // Add a camera to the scene and attach it to the canvas
    var camera = new BABYLON.ArcRotateCamera("Camera", 0.8, 1.1, 80, new BABYLON.Vector3(0,20,0), scene);
    camera.attachControl(canvas, true);

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    //var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
    
    // Add and manipulate meshes in the scene

    //CONSTANTS
    var rHeight     = 40;
    var rArmLength  = 19.6;
    var rAxisRadius = 9.2;

    var frames = [];
    var tracePoints = [];

    //AXES
    var xAxis = BABYLON.MeshBuilder.CreateCylinder("xAxis", { diameter: .5, height: 40 }, scene);
    var yAxis = BABYLON.MeshBuilder.CreateCylinder("yAxis", { diameter: .5, height: 40 }, scene);
    var zAxis = BABYLON.MeshBuilder.CreateCylinder("zAxis", { diameter: .5, height: 40 }, scene);
    xAxis.position = new BABYLON.Vector3(0, rHeight/2, rAxisRadius);
    yAxis.position = new BABYLON.Vector3(rAxisRadius * Math.cos(3.665), rHeight/2, rAxisRadius * Math.sin(3.665));
    zAxis.position = new BABYLON.Vector3(rAxisRadius * Math.cos(5.7595), rHeight/2, rAxisRadius * Math.sin(5.7595));

    xAxis.material = new BABYLON.StandardMaterial("x_red", scene);
    xAxis.material.diffuseColor = new BABYLON.Color3(0.91, 0.3, 0.24);
    xAxis.material.backFaceCulling = false;

    yAxis.material = new BABYLON.StandardMaterial("y_green", scene);
    yAxis.material.diffuseColor = new BABYLON.Color3(0.18, 0.8, 0.44); 
    yAxis.material.backFaceCulling = false;

    zAxis.material = new BABYLON.StandardMaterial("z_blue", scene);
    zAxis.material.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.86);
    zAxis.material.backFaceCulling = false;

    //JOINTS
    var xCarr = BABYLON.MeshBuilder.CreateSphere("xCarr", { diameter: 1 }, scene);
    var yCarr = BABYLON.MeshBuilder.CreateSphere("yCarr", { diameter: 1 }, scene);
    var zCarr = BABYLON.MeshBuilder.CreateSphere("zCarr", { diameter: 1 }, scene);
    xCarr.position = new BABYLON.Vector3(0, rHeight/2, rAxisRadius);
    yCarr.position = new BABYLON.Vector3(rAxisRadius * Math.cos(3.665), rHeight/2, rAxisRadius * Math.sin(3.665));
    zCarr.position = new BABYLON.Vector3(rAxisRadius * Math.cos(5.7595), rHeight/2, rAxisRadius * Math.sin(5.7595));

    //TCP
    var TCP = BABYLON.MeshBuilder.CreateSphere("TCP", { diameter: .5 }, scene);
    TCP.position = getTCPPos(xCarr.position,yCarr.position,zCarr.position);

    //ARMS
    var xLine = [ xCarr.position, TCP.position ];
    var yLine = [ yCarr.position, TCP.position ];
    var zLine = [ zCarr.position, TCP.position ];

    var xArm = BABYLON.MeshBuilder.CreateLines("xArm", {points: xLine, updatable: true}, scene);
    var yArm = BABYLON.MeshBuilder.CreateLines("yArm", {points: yLine, updatable: true}, scene);
    var zArm = BABYLON.MeshBuilder.CreateLines("zArm", {points: zLine, updatable: true}, scene);
    
    //ANIMATION TRACE
    var trace = BABYLON.MeshBuilder.CreateLines("trace", {points: tracePoints}, scene);
    
    //GUI
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var panel = new BABYLON.GUI.StackPanel();
    panel.width = "220px";
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(panel);

    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "Move robot to position");
    button.width = "120px";
    button.height = "20px";
    button.color = "white";
    button.background = "green";
    button.paddingBottom = "5px";
    button.fontSize = "10px";
    button.onPointerClickObservable.add(function(value){
    socket.emit('chat message', {data : [ Math.round((29.1 - xCarr.position.y) * 800) , Math.round((29.1 - yCarr.position.y) * 800) , Math.round((29.1 - zCarr.position.y) * 800) ]});
    });
    panel.addControl(button);

    var xslider = new BABYLON.GUI.Slider();
    xslider.minimum = 0;
    xslider.maximum = 40;
    xslider.value = xCarr.position.y;
    xslider.height = "13px";
    xslider.width = "200px";
    xslider.color = "red";
    xslider.background = "white";
    xslider.paddingBottom = "5px";
    xslider.onValueChangedObservable.add(function(value) {
    if(xCarr)xCarr.position.y = xslider.value; 
    updateCarrier();
    });
    panel.addControl(xslider);

    var yslider = new BABYLON.GUI.Slider();
    yslider.minimum = 0;
    yslider.maximum = 40;
    yslider.value = yCarr.position.y;
    yslider.height = "13px";
    yslider.width = "200px";
    yslider.color = "green";
    yslider.background = "white";
    yslider.paddingBottom = "5px";
    yslider.onValueChangedObservable.add(function(value) {
    if(yCarr)yCarr.position.y = yslider.value; 
    updateCarrier();
    });
    panel.addControl(yslider);

    var zslider = new BABYLON.GUI.Slider();
    zslider.minimum = 0;
    zslider.maximum = 40;
    zslider.value = zCarr.position.y;
    zslider.height = "13px";
    zslider.width = "200px";
    zslider.color = "blue";
    zslider.background = "white";
    zslider.paddingBottom = "5px";
    zslider.onValueChangedObservable.add(function(value) {
    if(zCarr)zCarr.position.y = zslider.value; 
    updateCarrier();
    });
    panel.addControl(zslider);

    document.getElementById("test").addEventListener("click",function () {
    l = document.getElementById("codearea").value.split("\n").map(el => el = el.split('\t').map(sel => sel = sel/10));
    l = l.filter(el => el.length == 3);
    frames = l;
    tracePoints.length = 0;
    });
    document.getElementById("btnPrint").addEventListener("click",function () {

    l = document.getElementById("codearea").value.split("\n").map(el => el = el.split(';').map(sel => sel = Math.round((291-sel)*80)));
    l = l.filter(el => el.length == 3);
    socket.emit("print",{ data: l});
    });

    scene.onAfterRenderObservable.add(function () {
    if(frames.length > 0){
        var coord = frames.shift();
        if(xCarr) xslider.value = xCarr.position.y = coord[0];
        if(yCarr) yslider.value = yCarr.position.y = coord[1];
        if(zCarr) zslider.value = zCarr.position.y = coord[2];
        updateCarrier();
        tracePoints.push(TCP.position);
        if(trace)trace.dispose();
        trace = BABYLON.MeshBuilder.CreateLines("trace", {points: tracePoints}, scene);
    }
    });
    
    function updateCarrier(){
    TCP.position = getTCPPos(xCarr.position,yCarr.position,zCarr.position);

    xArm = BABYLON.MeshBuilder.CreateLines("xArm", {points: [ xCarr.position, TCP.position ], instance: xArm});
    yArm = BABYLON.MeshBuilder.CreateLines("yArm", {points: [ yCarr.position, TCP.position ], instance: yArm});
    zArm = BABYLON.MeshBuilder.CreateLines("zArm", {points: [ zCarr.position, TCP.position ], instance: zArm});
    };
    
    return scene;
};

/******* End of the create scene function ******/

var scene = createScene(); //Call the createScene function

engine.runRenderLoop(function () { // Register a render loop to repeatedly render the scene
    scene.render();
});


window.addEventListener("resize", function () { // Watch for browser/canvas resize events
    engine.resize();
});

function getTCPPos(a,b,c,r=19.6){
    var ab  = b.subtract(a);
    var d   = ab.length();
    var ex  = ab.normalize();
    var ac  = c.subtract(a);
    var i   = BABYLON.Vector3.Dot(ex,ac);
    var ey  = ac.subtract(ex.scale(i)).normalize();
    var ez  = BABYLON.Vector3.Cross(ex,ey);
    var j   = BABYLON.Vector3.Dot(ey,ac);
    var x   = d/2;
    var y   = (i*i + j*j) / (2*j) - (i/j)*x;
    var z   = Math.sqrt(r*r-x*x-y*y);
    return a.add(ex.scale(x)).add(ey.scale(y)).add(ez.scale(z));
};