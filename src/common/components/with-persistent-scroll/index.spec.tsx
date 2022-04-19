import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { withPersistentScroll } from './index';
import { Provider } from 'react-redux';
import configureStore from '../../store/configure';
import { Store } from 'redux';
import { StaticRouter } from 'react-router-dom';
import { Location } from 'history';
import { savePageAct } from '../../store/persistent-page-scroll';


describe('With persistent scroll HOC', () => {
  const TestComponent = (props: any) => {
    return <div>Greeting, {props.name}</div>
  };

  const TestComponentWithPersistentScroll = withPersistentScroll(TestComponent);
  let testProps: any;
  let store: Store;
  let location: Location;

  beforeEach(() => {
    testProps = {
      name: 'Tester'
    };
    store = configureStore({} as any);
    location = {
      hash: '',
      key: undefined,
      search: '',
      state: undefined,
      pathname: '/testpath'
    };

    window.scroll = jest.fn();
  });

  it('should show original component', async () => {
    const component = TestRenderer.create(
      <StaticRouter location={location} context={{}}>
        <Provider store={store}>
          <TestComponentWithPersistentScroll {...testProps} />
        </Provider>
      </StaticRouter>
    );

    expect(component.root.findByType('div').props.children).toStrictEqual(['Greeting, ', 'Tester']);
  });

  it('should save scroll position to store', function () {
    const component = TestRenderer.create(
      <StaticRouter location={location} context={{}}>
        <Provider store={store}>
          <TestComponentWithPersistentScroll {...testProps} />
        </Provider>
      </StaticRouter>
    );

    (window as any).scrollY = 1000;
    component.unmount();

    expect(store.getState().persistentPageScroll['/testpath'].scroll).toBe(1000);
  });

  it('should scroll with stored scroll position', function () {
    store.dispatch(savePageAct({ pageName: '/testpath', scrollValue: 1000 }));

    act(() => {
      TestRenderer.create(
        <StaticRouter location={location} context={{}}>
          <Provider store={store}>
            <TestComponentWithPersistentScroll {...testProps} />
          </Provider>
        </StaticRouter>
      );
    });
    expect(window.scroll).toHaveBeenCalledWith(0, 1000);
  });
});