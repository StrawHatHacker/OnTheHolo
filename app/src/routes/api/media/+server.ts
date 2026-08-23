import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { ERROR_MAP } from '$lib/errors';
import { SETTINGS } from '$lib/settings.js';
import { MEDIA_PURPOSE } from '$lib/constants.js';
import { ImageGen } from '$lib/server/utils.js';
import sharp from 'sharp';

const validatePutBody = (data: FormData) => {
	const file = data.get('file');
	let purpose = Number(data.get('purpose'));

	if (!file || !(file instanceof File) || !purpose || Number.isNaN(purpose))
		throw new CError(400, ERROR_MAP.generalError);

	if (purpose === MEDIA_PURPOSE.profileImage) {
		if (file.size > SETTINGS.MAX_PFP_FILE_SIZE)
			throw new CError(400, ERROR_MAP.fileTooLarge + ' - Profile image');
	} else if (purpose === MEDIA_PURPOSE.bannerImage) {
		if (file.size > SETTINGS.MAX_BANNER_FILE_SIZE)
			throw new CError(400, ERROR_MAP.fileTooLarge + ' - Banner image');
	} else {
		throw new CError(400, ERROR_MAP.generalError);
	}

	return {
		file,
		purpose
	};
};
export const PUT = async ({ request, cookies }) => {
	try {
		const session = await Auth.verifySession(cookies);
		const data = validatePutBody(await request.formData());

		const filename = Auth.generateRandom(16) + '.avif';

		let savePath = '';

		if (data.purpose === MEDIA_PURPOSE.profileImage) {
			savePath = ImageGen.profileImagePath + filename;
		} else if (data.purpose === MEDIA_PURPOSE.bannerImage) {
			savePath = ImageGen.bannerImagePath + filename;
		} else {
			throw new CError(400, ERROR_MAP.generalError);
		}

		const inputBuffer = Buffer.from(await data.file.arrayBuffer());
		const avif = await ImageGen.convertToAVIF(inputBuffer);

		await sharp(avif).toFile(savePath);

		return json({ filename });
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};
