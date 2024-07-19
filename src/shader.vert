precision mediump float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoordinate;
attribute vec3 aNormal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
	vTexCoord = aTextureCoordinate;
	vNormal = normalize(mat3(model) * aNormal);
	vec4 worldPosition = model * vec4(aVertexPosition, 1.0);
	vPosition = worldPosition.xyz;

	gl_Position = projection * view * worldPosition;
}
