gt.geom = (function(){

    return {
        scene: function(c){
            return "float scene(in vec3 p){return "+c+";}";
        },

        /*transforms*/
        translate: function(o,c){
            return c.replace(/p/g,"(p-"+o+")");
        },

        repeat: function(r, c){
            return c.replace(/p/g, "(mod(p,"+r+")-0.5*"+r+")");
        },

        /*primitives*/
        vec: function(x,y,z){
            return "vec3("+x+","+y+","+z+")";
        },

        /*boolean*/
        union: function(a,b){
            return "min("+a+","+b+")";
        },

        subtract: function(a,b){
            return "max(-("+a+"),"+b+")";
        },

        intersect: function(a,b){
            return "max("+a+","+b+")";
        },

        sunion: function(k,a,b){
            return "-log(max(0.0001,exp(-"+k.toFixed(2)+"*("+a+")) + exp(-"+k.toFixed(2)+"*("+b+")))) / "+k.toFixed(2);
        },

        blend: function(k,a,b){
            k = k.toFixed(2);
            return k +"*("+a+")+(1.0-"+k+")*("+b+")";
        },
        /*geometry functions*/
        sphere: function(r,c){
            return "length(p) - "+r.toFixed(2);
        },

        torus: function(x,y){
            return "length(vec2(length(p.xz)-"+x.toFixed(2)+",p.y))-"+y.toFixed(2);
        },
    };
})();
