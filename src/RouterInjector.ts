import { beforeRender } from '@dojo/widget-core/WidgetBase';
import { w, registry as globalRegistry } from '@dojo/widget-core/d';
import { WidgetRegistry } from '@dojo/widget-core/WidgetRegistry';
import { Injector, BaseInjector } from '@dojo/widget-core/Injector';
import { RegistryLabel } from '@dojo/widget-core/interfaces';

import HashHistory from './history/HashHistory';
import { History } from './history/interfaces';
import { Router, RouteConfig } from './Router';

/**
 * Key for the router injetor
 */
export const routerKey = Symbol();

/**
 * Creates a router instance for a specific History manager (default is `HashHistory`) and registers
 * the route configuration.
 *
 * @param config The route config to register for the router
 * @param registry An optional registry that defaults to the global registry
 * @param history The history manager the router needs to use, default `HashHistory`
 * @param key The key for the router injector, defaults to exported `routerKey` symbol
 */
export function registerRouterInjector(
	config: RouteConfig[],
	registry: WidgetRegistry = globalRegistry,
	history: History = new HashHistory(),
	key: RegistryLabel = routerKey
): Router<any> {
	if (registry.has(key)) {
		throw new Error('Router has already been defined');
	}
	const router = new Router({ history, config });
	registry.define(key, Injector(RouterInjector, router));
	return router;
}

/**
 * Injector for routing
 */
export class RouterInjector extends BaseInjector<Router<any>> {
	constructor(context: Router<any>) {
		super(context);
		context.on('navstart', (event: any) => {
			this.invalidate();
		});
	}

	@beforeRender()
	protected beforeRender(renderFunc: any, properties: any, children: any[]) {
		const { outlet, mainComponent, indexComponent, errorComponent, mapParams } = properties.getProperties(this.toInject(), properties);
		if (this.context.hasOutlet(outlet)) {
			const { params = {}, type, location } = this.context.getOutlet(outlet);

			properties.getProperties = (injected: Router<any>, properties: any) => {
				return mapParams(params, type, location);
			};

			if ((type === 'index' || type === 'error') && indexComponent) {
				properties.render = () => w(indexComponent, properties.properties, children);
			}
			else if (type === 'error' && errorComponent) {
				properties.render = () => w(errorComponent, properties.properties, properties.children);
			}
			else if (type !== 'error' && mainComponent) {
				properties.render = () => w(mainComponent, properties.properties, properties.children);
			}
		}
		return renderFunc;
	}
}

export default RouterInjector;