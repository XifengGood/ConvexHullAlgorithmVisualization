let stars = [];
let starNum = 50;
let currentHoverStar = null;
function createStars(starNum) {
    stars = [];
    for (let i = 0; i < starNum; i++) {
        stars.push(new star(width, height, 5));
    }
    console.log(stars);
    return stars;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - select('.banner').height);
}
function setup() {
    createWidget();

    let canvas = createCanvas(windowWidth, windowHeight - select('.banner').height);
    fullscreen();
    canvas.style('display', 'block');
    stars = createStars(starNum);

}
let MouseState={Add:1,Sub:2,Normal:0};
function draw() {
    background('#E58686E0');
    //drawConvexHull();
    drawStars(stars);
    visualizationAlgorithm();
    drawCursor();
}

/* function drawConvexHull() {
    push();
    stroke('FFFFFF');
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < vertices.length; i++) {
        let edge = vertices[i].nextEdge;
        vertex(edge.origin.point.x, edge.origin.point.y);
        vertex(edge.next.point.x, edge.next.point.y);
    }
    endShape();
    pop();
} */
let currentMouseState=MouseState.Normal;
function drawCursor(){
    switch(currentMouseState){
        case MouseState.Add:{
            push();
            stroke('#FFFFFF');
            strokeWeight(5);
            point(mouseX,mouseY);
            pop();
            break;
        }
        case MouseState.Sub:{
            push();
            stroke('#FFFFFF');
            line(mouseX-2.5,mouseY-2,mouseX+2.5,mouseY+2);
            line(mouseX-2.5,mouseY+2,mouseX+2.5,mouseY-2);
            pop();
            break;
        }
    }
}
function mouseClicked(){
    switch(currentMouseState){
        case MouseState.Add:{
            if(isRunning)return;
            let nextStar=new star(width,height);
            nextStar.x=mouseX;
            nextStar.y=mouseY;
            stars.push(nextStar);
            break;
        }
        case MouseState.Sub:{
            if(isRunning)return;
            if(currentHoverStar==null)return;
            if(!InCircle({ x: currentHoverStar.x, y: currentHoverStar.y }, Math.max(currentHoverStar.originSize, currentHoverStar.size)/2, { x: mouseX, y: mouseY })){
                return;
            }
            let index=stars.indexOf(currentHoverStar);
            if(index==-1)return;
            stars.splice(index,1);
            break;
        }
    }
}
function mouseDragged() {
    if(currentMouseState!=MouseState.Normal)return;
    if (!isRunning && currentHoverStar != null) {
        currentHoverStar.x = lerp(currentHoverStar.x, mouseX, 0.8);
        currentHoverStar.y = lerp(currentHoverStar.y, mouseY, 0.8);
    }
}
function drawStars(stars) {
    if (!mouseIsPressed && currentHoverStar != null && !InCircle({ x: currentHoverStar.x, y: currentHoverStar.y }, Math.max(currentHoverStar.originSize, currentHoverStar.size)/2, { x: mouseX, y: mouseY })) {
        currentHoverStar.isHover = false;
        currentHoverStar = null;
    }
    for (let i = 0; i < stars.length; i++) {
        stars[i].detect();
        stars[i].shine(1.5);
        stars[i].display();
    }
}


let extremePoints = [];
let currentTriangle = {
    p: { x: 0, y: 0 }, q: { x: 0, y: 0 }, r: { x: 0, y: 0 }
}

let extremeEdges = [];
let currentEdges = [];

let startVertex = { x: 0, y: 0 };
let currentTestState = {
    startVertex: undefined,
    x: { x: 0, y: 0 },
    t: { x: 0, y: 0 },
    prev: { x: 0, y: 0 },
    next: { x: 0, y: 0 },
    isFinish: false
};
let ltl = { x: 0, y: 0 };
let currentJarvisMarchState = {
    ltl: { x: 0, y: 0 },
    s: { x: 0, y: 0 },
    t: { x: 0, y: 0 },
    isFinish: false
};

let sortResult = { ltl, vertices: [] };
let GrahamScanResult = [];
let currentGrahamScanState = {
    s: [], t: { x: 0, y: 0 }, isFinish: false
};

let currentSelection;
let currentSpeed = 1;
let baseWaitfortime = 50;
let isVeryFast = false;

let isRunning = false;
function createWidget() {
    let algorithmSelection = select('select');

    let speedSlider = select('.options li:nth-child(3) input');
    speedSlider.changed(() => { currentSpeed = speedSlider.value() / 5 });
    let speedCheckBox = select('.options li:nth-child(4) input');
    speedCheckBox.changed(() => { isVeryFast = speedCheckBox.checked(); });

    let runBtn = select('.run button');
    runBtn.mouseClicked(() => {
        currentSelection = algorithmSelection.value();
        console.log("current selectd: " + currentSelection);
        if (isRunning) {
            clearTimeout(currentWaitforme); isRunning = false;
            runBtn.html('<svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path id="svg_8" d="m60,40l86,61l-86,69c0,-43.33333 0,-86.66667 0,-130z" opacity="undefined" stroke-linecap="undefined" stroke-linejoin="undefined" stroke-width="20" stroke="#000" fill="none"/></svg>');
            return;
        }

        for (let i = 0; i < stars.length; i++) stars[i].reset();
        isRunning = true;
        runBtn.html('<svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g><line stroke-width="20" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_1" y2="170" x2="60" y1="30" x1="60" stroke="#000" /><line stroke-width="20" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_2" y2="170" x2="140" y1="30" x1="140" stroke="#000" /></g></svg>');
        switch (algorithmSelection.value()) {
            case "Extreme Point": {
                // extremePoints=constructConvexHullByTriangle(stars);
                // console.log(extremePoints);
                currentTriangle = {
                    p: { x: 0, y: 0 }, q: { x: 0, y: 0 }, r: { x: 0, y: 0 }
                }
                asyncGetExtremePoints(stars, currentTriangle).then(() => { isRunning = false; console.log(isRunning); });
                console.log(currentTriangle);
                break;
            }
            case "Extreme Edge": {
                // extremeEdges=getExtremeEdges(stars);
                // console.log(extremeEdges);
                currentEdges = [];
                asyncGetExtremeEdges(stars, currentEdges).then(() => { isRunning = false; console.log(isRunning); });
                console.log(currentEdges);
                break;
            }
            case "Incremental": {
                // startVertex=getConvexHullByIncremental(stars);
                // console.log(startVertex);
                currentTestState = {
                    startVertex: undefined,
                    x: { x: 0, y: 0 },
                    t: { x: 0, y: 0 },
                    prev: { x: 0, y: 0 },
                    next: { x: 0, y: 0 },
                    isFinish: false
                };
                asyncGetConvexHullByIncremental(stars, currentTestState).then(() => { isRunning = false; console.log(isRunning); });
                console.log(currentTestState);
                break;
            }
            case "Jarvis March": {
                // ltl=getConvexHullByJarvisMarch(stars);
                // console.log(ltl);
                currentJarvisMarchState = {
                    ltl: { x: 0, y: 0 },
                    s: { x: 0, y: 0 },
                    t: { x: 0, y: 0 },
                    isFinish: false
                };
                aysncGetConvexHullByJarvisMarch(stars, currentJarvisMarchState).then(() => { isRunning = false; console.log(isRunning); });
                console.log(currentJarvisMarchState);
                break;
            }
            case "Graham Scan": {
                // GrahamScanResult=GrahamScan(stars);
                // console.log(GrahamScanResult);
                currentGrahamScanState = {
                    s: [], t: { x: 0, y: 0 }, isFinish: false
                };
                asyncGrahamScan(stars, currentGrahamScanState).then(() => { isRunning = false; console.log(isRunning); });
                console.log(currentGrahamScanState);
                break;
            }
        }
    });

    let starNumSlider = select('.options li:nth-child(1) input');

    let addStarBtn=select('.tools button:nth-child(1)');
    addStarBtn.mouseClicked(()=>{
        if(currentMouseState==MouseState.Add)
            currentMouseState=MouseState.Normal;
        else
            currentMouseState=MouseState.Add;
    })
    let subStarBtn=select('.tools button:nth-child(2)');
    subStarBtn.mouseClicked(()=>{
        if(currentMouseState==MouseState.Sub)
            currentMouseState=MouseState.Normal;
        else
            currentMouseState=MouseState.Sub;
    })
    let createStarBtn = select('.tools button:nth-child(3)');
    createStarBtn.mouseClicked(() => {
        if (isRunning) return;
        stars = createStars(starNumSlider.value());
    })

    let expandToggle = select('.expandToggle');
    let optionPanel = select('.optionPanel');
    console.log(optionPanel);
    expandToggle.mouseClicked(() => {
        expandToggle.toggleClass('expanding');
        optionPanel.toggleClass('expanding');
        if (expandToggle.hasClass('expanding')) {
            expandToggle.html('<svg t="1670082939148" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1314" width="100%" height="100%"><path d="M24.064 24.0384A38.4 38.4 0 0 1 75.4688 21.4272L78.336 24.064l918.528 919.7568a38.4 38.4 0 0 1-51.456 56.9088l-2.8928-2.6368L24.0128 78.336A38.4 38.4 0 0 1 24.064 24.0384z" p-id="1315"></path><path d="M996.864 24.0384a38.4 38.4 0 0 0-51.4048-2.6112l-2.9184 2.6368L24.0128 943.8208a38.4 38.4 0 0 0 51.456 56.9088l2.8928-2.6368L996.8896 78.336a38.4 38.4 0 0 0-0.0512-54.2976z" p-id="1316"></path></svg>');
        } else {
            expandToggle.html('<svg t="1670082435726" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1314" width="100%" height="100%"><path d="M25.6 128h972.8v76.8H25.6z" p-id="1315"></path><path d="M665.6 51.2h230.4v230.4h-230.4zM563.2 742.4h230.4v230.4h-230.4zM166.4 396.8h230.4v230.4h-230.4z" p-id="1316"></path><path d="M25.6 473.6h972.8v76.8H25.6zM25.6 819.2h972.8v76.8H25.6z" p-id="1317"></path></svg>');
        }
    })

    let saveStarBtn=select('.data .save');
    saveStarBtn.mouseClicked(()=>{
        let saveData=[];
        for(let i=0;i<stars.length;i++){
            saveData.push({
                x:stars[i].x,
                y:stars[i].y,
                size:stars[i].originSize,
                color:stars[i].color,
            });
        }
        saveJSON(saveData, 'stars.json',true);
    })
    let loadStarBtn=select('.data .loader');
    let inputFile=select('.data input');
    console.log(inputFile);
    loadStarBtn.mouseClicked(()=>{
        if(isRunning)return;
        inputFile.elt.click();
    })
    inputFile.changed((e)=>{
        if(e.target.files.length<1)return;
        console.log(e.target.files[0]);
        noLoop();
        loadJSON(
            URL.createObjectURL(e.target.files[0]),
            undefined,
            undefined,
            (data) => {
                let n=data.length;
                stars.splice(0);
                for(let i=0;i<n;i++){
                    let tempStar=new star(width,height);
                    tempStar.x=data[i].x;
                    tempStar.y=data[i].y;
                    tempStar.size=data[i].size;
                    tempStar.color=data[i].color.levels;
                    stars.push(tempStar);
                }
                loop();
            }
        );
    })
}
function visualizationAlgorithm() {
    switch (currentSelection) {
        case "Extreme Point": {
            drawTriangle(currentTriangle);
            break;
        }
        case "Extreme Edge": {
            drawEdges(currentEdges);
            break;
        }
        case "Incremental": {
            drawIncrementalState(currentTestState);
            break;
        }
        case "Jarvis March": {
            //drawConvexHullByStartVertex(ltl);
            drawJarvisMarchState(currentJarvisMarchState);
            break;
        }
        case "Graham Scan": {
            // drawGrahamScanResult(GrahamScanResult);
            drawGrahamScanState(currentGrahamScanState);
            break;
        }
    }
}
