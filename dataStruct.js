class Vertex{
    constructor(point,edge,id){
        this.point=point;
        this.nextEdge=edge;
        this.id=id;
    }
}
class EdgeBase{
    constructor(v1,v2){
        this.origin=v1;
        this.next=v2;
    }
}
class Edge extends(EdgeBase){
    constructor(v1,v2){
        super(v1,v2);
    }
}