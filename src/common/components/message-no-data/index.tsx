import React from 'react';

interface Props {
    children: any;
}

const MessageNoData = ({children}:Props) => {
    return <div className="container-no-message">{children}</div>
}

export default (p: Props) => {
    const props: Props = {
        children: p.children,
    }

    return <MessageNoData {...props} />;
}
