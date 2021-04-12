#version 330 compatibility

uniform sampler2D	uImageUnit;
uniform sampler2D   uImageUnit1;
// uniform float 		uSc;
// uniform float 		uTc;

// uniform float 		uSc1;
// uniform float 		uTc1;

uniform float       uMagFactor;
uniform float       uRotAngle;
uniform float       top_left_Angle, top_left_Mag;//, top_left_Sharp;
uniform float       top_mid_Angle, top_mid_Mag;//, top_mid_Sharp;
uniform float       top_right_Angle, top_right_Mag;//, top_right_Sharp;

uniform float       mid_left_Angle, mid_left_Mag;//, mid_left_Sharp;
uniform float       mid_mid_Angle, mid_mid_Mag;//, mid_mid_Sharp;
uniform float       mid_right_Angle, mid_right_Mag;//, mid_right_Sharp;

uniform float       bottom_left_Angle, bottom_left_Mag;//, bottom_left_Sharp;
uniform float       bottom_mid_Angle, bottom_mid_Mag;//, bottom_mid_Sharp;
uniform float       bottom_right_Angle, bottom_right_Mag;//, bottom_right_Sharp;
uniform float       uSharpFactor;

uniform bool win;

uniform sampler2D Noise2;


float ResS, ResT;
vec3 target, irgb;
float center_s, center_t;
float mag;
float angle;
float sharp;
bool check[9] = {false, false, false, false, false, false, false, false, false};

in vec3	vMC;
in vec3	vNs;
in vec3	vEs;
in vec2 vST;

const vec4  WHITE = vec4( 1.,1.,1.,1. );
const float d = 0.12;

highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

void
shader(float uSc, float uTc, float uDs, float uDt, float uMagFactor, float uRotAngle, float alpha)   
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

    gl_FragColor = vec4( mix( target, irgb, uSharpFactor ), alpha );
}

void
do_shader( float center_s, float center_t, float Angle, float Mag , bool check1, bool check2, int now_block) 
{
    
    vec4 r = texture2D(Noise2, vec2(center_s, center_t));
    float angle = 0.;
    float mag = 0.;
    if (check1) {
        angle = Angle + (r.r * 3.14159);
    } 
    else {
        angle = Angle - (r.g * 3.14159);
    }
    
    if (check2) {
        mag = Mag - (r.b * 1.4);
    }
    else {
        mag = Mag + (r.a * 1.4);
    }

    if (angle > -0.03 && angle < 0.03 && mag > 0.97 && mag < 1.03) {
        shader(center_s, center_t, d, d, mag, angle, 1.);
        check[now_block-1] = true;
        if (check[now_block-1]){
            vec4 Image = texture2D(uImageUnit, vST);
            gl_FragColor = vec4(Image.rgb, 1.);
        }
        
    }
    else {
        shader(center_s, center_t, d, d, mag, angle, 0.5);
    }
}

void
main( )
{
    vec4 Image = texture2D(uImageUnit, vST);
    
    gl_FragColor = vec4(Image.rgb, 1.);
    // printf("%f, %f, %f", Noise3.x, Noise3.y, Noise3.z);
    // vec3 n = vec3(Noise3);
    // top-left block
    
    center_s = 0.25;
    center_t = 0.75;
    if ((vST.s > (center_s-d)) && (vST.s < (center_s+d)) && (vST.t > (center_t-d)) && (vST.t < (center_t+d))) { 
        do_shader(center_s, center_t, top_left_Angle, top_left_Mag, true, true, 1);
    }
    // top-mid block
    center_s = 0.5;
    center_t = 0.75;
    if ((vST.s > (center_s-d)) && (vST.s < (center_s+d)) && (vST.t > (center_t-d)) && (vST.t < (center_t+d))) { 
        do_shader(center_s, center_t, top_mid_Angle, top_mid_Mag, true, false, 2);
    }
    // top-right block
    center_s = 0.75;
    center_t = 0.75;
    if ((vST.s > (center_s-d)) && (vST.s < (center_s+d)) && (vST.t > (center_t-d)) && (vST.t < (center_t+d))) { 
        do_shader(center_s, center_t, top_right_Angle, top_right_Mag, false, true, 3);
    }
    // mid-left block
    center_s = 0.25;
    center_t = 0.5;
    if ((vST.s > (center_s-d)) && (vST.s < (center_s+d)) && (vST.t > (center_t-d)) && (vST.t < (center_t+d))) { 
        do_shader(center_s, center_t, mid_left_Angle, mid_left_Mag, false, false, 4);
    }
    // mid-mid block
    center_s = 0.5;
    center_t = 0.5;
    if ((vST.s > (center_s-d)) && (vST.s < (center_s+d)) && (vST.t > (center_t-d)) && (vST.t < (center_t+d))) { 
        do_shader(center_s, center_t, mid_mid_Angle, mid_mid_Mag, true, true, 5);
    }
    // mid-right block
    center_s = 0.75;
    center_t = 0.5;
    if ((vST.s > (center_s-d)) && (vST.s < (center_s+d)) && (vST.t > (center_t-d)) && (vST.t < (center_t+d))) { 
        do_shader(center_s, center_t, mid_right_Angle, mid_right_Mag, false, true, 6);
    }
    // bottom-left block
    center_s = 0.25;
    center_t = 0.25;
    if ((vST.s > (center_s-d)) && (vST.s < (center_s+d)) && (vST.t > (center_t-d)) && (vST.t < (center_t+d))) { 
        do_shader(center_s, center_t, bottom_left_Angle, bottom_left_Mag, true, false, 7);
    }
    // bottom-mid block
    center_s = 0.5;
    center_t = 0.25;
    if ((vST.s > (center_s-d)) && (vST.s < (center_s+d)) && (vST.t > (center_t-d)) && (vST.t < (center_t+d))) { 
        do_shader(center_s, center_t, bottom_mid_Angle, bottom_mid_Mag, true, true, 8);
    }
    // bottom-right block
    center_s = 0.75;
    center_t = 0.25;
    if ((vST.s > (center_s-d)) && (vST.s < (center_s+d)) && (vST.t > (center_t-d)) && (vST.t < (center_t+d))) { 
        do_shader(center_s, center_t, bottom_right_Angle, bottom_right_Mag, false, false, 9);
    }

    if ( win ) {
        vec2 st = vST;
        st.s += 0.03;
        vec4 Image1 = texture2D(uImageUnit1, st);

        vec4 back = vec4(Image.rgb, 1.);
        vec4 front = vec4(Image1.rgb, 1.);
        
        gl_FragColor = vec4(mix(back, front, 0.7));
    }
}