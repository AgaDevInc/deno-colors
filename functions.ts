// deno-lint-ignore-file no-control-regex
import { FONTS, Color } from "./constants.ts";

type Base10 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Base255STR = Base10 | `${Exclude<Base10, 0>}${Base10}` | `1${Base10}${Base10}` | `2${0 | 1 | 2 | 3 | 4}${Base10}` | `25${0 | 1 | 2 | 3 | 4 | 5}`;
type RGB_ARG = number | Base255STR;
type RGB_RED = RGB_ARG | [RGB_ARG, RGB_ARG, RGB_ARG];

/**
 * The function `ValidateColor` checks if a given string is a valid color in the terminal.
 * @param {string} color - The `color` parameter is a string that represents a color.
 * @returns a boolean value.
 */
export function ValidateColor(color: string): color is Color {
	return /^\x1b\[[0-9;]*m$/.test(color);
}

/**
 * The function `joinColors` takes in an array of colors and returns a string that represents the
 * joined colors, while ensuring that the colors are valid and do not conflict with each other.
 * @param {Color[]} colors - The `colors` parameter is an array of `Color` values.
 * @returns a string that represents the joined colors.
 */
export function joinColors(...colors: Color[]) {
	let foreground = false;
	let background = false;
	let result = FONTS.RESET;
	for (const color of colors) {
		if (!ValidateColor(color)) throw new Error('Invalid color');
		if (color === FONTS.RESET) result = FONTS.RESET;
		else if (color.startsWith('\x1b[38;2;')) foreground = true;
		else if (color.startsWith('\x1b[48;2;')) background = true;

		if (result.includes(color)) continue;
		if (color.startsWith('\x1b[38;2;') && foreground) continue;
		if (color.startsWith('\x1b[48;2;') && background) continue;
		result += color;
	}
	return result;
}
/**
 * The colorize function takes a string, a color, and an optional end color, and returns the string
 * wrapped in the specified color.
 * @param {string} text - The `text` parameter is a string that represents the text that you want to
 * colorize.
 * @param {Color} color - The `color` parameter is of type `Color`, which is likely an enum or a string
 * representing a color. It specifies the color to apply to the `text`.
 * @param {Color} end - The `end` parameter is an optional parameter that specifies the color to reset
 * to after applying the `color` to the `text`. If no `end` color is provided, it defaults to
 * `FONTS.RESET`.
 * @returns a string with the specified text colorized using the provided color and end color.
 */
export function colorize(text: string, color: Color, end: Color = FONTS.RESET): string {
	if (typeof text !== 'string') throw new Error('Invalid text');
	if (!ValidateColor(color)) throw new Error('Invalid color');
	if (!ValidateColor(end)) throw new Error('Invalid end color');
	if (text.includes(FONTS.RESET)) {
		const parts = text.split(FONTS.RESET);
		return parts.map(part => colorize(part, color, end)).join(FONTS.RESET);
	}
	return `${color}${text}${end}`;
}
/**
 * The `clear` function removes ANSI escape codes from a given text string.
 * @param {string} text - The `text` parameter is a string that represents the text that you want to
 * clear. It may contain ANSI escape codes for formatting, such as colors, styles, and cursor
 * movements. The `clear` function removes all ANSI escape codes from the text and returns the cleaned
 * text.
 * @returns a string with all ANSI escape codes removed.
 */
export function clear(text: string): string {
	return text.replace(/\x1b\[[0-9;]*m/g, '');
}

const ValidRGB = (n:number) => n >= 0 && n <= 255;
function validateRGB(red: RGB_RED, green: RGB_ARG, blue: RGB_ARG): [number, number, number] {
	if (Array.isArray(red)) return validateRGB(...red);

	red = parseInt(red as string);
	if (!ValidRGB(red)) throw new Error('Invalid red value');

	green = parseInt(green as string);
	if (!ValidRGB(green)) throw new Error('Invalid green value');

	blue = parseInt(blue as string);
	if (!ValidRGB(blue)) throw new Error('Invalid blue value');

	return [red, green, blue];
}
/**
 * The function `rgb` takes three numbers representing red, green, and blue values and returns a string
 * that represents the corresponding color in the terminal.
 * @param {number} red - The red parameter represents the intensity of the red color component in the
 * RGB color model. It should be a number between 0 and 255, where 0 represents no red and 255
 * represents maximum intensity of red.
 * @param {number} green - The `green` parameter in the `rgb` function represents the intensity of the
 * green color component in the RGB color model. It is a number between 0 and 255, where 0 represents
 * no green intensity and 255 represents maximum green intensity.
 * @param {number} blue - The `blue` parameter represents the intensity of the blue color component in
 * the RGB color model. It is a number between 0 and 255, where 0 represents no blue and 255 represents
 * maximum intensity blue.
 * @returns a string that represents an ANSI escape code for setting the foreground color in the
 * terminal to the specified RGB values.
 */
export function rgb(red: number, green: number, blue: number): Color {
	const [r, g, b] = validateRGB(red, green, blue);
	return `\x1b[38;2;${r};${g};${b}m`;
}
/* The `rgb.background` function is a property added to the `rgb` function object. It allows you to set
the background color in the terminal using RGB values. It takes three numbers representing the red,
green, and blue values and returns a string that represents the corresponding ANSI escape code for
setting the background color to the specified RGB values. */
rgb.background = function (red: number, green: number, blue: number): Color {
	const [r, g, b] = validateRGB(red, green, blue);
	return `\x1b[48;2;${r};${g};${b}m`;
};

/**
 * The `rgba` function takes in red, green, blue, and alpha values and returns a color string in the
 * RGBA format.
 * @param {number} red - The red parameter represents the intensity of the red color component in the
 * RGBA color model. It should be a number between 0 and 255, where 0 represents no red and 255
 * represents maximum intensity of red.
 * @param {number} green - The `green` parameter in the `rgba` function represents the intensity of the
 * green color component in the RGBA color model. It is a number between 0 and 255, where 0 represents
 * no green intensity and 255 represents maximum green intensity.
 * @param {number} blue - The `blue` parameter is a number that represents the intensity of the blue
 * color component in the RGBA color model. It should be a value between 0 and 255, where 0 represents
 * no blue and 255 represents maximum intensity of blue.
 * @param {number} alpha - The alpha parameter represents the opacity or transparency of the color. It
 * is a number between 0 and 1, where 0 represents fully transparent and 1 represents fully opaque.
 * @returns a string that represents an RGBA color in the format `\x1b[38;2;;;;m`.
 */
export function rgba(red: number, green: number, blue: number, alpha: number): Color {
	const [r, g, b] = validateRGB(red, green, blue);
	if(alpha < 0 || alpha > 1) throw new Error('Invalid alpha value')
	return `\x1b[38;2;${r};${g};${b};${alpha}m`;
}
/* The `rgba.background` function is a property added to the `rgba` function object. It allows you to
set the background color in the terminal using RGBA values. */
rgba.background = function (red: number, green: number, blue: number, alpha: number): Color {
	const [r, g, b] = validateRGB(red, green, blue);
	if(alpha < 0 || alpha > 1) throw new Error('Invalid alpha value')
	return `\x1b[48;2;${r};${g};${b};${alpha}m`;
};

/**
 * The function `hexToRGB` converts a hexadecimal color code to its corresponding RGB values.
 * @param {string} hex - The `hex` parameter is a string representing a hexadecimal color code. It
 * should start with a '#' symbol followed by six characters representing the red, green, and blue
 * color values.
 * @returns The function `hexToRGB` returns an array of three numbers representing the red, green, and
 * blue values of the converted RGB color.
 */
export function hexToRGB(hex: string): [number, number, number] {
	if (!hex.startsWith('#')) throw new Error('Invalid hex color');
	hex = hex.replace('#', '');
	const LENGTH = hex.length / 3;
	if (LENGTH === 1)
		hex = hex
			.split('')
			.map(x => x + x)
			.join('');
	else if (LENGTH !== 2) throw new Error('Invalid hex color');
	const red = parseInt(hex[0] + hex[1], 16);
	const green = parseInt(hex[2] + hex[3], 16);
	const blue = parseInt(hex[4] + hex[5], 16);
	return [red, green, blue];
}
