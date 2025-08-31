import Database from "better-sqlite3";
import { User } from "../../domain/User";
import { IRepos } from "../../usecases/ports/IRepos";

const db = new Database("app.db");

db.prepare(
	`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  )
`
).run();

export class RepositoryAdapterSqlite implements IRepos {
	async save(user: User): Promise<void> {
		const stmt = db.prepare(
			"INSERT INTO users (name, email) VALUES (?, ?)"
		);
		stmt.run(user.name, user.email);
	}

	async findByEmail(email: string): Promise<User | null> {
		const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
		const row = stmt.get(email) as
			| { id: number; name: string; email: string }
			| undefined;
		if (!row) return null;
		return User.restore(row.name, row.email);
	}

	async findAll(): Promise<User[]> {
		const stmt = db.prepare("SELECT * FROM users");
		const rows = stmt.all() as {
			id: number;
			name: string;
			email: string;
		}[];
		return rows.map((r) => User.restore(r.name, r.email));
	}
}
