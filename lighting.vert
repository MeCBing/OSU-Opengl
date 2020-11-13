#version 330 compatibility

const float PI = 	3.14159265;
const float AMP = 	0.2;		// amplitude
const float W = 	2.;		// frequency

uniform float	uTime;		// "Time", from Animate( )
uniform float   uRand;

out vec2  	vST;		// texture coords
out  vec3  vN;		// normal vector
out  vec3  vL;		// vector from point to light
out  vec3  vE;		// vector from point to eye

vec3 LightPosition = vec3(  0., 5., 5. );

void
main( )
{ 

    vST = gl_MultiTexCoord0.st;
	vec3 vert = gl_Vertex.xyz;

	if (vert.x > 0 && vert.y > 0 && vert.z > 0) {
		vert.x = vert.x + sin((PI/W + (10 * uTime)))*AMP;
		vert.y = vert.y + sin((PI/2. + (10 * uTime)))*AMP;
		vert.z = vert.z + sin((PI/2. + (10 * uTime)))*AMP;

		if(vert.x < 0)
			vert.x = 0;
		if(vert.y < 0)
			vert.y = 0;
		if(vert.z < 0)
			vert.z = 0;
	}

	if (vert.x < 0 && vert.y > 0 && vert.z > 0) {
		vert.x = vert.x + sin((PI/W + (10 * uTime)))*AMP;
		vert.y = vert.y - sin((PI/2. + (10 * uTime)))*AMP;
		vert.z = vert.z - sin((PI/2. + (10 * uTime)))*AMP;

		if(vert.x > 0)
			vert.x = 0;
		if(vert.y < 0)
			vert.y = 0;
		if(vert.z < 0)
			vert.z = 0;
	}

	if (vert.x > 0 && vert.y > 0 && vert.z < 0) {
		vert.x = vert.x - sin((PI/W + (10 * uTime)))*AMP;
		vert.y = vert.y - sin((PI/2. + (10 * uTime)))*AMP;
		vert.z = vert.z + sin((PI/2. + (10 * uTime)))*AMP;

		if(vert.x < 0)
			vert.x = 0;
		if(vert.y < 0)
			vert.y = 0;
		if(vert.z > 0)
			vert.z = 0;
	}

	if (vert.x < 0 && vert.y > 0 && vert.z < 0) {
		vert.x = vert.x - sin((PI/W + (10 * uTime)))*AMP;
		vert.y = vert.y + sin((PI/2. + (10 * uTime)))*AMP;
		vert.z = vert.z - sin((PI/2. + (10 * uTime)))*AMP;

		if(vert.x > 0)
			vert.x = 0;
		if(vert.y < 0)
			vert.y = 0;
		if(vert.z > 0)
			vert.z = 0;
	}




	if (vert.x > 0 && vert.y < 0 && vert.z > 0) {
		vert.x = vert.x - sin((PI/W + (10 * uTime)))*AMP;
		vert.y = vert.y + sin((PI/2. + (10 * uTime)))*AMP;
		vert.z = vert.z - sin((PI/2. + (10 * uTime)))*AMP;

		if(vert.x < 0)
			vert.x = 0;
		if(vert.y > 0)
			vert.y = 0;
		if(vert.z < 0)
			vert.z = 0;
	}

	if (vert.x < 0 && vert.y < 0 && vert.z > 0) {
		vert.x = vert.x - sin((PI/W + (10 * uTime)))*AMP;
		vert.y = vert.y - sin((PI/2. + (10 * uTime)))*AMP;
		vert.z = vert.z + sin((PI/2. + (10 * uTime)))*AMP;

		if(vert.x > 0)
			vert.x = 0;
		if(vert.y > 0)
			vert.y = 0;
		if(vert.z < 0)
			vert.z = 0;
	}

	if (vert.x > 0 && vert.y < 0 && vert.z < 0) {
		vert.x = vert.x + sin((PI/W + (10 * uTime)))*AMP;
		vert.y = vert.y - sin((PI/2. + (10 * uTime)))*AMP;
		vert.z = vert.z - sin((PI/2. + (10 * uTime)))*AMP;

		if(vert.x < 0)
			vert.x = 0;
		if(vert.y > 0)
			vert.y = 0;
		if(vert.z > 0)
			vert.z = 0;
	}

	if (vert.x < 0 && vert.y < 0 && vert.z < 0) {
		vert.x = vert.x + sin((PI/W + (10 * uTime)))*AMP;
		vert.y = vert.y + sin((PI/2. + (10 * uTime)))*AMP;
		vert.z = vert.z + sin((PI/2. + (10 * uTime)))*AMP;

		if(vert.x > 0)
			vert.x = 0;
		if(vert.y > 0)
			vert.y = 0;
		if(vert.z > 0)
			vert.z = 0;
	}

	// else if (vert.x < 0) {
	// 	vert.x = vert.x - sin((PI/2. + (10 * uTime)))*AMP;
	// }
	// if (vert.y >= 0) {
	// 	vert.y = vert.y + sin((PI/2. + (10 * uTime)))*AMP;
	// }
	// else if (vert.y < 0) {
	// 	vert.y = vert.y - sin((PI/2. + (10 * uTime)))*AMP;
	// }
	// if (vert.z >= 0) {
	// 	vert.z = vert.z + sin((PI/2. + (10 * uTime)))*AMP;
	// }
	// else if (vert.z < 0) {
	// 	vert.z = vert.z - sin((PI/2. + (10 * uTime)))*AMP;
	// }
	//vert.x = vert.x + sin(W * (PI/2. + (10 * uTime)))*AMP;
	//vert.y = vert.y;
	//vert.z = vert.z + sin(W * (PI/2. + (10 * uTime)))*AMP;

	vec4 ECposition = gl_ModelViewMatrix * vec4( vert, 1. );
	vN = normalize( gl_NormalMatrix * gl_Normal );	// normal vector
	vL = LightPosition - ECposition.xyz;		// vector from the point
							// to the light position
	vE = vec3( 0., 0., 0. ) - ECposition.xyz;	// vector from the point
							// to the eye position 
	gl_Position = gl_ModelViewProjectionMatrix * vec4( vert, 1. );
}