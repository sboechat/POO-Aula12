import mysql from "mysql2/promise";
import { User } from "../../domain/User";
import { IRepos } from "../../usecases/ports/IRepos";

export class RepositoryAdapterMysql implements IRepos {
	private pool;

	constructor() {
		this.pool = mysql.createPool({
			host: "localhost",
			user: "root",
			password: "root",
			database: "appdb",
		});
	}

	async save(user: User): Promise<void> {
		const conn = await this.pool.getConnection();
		await conn.execute("INSERT INTO users (name, email) VALUES (?, ?)", [
			user.name,
			user.email,
		]);
		conn.release();
	}

	async findByEmail(email: string): Promise<User | null> {
		const conn = await this.pool.getConnection();
		const [rows] = await conn.execute(
			"SELECT * FROM users WHERE email = ?",
			[email]
		);
		conn.release();

		const result = rows as { id: number; name: string; email: string }[];
		if (result.length === 0) return null;
		return User.restore(result[0].name, result[0].email);
	}

	async findAll(): Promise<User[]> {
		const conn = await this.pool.getConnection();
		const [rows] = await conn.execute("SELECT * FROM users");
		conn.release();

		return (rows as { id: number; name: string; email: string }[]).map(
			(r) => User.restore(r.name, r.email)
		);
	}
}
