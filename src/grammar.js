gt.grammar = (function(){
    function compile(node){
        if(!node.empty){
            return g.find(function(e){
                return e.name === node.name;
            }).compile(node);
        }
    }

    var g = [
        //ROOT
        {
            type: "component",
            compile: function(node){
                var a = compile(node.children[0]);
                if(a) return "float scene(in vec3 p){return "+a+";}";
            },
            args: [{
                type: "shape"
            }]
        },

        //SPHERE
        {
            name: "sphere",
            type: "shape",
            cat: "primitive",
            docs: "Primitive Geometry",
            compile: function(node){
                var r = compile(node.children[0]);
                if(r) return "length(p) - "+r;
            },
            args: [{
                type: "float",
                label: "radius"
            }]
        },

        //BOX
        {
            name: "box",
            type: "shape",
            cat: "primitive",
            docs: "Primitive Geometry",
            func: `
                float sdf_box(in vec3 p, in vec3 b ) {
                    vec3 d = abs(p) - b;
                    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
                }
            `,
            compile: function(node){
                var a = compile(node.children[0]);
                var b = compile(node.children[1]);
                var c = compile(node.children[2]);
                if(a&&b&&c) return "sdf_box(p,vec3("+a+","+b+","+c+"))";
            },
            args: [{
                type: "float",
                label: "width"
            },{
                type: "float",
                label: "height"
            },{
                type: "float",
                label: "depth"
            }]
        },

        //UNION
        {
            name: "union",
            type: "shape",
            cat: "boolean",
            docs: "Boolean Operator",
            compile: function(node){
                var a = compile(node.children[0]);
                var b = compile(node.children[1]);
                if(a&&b){
                    return "min("+a+","+b+")";
                }
            },
            args: [{
                type: "shape",
            },{
                type: "shape",
            }]
        },

        //SUBTRACT
        {
            name: "subtract",
            type: "shape",
            cat: "boolean",
            docs: "Boolean Operator",
            compile: function(node){
                var a = compile(node.children[0]);
                var b = compile(node.children[1]);
                if(a&&b){
                    return "max(-("+a+"),"+b+")";
                }
            },
            args: [{
                type: "shape",
            },{
                type: "shape",
            }]
        },


        //TRANSLATE
        {
            name: "translate",
            type: "shape",
            cat: "transform",
            docs: "offset",

            //length(p-vec3(0.2,0.2,0.1)) - 1.00
            compile: function(node){
                var a = compile(node.children[0]);
                var b = compile(node.children[1]);
                var c = compile(node.children[2]);
                var d = compile(node.children[3]);
                if(a&&b&&c&&d){
                    return d.replace("p","p-vec3("+a+","+b+","+c+")");
                }
            },
            args: [{
                type: "float",
                label: "x"
            },{
                type: "float",
                label: "y"
            },{
                type: "float",
                label: "z"
            },{
                type: "shape",
            }]
        },

        //FLOAT
        {
            name: "number",
            type: "float",
            docs: "Literal Float",
            value: 1.0,
            compile: function(node){
                return node.value.toFixed(2);
            }
        },
        {
            name: "variable",
            type: "float",
            docs: "Variable Float",
            value: 1.0,

        },
    ];

    return {
        getType: function(type){
            return g.filter(function(e){
                return e.type === type;
            });
        },
        getFunc: function(){
            return g.reduce(function(acc, e){
                if(e.func !== undefined){
                   return acc + e.func;
                }
                return acc;
            },"");
        },
        compile: compile
    };
})();
