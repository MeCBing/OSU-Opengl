#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>
#include <ctype.h>
#include "GL/glew.h"
#include <GL/gl.h>
#include <GL/glu.h>
#include <GL/glut.h>
// #include <SOIL.h>

#include <vector>

//#include "bmptotexture.cpp"


// delimiters for parsing the obj file:

#define OBJDELIMS		" \t"


struct Vertex
{
	float x, y, z;
};


struct Normal
{
	float nx, ny, nz;
};


struct TextureCoord
{
	float s, t, p;
};


struct face
{
	int v, n, t;
};



void	Cross( float [3], float [3], float [3] );
char *	ReadRestOfLine( FILE * );
void	ReadObjVTN( char *, int *, int *, int * );
float	Unit( float [3] );
float	Unit( float [3], float [3] );

// unsigned char *	BmpToTexture( char const *, int *, int * );
// void			HsvRgb( float[3], float [3] );
// int				ReadInt( FILE * );
// short			ReadShort( FILE * );

int
LoadObjFile( char *name, GLuint g )
{
	char *cmd;		// the command string
	char *str;		// argument string

	std::vector <struct Vertex> Vertices(10000);
	std::vector <struct Normal> Normals(10000);
	std::vector <struct TextureCoord> TextureCoords(10000);

	Vertices.clear();
	Normals.clear();
	TextureCoords.clear();

	struct Vertex sv;
	struct Normal sn;
	struct TextureCoord st;


	// open the input file:

	FILE *fp = fopen( name, "r" );
	if( fp == NULL )
	{
		fprintf( stderr, "Cannot open .obj file '%s'\n", name );
		return 1;
	}


	float xmin = 1.e+37f;
	float ymin = 1.e+37f;
	float zmin = 1.e+37f;
	float xmax = -xmin;
	float ymax = -ymin;
	float zmax = -zmin;

	glBegin( GL_TRIANGLES );

	for( ; ; )
	{
		char *line = ReadRestOfLine( fp );
		if( line == NULL )
			break;


		// skip this line if it is a comment:

		if( line[0] == '#' )
			continue;


		// skip this line if it is something we don't feel like handling today:

		if( line[0] == 'g' )
			continue;

		if( line[0] == 'm' )
			continue;

		if( line[0] == 's' )
			continue;

		if( line[0] == 'u' )
			continue;


		// get the command string:

		cmd = strtok( line, OBJDELIMS );


		// skip this line if it is empty:

		if( cmd == NULL )
			continue;


		if( strcmp( cmd, "v" )  ==  0 )
		{
			str = strtok( NULL, OBJDELIMS );
			sv.x = atof(str);

			str = strtok( NULL, OBJDELIMS );
			sv.y = atof(str);

			str = strtok( NULL, OBJDELIMS );
			sv.z = atof(str);

			Vertices.push_back( sv );

			if( sv.x < xmin )	xmin = sv.x;
			if( sv.x > xmax )	xmax = sv.x;
			if( sv.y < ymin )	ymin = sv.y;
			if( sv.y > ymax )	ymax = sv.y;
			if( sv.z < zmin )	zmin = sv.z;
			if( sv.z > zmax )	zmax = sv.z;

			continue;
		}


		if( strcmp( cmd, "vn" )  ==  0 )
		{
			str = strtok( NULL, OBJDELIMS );
			sn.nx = atof( str );

			str = strtok( NULL, OBJDELIMS );
			sn.ny = atof( str );

			str = strtok( NULL, OBJDELIMS );
			sn.nz = atof( str );

			Normals.push_back( sn );

			continue;
		}


		if( strcmp( cmd, "vt" )  ==  0 )
		{
			st.s = st.t = st.p = 0.;

			str = strtok( NULL, OBJDELIMS );
			st.s = atof( str );

			str = strtok( NULL, OBJDELIMS );
			if( str != NULL )
				st.t = atof( str );

			str = strtok( NULL, OBJDELIMS );
			if( str != NULL )
				st.p = atof( str );

			TextureCoords.push_back( st );

			continue;
		}

		// if( strcmp( cmd, "usemtl") == 0)
		// {
		// 	str = strtok( NULL, OBJDELIMS );
		// 	int width, height;
		// 	char s[128];
		// 	snprintf(s, sizeof s, "C:/Users/super/Desktop/550/OSU-Opengl/star_wars/bmp/%s.bmp", str);
		// 	unsigned char * img = BmpToTexture( s, &width, &height);
		// 	glBindTexture( GL_TEXTURE_2D, g ); // make the Tex0 texture current and set its parameters
		// 	glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP );
		// 	glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP );
		// 	glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
		// 	glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		// 	glTexEnvf( GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_REPLACE );
		// 	glTexImage2D( GL_TEXTURE_2D, 0, 3, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, img );
		// }

		if( strcmp( cmd, "f" )  ==  0 )
		{
			struct face vertices[10];
			for( int i = 0; i < 10; i++ )
			{
				vertices[i].v = 0;
				vertices[i].n = 0;
				vertices[i].t = 0;
			}

			int sizev = (int)Vertices.size();
			int sizen = (int)Normals.size();
			int sizet = (int)TextureCoords.size();

			int numVertices = 0;
			bool valid = true;
			int vtx = 0;
			char *str;
			while( ( str = strtok( NULL, OBJDELIMS ) )  !=  NULL )
			{
				int v, n, t;
				ReadObjVTN( str, &v, &t, &n );

				// if v, n, or t are negative, they are wrt the end of their respective list:

				if( v < 0 )
					v += ( sizev + 1 );

				if( n < 0 )
					n += ( sizen + 1 );

				if( t < 0 )
					t += ( sizet + 1 );


				// be sure we are not out-of-bounds (<vector> will abort):

				if( t > sizet )
				{
					if( t != 0 )
						fprintf( stderr, "Read texture coord %d, but only have %d so far\n", t, sizet );
					t = 0;
				}

				if( n > sizen )
				{
					if( n != 0 )
						fprintf( stderr, "Read normal %d, but only have %d so far\n", n, sizen );
					n = 0;
				}

				if( v > sizev )
				{
					if( v != 0 )
						fprintf( stderr, "Read vertex coord %d, but only have %d so far\n", v, sizev );
					v = 0;
					valid = false;
				}

				vertices[vtx].v = v;
				vertices[vtx].n = n;
				vertices[vtx].t = t;
				vtx++;

				if( vtx >= 10 )
					break;

				numVertices++;
			}


			// if vertices are invalid, don't draw anything this time:

			if( ! valid )
				continue;

			if( numVertices < 3 )
				continue;


			// list the vertices:

			int numTriangles = numVertices - 2;

			for( int it = 0; it < numTriangles; it++ )
			{
				int vv[3];
				vv[0] = 0;
				vv[1] = it + 1;
				vv[2] = it + 2;

				// get the planar normal, in case vertex normals are not defined:

				struct Vertex *v0 = &Vertices[ vertices[ vv[0] ].v - 1 ];
				struct Vertex *v1 = &Vertices[ vertices[ vv[1] ].v - 1 ];
				struct Vertex *v2 = &Vertices[ vertices[ vv[2] ].v - 1 ];

				float v01[3], v02[3], norm[3];
				v01[0] = v1->x - v0->x;
				v01[1] = v1->y - v0->y;
				v01[2] = v1->z - v0->z;
				v02[0] = v2->x - v0->x;
				v02[1] = v2->y - v0->y;
				v02[2] = v2->z - v0->z;
				Cross( v01, v02, norm );
				Unit( norm, norm );
				glNormal3fv( norm );

				for( int vtx = 0; vtx < 3 ; vtx++ )
				{
					if( vertices[ vv[vtx] ].t != 0 )
					{
						struct TextureCoord *tp = &TextureCoords[ vertices[ vv[vtx] ].t - 1 ];
						glTexCoord2f( tp->s, tp->t );
					}

					if( vertices[ vv[vtx] ].n != 0 )
					{
						struct Normal *np = &Normals[ vertices[ vv[vtx] ].n - 1 ];
						glNormal3f( np->nx, np->ny, np->nz );
					}

					struct Vertex *vp = &Vertices[ vertices[ vv[vtx] ].v - 1 ];
					glVertex3f( vp->x, vp->y, vp->z );
				}
			}
			continue;
		}


		if( strcmp( cmd, "s" )  ==  0 )
		{
			continue;
		}

	}

	glEnd();
	fclose( fp );

	fprintf( stderr, "Obj file range: [%8.3f,%8.3f,%8.3f] -> [%8.3f,%8.3f,%8.3f]\n",
		xmin, ymin, zmin,  xmax, ymax, zmax );
	fprintf( stderr, "Obj file center = (%8.3f,%8.3f,%8.3f)\n",
		(xmin+xmax)/2., (ymin+ymax)/2., (zmin+zmax)/2. );
	fprintf( stderr, "Obj file  span = (%8.3f,%8.3f,%8.3f)\n",
		xmax-xmin, ymax-ymin, zmax-zmin );

	return 0;
}



void
Cross( float v1[3], float v2[3], float vout[3] )
{
	float tmp[3];

	tmp[0] = v1[1]*v2[2] - v2[1]*v1[2];
	tmp[1] = v2[0]*v1[2] - v1[0]*v2[2];
	tmp[2] = v1[0]*v2[1] - v2[0]*v1[1];

	vout[0] = tmp[0];
	vout[1] = tmp[1];
	vout[2] = tmp[2];
}



float
Unit( float v[3] )
{
	float dist;

	dist = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];

	if( dist > 0.0 )
	{
		dist = sqrt( dist );
		v[0] /= dist;
		v[1] /= dist;
		v[2] /= dist;
	}

	return dist;
}



float
Unit( float vin[3], float vout[3] )
{
	float dist;

	dist = vin[0]*vin[0] + vin[1]*vin[1] + vin[2]*vin[2];

	if( dist > 0.0 )
	{
		dist = sqrt( dist );
		vout[0] = vin[0] / dist;
		vout[1] = vin[1] / dist;
		vout[2] = vin[2] / dist;
	}
	else
	{
		vout[0] = vin[0];
		vout[1] = vin[1];
		vout[2] = vin[2];
	}

	return dist;
}


char *
ReadRestOfLine( FILE *fp )
{
	static char *line;
	std::vector<char> tmp(1000);
	tmp.clear();

	for( ; ; )
	{
		int c = getc( fp );

		if( c == EOF  &&  tmp.size() == 0 )
		{
			return NULL;
		}

		if( c == EOF  ||  c == '\n' )
		{
			delete [] line;
			line = new char [ tmp.size()+1 ];
			for( int i = 0; i < (int)tmp.size(); i++ )
			{
				line[i] = tmp[i];
			}
			line[ tmp.size() ] = '\0';	// terminating null
			return line;
		}
		else
		{
			tmp.push_back( c );
		}
	}

	return "";
}


void
ReadObjVTN( char *str, int *v, int *t, int *n )
{
	// can be one of v, v//n, v/t, v/t/n:

	if( strstr( str, "//") )				// v//n
	{
		*t = 0;
		sscanf( str, "%d//%d", v, n );
		return;
	}
	else if( sscanf( str, "%d/%d/%d", v, t, n ) == 3 )	// v/t/n
	{
		return;
	}
	else
	{
		*n = 0;
		if( sscanf( str, "%d/%d", v, t ) == 2 )		// v/t
		{
			return;
		}
		else						// v
		{
			*n = *t = 0;
			sscanf( str, "%d", v );
		}
	}
}

// int	Read_Int( FILE * );
// short	Read_Short( FILE * );

// struct bmfh_
// {
// 	short bfType;
// 	int bfSize;
// 	short bfReserved1;
// 	short bfReserved2;
// 	int bfOffBits;
// } FileHeader1;

// struct bmih_
// {
// 	int biSize;
// 	int biWidth;
// 	int biHeight;
// 	short biPlanes;
// 	short biBitCount;
// 	int biCompression;
// 	int biSizeImage;
// 	int biXPelsPerMeter;
// 	int biYPelsPerMeter;
// 	int biClrUsed;
// 	int biClrImportant;
// } InfoHeader1;

// const int birgb_ = { 0 };

// unsigned char *
// BmpToTexture( char *filename, int *width, int *height )
// {

// 	int s, t, e;		// counters
// 	int numextra;		// # extra bytes each line in the file is padded with
// 	FILE *fp;
// 	unsigned char *texture;
// 	int nums, numt;
// 	unsigned char *tp;


// 	fp = fopen( filename, "rb" );
// 	if( fp == NULL )
// 	{
// 		fprintf( stderr, "Cannot open Bmp file '%s'\n", filename );
// 		return NULL;
// 	}

// 	FileHeader1.bfType = Read_Short( fp );


// 	// if bfType is not 0x4d42, the file is not a bmp:

// 	if( FileHeader1.bfType != 0x4d42 )
// 	{
// 		fprintf( stderr, "Wrong type of file: 0x%0x\n", FileHeader1.bfType );
// 		fclose( fp );
// 		return NULL;
// 	}


// 	FileHeader1.bfSize = Read_Int( fp );
// 	FileHeader1.bfReserved1 = Read_Short( fp );
// 	FileHeader1.bfReserved2 = Read_Short( fp );
// 	FileHeader1.bfOffBits = Read_Int( fp );


// 	InfoHeader1.biSize = Read_Int( fp );
// 	InfoHeader1.biWidth = Read_Int( fp );
// 	InfoHeader1.biHeight = Read_Int( fp );

// 	nums = InfoHeader1.biWidth;
// 	numt = InfoHeader1.biHeight;

// 	InfoHeader1.biPlanes = Read_Short( fp );
// 	InfoHeader1.biBitCount = Read_Short( fp );
// 	InfoHeader1.biCompression = Read_Int( fp );
// 	InfoHeader1.biSizeImage = Read_Int( fp );
// 	InfoHeader1.biXPelsPerMeter = Read_Int( fp );
// 	InfoHeader1.biYPelsPerMeter = Read_Int( fp );
// 	InfoHeader1.biClrUsed = Read_Int( fp );
// 	InfoHeader1.biClrImportant = Read_Int( fp );


// 	// fprintf( stderr, "Image size found: %d x %d\n", ImageWidth, ImageHeight );


// 	texture = new unsigned char[ 3 * nums * numt ];
// 	if( texture == NULL )
// 	{
// 		fprintf( stderr, "Cannot allocate the texture array!\b" );
// 		return NULL;
// 	}


// 	// extra padding bytes:

// 	numextra =  4*(( (3*InfoHeader1.biWidth)+3)/4) - 3*InfoHeader1.biWidth;


// 	// we do not support compression:

// 	if( InfoHeader1.biCompression != birgb_ )
// 	{
// 		fprintf( stderr, "Wrong type of image compression: %d\n", InfoHeader1.biCompression );
// 		fclose( fp );
// 		return NULL;
// 	}
	


// 	rewind( fp );
// 	fseek( fp, 14+40, SEEK_SET );

// 	if( InfoHeader1.biBitCount == 24 )
// 	{
// 		for( t = 0, tp = texture; t < numt; t++ )
// 		{
// 			for( s = 0; s < nums; s++, tp += 3 )
// 			{
// 				*(tp+2) = fgetc( fp );		// b
// 				*(tp+1) = fgetc( fp );		// g
// 				*(tp+0) = fgetc( fp );		// r
// 			}

// 			for( e = 0; e < numextra; e++ )
// 			{
// 				fgetc( fp );
// 			}
// 		}
// 	}

// 	fclose( fp );

// 	*width = nums;
// 	*height = numt;
// 	return texture;
// }



// int
// Read_Int( FILE *fp )
// {
// 	unsigned char b3, b2, b1, b0;
// 	b0 = fgetc( fp );
// 	b1 = fgetc( fp );
// 	b2 = fgetc( fp );
// 	b3 = fgetc( fp );
// 	return ( b3 << 24 )  |  ( b2 << 16 )  |  ( b1 << 8 )  |  b0;
// }


// short
// Read_Short( FILE *fp )
// {
// 	unsigned char b1, b0;
// 	b0 = fgetc( fp );
// 	b1 = fgetc( fp );
// 	return ( b1 << 8 )  |  b0;
// }