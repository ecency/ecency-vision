import sumTotal from './sum-total';

describe('sum total', () => {
    it('(1) should calculate sum total for not paid out post', () => {
        const input = {
            last_payout: '1970-01-01T00:00:00',
            pending_payout_value: '567.055 HBD',
            total_payout_value: '0.000 HBD',
            curator_payout_value: '0.000 HBD'
        };
        const expected = 567.055;

        // @ts-ignore
        expect(sumTotal(input)).toBe(expected);
    });

    it('(2) should calculate sum total for paid out post', () => {
        const input = {
            last_payout: '2018-08-22T12:00:00',
            pending_payout_value: '0.000 HBD',
            total_payout_value: '567.055 HBD',
            curator_payout_value: '1.070 HBD'
        };
        const expected = 568.125;

        // @ts-ignore
        expect(sumTotal(input)).toBe(expected);
    });
});
