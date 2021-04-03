import {crossPostMessage} from "./cross-post";

it('1 - Invalid', () => {
    expect(crossPostMessage("")).toMatchSnapshot();
    expect(crossPostMessage("lorem ipsum dolor sit amet")).toMatchSnapshot();
});

it('2 - Valid', () => {
    expect(crossPostMessage("This is a cross post of [@foo/bar-baz](/hive-125125/@foo/bar-baz) by @romytokic.<br><br>This part is message to community.")).toMatchSnapshot();
});
