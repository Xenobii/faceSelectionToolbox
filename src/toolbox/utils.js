let Utils = {};

Utils.setVectorPrecision = (v, prec)=>{
    v.x = parseFloat( v.x.toPrecision(prec) );
    v.y = parseFloat( v.y.toPrecision(prec) );
    v.z = parseFloat( v.z.toPrecision(prec) );
    
    return v;
};

export default Utils;