const author_re = /author:([^\s]+)/g;
const type_re = /type:([^\s]+)/g;
const category_re = /category:([^\s]+)/g;
const tag_re = /tag:([^\s]+)/g;

export type SearchType = "" | "post" | "comment";

export default class SearchQuery {
    public query: string = "";
    public baseQuery: string = "";
    public author: string = "";
    public type: SearchType = "";
    public category: string = "";
    public tags: string[] = [];

    constructor(_query: string) {
        this.query = _query;
        this.baseQuery = _query;

        this.grabAuthor();
        this.grabType();
        this.grabCategory();
        this.grabTags();
        this.grabBaseQuery();
    }

    private grab = (re: RegExp): string => {
        const matches = [...this.query.matchAll(re)];
        if (matches.length > 0) {
            return matches[0][1].trim();
        }

        return "";
    }

    private grabAuthor = () => {
        this.author = this.grab(author_re);
    }

    private grabType = () => {
        const type = this.grab(type_re);
        if (["", "post", "comment"].includes(type)) {
            this.type = type as SearchType;
        }
    }

    private grabCategory = () => {
        this.category = this.grab(category_re);
    }

    private grabTags = () => {
        const tags = this.grab(tag_re);
        if (tags !== "") {
            this.tags = tags.split(",").map(x => x.trim());
        }
    }

    private grabBaseQuery = () => {
        [author_re, type_re, category_re, tag_re].forEach(r => {
            this.baseQuery = this.baseQuery.replace(r, () => "");
        })

        while (this.baseQuery.indexOf("  ") !== -1) {
            this.baseQuery = this.baseQuery.replace("  ", " ");
        }

        this.baseQuery = this.baseQuery.trim();
    }

    public rebuild = () => {
        let q = this.baseQuery;

        if (this.author) {
            q += ` author:${this.author}`;
        }

        if (this.type) {
            q += ` type:${this.type}`;
        }

        if (this.category) {
            q += ` category:${this.category}`;
        }

        if (this.tags.length > 0) {
            q += ` tag:${this.tags.join(",")}`;
        }

        return q;
    }
}
