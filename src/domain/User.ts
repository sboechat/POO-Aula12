export interface UserProps {
	name: string;
	email: string;
}

export class User {
	private constructor(
		public readonly name: string,
		public readonly email: string
	) {}

	static create(props: UserProps): User {
		const { name, email } = props;

		if (!name || !name.trim()) {
			throw new Error("Nome inválido");
		}

		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			throw new Error("Email inválido");
		}

		return new User(name.trim(), email.toLowerCase());
	}

	// Novo: reidratar do banco (sem validar de novo)
	static restore(name: string, email: string): User {
		return new User(name, email);
	}
}
