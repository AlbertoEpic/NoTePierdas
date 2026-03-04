import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
	const { pathname, search } = context.url;

	if (pathname.startsWith('/NoTePierdas/')) {
		const rewrittenPath = pathname.replace(/^\/NoTePierdas\//, '/');
		const rewrittenUrl = new URL(`${rewrittenPath}${search}`, context.url);
		return context.rewrite(rewrittenUrl);
	}

	if (pathname === '/NoTePierdas') {
		const rewrittenUrl = new URL('/', context.url);
		return context.rewrite(rewrittenUrl);
	}

	return next();
});
