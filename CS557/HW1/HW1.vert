#version 330 compatibility

uniform float uAmp;
uniform float uFreq;

out vec3  vMCposition;
out float vLightIntensity; 
out vec2 vST;
out vec3 vColor;
out float vX, vY;

const vec3 LIGHTPOS = const vec3( -2., 0., 10.);

void
main( )
{
	vST = gl_MultiTexCoord0.st;

	vec3 tnorm      = normalize( gl_NormalMatrix * gl_Normal );
	vec3 ECposition = vec3( gl_ModelViewMatrix * gl_Vertex );
	vLightIntensity  = abs( dot( normalize(LIGHTPOS - ECposition), tnorm ) );

	vColor = gl_Color.rgb;
	vec3 vMCposition  = gl_Vertex.xyz;
	vX = vMCposition.x;
	vY = vMCposition.y;
	vX = vX + uAmp * sin(uFreq * vY);
	
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}