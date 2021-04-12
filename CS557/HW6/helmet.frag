#version 330 compatibility

uniform vec4 uColor;
uniform float uAlpha;
uniform float uRadius;

in float vLightIntensity;
in vec2	vST;

void
main( )
{
    

    if (uRadius < 0.5) {
        gl_FragColor = vec4(vLightIntensity * uColor.rgb, 1.);
        if ((vST.s-0.5) * (vST.s-0.5) + (vST.t-0.5) * (vST.t-0.5) < uRadius * uRadius) {
            if (uAlpha == 0.)
            {
                discard;
            }
            gl_FragColor = vec4(vLightIntensity * uColor.rgb, uAlpha);
        }
    }
    else {
        if (uAlpha == 0.)
        {
            discard;
        }
        gl_FragColor = vec4(vLightIntensity * uColor.rgb, uAlpha);
    }
}