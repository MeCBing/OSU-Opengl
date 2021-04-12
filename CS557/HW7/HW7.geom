#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable

layout( triangles  ) in;
layout( triangle_strip, max_vertices=204 ) out;

uniform bool uModelCoords;
uniform int uLevel;
uniform float uQuantize;
uniform float uLightX;
uniform float uLightY;
uniform float uLightZ;

in vec3		vNormal[3];
out float	gLightIntensity;

vec3 V0, V01, V02;
vec3 N0, N01, N02;

vec3 LIGHTPOS;

float
Quantize( float f )
{
	f *= uQuantize;
	f += .5;		// round-off
	int fi = int( f );
	f = float( fi ) / uQuantize;
	return f;
}

vec3
QuantizedVertex( float s, float t )
{
	vec3 v = V0 + (s * V01) + (t * V02);		// interpolate the vertex from s and t

	if( !uModelCoords )
	{
		v = ( gl_ModelViewMatrix * vec4( v, 1. ) ).xyz;
	}

	v.x = Quantize( v.x );
	v.y = Quantize( v.y );
	v.z = Quantize( v.z );
	return v;
}

void
ProduceVertex( float s, float t )
{
	LIGHTPOS = vec3(uLightX, uLightY, uLightZ);

	vec3 v = QuantizedVertex( s, t );

	vec3 n = N0 + (s * N01) + (t * N02);	// interpolate the normal from s and t
	vec3 tnorm = normalize(gl_NormalMatrix * n);	// transformed normal

	vec4 ECposition;
	if( uModelCoords )
	{
		ECposition = gl_ModelViewMatrix * vec4( v, 1. );
	}
	else
	{
		ECposition = vec4( v, 1. );
	}

	gLightIntensity  = abs( dot( normalize(LIGHTPOS - ECposition.xyz), tnorm ) );

	gl_Position = gl_ProjectionMatrix * ECposition;
	EmitVertex();
}

void
main()
{
    V01 = ( gl_PositionIn[1] - gl_PositionIn[0] ).xyz;
    V02 = ( gl_PositionIn[2] - gl_PositionIn[0] ).xyz;
    V0  =   gl_PositionIn[0].xyz;

    N01 =  vNormal[1] - vNormal[0];
    N02 =  vNormal[2] - vNormal[0];
    N0  =  vNormal[0];

    
    
    int numLayers = 1 << uLevel;
    float dt = 1. / float( numLayers );
    float t_top = 1.;

    for( int it = 0; it < numLayers; it++ )
    {
        float t_bot = t_top - dt;
        float smax_top = 1. - t_top;
        float smax_bot = 1. - t_bot;
        int nums = it + 1;
        float ds_top = smax_top / float( nums - 1 );
        float ds_bot = smax_bot / float( nums );
        float s_top = 0.;
        float s_bot = 0.;

        for( int is = 0; is < nums; is++ )
        {
            ProduceVertex( s_bot, t_bot );
            ProduceVertex( s_top, t_top );

            s_top += ds_top;
            s_bot += ds_bot;
        }

        ProduceVertex( s_bot, t_bot );

        EndPrimitive( );

        t_top = t_bot;
        t_bot -= dt;
    }

    // for (int it = 0; it < numLayers; it++) {
    //     int nums = it + 1;
    //     for (int is =0; is <= nums; is++) {
    //         ProduceVertex(is, it);
    //     }
    //     EndPrimitive( );
    // }

    // for (int t=0; t<numLayers; t++)
    // {
    //     for each (s,t) in that new triangle strip:
    //     {
    //         Turn that (s,t) into an (nx,ny,nz)
    //         Transform and normalize that (nx,ny,nz)
    //         Use the (nx,ny,nz) to produce gLightIntensity

    //         call ProduceVertex( ) to:
    //             Turn that same (s,t) into an (x,y,z)
    //             If you are working in ????? coordinates, multiply the (x,y,z) by the ModelView matrix, then Quantize
    //             If you are working in ????? coordinates, Quantize the (x,y,z) and then multiply by the ModelView matrix
    //             In either case, then multiply the resulting (x,y,z) by the Projection matrix to produce gl_Position
    //             EmitVertex( );
    //     }
    //     EndPrimitive( );
    // }
}