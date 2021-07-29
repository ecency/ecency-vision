import {useEffect} from 'react';
import {Global} from '../../store/global/types';

interface Props {
    global: Global
}

export default (props: Props) => {
    useEffect(() => {
        if (['day', 'night'].includes(props.global.theme)) {
            let body: any = document.getElementsByTagName('body');
            if (!body) return;
            body = body[0];
            if(body.classList.contains("theme-day")){
                body.classList.remove("theme-day")
                body.classList.add("theme-night")
            }
            else {
                body.classList.remove("theme-night")
                body.classList.add("theme-day")
            }
        }

    }, [props.global.theme]);

    return null;
};
