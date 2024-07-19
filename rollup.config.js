import path from 'path'
import glslify from 'rollup-plugin-glslify'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import commonJS from '@rollup/plugin-commonjs'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json'
import image from '@rollup/plugin-image'

export default {
	input: path.resolve(process.cwd(), 'src', 'main.ts'),
	output: {
		file: path.resolve(process.cwd(), 'dist', 'app.js'),
		format: 'iife',
		name: 'app'
	},
	plugins: [
		glslify(),
		resolve(),
		image(),
		typescript(),
		commonJS(),
		babel(),
		json(),
		process.env.NODE_ENV == 'development' &&
			serve({
				host: 'localhost',
				contentBase: ['dist'],
				port: 8000,
				open: true
			}),
		process.env.NODE_ENV == 'development' && livereload(),
		process.env.NODE_ENV == 'production' && terser()
	]
}
