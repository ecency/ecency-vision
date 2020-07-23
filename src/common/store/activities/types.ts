interface BaseActivity {
    event: "notify";
    source: string;
    target: string;
    timestamp: string;
    extra: any;
}

export interface VoteActivity extends BaseActivity {
    type: "vote",
    extra: {
        permlink: string;
        weight: number;
        title: string | null;
        img_url: string | null;
    }
}

export interface MentionActivity extends BaseActivity {
    type: "mention",
    extra: {
        permlink: string;
        is_post: 0 | 1;
        title: string | null;
        img_url: string | null;
    }
}

export interface FollowActivity extends BaseActivity {
    type: "follow",
    extra: {
        what: string[]
    }
}

export interface ReplyActivity extends BaseActivity {
    type: "reply",
    extra: {
        title: string;
        body: string;
        json_metadata: string;
        permlink: string;
        parent_author: string;
        parent_permlink: string;
        parent_title: string | null;
        parent_img_url: string | null;
    }
}

export interface ReblogActivity extends BaseActivity {
    type: "reblog";
    extra: {
        permlink: string;
        title: string | null;
        img_url: string | null;
    }

}

export interface TransferActivity extends BaseActivity {
    type: "transfer";
    extra: {
        amount: string;
        memo: string;
    }
}


export type Activity = VoteActivity | MentionActivity | FollowActivity | ReplyActivity | ReblogActivity | TransferActivity;
