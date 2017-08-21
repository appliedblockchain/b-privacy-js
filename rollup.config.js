import resolve 	from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
// import pkg 			from './package.json' // node v8 only
const pkg = require('./package.json')


export default [
	// browser-friendly UMD build
	{
		entry: 			'src/b-privacy.js',
		dest: 			pkg.browser,
		format: 		'umd',
		moduleName: 'bPrivacy',
		plugins: [
			resolve(), // so Rollup can find `ms`
			commonjs() // so Rollup can convert `ms` to an ES module
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	{
		entry: 'src/b-privacy.js',
		external: ['ecccrypto'],
		targets: [
			{ dest: pkg.main, 	format: 'cjs' },
			{ dest: pkg.module, format: 'es' 	}
		]
	}
]
