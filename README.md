# WebGL light implementation
Quick light implementation using WebGL, Babel, Rollup and Typescript.
The shaders
```glsl
// Vertex shader
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
// Fragment shader
precision mediump float;


varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D texture;
uniform vec3 lightPosition;
uniform vec3 viewPosition;
uniform vec3 lightColor;

// Material properties
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

void main() {
	// Check if we are rendering wireframe
	// Normalize input vectors
	vec3 normal = normalize(vNormal);
	vec3 lightDir = normalize(lightPosition - vPosition);
	vec3 viewDir = normalize(viewPosition - vPosition);
	vec3 reflectDir = reflect(-lightDir, normal);

	// Ambient
	vec3 ambient = ambientColor * lightColor;

	// Diffuse
	float diff = max(dot(normal, lightDir), 0.0);
	vec3 diffuse = diff * diffuseColor * lightColor;

	// Specular
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
	vec3 specular = spec * specularColor * lightColor;

	// Combine all components
	vec3 phong = ambient + diffuse + specular;

	// Texture color
	vec4 texColor = texture2D(texture, vTexCoord);

	// Final color
	gl_FragColor = vec4(phong, 1.0) * texColor;
}

```

Live demo: [TODO](#)