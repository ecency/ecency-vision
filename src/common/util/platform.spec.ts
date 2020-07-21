import platform from "./platform";

it('platform os', () => {
    expect(platform({navigator:{appVersion:'5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36'}})).toBe('MacOS');
});