#version 330 compatibility

out vec3 vNs;
out vec3 vEs;
out vec3 vMC;
out vec2 vST;

void
main( )
{    
    vMC = gl_Vertex.xyz;
    vST = gl_MultiTexCoord0.st;

    vec4 ECposition = gl_ModelViewMatrix * gl_Vertex;

    vNs = normalize( gl_NormalMatrix * gl_Normal );
    vEs = ECposition.xyz - vec3( 0., 0., 0. ) ; 

    gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}