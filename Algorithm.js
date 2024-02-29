class star {
    constructor(width, height, size = 5) {
        this.x = (Math.random() * 0.8 + 0.1) * width;
        this.y = (Math.random() * 0.8 + 0.1) * height;
        this.originPos = { x: this.x, y: this.y };
        this.originSize = size;
        this.size = size;

        this.color = color(parseInt(Math.random() * 255), parseInt(Math.random() * 255), parseInt(Math.random() * 255));

        this.isShining = false;
        this.targetSize = size;

        this.isExtremePoint = false;
        this.prev = null;
        this.next = null;
        this.isHover = false;
    }
    detect() {
        if (mouseIsPressed) return;

        let sqrtDist = SqrtDist({ x: this.x, y: this.y }, { x: mouseX, y: mouseY });
        let currentHoverDist = Number.MAX_VALUE;
        if (currentHoverStar != null) {
            currentHoverDist = SqrtDist({ x: currentHoverStar.x, y: currentHoverStar.y }, { x: mouseX, y: mouseY });
        }

        let size = Math.max(this.originSize, this.size);
        if (sqrtDist < size * size / 4 && sqrtDist < currentHoverDist) {
            console.log(this.size);
            if (currentHoverStar != null) currentHoverStar.isHover = false;
            currentHoverStar = this;
            this.isHover = true;
            console.log('Hover');
        }
    }
    reset() {
        this.isShining = false;
        this.isExtremePoint = false;
        this.prev = null;
        this.next = null;
    }
    shine(strength = 1) {
        if (this.isHover) {
            this.size = lerp(this.size, this.originSize * 2.5, 0.05);
            //cursor('grab');
            return;
        }
        if (this.isExtremePoint) {
            this.size = lerp(this.size, this.originSize * 5, 0.05);;
            return;
        }
        if (Math.abs(this.size - this.targetSize) < 0.2) {
            this.isShining = false;
        }
        if (!this.isShining) {
            this.targetSize = (random() * (strength - 0.2) + 0.2) * this.originSize;
            this.isShining = true;
        }
        this.size = lerp(this.size, this.targetSize, 0.05);
    }
    display() {
        push();
        stroke(this.color);
        strokeWeight(this.size);
        point(this.x, this.y);
        pop();
    }
}

function getExtremePoints(vertices) {
    let n = vertices.length;
    for (let i = 0; i < n; i++) {
        vertices[i].isExtremePoint = true;
    }
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            for (let k = j + 1; k < n; k++) {
                let p = vertices[i];
                let q = vertices[j];
                let r = vertices[k];
                for (let x = 0; x < n; x++) {
                    let s = vertices[x];
                    if (x == i || x == j || x == k || !s.isExtremePoint) { continue; }
                    if (InTriangleTest(p, q, r, s)) {
                        s.isExtremePoint = false;
                    }
                }
            }
        }
    }
    return vertices;
}

function drawTriangle(currentTriangle = { p: { x: 0, y: 0 }, q: { x: 0, y: 0 }, r: { x: 0, y: 0 } }) {
    let p = currentTriangle.p;
    let q = currentTriangle.q;
    let r = currentTriangle.r;
    if (!ToLeftTest(p, q, r)) return;
    push();
    stroke('#FFFFFF');
    strokeWeight(1);
    noFill();
    triangle(p.x, p.y, q.x, q.y, r.x, r.y);
    pop();
}
async function asyncGetExtremePoints(vertices, currentTriangle = { p: { x: 0, y: 0 }, q: { x: 0, y: 0 }, r: { x: 0, y: 0 } }) {
    let n = vertices.length;
    for (let i = 0; i < n; i++) {
        vertices[i].isExtremePoint = true;
    }
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            for (let k = j + 1; k < n; k++) {
                let p = vertices[i];
                let q = vertices[j];
                let r = vertices[k];
                if (!ToLeftTest(p, q, r)) {
                    let t = q;
                    q = r; r = t;
                }
                currentTriangle.p = p;
                currentTriangle.q = q;
                currentTriangle.r = r;

                if (isVeryFast) {// out variable
                    await waitforme(baseWaitfortime / currentSpeed);// out variable
                    console.log('Extreme Point');
                }
                for (let x = 0; x < n; x++) {
                    let s = vertices[x];
                    if (x == i || x == j || x == k || !s.isExtremePoint) { continue; }
                    if (InTriangleTest(p, q, r, s)) {
                        s.isExtremePoint = false;
                    }

                    if (!isVeryFast) {// out variable
                        await waitforme(baseWaitfortime / currentSpeed);// out variable
                        console.log('Extreme Point');
                    }
                }
            }
        }
    }
    currentTriangle.p = { x: 0, y: 0 };
    currentTriangle.q = { x: 0, y: 0 };
    currentTriangle.r = { x: 0, y: 0 };
    return vertices;
}

async function CheckEdge(vertices, i, j) {
    let LEmpty = true, REmpty = true;
    let n = vertices.length;
    let p = vertices[i];
    let q = vertices[j];
    for (let k = 0; k < n && (LEmpty || REmpty); k++) {
        if (!isVeryFast) {// outer variable
            await waitforme(baseWaitfortime / currentSpeed);// outer variable
            console.log('Check Edge');
        }

        if (k != i && k != j) {
            let s = vertices[k];
            if (!ToLeftTest(p, q, s)) {
                LEmpty = false;
            } else {
                REmpty = false;
            }
        }
    }
    if (LEmpty || REmpty) {
        p.isExtremePoint = q.isExtremePoint = true;
        if (LEmpty) {
            return -1;
        } else if (REmpty) {
            return 1;
        }
    } else {
        return 0;
    }
}
function getExtremeEdges(vertices) {
    let n = vertices.length;
    let edges = [];
    for (let i = 0; i < n; i++) {
        vertices[i].isExtremePoint = false;
    }
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            let edgeType = CheckEdge(vertices, i, j);
            switch (edgeType) {
                case 1: {
                    edges.push(new Edge(vertices[i], vertices[j]));
                    break;
                }
                case -1: {
                    edges.push(new Edge(vertices[j], vertices[i]));
                    break;
                }
            }
        }
    }
    return edges;
}
async function asyncGetExtremeEdges(vertices, currentEdges = []) {
    let n = vertices.length;
    let edges = [];
    for (let i = 0; i < n; i++) {
        vertices[i].isExtremePoint = false;
    }
    currentEdges.push(new Edge({ x: 0, y: 0 }, { x: 0, y: 0 }));
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            currentEdges[currentEdges.length - 1] = new Edge(vertices[i], vertices[j]);

            if (isVeryFast) {// outer variable
                await waitforme(baseWaitfortime / currentSpeed);// outer variable
                console.log('Extreme Edge');
            }

            let edgeType = await CheckEdge(vertices, i, j);
            switch (edgeType) {
                case 1: {
                    edges.push(new Edge(vertices[i], vertices[j]));
                    currentEdges[currentEdges.length - 1] = edges[edges.length - 1];
                    currentEdges.push(new Edge({ x: 0, y: 0 }, { x: 0, y: 0 }));
                    break;
                }
                case -1: {
                    edges.push(new Edge(vertices[j], vertices[i]));
                    currentEdges[currentEdges.length - 1] = edges[edges.length - 1];
                    currentEdges.push(new Edge({ x: 0, y: 0 }, { x: 0, y: 0 }));
                    break;
                }
            }
        }
    }
    currentEdges.pop();
    return edges;
}
function drawEdge(edge) {
    push();
    stroke('#FFFFFF');
    line(edge.origin.x, edge.origin.y, edge.next.x, edge.next.y);
    pop();
}
function drawEdges(edges = []) {
    for (let i = 0; i < edges.length; i++) {
        drawEdge(edges[i]);
    }
}

function getConvexHullByIncremental(vertices) {
    let n = vertices.length;
    if (vertices.length < 3) return convexHull;
    let p = vertices[0];
    let q = vertices[1];
    let r = vertices[2];
    let startVertex = p;
    if (ToLeftTest(p, q, r)) {
        p.next = q; p.prev = r;
        q.next = r; q.prev = p;
        r.next = p; r.prev = q;
    } else {
        p.next = r; p.prev = q;
        r.next = q; r.prev = p;
        q.next = p; q.prev = r;
    }
    for (let i = 3; i < n; i++) {
        let x = vertices[i];
        let k = startVertex;

        let s, t;
        do {
            let prevTest = ToLeftTest(x, k, k.prev);
            let nextTest = ToLeftTest(x, k, k.next);
            if (prevTest && nextTest) {
                s = k;
            } else if (!prevTest && !nextTest) {
                t = k;
            }
            k = k.next;
        } while (k != startVertex);

        if (ToLeftTest(x, startVertex, startVertex.prev)
            && !ToLeftTest(x, startVertex, startVertex.next)) {
            startVertex = x;
        }

        if (s != undefined && t != undefined) {
            t.next = x;
            x.next = s;
            x.prev = t;
            s.prev = x;
        }
    }
    return startVertex;
}
function drawConvexHullByStartVertex(startVertex) {
    let k = startVertex;
    push();
    stroke('#FFFFFF');
    noFill();
    beginShape();
    do {
        vertex(k.x, k.y);
        k = k.next;
    } while (k != startVertex);
    vertex(k.x, k.y);
    endShape();
    pop();
}

async function asyncGetConvexHullByIncremental(vertices, currentIncrementalState = {
    startVertex,
    x: { x: 0, y: 0 },
    t: { x: 0, y: 0 },
    prev: { x: 0, y: 0 },
    next: { x: 0, y: 0 },
    isFinish: false
}) {
    let n = vertices.length;
    if (vertices.length < 3) return convexHull;
    let p = vertices[0];
    let q = vertices[1];
    let r = vertices[2];
    let startVertex = p;
    if (ToLeftTest(p, q, r)) {
        p.next = q; p.prev = r;
        q.next = r; q.prev = p;
        r.next = p; r.prev = q;
    } else {
        p.next = r; p.prev = q;
        r.next = q; r.prev = p;
        q.next = p; q.prev = r;
    }
    for (let i = 3; i < n; i++) {
        let x = vertices[i];
        currentIncrementalState.x.x = x.x;
        currentIncrementalState.x.y = x.y;

        let k = startVertex;
        currentIncrementalState.startVertex = startVertex;

        let s, t;
        do {
            currentIncrementalState.t.x = k.x;
            currentIncrementalState.t.y = k.y;
            currentIncrementalState.prev.x = k.prev.x;
            currentIncrementalState.prev.y = k.prev.y;
            currentIncrementalState.next.x = k.next.x;
            currentIncrementalState.next.y = k.next.y;

            await waitforme(baseWaitfortime / currentSpeed);// outer variable
            console.log('Incremental');

            let prevTest = ToLeftTest(x, k, k.prev);
            let nextTest = ToLeftTest(x, k, k.next);
            if (prevTest && nextTest) {
                s = k;
            } else if (!prevTest && !nextTest) {
                t = k;
            }
            k = k.next;
        } while (k != startVertex);

        if (ToLeftTest(x, startVertex, startVertex.prev)
            && !ToLeftTest(x, startVertex, startVertex.next)) {
            startVertex = x;
        }

        if (s != undefined && t != undefined) {
            t.next = x;
            x.next = s;
            x.prev = t;
            s.prev = x;
        }
    }
    currentIncrementalState.isFinish = true;
    let k = startVertex;
    do {
        k.isExtremePoint = true;
        k = k.next;
    } while (k != startVertex);
    return startVertex;
}
function drawIncrementalState(currentIncrementalState = {
    startVertex,
    x: { x: 0, y: 0 },
    t: { x: 0, y: 0 },
    prev: { x: 0, y: 0 },
    next: { x: 0, y: 0 },
    isFinish: false
}) {
    if (currentIncrementalState.startVertex == undefined) return;

    let x = currentIncrementalState.x;
    let t = currentIncrementalState.t;
    let prev = currentIncrementalState.prev;
    let next = currentIncrementalState.next;
    drawConvexHullByStartVertex(currentIncrementalState.startVertex);
    if (currentIncrementalState.isFinish) { return; }

    push();
    stroke('#FFFFFF');
    line(x.x, x.y, t.x, t.y);
    stroke('#9043FF');
    line(t.x, t.y, prev.x, prev.y);
    stroke('#E8FF6A');
    line(t.x, t.y, next.x, next.y);
    pop();
}


function getConvexHullByJarvisMarch(vertices) {
    let n = vertices.length;
    for (let i = 0; i < n; i++) {
        vertices[i].isExtremePoint = false;
    }
    let ltl = LTL(vertices);
    let k = ltl;
    do {
        k.isExtremePoint = true;
        let s = -1;
        for (let i = 0; i < n; i++) {
            let t = vertices[i];
            if (t != k && t != s && (s == -1 || !ToLeftTest(k, s, t))) {
                s = t;
            }
        }
        k.next = s; k = s;
    } while (k != ltl);
    return ltl;
}

async function aysncGetConvexHullByJarvisMarch(vertices, currentJarvisMarchState = {
    ltl: { x: 0, y: 0 }, s: { x: 0, y: 0 }, t: { x: 0, y: 0 }, isFinish: false
}) {
    let n = vertices.length;
    for (let i = 0; i < n; i++) {
        vertices[i].isExtremePoint = false;
    }
    let ltl = LTL(vertices);
    currentJarvisMarchState.ltl = ltl;

    let k = ltl;
    do {
        k.isExtremePoint = true;
        let s = -1;
        for (let i = 0; i < n; i++) {
            let t = vertices[i];
            currentJarvisMarchState.t = t;
            if (t != k && t != s && (s == -1 || !ToLeftTest(k, s, t)) && (t == ltl || t.next == undefined)) {
                s = t;
                currentJarvisMarchState.s = s;
            }
            await waitforme(baseWaitfortime / currentSpeed);// outer variable
            console.log('Jarvis March');
        }
        k.next = s; k = s;
    } while (k != ltl);
    currentJarvisMarchState.isFinish = true;
    return ltl;
}

function LTL(vertices) {
    let ltl = vertices[0];
    for (let i = 1; i < vertices.length; i++) {
        if (vertices[i].y < ltl.y || (vertices[i].y == ltl.y && vertices[i].x < ltl.x)) {
            ltl = vertices[i];
        }
    }
    return ltl;
}
function drawJarvisMarchState(currentJarvisMarchState = {
    ltl: { x: 0, y: 0 }, s: { x: 0, y: 0 }, t: { x: 0, y: 0 }, isFinish: false
}) {

    push();
    let k = currentJarvisMarchState.ltl;
    let s = currentJarvisMarchState.s;
    let t = currentJarvisMarchState.t;
    stroke('#FFFFFF');
    noFill();
    beginShape();
    do {
        vertex(k.x, k.y);
        if (k.next == undefined) break;
        k = k.next;
    } while (k != s);
    if (currentJarvisMarchState.isFinish) {
        vertex(s.x, s.y);
    }
    endShape();
    if (!currentJarvisMarchState.isFinish) {
        stroke('#FFDE1F');
        line(k.x, k.y, s.x, s.y);
        stroke('#9043FF');
        line(s.x, s.y, t.x, t.y);
    }
    pop();
}

function GrahamScan(vertices) {
    let newVertices = vertices.slice(0);
    let ltl = LTL(newVertices);
    newVertices.splice(newVertices.indexOf(ltl), 1);
    newVertices.sort((a, b) => { return ToLeftTest(ltl, a, b) ? -1 : 1 });
    let t = [];
    let s = [];
    s.push(ltl);
    s.push(newVertices.shift());
    while (newVertices.length > 0) {
        t.push(newVertices.pop());
    }
    while (t.length > 0) {
        let s0 = s[s.length - 1];
        let s1 = s[s.length - 2];
        let t0 = t.pop();
        if (ToLeftTest(s1, s0, t0)) {
            s.push(t0);
        } else {
            do {
                s.pop();
                s0 = s1;
                s1 = s[s.length - 2];
            } while (!ToLeftTest(s1, s0, t0));
            s.push(t0);
        }
    }
    return s;
}
function drawRadioSortResult() {
    push();
    for (let i = 0; i < sortResult.vertices.length; i++) {
        stroke(i);
        line(sortResult.ltl.x, sortResult.ltl.y, sortResult.vertices[i].x, sortResult.vertices[i].y);
    }
    pop();
}
function drawGrahamScanResult(s) {
    push();
    stroke('#FFFFFF');
    noFill();
    beginShape();
    for (let i = 0; i < s.length; i++) {
        vertex(s[i].x, s[i].y);
    }
    vertex(s[0].x, s[0].y);
    endShape();
    pop();
}

async function asyncGrahamScan(vertices, currentGrahamScanState = { s: [], t: { x: 0, y: 0 }, isFinish: false }) {
    let newVertices = vertices.slice(0);
    let ltl = LTL(newVertices);
    newVertices.splice(newVertices.indexOf(ltl), 1);
    newVertices.sort((a, b) => { return ToLeftTest(ltl, a, b) ? -1 : 1 });
    let t = [];
    let s = [];
    s.push(ltl);
    s.push(newVertices.shift());
    while (newVertices.length > 0) {
        t.push(newVertices.pop());
    }
    while (t.length > 0) {
        let s0 = s[s.length - 1];
        let s1 = s[s.length - 2];
        let t0 = t.pop();

        currentGrahamScanState.t = t0;
        if (ToLeftTest(s1, s0, t0)) {
            currentGrahamScanState.s = s;

            await waitforme(baseWaitfortime / currentSpeed);// outer variable
            console.log('Graham Scan');

            s.push(t0);
        } else {
            do {
                s.pop();
                s0 = s1;
                s1 = s[s.length - 2];
                currentGrahamScanState.s = s;
                await waitforme(baseWaitfortime / currentSpeed);// outer variable
                console.log('Graham Scan');

            } while (!ToLeftTest(s1, s0, t0));
            s.push(t0);
        }
    }
    currentGrahamScanState.isFinish = true;
    for (let i = 0; i < s.length; i++) {
        s[i].isExtremePoint = true;
    }
    return s;
}
function drawGrahamScanState(currentGrahamScanState = { s: [], t: { x: 0, y: 0 }, isFinish: false }) {
    if (currentGrahamScanState.s.length == 0) return;

    let s = currentGrahamScanState.s;
    let s0 = s[s.length - 1];
    let t0 = currentGrahamScanState.t;
    push();
    stroke('#FFFFFF');
    noFill();
    beginShape();
    for (let i = 0; i < s.length; i++) {
        vertex(s[i].x, s[i].y);
    }
    if (currentGrahamScanState.isFinish) { vertex(s[0].x, s[0].y) };
    endShape();
    if (!currentGrahamScanState.isFinish) {
        stroke('#9043FF');
        line(s0.x, s0.y, t0.x, t0.y);
    }
    pop();
}