import type { IRoomRepository, ITurnRepository } from "@briom/domain";

export interface IRoomUnitOfWork {
	execute<T>(work: (tx: IRoomUnitOfWork) => Promise<T>): Promise<T>;
	readonly roomRepository: IRoomRepository;
	readonly turnRepository: ITurnRepository;
}
