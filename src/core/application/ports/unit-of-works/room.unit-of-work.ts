import type { IRoomRepository, ITurnRepository } from "@briom/core/domain";

/**
 * @description
 * Manages transaction boundaries (Unit of Work) for Room and Turn aggregates.
 * Ensures that all repository operations executed within the `execute` block
 * maintain atomicity and database integrity (ACID principles).
 */
export interface IRoomUnitOfWork {
	/**
	 * @description
	 * Executes a series of database operations within a single,
	 * isolated transaction scope.
	 */
	execute<T>(work: (tx: IRoomUnitOfWork) => Promise<T>): Promise<T>;

	/**
	 * @description
	 * Repository for managing Room entity persistence.
	 *
	 * *Note: When accessed within the `execute` callback, this instance
	 * automatically uses the active transaction context.*
	 */
	readonly roomRepository: IRoomRepository;

	/**
	 * @description Repository for managing Turn entity persistence.
	 *
	 * *Note: When accessed within the `execute` callback, this instance
	 * automatically uses the active transaction context.*
	 */
	readonly turnRepository: ITurnRepository;
}
