function ToLeftTest(p, q, r) {
    return (
        p.x * q.y - p.y * q.x +
        q.x * r.y - q.y * r.x +
        r.x * p.y - r.y * p.x
    ) > 0;
}
function InTriangleTest(p, q, r, s) {
    if (!ToLeftTest(p, q, s)) return false;
    if (!ToLeftTest(q, r, s)) return false;
    if (!ToLeftTest(r, p, s)) return false;
    return true;
}
function InCircle(center,radius,pos){
    return SqrtDist(center,pos)<radius*radius;
}
function SqrtDist(pos1,pos2){
    return Math.pow(pos1.x-pos2.x,2)+Math.pow(pos1.y-pos2.y,2);
}
let currentWaitforme;
function waitforme(delay,excute=()=>{}) {
    return new Promise(resovle => {
        currentWaitforme=setTimeout(() => { resovle();excute();}, delay);// outer variable
        //console.log(currentWaitforme);
    }
    )
}