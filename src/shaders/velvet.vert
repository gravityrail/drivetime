attribute vec4 position;
attribute vec4 sunPosition;
uniform mat4 modelViewMatrix;

varying mat3 normalMatrix;

varying vec4 Ca;
varying vec4 Cd;
varying vec4 Cs;

varying vec4 V_eye;
varying vec4 L_eye;
varying vec4 N_eye;

void main(void)
{
	normalMatrix = mat3.create();
	mat4.toInverseMat3(modelViewMatrix, normalMatrix);
	mat3.transpose(normalMatrix, normalMatrix);

	V_eye = modelViewMatrix * vec4( position, 1.0 );
	L_eye = sunPosition - V_eye;
	N_eye = vec4(normalMatrix * gl_Normal, 1.0);

	gl_Position = gl_ProjectionMatrix * V_eye;
	V_eye = -V_eye;

	Ca = gl_FrontMaterial.ambient;
	Cd = gl_FrontMaterial.diffuse;
	Cs = gl_FrontMaterial.specular;
}