import { User } from "../../domain/User";
import { IRepos } from "../../usecases/ports/IRepos";

// Adapter "fake" em memória para simplificar.
// Troque por pg/knex/prisma depois mantendo a mesma interface.
export class RepositoryAdapterPostgres implements IRepos {
	private table = new Map<string, User>(); // email -> User

	async save(user: User): Promise<void> {
		// Aqui você faria INSERT ... RETURNING
		this.table.set(user.email, user);
		// console.log("[PG] salvou", user);
	}

	async findByEmail(email: string): Promise<User | null> {
		// SELECT * FROM users WHERE email = $1
		return this.table.get(email) ?? null;
	}
}
