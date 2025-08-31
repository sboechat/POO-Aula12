import { Client } from "pg";
import { User } from "../../domain/User";
import { IRepos } from "../../usecases/ports/IRepos";

export class RepositoryAdapterPostgreSQL implements IRepos {
	private client: Client | null = null;

	constructor() {
		// Inicialização será feita no primeiro uso
	}

	private async getClient(): Promise<Client> {
		if (!this.client) {
			this.client = new Client({
				host: process.env.POSTGRES_HOST || "localhost",
				user: process.env.POSTGRES_USER || "postgres",
				password: process.env.POSTGRES_PASSWORD || "",
				database: process.env.POSTGRES_DATABASE || "app_db",
				port: parseInt(process.env.POSTGRES_PORT || "5432"),
			});

			await this.client.connect();

			// Criar tabela se não existir
			await this.client.query(`
				CREATE TABLE IF NOT EXISTS users (
					id SERIAL PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					email VARCHAR(255) UNIQUE NOT NULL
				)
			`);
		}
		return this.client;
	}

	async save(user: User): Promise<void> {
		try {
			const client = await this.getClient();
			await client.query(
				"INSERT INTO users (name, email) VALUES ($1, $2)",
				[user.name, user.email]
			);
		} catch (error) {
			throw new Error(`Erro ao salvar usuário: ${error}`);
		}
	}

	async findByEmail(email: string): Promise<User | null> {
		try {
			const client = await this.getClient();
			const result = await client.query(
				"SELECT * FROM users WHERE email = $1",
				[email]
			);

			if (result.rows.length === 0) return null;

			const row = result.rows[0];
			return User.restore(row.name, row.email);
		} catch (error) {
			throw new Error(`Erro ao buscar usuário por email: ${error}`);
		}
	}

	async findAll(): Promise<User[]> {
		try {
			const client = await this.getClient();
			const result = await client.query("SELECT * FROM users");

			return result.rows.map((row: any) =>
				User.restore(row.name, row.email)
			);
		} catch (error) {
			throw new Error(`Erro ao buscar todos os usuários: ${error}`);
		}
	}

	// Método para fechar a conexão quando necessário
	async close(): Promise<void> {
		if (this.client) {
			await this.client.end();
		}
	}
}
