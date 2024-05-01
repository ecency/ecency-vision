import {
  createPermlink,
  createReplyPermlink,
  extractMetaData,
  makeCommentOptions,
  makeJsonMetaDataReply
} from "./posting";

describe("createPermlink", () => {
  it("(1) ", () => {
    const input = "lorem ipsum dolor sit amet";
    expect(createPermlink(input)).toMatchSnapshot();
  });
});

describe("createPermlink random", () => {
  jest.spyOn(Math, "random").mockImplementation(() => {
    return 1.95136022969379;
  });

  it("(1) ", () => {
    const input = "lorem ipsum dolor sit amet";
    expect(createPermlink(input, true)).toMatchSnapshot();
  });
});

describe("createPermlink non-latin chars", () => {
  jest.spyOn(Math, "random").mockImplementation(() => {
    return 1.95136022969379;
  });

  it("(1) ", () => {
    const input = "ปลาตัวใหญ่สีเหลืองทอง";
    expect(createPermlink(input)).toMatchSnapshot();
  });
});

describe("extractMetadata", () => {
  it("(1) ", () => {
    const input = '<img src="http://www.xx.com/a.png"> @lorem @ipsum';
    expect(extractMetaData(input)).toMatchSnapshot();
  });

  it("(2) ", () => {
    const input =
      '@lorem <img src="http://www.xx.com/a.png"> ![h74zrad2fh.jpg](https://img.esteem.ws/h74zrad2fh.jpg) http://www.google.com/foo/bar  @ipsum';
    expect(extractMetaData(input)).toMatchSnapshot();
  });
});

describe("makeCommentOptions", () => {
  it("(1) Default 50% / 50%", () => {
    expect(makeCommentOptions("talhasch", "lorem-ipsum-1", "default")).toMatchSnapshot();
  });

  it("(2) Power Up 100%", () => {
    expect(makeCommentOptions("talhasch", "lorem-ipsum-1", "sp")).toMatchSnapshot();
  });

  it("(3) Decline Payout", () => {
    expect(makeCommentOptions("talhasch", "lorem-ipsum-1", "dp")).toMatchSnapshot();
  });

  it("(4) Empty beneficiary list", () => {
    expect(makeCommentOptions("talhasch", "lorem-ipsum-1", "default", [])).toMatchSnapshot();
  });

  it("(5) With beneficiary list", () => {
    expect(
      makeCommentOptions("talhasch", "lorem-ipsum-1", "default", [
        { account: "foo", weight: 300 },
        { account: "bar", weight: 200 }
      ])
    ).toMatchSnapshot();
  });
});

describe("makeJsonMetadataReply", () => {
  it("(1)", () => {
    expect(makeJsonMetaDataReply(["foo", "bar"], "1.1")).toMatchSnapshot();
  });
});

describe("createReplyPermlink", () => {
  // @ts-ignore
  jest.spyOn(Date, "now").mockImplementation(() => {
    return new Date("2018-09-21T12:00:50.000Z");
  });

  it("(1) ", () => {
    expect(createReplyPermlink("good-karma")).toMatchSnapshot();
  });
});
