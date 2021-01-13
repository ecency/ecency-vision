import React, {Component, Fragment} from "react";

interface Props {

}

interface State {
    author: string;
    type: string;
    category: string;
    tags: string[];
    sort:string;
    hideLow: boolean;
}

class SearchComment extends Component<Props, State> {

    componentDidMount() {
    }

    render() {
        return <div className="card">
            <div className="card-header">
                <strong>Posts</strong>
            </div>
            <div className="card-body">

            </div>
        </div>
    }
}

export default (p: Props) => {
    const props = {}

    return <SearchComment {...props} />
}
