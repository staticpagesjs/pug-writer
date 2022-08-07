import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import rimraf from 'rimraf';
import { pugWriter } from '../esm/index.js';

// cwd should be in tests folder where we provide a proper folder structure.
process.chdir(path.dirname(fileURLToPath(import.meta.url)));

// TODO: mock fs to provide a more stable environment for the tests?

afterEach(() => {
	rimraf.sync('dist');
});

test('can initialize a writer with default parameters', async () => {
	const writer = pugWriter();
	expect(writer).toBeDefined();
});

test('can render a simple template', async () => {
	const writer = pugWriter();

	await writer({
		url: 'unnamed',
		body: 'foo',
	});

	const expectedPath = 'dist/unnamed.html';
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can set views dir with initial view', async () => {
	const writer = pugWriter({
		view: 'userview.pug',
		viewsDir: 'views2/userViews1'
	});

	await writer({
		url: 'unnamed',
		body: 'foo',
	});

	const expectedPath = 'dist/unnamed.html';
	const expectedContent = '__*<p>foo</p>*__';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can set output dir', async () => {
	const writer = pugWriter({
		outDir: 'dist'
	});

	await writer({
		url: 'unnamed',
		body: 'foo',
	});

	const expectedPath = 'dist/unnamed.html';
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can set outfile name via header.path', async () => {
	const writer = pugWriter();

	await writer({
		header: {
			path: 'my/output.file'
		},
		body: 'foo',
	});

	const expectedPath = 'dist/my/output.html';
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can set outfile name via outFile option', async () => {
	const writer = pugWriter({
		outFile: () => 'my/output.file'
	});

	await writer({
		body: 'foo',
	});

	const expectedPath = 'dist/my/output.file';
	const expectedContent = 'hello world!<p>foo</p>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});

test('can turn off custom markdown filter', async () => {
	const writer = pugWriter({
		showdownEnabled: false
	});

	await expect(async () => {
		await writer({
			body: 'foo',
		});
	})
		.rejects
		.toThrow('views');
});

test('can configure showdown filter', async () => {
	const writer = pugWriter({
		view: 'showdown.pug',
		showdownOptions: {
			headerLevelStart: 2
		}
	});

	await writer({
		url: 'unnamed',
		body: '# foo',
	});

	const expectedPath = 'dist/unnamed.html';
	const expectedContent = '<h2 id="foo">foo</h2>';

	expect(fs.existsSync(expectedPath)).toBe(true);
	expect(fs.readFileSync(expectedPath, 'utf-8')).toBe(expectedContent);
});
