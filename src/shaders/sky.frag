uniform sampler2D skySampler;
uniform vec3 sunPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;

vec3 cameraPos = vec3(0., 0., 0.);
// uniform sampler2D sDiffuse;
// const float turbidity = 10.0; //
// const float reileigh = 2.; //
// const float luminance = 1.0; //
// const float mieCoefficient = 0.005;
// const float mieDirectionalG = 0.8;

uniform float luminance;
uniform float turbidity;
uniform float reileigh;
uniform float mieCoefficient;
uniform float mieDirectionalG;

// constants for atmospheric scattering
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;

const float n = 1.0003; // refractive index of air
const float N = 2.545E25; // number of molecules per unit volume for air at
						// 288.15K and 1013mb (sea level -45 celsius)
const float pn = 0.035;	// depolatization factor for standard air

// wavelength of used primaries, according to preetham
const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);

// mie stuff
// K coefficient for the primaries
const vec3 K = vec3(0.686, 0.678, 0.666);
const float v = 4.0;

// optical length at zenith for molecules
const float rayleighZenithLength = 8.4E3;
const float mieZenithLength = 1.25E3;
const vec3 up = vec3(0.0, 1.0, 0.0);

const float EE = 1000.0;
const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;
// 66 arc seconds -> degrees, and the cosine of that

// earth shadow hack
const float cutoffAngle = pi/1.95;
const float steepness = 1.5;

// from: https://github.com/ashima/webgl-noise/blob/master/src/noise3D.glsl
//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }

float Hash( float n )
{
	return fract( cos( n ) * 1000.0 );
	return fract( (1.0 + cos(n)) * 415.92653);
}

float Noise2d( in vec3 point )
{
	//float x_modulo = float( mod( point.x, float( 1 ) ) );
	//float y_modulo = float( mod( point.y, float( 1 ) ) );
	//float z_modulo = float( mod( point.z, float( 1 ) ) );


	//find nearest star point

	vec3 nearestStar = vec3( 
		point.x - mod( point.x, 5.0 ),
		point.y - mod( point.y, 5.0 ),
		point.z - mod( point.z, 5.0 ) 
	);

	//calculate size (aka brightness)

	//figure out radius

	return fract( Hash( point.x ) + Hash( point.y ) + Hash( point.z ) );

	//if ( x_modulo < float( 0.1 ) ) {
	//	return x_modulo * float( 10 );
	//} else {
	//	return float( 0 );
	//}
    //float xhash = Hash( point.x * 20.0 );
    //float yhash = Hash( point.y * 20.0 );
    //float zhash = Hash( point.z * 20.0 );
    //return fract( xhash + yhash + zhash );
}

vec3 totalRayleigh(vec3 lambda)
{
	return (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn));
}

// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness
// A simplied version of the total Reayleigh scattering to works on browsers that use ANGLE
vec3 simplifiedRayleigh()
{
	return 0.0005 / vec3(94, 40, 18);
	// return 0.00054532832366 / (3.0 * 2.545E25 * pow(vec3(680E-9, 550E-9, 450E-9), vec3(4.0)) * 6.245);
}

float rayleighPhase(float cosTheta)
{	 
	return (3.0 / (16.0*pi)) * (1.0 + pow(cosTheta, 2.0));
//	return (1.0 / (3.0*pi)) * (1.0 + pow(cosTheta, 2.0));
//	return (3.0 / 4.0) * (1.0 + pow(cosTheta, 2.0));
}

vec3 totalMie(vec3 lambda, vec3 K, float T)
{
	float c = (0.2 * T ) * 10E-18;
	return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;
}

float hgPhase(float cosTheta, float g)
{
	return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));
}

float sunIntensity(float zenithAngleCos)
{
// This function originally used `exp(n)`, but it returns an incorrect value
// on Samsung S6 phones. So it has been replaced with the equivalent `pow(e, n)`.
// See https://github.com/mrdoob/three.js/issues/8382
	return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos))/steepness)));
}

// float logLuminance(vec3 c)
// {
// 	return log(c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722);
// }

// Filmic ToneMapping http://filmicgames.com/archives/75
float A = 0.15;
float B = 0.50;
float C = 0.10;
float D = 0.20;
float E = 0.02;
float F = 0.30;
float W = 1000.0;

vec3 Uncharted2Tonemap(vec3 x)
{
   return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}


void main() 
{
	float sunfade = 1.0-clamp(1.0-exp((sunPosition.y/450000.0)),0.0,1.0);

	// luminance =  1.0 ;// vWorldPosition.y / 450000. + 0.5; //sunPosition.y / 450000. * 1. + 0.5;

	 // gl_FragColor = vec4(sunfade, sunfade, sunfade, 1.0);

	float reileighCoefficient = reileigh - (1.0* (1.0-sunfade));

	vec3 sunDirection = normalize(sunPosition);

	float sunE = sunIntensity(dot(sunDirection, up));

	// extinction (absorbtion + out scattering) 
	// rayleigh coefficients

	// "vec3 betaR = totalRayleigh(lambda) * reileighCoefficient;
	vec3 betaR = simplifiedRayleigh() * reileighCoefficient;

	// mie coefficients
	vec3 betaM = totalMie(lambda, K, turbidity) * mieCoefficient;

	// optical length
	// cutoff angle at 90 to avoid singularity in next formula.
	float zenithAngle = acos(max(0.0, dot(up, normalize(vWorldPosition - cameraPos))));
	float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
	float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));



	// combined extinction factor	
	vec3 Fex = exp(-(betaR * sR + betaM * sM));

	// in scattering
	float cosTheta = dot(normalize(vWorldPosition - cameraPos), sunDirection);

	float rPhase = rayleighPhase(cosTheta*0.5+0.5);
	vec3 betaRTheta = betaR * rPhase;

	float mPhase = hgPhase(cosTheta, mieDirectionalG);
	vec3 betaMTheta = betaM * mPhase;


	vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex),vec3(1.5));
	Lin *= mix(vec3(1.0),pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dot(up, sunDirection),5.0),0.0,1.0));

	//nightsky
	vec3 direction = normalize(vWorldPosition - cameraPos);
	float theta = acos(direction.y); // elevation --> y-axis, [-pi/2, pi/2]
	float phi = atan(direction.z, direction.x); // azimuth --> x-axis [-pi/2, pi/2]
	vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);
	// vec3 L0 = texture2D(skySampler, uv).rgb+0.1 * Fex;
	vec3 L0 = vec3(0.1) * Fex;

	// composition + solar disc
	//if (cosTheta > sunAngularDiameterCos)
	float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);
	// if (normalize(vWorldPosition - cameraPos).y>0.0)
	L0 += (sunE * 19000.0 * Fex)*sundisk;


	vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));

	vec3 texColor = (Lin+L0);   
	texColor *= 0.04 ;
	texColor += vec3(0.0,0.001,0.0025)*0.3;

	float g_fMaxLuminance = 1.0;
	float fLumScaled = 0.1 / luminance;     
	float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled); 

	float ExposureBias = fLumCompressed;

	vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);
	vec3 color = curr*whiteScale;

	vec3 retColor = pow(color,vec3(1.0/(1.2+(1.2*sunfade))));

	//stars
    float StarVal = snoise( vNormal * vec3( 80.0 ) ); // scale up the noise by multiplying the vector

    // let's have a lower-frequency noise function to change the star brightness
    StarVal = StarVal*0.8 + ( snoise( vNormal * vec3( 2.0 ) ) * 0.2 );

    StarVal = pow( StarVal, 5.0 );
	retColor += vec3( StarVal );

    gl_FragColor.rgb = retColor;

	gl_FragColor.a = 1.0;
}