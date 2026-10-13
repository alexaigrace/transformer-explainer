import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const bundledFiles = {
	'static/tokenizer/gpt2/tokenizer.json':
		'cda20b8ca044949aa07ac4078420c80d1a57139d5f9f33700e46fb2d891e7c66',
	'static/tokenizer/gpt2/tokenizer_config.json':
		'551e26ec611d8d0c8edc3ef72e518a38418cb71f40de1347dd486a595e1557d7',
	'static/fonts/Jersey10-Regular.ttf':
		'db9cbd091617048a145d249daa2b815fe7083be6ab66ac26626e21a4e01c3e82'
};

try {
	for (const [path, expectedHash] of Object.entries(bundledFiles)) {
		const bytes = await readFile(new URL(path, root));
		if (createHash('sha256').update(bytes).digest('hex') !== expectedHash) {
			throw new Error(`Bundled asset is corrupted or changed: ${path}`);
		}
	}
	for (let i = 0; i < 63; i++) {
		const path = `static/model-v2/gpt2.onnx.part${i}`;
		const { size } = await stat(new URL(path, root));
		if (size === 0 || (i < 62 && size !== 10 * 1024 * 1024)) {
			throw new Error(`Invalid GPT-2 model chunk: ${path}`);
		}
	}
	const runtimePackage = JSON.parse(
		await readFile(new URL('node_modules/onnxruntime-web/package.json', root), 'utf8')
	);
	await mkdir(new URL('static/onnxruntime/', root), { recursive: true });
	const runtimeFiles = (await readdir(new URL('node_modules/onnxruntime-web/dist/', root))).filter(
		(filename) => /^ort-wasm.*\.(mjs|wasm)$/.test(filename)
	);
	if (runtimeFiles.length === 0) throw new Error('ONNX Runtime WASM files are missing.');
	for (const filename of runtimeFiles) {
		await copyFile(
			new URL(`node_modules/onnxruntime-web/dist/${filename}`, root),
			new URL(`static/onnxruntime/${filename}`, root)
		);
	}
	console.log(
		`Local assets ready: GPT-2 tokenizer, 63 model chunks, fonts, ONNX Runtime ${runtimePackage.version}.`
	);
} catch (error) {
	console.error(`Local asset preparation failed in ${fileURLToPath(root)}: ${error.message}`);
	console.error(
		'Restore the bundled assets or install the locked npm dependencies. No downloads were attempted.'
	);
	process.exitCode = 1;
}
