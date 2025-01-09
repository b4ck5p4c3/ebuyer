export function verifyUrl(url: string, hostnameRegex: RegExp, pathnameRegex: RegExp): boolean {
    try {
        const parsedUrl = new URL(url);
        return !!parsedUrl.hostname.match(hostnameRegex) && !!parsedUrl.pathname.match(pathnameRegex);
    } catch (e) {
        return false;
    }
}

