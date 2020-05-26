import parseToken from './parse-token';

describe('Parse token', () => {
    it('(1) should parse', () => {
        const input = '18.494 HBD';
        expect(parseToken(input)).toMatchSnapshot();
    });

    it('(2) should parse', () => {
        const input = '0.000 HIVE';
        expect(parseToken(input)).toMatchSnapshot();
    });

    it('(2) should parse number', () => {
        const input = 0;
        expect(parseToken(input)).toMatchSnapshot();
    });
});
