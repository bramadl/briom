import { useSyncExternalStore } from "react";

export class Signal<T> {
	private listeners = new Set<() => void>();
	constructor(private _value: T) {}
	get value() {
		return this._value;
	}
	set value(v: T) {
		if (this._value !== v) {
			this._value = v;
			this.listeners.forEach((l) => void l());
		}
	}
	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};
}

export function useSignalValue<T>(signal: Signal<T>): T {
	return useSyncExternalStore(
		(cb) => signal.subscribe(cb),
		() => signal.value,
		() => signal.value,
	);
}
