#version 330 compatibility

in vec2 vST;
in vec4 vECposition;
in vec3 vMCposition;

in vec3 vNf;
in vec3 vNs;
in vec3 vLf;
in vec3 vLs;
in vec3 vEf;
in vec3 vEs;


// uniform float uLightX, uLightY, uLightz;
uniform float uKa, uKd, uKs;
uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform float uShininess;
uniform float uNoiseAmp;
uniform float uNoiseFreq;

uniform sampler3D Noise3;

const vec3 WHITE = vec3(1., 1., 1.);

vec3
RotateNormal( float angx, float angy, vec3 n )
{
        float cx = cos( angx );
        float sx = sin( angx );
        float cy = cos( angy );
        float sy = sin( angy );

        // rotate about x:
        float yp =  n.y*cx - n.z*sx;    // y'
        n.z      =  n.y*sx + n.z*cx;    // z'
        n.y      =  yp;
        // n.x      =  n.x;

        // rotate about y:
        float xp =  n.x*cy + n.z*sy;    // x'
        n.z      = -n.x*sy + n.z*cy;    // z'
        n.x      =  xp;
        // n.y      =  n.y;

        return normalize( n );
}

void
main()
{

    vec4 nvx = texture3D( Noise3, uNoiseFreq * vMCposition );
	float angx = nvx.r + nvx.g + nvx.b + nvx.a  -  2.;
	angx *= uNoiseAmp;

    vec4 nvy = texture3D( Noise3, uNoiseFreq * vec3(vMCposition.xy, vMCposition.z + 0.5) );
	float angy = nvy.r + nvy.g + nvy.b + nvy.a  -  2.;
	angy *= uNoiseAmp;

    // vec3 Normal = RotateNormal(angx, angy, vNs);
    vec3 Normal = normalize(gl_NormalMatrix * RotateNormal(angx, angy, vNs));
    vec3 Light = normalize(vLs);
	vec3 Eye = normalize(vEs);

    vec4 ambient = uKa * uColor;

    float d = max( dot(Normal, Light), 0. );
    vec4 diffuse = uKd * d * uColor;

    float s = 0.;
    if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
    {
        vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
        s = pow( max( dot(Eye,ref),0. ), uShininess );
        // vec3 ref = normalize(  reflect( -Light, Normal )  );
		// s = pow( max( dot(Eye,ref),0. ), uShininess );
    }
    vec4 specular = uKs * s * uSpecularColor;
    gl_FragColor = vec4( ambient.rgb + diffuse.rgb + specular.rgb, 1. );

    // float f = fract( uA * vX);

    // float Ar = uAd/2.;
    // float Br = uBd/2.;
    // int numins = int( vST.s / uAd );
    // int numint = int( vST.t / uBd );
    // float sc = numins * uAd + Ar;
    // float tc = numint * uBd + Br;

    // vec4 nv  = texture2D( Noise2, uNoiseFreq * vST );

    // float n = nv.r + nv.g + nv.b + nv.a;    //  1. -> 3.
    // n = n - 2.;                             // -1. -> 1.
    // n *= uNoiseAmp;

    // float sc = float(numins) * uAd  +  Ar;
    // float ds = vST.s - sc;                   // wrt ellipse center
    // float tc = float(numint) * uBd  +  Br;
    // float dt = vST.t - tc;                   // wrt ellipse center

    // float oldDist = sqrt( ds*ds + dt*dt );
    // float newDist = oldDist + n;
    // float scale = newDist / oldDist;        // this could be < 1., = 1., or > 1.

    // ds *= scale; // scale by noise factor
    // ds /= Ar; // ellipse equation
    // dt *= scale; // scale by noise factor
    // dt /= Br; // ellipse equation

    // float d = ds*ds + dt*dt;
    // // float d = ((ds * ds)) / (Ar * Ar)) + ((dt * dt) / (Br * Br));
    // // float t = smoothstep(0.5-uP-uTol, 0.5-uP+uTol, f) - smoothstep(0.5+uP-uTol, 0.5+uP+uTol, f);
    // float t = smoothstep(1. - uTol, 1 + uTol, d);
    // vec4 back = vec4(vLightIntensity * WHITE, uAlpha);
    // vec4 color = vec4(vLightIntensity * vColor, 1.);

    // vec4 rgb =  mix(color, back, t);
    // if (uAlpha == 0. && rgb == back)
    // {
    //     discard;
    // }
    // gl_FragColor = rgb;
}