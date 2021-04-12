#version 330 compatibility

in float vX, vY;
in vec2 vST;
in vec3 vColor;
in float vLightIntensity;

uniform float uTol;
uniform float uAd;
uniform float uBd;
uniform float uAmp;

const vec3 WHITE = vec3(1., 1., 1.);

void
main()
{
    // float f = fract( uA * vX);

    float Ar = uAd/2.;
    float Br = uBd/2.;
    int numins = int( vST.s / uAd );
    int numint = int( vST.t / uBd );
    float sc = numins * uAd + Ar;
    float tc = numint * uBd + Br;

    float d = (((vST.s - sc) * (vST.s - sc)) / (Ar * Ar)) + (((vST.t - tc) * (vST.t - tc)) / (Br * Br));

    // float t = smoothstep(0.5-uP-uTol, 0.5-uP+uTol, f) - smoothstep(0.5+uP-uTol, 0.5+uP+uTol, f);
    float t = smoothstep(1. - uTol, 1 + uTol, d);
    vec3 rgb = vLightIntensity * mix(vColor, WHITE, t);
    gl_FragColor = vec4(rgb, 1.);
}