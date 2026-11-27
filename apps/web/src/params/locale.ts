import type { ParamMatcher } from '@sveltejs/kit';
import { isLocale } from '@portofolio/shared';

export const match: ParamMatcher = (param) => isLocale(param);
