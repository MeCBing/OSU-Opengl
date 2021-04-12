#version 330 compatibility

uniform sampler2D TexUnit;

in vec2	vST;

void
main( )
{
    vec4 textcolor = texture2D( TexUnit, vST );
    
    gl_FragColor = textcolor;
}