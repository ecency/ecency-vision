import React from 'react';

interface Props {
    onBottom: () => any
}

export default class DetectBottom extends React.Component<Props> {

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }


    handleScroll = () => {
        const {onBottom} = this.props;
        if ((window.innerHeight + window.scrollY) + 100 >= document.body.offsetHeight) {
            onBottom();
        }
    };

    render() {
        return null;
    }
}
