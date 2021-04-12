#version 330 compatibility

uniform float uK, uP;
uniform float uLightX, uLightY, uLightZ;

out vec3 vMCposition;
out vec4 vECposition;
out vec2 vST;

flat out vec3 vNf;
out vec3 vNs;
flat out vec3 vLf;
out vec3 vLs;
flat out vec3 vEf;
out vec3 vEs;

// out float vLightIntensity;

const float PI = 	3.14159265;

vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );



void
main( )
{
	vST = gl_MultiTexCoord0.st;

	vec4 vert = gl_Vertex;

	float Y0 = 1.;

	vert.z = uK * (Y0 - vert.y) * sin ( 2. * PI * vert.x / uP);

	float dzdx = uK * (Y0 - vert.y) * (2. * PI / uP) * cos( 2. * PI * vert.x / uP );
	float dzdy = -uK * sin( 2. * PI * vert.x / uP );

	vec3 Tx = vec3(1., 0., dzdx);
	vec3 Ty = vec3(0., 1., dzdy);
	vec3 normal = normalize(cross(Tx, Ty));

	// vec3 fv = vec3(vert.x, vert.y, dzdz);

	vECposition = gl_ModelViewMatrix * vert;

	vNf = normalize( gl_NormalMatrix * normal );
	vNs = vNf;

	vLf = eyeLightPosition - vECposition.xyz;
	vLs = vLf;

	vEf = vec3(0., 0., 0.) - vECposition.xyz;
	vEs = vEf;
	// vLightIntensity  = abs( dot( normalize(eyeLightPosition - vECposition), vN ) );

	// vColor = gl_Color.rgb;
	
	vMCposition = vert.xyz;
	
	// vX = vX + uAmp * sin(uFreq * vY);
	
	gl_Position = gl_ModelViewProjectionMatrix * vert;
}