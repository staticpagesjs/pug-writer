import * as path from 'path';
import * as showdown from 'showdown';
import * as pug from 'pug';
import { fileWriter, FileWriterOptions } from '@static-pages/file-writer';

export type PugWriterOptions = {
	view?: string | { (data: Record<string, unknown>): string };
	viewsDir?: string;
	pugOptions?: pug.Options;
	showdownEnabled?: boolean;
	showdownOptions?: showdown.ConverterOptions;
} & Omit<FileWriterOptions, 'renderer'>;

export const pugWriter = ({
	view = 'main.pug',
	viewsDir = 'views',
	pugOptions = {},
	showdownEnabled = true,
	showdownOptions = {},
	...rest
}: PugWriterOptions = {}) => {
	if (typeof view !== 'string' && typeof view !== 'function')
		throw new Error('pug-writer \'view\' option expects a string or a function.');

	if (typeof pugOptions !== 'object' || !pugOptions)
		throw new Error('pug-writer \'pugOptions\' option expects an object.');

	if (typeof showdownOptions !== 'object' || !showdownOptions)
		throw new Error('pug-writer \'showdownOptions\' option expects an object.');

	const addons: Record<string, unknown> = {};

	// Provide a built-in markdown function
	if (showdownEnabled) {
		const converter = new ((showdown as unknown as { default: typeof showdown })?.default ?? showdown).Converter({
			simpleLineBreaks: true,
			ghCompatibleHeaderId: true,
			customizedHeaderId: true,
			tables: true,
			...showdownOptions,
		});
		addons.markdown = (md: string) => converter.makeHtml(md);
	}

	const writer = fileWriter({
		...rest,
		renderer: data => pug.renderFile(
			path.join(viewsDir, typeof view === 'function' ? view(data) : view),
			{
				...data,
				...addons,
				cache: true,
				...pugOptions,
			}),
	});

	return (data: Record<string, unknown>): Promise<void> => writer(data);
};

export default pugWriter;
