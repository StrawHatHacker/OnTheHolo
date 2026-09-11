import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { ERROR_MAP } from '$lib/errors';
import { SETTINGS } from '$lib/settings.js';
import { MEDIA_PURPOSE } from '$lib/constants.js';
import { ImageGen } from '$lib/server/utils.js';
import fs from 'node:fs';
import path from 'node:path';
import { isRateLimited } from '$lib/server/ratelimits';

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
export const PUT = async ({ request, cookies, getClientAddress }) => {
	try {
		isRateLimited(Auth.getClientIp(request, getClientAddress), 'media');
		const session = await Auth.verifySession(cookies);
		const data = validatePutBody(await request.formData());

		const random = Auth.generateRandom(16);
		const fileExt = SETTINGS.FORCE_AVIF_IMAGES ? '.avif' : '.' + data.file.name.split('.').pop();

		let savePath = '';

		if (data.purpose === MEDIA_PURPOSE.profileImage) {
			savePath = path.join(ImageGen.profileImagePath);
		} else if (data.purpose === MEDIA_PURPOSE.bannerImage) {
			savePath = path.join(ImageGen.bannerImagePath);
		} else {
			throw new CError(400, ERROR_MAP.generalError);
		}

		let inputBuffer = Buffer.from(await data.file.arrayBuffer());

		if (SETTINGS.FORCE_AVIF_IMAGES) {
			inputBuffer = await ImageGen.convertToAVIF(inputBuffer);
		}

		fs.promises.writeFile(savePath + random + fileExt, inputBuffer);

		return json({ filename: random + fileExt });
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};
