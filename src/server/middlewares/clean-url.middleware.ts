import { NextFunction, Request, Response } from "express";

class CleanUrlMiddlewareError extends Error {
  constructor(public redirectUri: string) {
    super();
    this.name = "CleanUrlMiddlewareError";
  }
}

export class CleanUrlMiddleware {
  constructor(private request: Request, private response: Response, private next: NextFunction) {}

  private removeDuplicates(): boolean {
    let replaceValue = "";
    const hasDuplicates = ["//", "@@"].some((i) => {
      if (this.request.url.includes(i)) {
        replaceValue = i[0];
        return true;
      }
      return false;
    });
    if (hasDuplicates) {
      throw new CleanUrlMiddlewareError(
        this.request.url.replace(new RegExp(replaceValue + "{2,}", "g"), replaceValue)
      );
    }
    return false;
  }

  private processHsCode(): boolean {
    return this.request.url.includes("-hs?code");
  }

  private checkLowerCase(): boolean {
    if (
      this.request.url !== this.request.url.toLowerCase() &&
      !this.request.url.includes("auth?code") &&
      !this.request.url.includes("onboard-friend/")
    ) {
      throw new CleanUrlMiddlewareError(this.request.url.toLowerCase());
    } else {
      return true;
    }
  }

  private stripLastSlash(): boolean {
    if (this.request.path.substr(-1) === "/" && this.request.path.length > 1) {
      const query = this.request.url.slice(this.request.path.length);
      throw new CleanUrlMiddlewareError(this.request.path.slice(0, -1) + query);
    } else {
      return true;
    }
  }

  public static build(request: Request, response: Response, next: NextFunction) {
    const instance = new CleanUrlMiddleware(request, response, next);
    try {
      if (instance.removeDuplicates()) {
        next();
      } else if (instance.processHsCode()) {
        next();
      } else if (instance.checkLowerCase()) {
        next();
      } else if (instance.stripLastSlash()) {
        next();
      }
    } catch (e: any) {
      if (e instanceof CleanUrlMiddlewareError || e.name == "CleanUrlMiddlewareError") {
        instance.response.redirect(301, e.redirectUri);
      }
    }
  }
}
