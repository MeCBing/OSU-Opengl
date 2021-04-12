#version 330 compatibility

in vec2 vST;
in vec3 vColor;
in float vLightIntensity;

uniform float uTol;
uniform float uAd;
uniform float uBd;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uAlpha;

uniform sampler2D Noise2;

const vec3 WHITE = vec3(1., 1., 1.);

void
main()
{
    // float f = fract( uA * vX);

    float Ar = uAd/2.;
    float Br = uBd/2.;
    int numins = int( vST.s / uAd );
    int numint = int( vST.t / uBd );
    // float sc = numins * uAd + Ar;
    // float tc = numint * uBd + Br;

    vec4 nv  = texture2D( Noise2, uNoiseFreq * vST );

    float n = nv.r + nv.g + nv.b + nv.a;    //  1. -> 3.
    n = n - 2.;                             // -1. -> 1.
    n *= uNoiseAmp;

    float sc = float(numins) * uAd  +  Ar;
    float ds = vST.s - sc;                   // wrt ellipse center
    float tc = float(numint) * uBd  +  Br;
    float dt = vST.t - tc;                   // wrt ellipse center

    float oldDist = sqrt( ds*ds + dt*dt );
    float newDist = oldDist + n;
    float scale = newDist / oldDist;        // this could be < 1., = 1., or > 1.

    ds *= scale; // scale by noise factor
    ds /= Ar; // ellipse equation
    dt *= scale; // scale by noise factor
    dt /= Br; // ellipse equation

    float d = ds*ds + dt*dt;
    // float d = ((ds * ds)) / (Ar * Ar)) + ((dt * dt) / (Br * Br));
    // float t = smoothstep(0.5-uP-uTol, 0.5-uP+uTol, f) - smoothstep(0.5+uP-uTol, 0.5+uP+uTol, f);
    float t = smoothstep(1. - uTol, 1 + uTol, d);
    vec4 back = vec4(vLightIntensity * WHITE, uAlpha);
    vec4 color = vec4(vLightIntensity * vColor, 1.);

    vec4 rgb =  mix(color, back, t);
    if (uAlpha == 0. && rgb == back)
    {
        discard;
    }
    gl_FragColor = rgb;
}