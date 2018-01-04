import {
	Constructor,
	RegistryLabel,
	VNodeProperties,
	WidgetBaseInterface,
	WidgetProperties
} from '@dojo/widget-core/interfaces';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';

/**
 * Description of a registered route
 */
export interface Route {
	path: string;
	outlet: string;
	params: string[];
	query: string[];
	segments: (symbol | string)[];
	children: Route[];
	fullPath: string;
	fullParams: string[];
	defaultParams: Params;
}

/**
 * Route configuration
 */
export interface Config {
	path: string;
	outlet: string;
	children?: Config[];
	defaultParams?: Params;
	defaultRoute?: boolean;
}

/**
 * Route Params
 */
export interface Params {
	[index: string]: string;
}

/**
 * Options passed to the mapParams callback
 */
export interface MapParamsOptions {
	queryParams: Params;
	params: Params;
	type: MatchType;
	router: RouterInterface;
}

/**
 * Type of outlet matches
 */
export type MatchType = 'error' | 'exact' | 'partial';

/**
 * Context stored for matched outlets
 */
export interface OutletContext {
	/**
	 * The type of match for the outlet
	 */
	type: MatchType;

	/**
	 * The params for the specific outlet
	 */
	params: Params;

	/**
	 * The query params for the route
	 */
	queryParams: Params;
}

/**
 * Interface for Router
 */
export interface RouterInterface {
	/**
	 * Generates a link from the outlet and the optional params
	 */
	link(outlet: string, params?: Params): string | undefined;

	/**
	 * Sets the path on the underlying history manager
	 */
	setPath(path: string): void;

	/**
	 * Returns the outlet context if matched
	 */
	getOutlet(outletId: string): OutletContext | undefined;

	/**
	 * The current params for matched routes
	 */
	readonly currentParams: Params;
}

/**
 * Function for mapping params to properties
 */
export interface MapParams {
	(options: MapParamsOptions): any;
}

/**
 * Outlet options that can be configured
 */
export interface OutletOptions {
	key?: RegistryLabel;
	onEnter?: () => void;
	onExit?: () => void;
	mapParams?: MapParams;
}

/**
 * Component type
 */
export type Component<W extends WidgetBaseInterface = WidgetBaseInterface> = Constructor<W> | RegistryLabel;

/**
 * Outlet component options
 */
export interface OutletComponents<
	W extends WidgetBaseInterface,
	I extends WidgetBaseInterface,
	E extends WidgetBaseInterface
> {
	main?: Component<W>;
	index?: Component<I>;
	error?: Component<E>;
}

/**
 * Type for Outlet
 */
export type Outlet<
	W extends WidgetBaseInterface,
	F extends WidgetBaseInterface,
	E extends WidgetBaseInterface
> = Constructor<
	WidgetBase<Partial<E['properties']> & Partial<W['properties']> & Partial<F['properties']> & WidgetProperties, null>
>;

/**
 * Properties for the Link widget
 */
export interface LinkProperties extends VNodeProperties {
	key?: string;
	isOutlet?: boolean;
	params?: Params;
	onClick?: (event: MouseEvent) => void;
	to: string;
}

/**
 * History interface
 */
export interface History {
	/**
	 * Sets the path on the history manager
	 */
	set(path: string): void;

	/**
	 * Adds a prefix to the path if the history manager requires
	 */
	prefix(path: string): string;

	/**
	 * Returns the current path
	 */
	readonly current: string;
}