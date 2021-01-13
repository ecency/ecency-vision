const author_re = /author:([^\s]+)/g;
const type_re = /type:([^\s]+)/g;
const category_re = /category:([^\s]+)/g;
const tag_re = /tag:([^\s]+)/g;

export type SearchType = "" | "post" | "comment";

export default class SearchQuery {
    public query: string = "";
    public queryStripped: string = "";
    public author: string = "";
    public type: SearchType = "";
    public category: string = "";
    public tags: string[] = [];

    constructor(_query: string) {
        this.query = _query;
        this.queryStripped = _query;

        this.grab_author();
        this.grab_type();
        this.grab_category();
        this.grab_tags();
        this.stripQuery();
    }

    private grab = (re: RegExp): string => {
        const matches = [...this.query.matchAll(re)];
        if (matches.length > 0) {
            return matches[0][1].trim();
        }

        return "";
    }

    private grab_author = () => {
        this.author = this.grab(author_re);
    }

    private grab_type = () => {
        const type = this.grab(type_re);
        if (["", "post", "comment"].includes(type)) {
            this.type = type as SearchType;
        }
    }

    private grab_category = () => {
        this.category = this.grab(category_re);
    }

    private grab_tags = () => {
        const tags = this.grab(tag_re);
        if (tags !== "") {
            this.tags = tags.split(",").map(x => x.trim());
        }
    }

    private stripQuery = () => {
        [author_re, type_re, category_re, tag_re].forEach(r => {
            this.queryStripped = this.queryStripped.replace(r, () => "");
        })

        while (this.queryStripped.indexOf("  ") !== -1) {
            this.queryStripped = this.queryStripped.replace("  ", " ");
        }

        this.queryStripped = this.queryStripped.trim();
    }

    public rebuild = () => {
        let q = this.queryStripped;

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
