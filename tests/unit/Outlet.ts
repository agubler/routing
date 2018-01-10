const { beforeEach, describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');
import { stub } from 'sinon';

import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { WNode } from '@dojo/widget-core/interfaces';
import { Router } from './../../src/Router';
import { MemoryHistory as HistoryManager } from './../../src/history/MemoryHistory';
import { Outlet, getProperties } from './../../src/Outlet';

class Widget extends WidgetBase {
	render() {
		return 'widget';
	}
}

const configOnEnter = stub();
const configOnExit = stub();

const routeConfig = [
	{
		path: '/foo',
		outlet: 'foo',
		children: [
			{
				path: '/bar',
				outlet: 'bar'
			}
		]
	},
	{
		path: 'baz/{baz}',
		outlet: 'baz'
	}
];

describe('Outlet', () => {
	beforeEach(() => {
		configOnEnter.reset();
	});

	it('Should render the main component for index matches when no index component is set', () => {
		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/foo');
		const TestOutlet = Outlet(Widget, 'foo');
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		const renderResult = outlet.__render__() as WNode;
		assert.strictEqual(renderResult.widgetConstructor, Widget);
		assert.deepEqual(renderResult.children, []);
		assert.deepEqual(renderResult.properties, {});
	});

	it('Should render the main component for partial matches', () => {
		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/foo/bar');
		const TestOutlet = Outlet(Widget, 'foo');
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		const renderResult = outlet.__render__() as WNode;
		assert.strictEqual(renderResult.widgetConstructor, Widget);
		assert.deepEqual(renderResult.children, []);
		assert.deepEqual(renderResult.properties, {});
	});

	it('Should render the index component only for index matches', () => {
		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/foo');
		const TestOutlet = Outlet({ index: Widget }, 'foo');
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		let renderResult = outlet.__render__() as WNode;
		assert.strictEqual(renderResult.widgetConstructor, Widget);
		assert.deepEqual(renderResult.children, []);
		assert.deepEqual(renderResult.properties, {});
		router.setPath('/foo/bar');
		renderResult = outlet.__render__() as WNode;
		assert.isNull(renderResult);
	});

	it('Should render the error component only for error matches', () => {
		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/foo/other');
		const TestOutlet = Outlet({ error: Widget }, 'foo');
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		let renderResult = outlet.__render__() as WNode;
		assert.strictEqual(renderResult.widgetConstructor, Widget);
		assert.deepEqual(renderResult.children, []);
		assert.deepEqual(renderResult.properties, {});
	});

	it('Should render the index component only for error matches when there is no error component', () => {
		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/foo/other');
		const TestOutlet = Outlet({ index: Widget }, 'foo');
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		let renderResult = outlet.__render__() as WNode;
		assert.strictEqual(renderResult.widgetConstructor, Widget);
		assert.deepEqual(renderResult.children, []);
		assert.deepEqual(renderResult.properties, {});
	});

	it('Map params is called with params, queryParams, match type and router', () => {
		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/baz/bazParam?bazQuery=true');
		const mapParams = stub();
		const TestOutlet = Outlet({ index: Widget }, 'baz', { mapParams });
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		outlet.__render__() as WNode;
		assert.isTrue(mapParams.calledOnce);
		assert.isTrue(
			mapParams.calledWith({
				params: {
					baz: 'bazParam'
				},
				queryParams: {
					bazQuery: 'true'
				},
				router,
				type: 'index'
			})
		);
	});

	it('onEnter called when the outlet is rendered', () => {
		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/foo');
		const onEnter = stub();
		const TestOutlet = Outlet({ index: Widget }, 'foo', { onEnter });
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledOnce);
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledOnce);
		router.setPath('/foo/bar');
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledOnce);
		router.setPath('/baz');
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledOnce);
		router.setPath('/foo');
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledTwice);
	});

	it('onEnter called when the outlet is rendered with different params', () => {
		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/baz/param');
		const onEnter = stub();
		const TestOutlet = Outlet({ index: Widget }, 'baz', { onEnter });
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledOnce);
		router.setPath('/baz/bar');
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledTwice);
		router.setPath('/baz/bar');
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledTwice);
		router.setPath('/baz/baz');
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledThrice);
	});

	it('configuration onEnter called when the outlet is rendered', () => {
		const routeConfig = [
			{
				path: '/foo',
				outlet: 'foo',
				children: [
					{
						path: '/bar',
						outlet: 'bar'
					}
				]
			},
			{
				path: 'baz/{baz}',
				outlet: 'baz',
				onEnter: configOnEnter,
				onExit: configOnExit
			}
		];

		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/baz/param');
		const TestOutlet = Outlet({ index: Widget }, 'baz');
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		outlet.__render__() as WNode;
		assert.isTrue(configOnEnter.calledOnce);
		router.setPath('/baz/bar');
		outlet.__render__() as WNode;
		assert.isTrue(configOnEnter.calledTwice);
		router.setPath('/baz/baz');
		outlet.__render__() as WNode;
		assert.isTrue(configOnEnter.calledThrice);
	});

	it('outlet onEnter overrides configuration onEnter', () => {
		const routeConfig = [
			{
				path: '/foo',
				outlet: 'foo',
				children: [
					{
						path: '/bar',
						outlet: 'bar'
					}
				]
			},
			{
				path: 'baz/{baz}',
				outlet: 'baz',
				onEnter: configOnEnter,
				onExit: configOnExit
			}
		];

		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/baz/param');
		const onEnter = stub();
		const TestOutlet = Outlet({ index: Widget }, 'baz', { onEnter });
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledOnce);
		assert.isTrue(configOnEnter.notCalled);
		router.setPath('/baz/bar');
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledTwice);
		assert.isTrue(configOnEnter.notCalled);
		router.setPath('/baz/baz');
		outlet.__render__() as WNode;
		assert.isTrue(onEnter.calledThrice);
		assert.isTrue(configOnEnter.notCalled);
	});

	it('onExit called when the outlet is not rendered after previously rendering', () => {
		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/foo');
		const onExit = stub();
		const TestOutlet = Outlet({ index: Widget }, 'foo', { onExit });
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		outlet.__render__() as WNode;
		assert.isTrue(onExit.notCalled);
		router.setPath('/foo/bar');
		outlet.__render__() as WNode;
		assert.isTrue(onExit.calledOnce);
		router.setPath('/baz');
		outlet.__render__() as WNode;
		assert.isTrue(onExit.calledOnce);
		router.setPath('/foo');
		outlet.__render__() as WNode;
		assert.isTrue(onExit.calledOnce);
	});

	it('configuration onExit called when the outlet is rendered', () => {
		const routeConfig = [
			{
				path: '/foo',
				outlet: 'foo',
				onEnter: configOnEnter,
				onExit: configOnExit,
				children: [
					{
						path: '/bar',
						outlet: 'bar'
					}
				]
			},
			{
				path: 'baz/{baz}',
				outlet: 'baz'
			}
		];

		const router = new Router(routeConfig, { HistoryManager });
		router.setPath('/foo');
		const TestOutlet = Outlet({ index: Widget }, 'foo');
		const outlet = new TestOutlet();
		outlet.__setProperties__({ router } as any);
		outlet.__render__() as WNode;
		assert.isTrue(configOnExit.notCalled);
		router.setPath('/foo/bar');
		outlet.__render__() as WNode;
		assert.isTrue(configOnExit.calledOnce);
		router.setPath('/baz');
		outlet.__render__() as WNode;
		assert.isTrue(configOnExit.calledOnce);
		router.setPath('/foo');
		outlet.__render__() as WNode;
		assert.isTrue(configOnExit.calledOnce);
	});

	it('getProperties returns the payload as router', () => {
		const router = new Router(routeConfig, { HistoryManager });
		assert.deepEqual(getProperties(router, {}), { router });
	});
});
