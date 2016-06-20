varying vec4 Ca;
varying vec4 Cd;
varying vec4 Cs;

varying vec4 V_eye;
varying vec4 L_eye;
varying vec4 N_eye;

const float backscatter = 0.25;
const float edginess = 4.0;
const float sheen = 0.7;
const float roughness = 0.1;

void main(void)
{
	vec3 V = normalize(vec3(V_eye));
	vec3 L = normalize(vec3(L_eye));
	vec3 N = normalize(vec3(N_eye));

	float diffuse = max(dot(L, N), 0.0);

	float cosine = max(dot(L, V), 0.0);
	float shiny = sheen * pow(cosine, 1.0 / roughness) * backscatter;

	cosine = max(dot(N, V), 0.0);
	float sine = sqrt(1.0 - cosine);
	shiny = shiny + sheen * pow(sine, edginess) * diffuse;

	gl_FragColor = Ca + (Cd*diffuse) + (Cs*shiny);
}