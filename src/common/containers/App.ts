import {bindActionCreators, AnyAction, Dispatch} from 'redux';
import {connect} from 'react-redux';
import Counter from '../components/Counter';
import {increment, decrement} from '../store/counter/index';

const mapStateToProps = (state: any) => ({
    counter: state.counter,
});

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
    // @ts-ignore
    return bindActionCreators(
        {
            increment,
            decrement
        }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
