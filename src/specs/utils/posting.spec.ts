import {
  createPatch,
  createPermlink,
  createReplyPermlink,
  extractMetaData,
  makeCommentOptions,
  makeJsonMetaData,
  makeJsonMetaDataReply
} from "../../utils/posting";

describe("Posting", () => {
  it("createPermlink", () => {
    const input = "lorem ipsum dolor sit amet";
    expect(createPermlink(input)).toMatchSnapshot();
  });

  it("createPermlink random", () => {
    jest.spyOn(Math, "random").mockImplementation(() => {
      return 1.95136022969379;
    });
    const input = "lorem ipsum dolor sit amet";
    expect(createPermlink(input, true)).toMatchSnapshot();
  });

  it("createPermlink non-latin chars", () => {
    jest.spyOn(Math, "random").mockImplementation(() => {
      return 1.95136022969379;
    });
    const input = "ปลาตัวใหญ่สีเหลืองทอง";
    expect(createPermlink(input)).toMatchSnapshot();
  });

  it("(1) extractMetadata", () => {
    const input = '<img src="http://www.xx.com/a.png"> @lorem @ipsum';
    expect(extractMetaData(input)).toMatchSnapshot();
  });

  it("(2) extractMetadata", () => {
    const input =
      '@lorem <img src="http://www.xx.com/a.png"> ![h74zrad2fh.jpg](https://img.esteem.ws/h74zrad2fh.jpg) http://www.google.com/foo/bar  @ipsum';
    expect(extractMetaData(input)).toMatchSnapshot();
  });

  it("makeJsonMetaData", () => {
    const meta = {
      image: ["http://www.xx.com/a.png", "https://img.esteem.ws/h74zrad2fh.jpg"]
    };
    const tags = ["esteem", "art"];

    expect(makeJsonMetaData(meta, tags, "", "2.0.0")).toMatchSnapshot();
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

  it("makeJsonMetadataReply", () => {
    expect(makeJsonMetaDataReply(["foo", "bar"], "1.1")).toMatchSnapshot();
  });

  it("createReplyPermlink", () => {
    // @ts-ignore
    jest.spyOn(Date, "now").mockImplementation(() => {
      return new Date("2018-09-21T12:00:50.000Z");
    });
    expect(createReplyPermlink("good-karma")).toMatchSnapshot();
  });

  it("createPatch", () => {
    expect(
      createPatch("lorem ipsum dlor sit amet", "lorem ipsum dolor sit amet")
    ).toMatchSnapshot();
  });
});
