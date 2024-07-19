import vert from './shader.vert'
import frag from './shader.frag'
import suzanne from './suzanne.json'
import content from './texture.png'
import { mat4 } from 'gl-matrix'

const canvas = document.querySelector<HTMLCanvasElement>('#gl-canvas')!
const gl = canvas.getContext('webgl', {
	antialias: true
})!

const onResize = () => {
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
	gl.viewport(0, 0, canvas.width, canvas.height) // Update the viewport
}

const texture = gl.createTexture()
const image = new Image()
image.onload = function () {
	// Create a texture object
	gl.bindTexture(gl.TEXTURE_2D, texture)

	// Flip the Y axis to match the WebGL texture coordinate system
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

	// Upload the image into the texture
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

	// Generate mipmaps for the texture
	gl.generateMipmap(gl.TEXTURE_2D)

	// Set texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texParameteri(
		gl.TEXTURE_2D,
		gl.TEXTURE_MIN_FILTER,
		gl.LINEAR_MIPMAP_LINEAR
	)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.bindTexture(gl.TEXTURE_2D, null)

	drawScene()
}
image.src = content

window.addEventListener('resize', onResize)
onResize() // Set initial canvas size and viewport

gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)
gl.cullFace(gl.BACK)
gl.frontFace(gl.CCW)

// Vertex Shader
const vShader = gl.createShader(gl.VERTEX_SHADER)!
gl.shaderSource(vShader, vert)
gl.compileShader(vShader)
if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
	console.error(
		'ERROR compiling vertex shader!',
		gl.getShaderInfoLog(vShader)
	)
}

// Fragment Shader
const fShader = gl.createShader(gl.FRAGMENT_SHADER)!
gl.shaderSource(fShader, frag)
gl.compileShader(fShader)
if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
	console.error(
		'ERROR compiling fragment shader!',
		gl.getShaderInfoLog(fShader)
	)
}

// Shader Program
const program = gl.createProgram()!
gl.attachShader(program, vShader)
gl.attachShader(program, fShader)
gl.linkProgram(program)
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	console.error('ERROR linking program!', gl.getProgramInfoLog(program))
}
gl.validateProgram(program)
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
	console.error('ERROR validating program!', gl.getProgramInfoLog(program))
}

gl.useProgram(program)

const flatFaces = suzanne.meshes[0].faces.flat()

// Vertices
const vertices = new Float32Array(suzanne.meshes[0].vertices)
const indices = new Uint16Array(flatFaces)
const texCoords = new Float32Array(suzanne.meshes[0].texturecoords[0])
const normals = new Float32Array(suzanne.meshes[0].normals)

const tcb = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, tcb)
gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)

const normalBuff = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuff)
gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW)

const vbo = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

const ibo = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

const vertexPosLocation = gl.getAttribLocation(program, 'aVertexPosition')
gl.enableVertexAttribArray(vertexPosLocation)
gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
gl.vertexAttribPointer(vertexPosLocation, 3, gl.FLOAT, false, 0, 0)

const texCoordLocation = gl.getAttribLocation(program, 'aTextureCoordinate')
gl.enableVertexAttribArray(texCoordLocation)
gl.bindBuffer(gl.ARRAY_BUFFER, tcb)
gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

const normalLocation = gl.getAttribLocation(program, 'aNormal')
gl.enableVertexAttribArray(normalLocation)
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuff)
gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0)

const toRadians = (angle: number) => {
	var radianNumber = angle * (Math.PI / 180)
	return radianNumber
}

const viewUniformLocation = gl.getUniformLocation(program, 'view')!
const projectionUniformLocation = gl.getUniformLocation(program, 'projection')!
const modelUniformLocation = gl.getUniformLocation(program, 'model')!
const textureSamplerLocation = gl.getUniformLocation(program, 'texture')!
const lightPosLocation = gl.getUniformLocation(program, 'lightPosition')!
const viewPosLocation = gl.getUniformLocation(program, 'viewPosition')!
const lightColLocation = gl.getUniformLocation(program, 'lightColor')!
const ambColorLocation = gl.getUniformLocation(program, 'ambientColor')!
const diffColorLocation = gl.getUniformLocation(program, 'diffuseColor')!
const spcColorLocation = gl.getUniformLocation(program, 'specularColor')!
const shinLocation = gl.getUniformLocation(program, 'shininess')!
var model = mat4.create()
mat4.rotateX(model, model, toRadians(-91.3908))

const drawScene = () => {
	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

	// Define view and projection matrices
	const view = mat4.create()
	mat4.lookAt(view, [0, 0, 10], [0, 0, 0], [0, 1, 0])

	const projection = mat4.create()
	mat4.perspective(
		projection,
		toRadians(45),
		canvas.width / canvas.height,
		1,
		1000
	)

	// Update model matrix (rotate each frame)
	mat4.rotateZ(model, model, toRadians(1))

	// Set uniforms for matrices
	gl.uniformMatrix4fv(viewUniformLocation, false, view)
	gl.uniformMatrix4fv(projectionUniformLocation, false, projection)
	gl.uniformMatrix4fv(modelUniformLocation, false, model)

	// Set other uniforms (lighting and material properties)
	gl.uniform3f(lightPosLocation, 0.0, 5.0, 6.0) // Example light position
	gl.uniform3f(viewPosLocation, 0.0, 0.0, 10.0) // Example view position
	gl.uniform3f(lightColLocation, 1.0, 1.0, 1.0) // Example light color
	gl.uniform3f(ambColorLocation, 0, 0, 0) // Example ambient color
	gl.uniform3f(diffColorLocation, 0.8, 0.8, 0.8) // Example diffuse color
	gl.uniform3f(spcColorLocation, 0.2, 0.2, 0.2) // Example specular color
	gl.uniform1f(shinLocation, 25) // Example shininess

	// Activate and bind texture
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, texture)
	gl.uniform1i(textureSamplerLocation, 0)

	// Draw your geometry
	gl.drawElements(gl.TRIANGLES, flatFaces.length, gl.UNSIGNED_SHORT, 0)

	// Request the next frame
	requestAnimationFrame(drawScene)
}

drawScene()
