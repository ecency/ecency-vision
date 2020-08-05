import tempEntry from './temp-entry';

global.Date.now = jest.fn(() => new Date('2019-04-22T10:20:30Z').getTime());


describe('tempEntry', () => {
    it('(1) Create temp entry', () => {
        const input = {
            author: {
                name: "foo",
                reputation: 24.33
            },
            permlink: "lorem",
            parentAuthor: "",
            parentPermlink: "ecency",
            title: "a test post",
            body: "lorem ipsum dolor sit amet",
            tags: ["ecency", "photography"],
            category: "ecency"
        }
        expect(tempEntry(input)).toMatchSnapshot();
    });

});
