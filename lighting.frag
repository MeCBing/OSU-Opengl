
uniform float   uKa, uKd, uKs;		// coefficients of each type of lighting
uniform vec3  uColor;			// object color
uniform vec3  uSpecularColor;		// light color
uniform float   uShininess;		// specular exponent

uniform float Time;

uniform float   uS0, uT0, uDs, uDt;  // S T Ds Dt
uniform float   uSize;

in  vec2  vST;			// texture coords
in  vec3  vN;			// normal vector
in  vec3  vL;			// vector from point to light
in  vec3  vE;			// vector from point to eye


void
main( )
{
	vec3 Normal = normalize(vN);
	vec3 Light     = normalize(vL);
	vec3 Eye        = normalize(vE);

	vec3 myColor = uColor;
	//float greenValue = sin(Time) / 2.0f + 0.5f;
	if( uS0 - uSize/2. <= vST.s && vST.s <= uS0 + uSize/2. && uT0 - uSize/2. <= vST.t && vST.t <= uT0 + uSize/2. )
    {
        myColor = vec3( 1., 0., 0. );
    }
	//myColor = vec3( 1., greenValue, 0. );

	vec3 ambient = uKa * myColor;

	float d = max( dot(Normal,Light), 0. );       // only do diffuse if the light can see the point
	vec3 diffuse = uKd * d * myColor;

	float s = 0.;
	if( dot(Normal,Light) > 0. )	          // only do specular if the light can see the point
	{
		vec3 ref = normalize(  reflect( -Light, Normal )  );
		s = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec3 specular = uKs * s * uSpecularColor;
	gl_FragColor = vec4( ambient + diffuse + specular,  1. );
}