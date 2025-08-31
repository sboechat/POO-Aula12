# Instanciação de Classes - Clean Architecture

## 2. Melhor local para instanciar as classes sem framework

**Resposta**: O melhor local é criar um **arquivo de entrada principal** (como `main.ts` ou `index.ts`) na raiz do projeto ou em uma pasta `src/`. Este arquivo deve:

-   Instanciar as dependências na ordem correta (repositório → caso de uso → controller)
-   Centralizar a configuração do sistema
-   Permitir fácil troca entre diferentes implementações

### Exemplo de estrutura recomendada:

```typescript
// src/main.ts
import { RepositoryAdapterSqlite } from "./adapters/db/RepositoryAdapterSqlite";
import { CreateUserUsecase } from "./usecases/CreateUserUsecase";
import { CreateUserController } from "./adapters/controllers/CreateUserController";

async function bootstrap() {
	// Instanciar na ordem de dependência
	const repository = new RepositoryAdapterSqlite();
	const createUserUsecase = new CreateUserUsecase(repository);
	const createUserController = new CreateUserController(createUserUsecase);

	// Usar o sistema
	const result = await createUserController.handle({
		name: "João Silva",
		email: "joao@email.com",
	});

	console.log(result);
}

bootstrap().catch(console.error);
```

### Alternativa com Factory Pattern:

```typescript
// src/factories/AppFactory.ts
export class AppFactory {
	static createUserManagementSystem(
		dbType: "sqlite" | "mysql" | "postgres" = "sqlite"
	) {
		let repository;

		switch (dbType) {
			case "mysql":
				repository = new RepositoryAdapterMySQL();
				break;
			case "postgres":
				repository = new RepositoryAdapterPostgreSQL();
				break;
			default:
				repository = new RepositoryAdapterSqlite();
		}

		const usecase = new CreateUserUsecase(repository);
		const controller = new CreateUserController(usecase);

		return { repository, usecase, controller };
	}
}
```

## 3. Como instanciar as classes com framework

**Resposta**: Com framework, use **Injeção de Dependência (DI)** através de um **container IoC** ou **decorators**. As principais abordagens são:

### Opção 1: Container IoC Simples (Express.js)

```typescript
// src/container.ts
class DIContainer {
	private services = new Map();

	register(key: string, factory: () => any) {
		this.services.set(key, factory);
	}

	get<T>(key: string): T {
		const factory = this.services.get(key);
		if (!factory) throw new Error(`Service ${key} not found`);
		return factory();
	}
}

const container = new DIContainer();

// Configuração das dependências
container.register("repository", () => {
	const dbType = process.env.DB_TYPE || "sqlite";
	switch (dbType) {
		case "mysql":
			return new RepositoryAdapterMySQL();
		case "postgres":
			return new RepositoryAdapterPostgreSQL();
		default:
			return new RepositoryAdapterSqlite();
	}
});

container.register(
	"createUserUsecase",
	() => new CreateUserUsecase(container.get("repository"))
);

container.register(
	"createUserController",
	() => new CreateUserController(container.get("createUserUsecase"))
);

export { container };
```

#### Uso no Express.js:

```typescript
// src/server.ts
import express from "express";
import { container } from "./container";
import { CreateUserController } from "./adapters/controllers/CreateUserController";

const app = express();
app.use(express.json());

app.post("/users", async (req, res) => {
	const controller = container.get<CreateUserController>(
		"createUserController"
	);
	const result = await controller.handle(req.body);

	if (result.success) {
		res.status(201).json(result);
	} else {
		res.status(400).json(result);
	}
});

app.listen(3000, () => {
	console.log("Server running on port 3000");
});
```

### Opção 2: TSyringe (Decorators)

```bash
# Instalar dependências
npm install tsyringe reflect-metadata
```

```typescript
// src/main.ts
import "reflect-metadata";
import { container, injectable, inject } from "tsyringe";

@injectable()
export class CreateUserUsecase {
	constructor(@inject("IRepos") private repository: IRepos) {}
	// ... implementação
}

@injectable()
export class CreateUserController {
	constructor(private usecase: CreateUserUsecase) {}
	// ... implementação
}

// Configuração no main.ts
container.register<IRepos>("IRepos", { useClass: RepositoryAdapterPostgreSQL });

// Uso automático
const controller = container.resolve(CreateUserController);
```

### Opção 3: NestJS (Framework completo)

```bash
# Instalar NestJS
npm i @nestjs/core @nestjs/common @nestjs/platform-express
```

```typescript
// user.module.ts
import { Module } from "@nestjs/common";

@Module({
	providers: [
		CreateUserUsecase,
		{
			provide: "IRepos",
			useClass: RepositoryAdapterPostgreSQL,
		},
	],
	controllers: [CreateUserController],
})
export class UserModule {}

// create-user.controller.ts
import { Controller, Post, Body } from "@nestjs/common";

@Controller("users")
export class CreateUserController {
	constructor(private readonly usecase: CreateUserUsecase) {}

	@Post()
	async create(@Body() dto: CreateUserDTO) {
		return await this.usecase.execute(dto);
	}
}
```

## Vantagens de cada abordagem

### Sem Framework:

-   **Controle total** sobre a instanciação
-   **Simplicidade** para projetos pequenos
-   **Transparência** no fluxo de dependências
-   **Fácil debug** e compreensão

### Com Framework:

-   **Gerenciamento automático** do ciclo de vida das instâncias
-   **Resolução automática** de dependências
-   **Configuração centralizada**
-   **Facilita testes unitários** com mocks
-   **Reduz acoplamento** entre classes
-   **Escalabilidade** para projetos grandes

## Recomendação

-   **Projetos pequenos/médios**: Use instanciação manual com Factory Pattern
-   **Projetos grandes/complexos**: Use framework com injeção de dependência
-   **APIs REST**: Express.js + Container IoC ou NestJS
-   **Aplicações empresariais**: NestJS com decorators
