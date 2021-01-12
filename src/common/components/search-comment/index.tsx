import React, {Component, Fragment} from "react";

interface Props {

}

interface State {

}

class SearchComment extends Component<Props, State> {
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
