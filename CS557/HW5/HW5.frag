#version 330 compatibility

uniform sampler2D	uImageUnit;
uniform float 		uSc;
uniform float 		uTc;
uniform float		uDs;
uniform float 		uDt;
uniform float       uMagFactor;
uniform float       uRotAngle;
uniform float       uSharpFactor;
uniform float       uRadius;
uniform bool        uUseCircle;

float ResS, ResT;
vec3 target, irgb;

in vec3	vMC;
in vec3	vNs;
in vec3	vEs;
in vec2 vST;

const vec4  WHITE = vec4( 1.,1.,1.,1. );

void
shader( )   
{
    ivec2 ires = textureSize( uImageUnit, 0 );
    ResS = float( ires.s );
    ResT = float( ires.t );

    vec2 ST = vec2(vST.s, vST.t);
    ST.s = (ST.s - uSc) / uMagFactor;
    ST.t = (ST.t - uTc) / uMagFactor;

    float ns = ST.s * cos(uRotAngle) - ST.t * sin(uRotAngle);
    float nt = ST.s * sin(uRotAngle) + ST.t * cos(uRotAngle);

    ST = vec2(ns + uSc, nt + uTc);
    irgb = texture2D(uImageUnit, ST).rgb;
    
	vec2 stp0 = vec2(1./ResS, 0. );
    vec2 st0p = vec2(0. , 1./ResT);
    vec2 stpp = vec2(1./ResS, 1./ResT);
    vec2 stpm = vec2(1./ResS, -1./ResT);
    vec3 i00 = texture2D( uImageUnit, ST ).rgb;
    vec3 im1m1 = texture2D( uImageUnit, ST-stpp ).rgb;
    vec3 ip1p1 = texture2D( uImageUnit, ST+stpp ).rgb;
    vec3 im1p1 = texture2D( uImageUnit, ST-stpm ).rgb;
    vec3 ip1m1 = texture2D( uImageUnit, ST+stpm ).rgb;
    vec3 im10 = texture2D( uImageUnit, ST-stp0 ).rgb;
    vec3 ip10 = texture2D( uImageUnit, ST+stp0 ).rgb;
    vec3 i0m1 = texture2D( uImageUnit, ST-st0p ).rgb;
    vec3 i0p1 = texture2D( uImageUnit, ST+st0p ).rgb;

    target = vec3(0.,0.,0.);
    target += 1.*(im1m1+ip1m1+ip1p1+im1p1);
    target += 2.*(im10+ip10+i0m1+i0p1);
    target += 4.*(i00);
    target /= 16.;

    gl_FragColor = vec4( mix( target, irgb, uSharpFactor ), 1. );
}

void
main( )
{
    vec4 Image = texture2D(uImageUnit, vST);	
    gl_FragColor = vec4(Image.rgb, 1.);
    
    if (uUseCircle) {
        if ((vST.s-uSc) * (vST.s-uSc) + (vST.t-uTc) * (vST.t-uTc) < uRadius * uRadius) {
            shader();
        }
    } else {
        if ((vST.s > (uSc-uDs)) && (vST.s < (uSc+uDs)) && (vST.t > (uTc-uDt)) && (vST.t < (uTc+uDt))) { 
            shader();
        }
    }
}