import {useEffect} from 'react';
import {State as GlobalState} from '../../store/global/types';

interface Props {
    global: GlobalState
}

export default (props: Props) => {
    useEffect(() => {
        if (['day', 'night'].includes(props.global.theme)) {
            const body = document.querySelector('body');
            if (!body) return;

            body.className = `theme-${props.global.theme}`;
        }

    }, [props.global.theme]);

    return null;
};
