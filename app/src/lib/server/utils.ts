import { MEDIA_FOLDERS } from "$lib/constants";
import * as jdenticon from "jdenticon";
import path from "path";
import sharp from "sharp";
import { Auth } from "./auth";

const emailRegex = new RegExp(
	/(?:[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+(?:\.[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9\x2d]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
);

export const isValidEmail = (email: string) => {
	return emailRegex.test(email);
};

/**
 * Validates if a string is a valid hex color code (#RRGGBB).
 */
export const isValidHex = (str: string) => /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str);

export class ImageGen {
	static readonly profileImagePath = path.join(process.cwd(), `static/${MEDIA_FOLDERS.profileImages}/`);

	static profileImage = async (hash: string) => {
		const defaultProfileImagePng = jdenticon.toPng(hash, 128, { backColor: '#ffffff00' });
		const output = await sharp(defaultProfileImagePng)
			.avif({
				quality: 20
			})
			.toBuffer();

		const filename = Auth.generateRandom(16) + '.avif'

		const savePath = this.profileImagePath + filename;
		await sharp(output).toFile(savePath);

		return filename;
	}
};
