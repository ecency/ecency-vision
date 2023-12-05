const author_re = /author:([^\s]+)/g;
const type_re = /type:([^\s]+)/g;
const category_re = /category:([^\s]+)/g;
const tag_re = /tag:([^\s]+)/g;

export enum SearchType {
  ALL = "",
  POST = "post",
  COMMENT = "comment"
}

export default class SearchQuery {
  public query: string = "";
  public search: string = "";
  public author: string = "";
  public type: SearchType = SearchType.ALL;
  public category: string = "";
  public tags: string[] = [];

  constructor(_query: string) {
    this.query = _query;
    this.search = _query;

    this.grabAuthor();
    this.grabType();
    this.grabCategory();
    this.grabTags();
    this.grabSearch();
  }

  private grab = (re: RegExp): string => {
    const matches = [...this.query.matchAll(re)];
    if (matches.length > 0) {
      return matches[0][1].trim();
    }

    return "";
  };

  private grabAuthor = () => {
    this.author = this.grab(author_re);
  };

  private grabType = () => {
    const type = this.grab(type_re) as SearchType;
    if (Object.values(SearchType).includes(type)) {
      this.type = type as SearchType;
    }
  };

  private grabCategory = () => {
    this.category = this.grab(category_re);
  };

  private grabTags = () => {
    const tags = this.grab(tag_re);
    if (tags !== "") {
      this.tags = tags.split(",").map((x) => x.trim());
    }
  };

  private grabSearch = () => {
    [author_re, type_re, category_re, tag_re].forEach((r) => {
      this.search = this.search.replace(r, () => "");
    });

    while (this.search.indexOf("  ") !== -1) {
      this.search = this.search.replace("  ", " ");
    }

    this.search = this.search.trim();
  };
}
