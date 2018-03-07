var gt = (function(){
    var shaders = {
        vertex: function(){
            return `
                attribute vec2 position;
                varying vec2 surfacePosition;
                uniform vec2 screenRatio;

                void main() {
                    surfacePosition = position*screenRatio;
                    gl_Position = vec4(position, 0, 1);
                }
            `;
        }
    };

    shaders.fragment = {};
    shaders.fragment.rendering_functions = `
        vec3 normal(vec3 p){
            const float eps = 0.01;

            return normalize(vec3(scene(p + vec3(eps, 0, 0) ) - scene(p - vec3(eps, 0, 0)),
                                  scene(p + vec3(0, eps, 0) ) - scene(p - vec3(0, eps, 0)),
                                  scene(p + vec3(0, 0, eps) ) - scene(p - vec3(0, 0, eps))));
        }

        vec4 simpleLambert (vec3 normal) {
            vec3 lightDir = -normalize(lookAt-camPos);
            //vec3 lightDir = vec3(0.0,0.0,-1.0); // Light direction
            vec3 lightCol = vec3(1.0,1.0,1.0); // Light color

            float NdotL = max(dot(normal, lightDir),0.0);
            vec3 color = vec3(0.309,0.541,1.0) * lightCol * (0.7 + NdotL*0.3);

            return vec4(color.x, color.y, color.z, 1.0);
        }

        vec4 renderSurface(vec3 p){
            vec3 n = normal(p);
            return simpleLambert(n);
        }


        //raymarching
        const int STEPS = 256;
        const float MIN_DISTANCE = 0.001;
        vec4 rayMarching( vec3 origin, vec3 direction ) {
            float totaldistance = 0.0;

            vec3 position = origin;
            for(int i=0; i<STEPS; i++){
                float distance = scene(position);

                if (distance < MIN_DISTANCE) {
                    return renderSurface(position);
                }

                totaldistance += distance;
                position += distance * direction;

                if(totaldistance > 8.0){
                    break;
                }
            }
            return vec4(0.933,0.937,0.949,1.);
        }

        //main
        void main() {
            vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
            vec2 screenCoords = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*aspect;

            // Camera setup.
            vec3 forward = normalize(lookAt-camPos);
            vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
            vec3 up = normalize(cross(forward,right));

            float FOV = 0.5; // FOV - Field of view.
            vec3 ro = camPos; // ro - Ray origin.
            vec3 rd = normalize(forward + FOV*screenCoords.x*right + FOV*screenCoords.y*up); // rd - Ray direction.

            gl_FragColor = rayMarching(ro, rd);
        }
    `;

    shaders.fragment.scene = `
        float scene(in vec3 p) {
            return sdf_sphere(p, vec3(0.0,0.0,0.0), 1.5);
        }
    `;

    shaders.fragment.uniforms = `
        //#extension GL_OES_standard_derivatives : enable

        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform vec2 resolution;
        uniform vec3 lookAt;
        uniform vec3 camPos;

        uniform float sceneGraph[40];
    `;

    shaders.fragment.compose = function(scene, lib){
        return   shaders.fragment.uniforms+
                 lib+
                 scene+
                 shaders.fragment.rendering_functions;
    };

    return {
        shaders: shaders
    };
})();
