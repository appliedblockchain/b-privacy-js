import resolve 	from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel 		from 'rollup-plugin-babel'
// import pkg 			from './package.json' // node v8 only
const pkg = require('./package.json')


export default [
	// browser-friendly UMD build
	{
		entry: 			'src/b-privacy.js',
		dest: 			pkg.browser,
		format: 		'iife',
		moduleName: 'bPrivacy',
		plugins: [
			resolve({
				jsnext: true,
      	main: true,
      	browser: true,
			}), // so Rollup can find included modules
			commonjs({
			  exclude: [ 'node_modules/bitcore-lib/**' ],
			}), // so Rollup can convert included modules to ES modules - NOTE: bitcore-lib fails the conversion and must be included manually in the browser via npm / bower before BPrivacy (this module)
			babel({
				exclude: 'node_modules/**',
			}), // NOTE: a lighter alternative to babel would be nodent: https://github.com/oligot/rollup-plugin-nodent
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	{
		entry: 'src/b-privacy.js',
		external: Object.keys(pkg.dependencies),
		targets: [
			{ dest: pkg.main, 	format: 'cjs' },
			{ dest: pkg.module, format: 'es' 	}
		]
	}
]
