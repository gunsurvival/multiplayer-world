import typescript from "rollup-plugin-typescript2"
import { typescriptPaths } from "rollup-plugin-typescript-paths"
import { dts } from "rollup-plugin-dts"
import flatDts from "rollup-plugin-flat-dts"

/** @type {import('rollup').RollupOptions} */
export default {
	input: "src/index.ts",
	preserveModules: true, // indicate not create a single-file
	preserveModulesRoot: "src", // optional but useful to create a more plain folder structure
	output: [
		{
			dir: "dist",
			format: "cjs",
		},
		{
			dir: "dist",
			format: "es",
		},
	],
	plugins: [
		typescript({
			declarationDir: "dist/bundle.d.ts",
			inlineSourceMap: true,
		}),
		typescriptPaths(),
	],
	external: [
		"colyseus",
		"colyseus.js",
		"@colyseus/schema",
		"detect-collisions",
		"pixi.js",
		"pixi-viewport",
	],
}
