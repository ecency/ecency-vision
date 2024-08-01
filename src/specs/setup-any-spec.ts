import { TextDecoder, TextEncoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock("i18next", () => ({
  __esModule: true,
  default: {
    t: jest.fn((key) => key),
    init: jest.fn()
  }
}));
