var ctx = {
    w: 1200,
    h: 1200,
    AUcircles: [1, 3, 7, 15, 31],
    AUcircleColor: "white",
    step: 50.0,
    showLabels: false,
    PLANET_FADE_TIME: 800,
    PLANET_FADE_COLOR: "#CCC",
    PLANET_COLOR: "white",
    PLANET_SYMBOL_SIZE: 20,
    bodies: [{name:"p:Mercury"}, {name:"p:Venus"}, {name:"p:Earth"}, {name:"p:Mars"}, {name:"p:Jupiter"}, {name:"p:Saturn"}, {name:"p:Uranus"}, {name:"p:Neptune"}, {name:"a:Pluto"}],
    N: 100000000000,
    diameterExtent: [0, 0],
    listBodies: [],
    offline: "offlineData.json",
    scaleObjects: [{name: "arc", size: 50, title: "Triumphal Arch", ratio: 1}, {name: "eiffel", size: 324, title: "Eiffeil Tower", ratio: 1600/1920}, {name: "burj", size: 828, title: "Burj Khalifa", ratio: 586/2400}, {name: "fuji", size: 3776, title: "Mount Fuji", ratio: 1}, {name: "everest", size: 8849, title: "Mount Everest", ratio: 1416/676}, {name: "paris", size: 10000, title: "Paris", ratio: 567/440}, {name: "couronneParis", size: 40000, title: "Petite Couronne", ratio: 1}, {name: "IDF", size: 125000, title: "Ile-de-France", ratio: 1}, {name: "france", size: 1000000, title: "France", ratio: 2336/2154}],
};

const INNER_PLANETS = ["Mercury", "Venus", "Earth", "Mars"];
const OUTER_PLANETS = ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
var ASTEROIDS = []
fetch('asteroids.json')
    .then((response) => response.json())
    .then((json) => {
        ASTEROIDS = json;
    });

var ssScale = function(x){
    return Math.log2(x+1);
}

var buildSolarSystem = function(){
    ASTEROIDS.forEach(element => {
        ctx.bodies.push({name: element});
    });
    ctx.bodies.forEach(element => {
        let name = element.name;
        let type = name.split(":")[0];
        let body = name.split(":")[1];
        ctx.listBodies.push(body);
    });
    autocomplete(document.getElementById("searchField"), ctx.listBodies);
    document.body.addEventListener('keypress', function(e) {
        if (e.key == "Escape") {
          resetHighlight(1);
        }
      });
    ctx.mainG = ctx.svg.append("g")
           .attr("transform", "translate(" + ctx.w / 2 + "," + ctx.h / 2 + ") scale(1,-1)")
           .attr("id", "rootG")
           .attr("opacity", 1); // A MODIFIER
    // scale 1,-1 to have north-pole observer/counter-clockwise rotation

    var lineG = ctx.mainG.append("g").attr("id", "lines");
    lineG.selectAll("circle")
           .data(ctx.AUcircles)
           .enter()
           .append("circle")
           .attr("stroke", ctx.AUcircleColor)
           .attr("fill", "none")
           .attr("cx", 0)
           .attr("cy", 0)
           .attr("r", function(d){return ctx.cScale(ssScale(d));});
};


var createDetailViz = function(){
    ctx.powerGauge = gauge('#power-gauge', {
		size: 400,
		clipWidth: 400,
		clipHeight: 250,
		ringWidth: 60,
		maxValue: 10,
		transitionMs: 4000,
	});
    ctx.powerGauge.render();

};    

var createMassDiameterPlot = function(i){
    var body = ctx.bodies[i];
    var diameterA = parseFloat(body.diameter);
    var vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "url": "dataAsteroids.csv",
            "format": { "type": "csv" }
        },
        "params": [
            {
                "name": "diameterA",
                "value": diameterA
            }
        ],
        "transform": [
            { "filter": "datum.GM != null && datum.GM >0" },
            { "calculate": "datum.GM *1e9 / 6.67408e-11", "as": "mass" }
        ],
        "vconcat": [
            {
                "mark": { "type": "point", "filled": true, "size": 100, "opacity": 0.85},
                "width": 400,
                "height": 400,
                "encoding": {
                    "x": { 
                        "field": "diameter", 
                        "type": "quantitative", 
                        "scale": { "type": 'log' },
                        "axis": { 
                            "title": "Body diameter (km)"
                        }
                         },
                    "y": { 
                        "field": "mass", 
                        "type": "quantitative", 
                        "scale": { "type": 'log' }, 
                        "axis": { 
                            "title": "Body mass (kg)", 
                            "format": "e"
                        } 
                    },
                    "color": {
                        "condition": {"test": "datum.diameter == diameterA", "value": "#ffbb4d"},
                        "value": "#21F5FF"
                    },
                    "tooltip": [
                        { "field": "full_name", "type": "nominal", "title": "Name" },
                        { "field": "diameter", "type": "quantitative", "title": "Diameter (km)", "format": ".2f" },
                        { "field": "mass", "type": "quantitative", "title": "Mass (kg)", "format": ".2e" },
                    ]
                }
            }
        ],
        "config": {
            "background": "#152238",
            "title": {"color": "#fff"},
            "style": {"guide-label": {"fill": "#fff"}, "guide-title": {"fill": "#fff"}},
            "axis": {"domainColor": "#fff", "gridColor": "#aaa", "tickColor": "#fff", "tickCount": 4},
          }

    };
    //var vlOpts = { width: 700, height: 700, actions: false };
    vegaEmbed("#massDiameterPlot", vlSpec);
};

var createRotDiameterPlot = function(i){
    var body = ctx.bodies[i];
    var diameterA = parseFloat(body.diameter);
    var vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "url": "dataAsteroids.csv",
            "format": { "type": "csv" }
        },
        "params": [
            {
                "name": "diameterA",
                "value": diameterA
            }
        ],
        "transform": [
            { "filter": "datum.diameter != null && datum.diameter >0" }
        ],
        "vconcat": [
            {
                "mark": { "type": "point", "filled": true, "size": 100},
                "width": 400,
                "height": 400,
                "encoding": {
                    "x": { 
                        "field": "diameter", 
                        "type": "quantitative", 
                        "scale": { "type": 'log' },
                        "axis": { 
                            "title": "Body diameter (km)"
                        }
                         },
                    "y": { 
                        "field": "rot_per", 
                        "type": "quantitative", 
                        "scale": { "type": 'log' }, 
                        "axis": { 
                            "title": "Body rotational period (hours)", 
                            "format": ".5"
                        } 
                    },
                    "color": {
                        "condition": {"test": "datum.diameter == diameterA", "value": "#ffbb4d"},
                        "value": "#21F5FF"
                    },
                    "opacity": {
                        "condition": {"test": "datum.diameter == diameterA", "value": 1},
                        "value": 0.82
                    },
                    "tooltip": [
                        { "field": "full_name", "type": "nominal", "title": "Name" },
                        { "field": "diameter", "type": "quantitative", "title": "Diameter (km)", "format": ".2f" },
                        { "field": "rot_per", "type": "quantitative", "title": "Rotational period (hours)", "format": ".2f" },
                    ]
                }
            }
        ],
        "config": {
            "background": "#152238",
            "title": {"color": "#fff"},
            "style": {"guide-label": {"fill": "#fff"}, "guide-title": {"fill": "#fff"}},
            "axis": {"domainColor": "#fff", "gridColor": "#aaa", "tickColor": "#fff", "tickCount": 3},
          }

    };
    vegaEmbed("#rotDiameterPlot", vlSpec);
};

var createAlbedoHistogram = function(i){
    var body = ctx.bodies[i];
    if (body.albedo != null){
        var albedo = parseFloat(body.albedo);
    }
    else{
        var albedo = 0;
    }
    var size = 400;
    var q = ctx.maxAlbedo/0.05;
    maxTick = Math.ceil(q)*0.05;
    var posAlbedo = size*albedo/maxTick;
    console.log(maxTick);
    var vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "params": [
            {
                "name": "lineAlbedo",
                "value": posAlbedo

            }
        ],
        "data": {
            "url": "dataAsteroids.csv",
            "format": { "type": "csv" }
        },
        "layer": [
        {
        "mark": "bar",
        "width": size,
        "height": size,
        "encoding": {
          "x": {
            "bin": true,
            "field": "albedo",
            "axis": { "title": "Albedo" }
          },
          "y": {"aggregate": "count", "axis": { "title": "Number of bodies" }},
          "color": { "field": "albedo",
            "scale": {"range": ["#004280", "#21F5FF", "#E8EBFF"], "domain": [0, 0.5]},
            "type": "quantitative",
            "legend": null,
         },
         "tooltip": [
            { "field": "full_name", "type": "nominal", "title": "Name" },
        ]
      }
    },
    {
        "mark": "rule",
        "encoding": {
            "x": {
                "value": posAlbedo,
            },
            "color": {
                "value": "#ffbb4d"
            },
            "size": {
                "condition": {"test": "lineAlbedo>0", "value": 2},
                "value": 0
            }
        }
    }
    ],
    "config": {
        "background": "#152238",
        "title": {"color": "#fff"},
        "style": {"guide-label": {"fill": "#fff"}, "guide-title": {"fill": "#fff"}},
        "axis": {"domainColor": "#fff", "gridColor": "#aaa", "tickColor": "#fff"},
      }

    };
    vegaEmbed("#albedoHistogram", vlSpec);
    };      

var getX = function(body){
    var r = Math.sqrt(Math.pow(body.Hx,2) + Math.pow(body.Hy,2));
    var ta = Math.atan2(body.Hy, body.Hx);
    return (ctx.cScale(ssScale(r))) * Math.cos(ta);
};

var getY = function(body){
    var r = Math.sqrt(Math.pow(body.Hx,2) + Math.pow(body.Hy,2));
    var ta = Math.atan2(body.Hy, body.Hx);
    return (ctx.cScale(ssScale(r))) * Math.sin(ta);
};

var getRadius = function(x, y){
    return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
};

var getAngle = function(x, y){
    return Math.atan2(y, x);
};

var computePlanetPositions = function(bodyData){
    ctx.planetG = d3.select("#rootG").append("g").attr("id", "planets");
    circles = ctx.planetG.selectAll("circle")
            .data(bodyData)
            .enter()
            .append("circle")
            .attr("id", function(d){
                if (d.sso.hasOwnProperty("name")){
                    return d.sso.name;
                } else {
                    return "c"+d.sso.iau_code;
                }})
            .attr("fill", ctx.PLANET_COLOR)
            .attr("opacity", 0)
            .attr("cx", function(d){return getX(d);})
            .attr("cy", function(d){return getY(d);})
            .attr("r", 2)
            .on("click", function(d){
                let name = d.srcElement.id;
                console.log("here is the name", name);
                let searchBox = document.getElementById("searchField");
                searchBox.value = name;
                searchBody();
            });
                

    circles.append("title")
            .text(function(d){
                if (d.sso.hasOwnProperty("name")){
                    return d.sso.name;
                } else {
                    return "c"+d.sso.iau_code;
                };
            });

    ctx.planetScale = d3.scaleLinear()
        .domain([473, 69911])
        .range([10, 20]);
    ctx.planetG.select("#Mercury")
            .attr("fill", "#bb8f71")
            .attr("r", ctx.planetScale(2439.7));
    ctx.planetG.select("#Venus")
            .attr("fill", "#eebabc")
            .attr("r", ctx.planetScale(6051.8));
    ctx.planetG.select("#Mars")
            .attr("fill", "#d23a2a")
            .attr("r", ctx.planetScale(3389.5));
    ctx.planetG.select("#Earth")
            .attr("fill", "#80ccea")
            .attr("r", ctx.planetScale(6371));
    ctx.planetG.select("#Jupiter")
            .attr("fill", "#f3ccba")
            .attr("r", ctx.planetScale(69911));
    ctx.planetG.select("#Saturn")
            .attr("fill", "#fff599")
            .attr("r", ctx.planetScale(58232));
    ctx.planetG.select("#Uranus")
            .attr("fill", "#8eb9e5")
            .attr("r", ctx.planetScale(25362));
    ctx.planetG.select("#Neptune")
            .attr("fill", "#4d5dab")
            .attr("r", ctx.planetScale(24622));
    ctx.planetG.select("#Pluto")
            .attr("fill", "#dbe9f0")
            .attr("r", ctx.planetScale(1188.3));


    // sun
    ctx.mainG.append("circle")
            .attr("fill", "#FFE87C")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 30) //XXX sol size as a function of actual size
            .attr("id", "sun")
            .append("title")
            .text("Sun");

    ctx.planetG.selectAll("circle")
            .transition().duration(ctx.PLANET_FADE_TIME)
            .attr("opacity", 1);
    addPhysicalData();
}

var roundToN = function(num, rN){
    return Math.round(num * rN) / rN;
};


// time span covered by Miriade depending on planetary theory used
// INPOP: 1000-01-01 12h to 3000-01-01 12h
// DE406: -3000-02-23 0h to 3000-05-06 0h

var MIRIADE_QUERY_URL_1 = "http://vo.imcce.fr/webservices/miriade/ephemcc_query.php?-name=";
var MIRIADE_QUERY_URL_2 = "&-theory=DE406&-observer=@sun&-tcoor=2&-rplane=2&-mime=json&-ep=";
var TIME = "now";
var PARALLEL_QUERIES = false;

// example request
// http://vo.imcce.fr/webservices/miriade/ephemcc_query.php?-name=p:Terre&-ep=2018-01-16T00:00:00&-observer=@sun&-tcoor=2&-rplane=2&-mime=json

var getQueryURL = function(body, time){
    if (body == "c:c67P"){
        body = "c:67P";
    }
    return MIRIADE_QUERY_URL_1 + body + MIRIADE_QUERY_URL_2 + time;
}

var addViz = function(){
    ctx.cScale = d3.scaleLinear()
        .domain([0, ctx.AUcircles.length])
        .range([0, d3.min([ctx.w, ctx.h])/2.1]);
    ctx.svg = d3.select("body")
                .append("svg");
    ctx.svg.attr("width", ctx.w)
           .attr("height", ctx.h);
    buildSolarSystem();
    query();
    createDetailViz();
};

var query = function(){
    if (ctx.offline){
        d3.json(ctx.offline).then(
            function(jsonData){
                //alert("offline mode");
                computePlanetPositions(jsonData, false);
            }
        ).catch(function(error){console.log(error)});
        return;
    }
    console.log("Quering (series)...");
    var jsonDataSets = [];
    console.log("Processing bodies...");
    sequentialQueries(0, jsonDataSets);
};

function saveText(text, filename){
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click()
  }

var sequentialQueries = function(i, jsonDataSets){
    bodyName = ctx.bodies[i].name;
    console.log(bodyName);
    d3.json(getQueryURL(bodyName, TIME)).then(function(body){
        console.log(body);
        body.Hx = body['data'][0]['position'][0];
        body.Hy = body['data'][0]['position'][1];
        jsonDataSets.push(body);
        if (i < ctx.bodies.length-1){
            sequentialQueries(i+1, jsonDataSets);
        }
        else {
            console.log("done");
            //save json data in a file
            //saveText( JSON.stringify(jsonDataSets), "offlineData.json" );
            
            computePlanetPositions(jsonDataSets);
        }
    }).catch(function(error){
        console.log(error);
    });
};

var searchBody = function(){
    var search = document.getElementById('searchField').value;
    if (search == ""){
        return;
    }
    var found = false;
    for (var i = 0; i < ctx.bodies.length; i++){
        bodyLower = ctx.bodies[i].name.toLowerCase();
        if (bodyLower.endsWith(search.toLowerCase())){
            found = true;
            if (INNER_PLANETS.includes(ctx.bodies[i].name.slice(2)) || OUTER_PLANETS.includes(ctx.bodies[i].name.slice(2))){
                //do not allow to show details for planets
                break;
            }
            detailsButton = document.getElementById('detailsButton')
            detailsButton.value = "Show details on "+ctx.bodies[i].name.slice(2);
            detailsButton.name = String(i);
            detailsButton.disabled = false;
            break;
        }
    }
    if (!found){
        alert("Body not found");
        return;
    }
    resetHighlight(0);
    highlightBody(i);
};

var highlightBody = function(i){
    var body = ctx.bodies[i];
    console.log(body);
    console.log(body.name)
    ctx.planetG.selectAll("circle")
            .filter(function(d, j){
                return j!=i;
            })
            .transition().duration(1000)
            .attr("opacity", 0.2);
    let circle = ctx.planetG.select("#" + body.name.slice(2));
    circle.attr("opacity", 1);
    circle.transition().delay(1205).duration(1)
            .attr("stroke", "white")
            .attr("stroke-width", 3);
    let radius = circle.attr("r");
    let x = circle.attr("cx");
    let y = circle.attr("cy");
    let outerCircle = ctx.planetG.append("circle")
        .attr("id", "highlight")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 1200)
        .attr("fill", "none")
        .attr("opacity", 1)
        .attr("stroke", "white")
        .attr("stroke-width", 3);
    outerCircle.transition().duration(1200)
            .ease(d3.easePolyOut.exponent(3))
            .attr("r", radius);
    outerCircle.transition().delay(1210).duration(1)
            .remove();
    

};

var resetHighlight = function(resetSearch){
    if (resetSearch){
        document.getElementById('searchField').value = "";
        detailsButton = document.getElementById('detailsButton')
        detailsButton.value = "Show details";
        detailsButton.name = "";
        detailsButton.disabled = true;
        hideDetails();
        showMap();
    }
    ctx.planetG.selectAll("circle")
            .transition().duration(1000)
            .attr("opacity", 1)
            .attr("stroke", "none");
};

var focusSearch = function(){
    var searchField = document.getElementById('searchField');
    searchField.classList.remove('unfocused');
    searchField.classList.add('focused');
};

var handleKeyEvent = function(e){
    if (e.keyCode === 13){
        // enter
        e.preventDefault();
        searchBody();
    }
    else if (e.keyCode === 38){
        // arrow up
        e.preventDefault();
        var dateTf = document.getElementById('dateTf');
        var date = getDate(dateTf.value);
        var tokens = date.split("-");
        tokens[0] = String(parseInt(tokens[0]) + 1);
        dateTf.value = tokens.join("-");
    }
    else if (e.keyCode === 40){
        // arrow down
        e.preventDefault();
        var dateTf = document.getElementById('dateTf');
        var date = getDate(dateTf.value);
        var tokens = date.split("-");
        tokens[0] = String(parseInt(tokens[0]) - 1);
        dateTf.value = tokens.join("-");
    }
    else if (e.keyCode === 27){
        // escape
        e.preventDefault();
        resetHighlight(1);
    }

};


var addPhysicalData = function(){
    //alert("physical data");
    ctx.maxAlbedo = 0;
    d3.csv("dataAsteroids.csv").then(function(data){
        setDiameter(data);
        for (var i = 0; i < data.length; i++){
            var bodyData = data[i];
            var name = bodyData.full_name;
            var body = ctx.bodies.find(function(b){return b.name.slice(2) == name});
            if (body){
                body.diameter = bodyData.diameter;
                body.albedo = bodyData.albedo;
                if (body.albedo > ctx.maxAlbedo){
                    ctx.maxAlbedo = body.albedo;
                }
                body.rot_speed = 24/bodyData.rot_per;
                body.mass = bodyData.GM * (10**9) / 6.67430e-11; //kg
                body.spec_B = bodyData.spec_B;
                body.spec_T = bodyData.spec_T;
                body.e = bodyData.e;
                body.i = bodyData.i;
                body.q = bodyData.q;
                body.per_y = bodyData.per_y;
                body.n_obs_used = bodyData.n_obs_used;
            }
        }
    });
    console.log(ctx.bodies);
};

var setDiameter = function(data){
    ctx.diameterExtent = [d3.min(data,
                                            (d) => parseFloat(d.diameter)),
                        d3.max(data,
                                            (d) => parseFloat(d.diameter))];
    ctx.diameterScale = d3.scaleLinear()
                            .domain(ctx.diameterExtent)
                            .range([2, 10]);
    ctx.planetG.selectAll("circle")
                .data(data, function(d){
                    r = d.full_name || this.id;
                    return r;})
                .attr("r", function (d){
                    return ctx.diameterScale(d.diameter);
                })
                .attr("fill", "#D78547");
};

var showDetails = function(){
    index = document.getElementById('detailsButton').name;
    if (index == ""){
        return;
    }
    var i = parseInt(index);
    hideMap();
    createAlbedoHistogram(i);
    createMassDiameterPlot(i);
    createRotDiameterPlot(i);
    createSpeedGauge(i);
    display3Dmodel(i);
    updateNumberOfObservations(i);
    updateImpactInfo(i);
    updateBodyName(i);
    d3.select("#details")
    .transition()
    .delay(800)
    .duration(1000)
    .style("opacity", 1)
    .style("display", "block");
    //.style("background-color", "white");
};

var hideMap = function(){
    ctx.mainG
        .transition()
        .duration(800)
        .attr("opacity", 0);
    ctx.svg.transition().delay(800).style("display", "none");
};

var hideDetails = function(){
    d3.select("#details").transition()
            .duration(800)
            .style("opacity", 0);
    d3.select("#details").transition().delay(800).style("display", "none");
};

var showMap = function(){
    ctx.mainG
        .transition()
        .delay(800)
        .duration(1000)
        .attr("opacity", 1);
    ctx.svg.transition().delay(800).style("display", "block");
};

var createSpeedGauge = function(i){
    var body = ctx.bodies[i];
    var speed = body.rot_speed;
    if (speed == undefined){
        speed = 0;
    }
    ctx.powerGauge.update(parseFloat(speed));
};

var display3Dmodel = function(i){
    var body = ctx.bodies[i];
    var name = body.name.slice(2);
    var modelPath = "asteroids3D_gltf/" + name + ".gltf";
    var viewer = document.getElementById('modelViewer');
    viewer.src = modelPath;
    var size = body.diameter*1000; // km to m
    if (isNaN(size)){
        console.log("No size data available for this body");
        return;
    }
    console.log("OK :" + size);
    var scale = 150*size/600;
    var scaleObject = getScaleObject(scale);
    var img = document.getElementById('sizeScale');
    img.src = "img/"+scaleObject.name + ".png";
    img.height = scaleObject.size*600/size;
    s = scaleObject.size;
    unit = "m";
    if (scaleObject.size >= 10000){
        s = s/1000;
        unit = "km";
    }
    img.title = scaleObject.title + " (" + s + " " + unit + ")";
    var scaleText = document.getElementById('sizeScaleName');
    var imgWidth = img.height*scaleObject.ratio;
    scaleText.style.width = imgWidth + "px";
};

var getScaleObject = function(scale){
    var obj = ctx.scaleObjects[0];
    for (var i = 1; i < ctx.scaleObjects.length; i++){
        size = ctx.scaleObjects[i].size;
        if (size > obj.size && size < scale){
            obj = ctx.scaleObjects[i];
        }
    }
    return obj;
};

var updateNumberOfObservations = function(i){
    var body = ctx.bodies[i];
    var nbObs = body.n_obs_used;
    if (isNaN(nbObs)){
        nbObs = "Unknown number of";
    }
    document.getElementById("numObsText").innerHTML = nbObs + " observations used";
};

var updateImpactInfo = function(i){
    var body = ctx.bodies[i];
    var diameter = body.diameter;
    var factor;
    if (isNaN(diameter)){
        factor = "Unknown";
        short_factor = "an unknown";
    }
    else{
        factor = Math.pow(diameter/10, 3);
        factor = 100000000*factor;
        console.log("factor: " + factor);
        factor = Number(factor.toPrecision(2));
        var bigNumArry = new Array('', ' thousand', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion');
        var bigNum = Math.floor(Math.log(factor)/Math.log(1000));
        var short_factor = factor/Math.pow(1000, bigNum);
        short_factor = Number(short_factor.toPrecision(2));
        short_factor_str = short_factor + bigNumArry[bigNum];
        //add space every 3 digits
        factor_str = factor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    document.getElementById("energyNumber").innerHTML = factor_str;
    document.getElementById("energyText").innerHTML = "Impact energy equivalent to " + short_factor_str + " Tsar Bomba*";
};

var updateBodyName = function(i){
    var body = ctx.bodies[i];
    var name = body.name.slice(2);
    document.getElementById("bodyName").innerHTML = name;
};




function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  }

var gauge = function(container, configuration) {
	var that = {};
	var config = {
		size						: 200,
		clipWidth					: 200,
		clipHeight					: 110,
		ringInset					: 20,
		ringWidth					: 20,
		
		pointerWidth				: 10,
		pointerTailLength			: 5,
		pointerHeadLengthPercent	: 0.9,
		
		minValue					: 0,
		maxValue					: 10,
		
		minAngle					: -90,
		maxAngle					: 90,
		
		transitionMs				: 750,
		
		majorTicks					: 5,
		labelFormat					: d3.format('.3'),
		labelInset					: 10,

        arcColorFn					: d3.interpolateHsl(d3.rgb('#004280'), d3.rgb('#21F5FF'))
	};
	var range = undefined;
	var r = undefined;
	var pointerHeadLength = undefined;
	var value = 0;
	
	var svg = undefined;
	var arc = undefined;
	var scale = undefined;
	var ticks = undefined;
	var tickData = undefined;
	var pointer = undefined;

	var donut = d3.pie();
	
	function deg2rad(deg) {
		return deg * Math.PI / 180;
	}
	
	function newAngle(d) {
		var ratio = scale(d);
		var newAngle = config.minAngle + (ratio * range);
		return newAngle;
	}
	
	function configure(configuration) {
		var prop = undefined;
		for ( prop in configuration ) {
			config[prop] = configuration[prop];
		}
		
		range = config.maxAngle - config.minAngle;
		r = config.size / 2;
		pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

		// a linear scale that maps domain values to a percent from 0..1
		scale = d3.scaleLinear()
			.range([0,1])
			.domain([config.minValue, config.maxValue]);
			
		ticks = scale.ticks(config.majorTicks);
		tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});
		
		arc = d3.arc()
			.innerRadius(r - config.ringWidth - config.ringInset)
			.outerRadius(r - config.ringInset)
			.startAngle(function(d, i) {
				var ratio = d * i;
				return deg2rad(config.minAngle + (ratio * range));
			})
			.endAngle(function(d, i) {
				var ratio = d * (i+1);
				return deg2rad(config.minAngle + (ratio * range));
			});
	}
	that.configure = configure;
	
	function centerTranslation() {
		return 'translate('+r +','+ r +')';
	}
	
	function isRendered() {
		return (svg !== undefined);
	}
	that.isRendered = isRendered;
	
	function render(newValue) {
		svg = d3.select(container)
			.append('svg:svg')
				.attr('class', 'gauge')
				.attr('width', config.clipWidth)
				.attr('height', config.clipHeight);
		
		var centerTx = centerTranslation();
		
		var arcs = svg.append('g')
				.attr('class', 'arc')
				.attr('transform', centerTx);
		
		arcs.selectAll('path')
				.data(tickData)
			.enter().append('path')
				.attr('fill', function(d, i) {
					return config.arcColorFn(d * i);
				})
				.attr('d', arc);
		
		var lg = svg.append('g')
				.attr('class', 'label')
				.attr('transform', centerTx);
		lg.selectAll('text')
				.data(ticks)
			.enter().append('text')
				.attr('transform', function(d) {
					var ratio = scale(d);
					var newAngle = config.minAngle + (ratio * range);
					return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +')';
				})
				.text(config.labelFormat)
                .style('fill', '#fff')
        if (newValue == undefined) {
            showValue = config.minValue;
        } else {
            showValue = newValue;
        }
        lg.append('text')
            .attr('id', 'rot_speed_value')
            .attr('transform', 'translate(0,30)')
            .text(showValue+' m/s')
            .style('font-size', '20px')
            .style('fill', 'black')
            .style('font-weight', 'bold');


		var lineData = [ [config.pointerWidth / 2, 0], 
						[0, -pointerHeadLength],
						[-(config.pointerWidth / 2), 0],
						[0, config.pointerTailLength],
						[config.pointerWidth / 2, 0] ];
		var pointerLine = d3.line().curve(d3.curveMonotoneX);
		var pg = svg.append('g').data([lineData])
				.attr('class', 'pointer')
				.attr('transform', centerTx);
				
		pointer = pg.append('path')
			.attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
			.attr('transform', 'rotate(' +config.minAngle +')');
			
		update(newValue === undefined ? 0 : newValue);
	}
	that.render = render;
	
	function update(newValue, newConfiguration) {
		if ( newConfiguration  !== undefined) {
			configure(newConfiguration);
		}
        var showValue = Math.floor(newValue*100)/100;
		var ratio = scale(newValue);
		var newAngle = config.minAngle + (ratio * range);
        d3.select('#rot_speed_value').text(showValue+' rotations per day').style('fill', 'white');
		pointer.transition()
			.duration(config.transitionMs)
			.ease(d3.easeElastic)
			.attr('transform', 'rotate(' +newAngle +')');
	}
	that.update = update;

	configure(configuration);
	
	return that;
};