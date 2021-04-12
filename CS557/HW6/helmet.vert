#version 330 compatibility

out vec2 vST;
out float vLightIntensity; 

const vec3 LIGHTPOS = const vec3( -2., 0., 10.);

void
main( )
{
    vST = gl_MultiTexCoord0.st;

    vec3 tnorm      = normalize( gl_NormalMatrix * gl_Normal );
	vec3 ECposition = vec3( gl_ModelViewMatrix * gl_Vertex );
	vLightIntensity  = abs( dot( normalize(LIGHTPOS - ECposition), tnorm ) );
    
    gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}