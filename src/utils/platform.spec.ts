import platform from "./platform";

it("MacOS", () => {
  expect(
    platform({
      navigator: { appVersion: "5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36" }
    })
  ).toBe("MacOS");
});

it("WindowsOS", () => {
  expect(
    platform({
      navigator: {
        appVersion:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
      }
    })
  ).toBe("WindowsOS");
});

it("LinuxOS", () => {
  expect(
    platform({
      navigator: {
        appVersion: "Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0"
      }
    })
  ).toBe("LinuxOS");
});

it("AndroidOS", () => {
  expect(
    platform({
      navigator: {
        appVersion:
          "Mozilla/5.0 (Linux; Android 6.0.1; RedMi Note 5 Build/RB3N5C; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/68.0.3440.91 Mobile Safari/537.36"
      }
    })
  ).toBe("AndroidOS");
});

it("iOS", () => {
  expect(
    platform({
      navigator: {
        appVersion:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A5297c Safari/602.1"
      }
    })
  ).toBe("iOS");
});
