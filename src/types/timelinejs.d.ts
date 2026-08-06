declare module '@knight-lab/timelinejs' {
	export class Timeline {
		constructor(
			containerId: string,
			data: Record<string, unknown>,
			options?: Record<string, unknown>,
		);
	}
}
