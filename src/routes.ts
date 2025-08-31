import { Router } from "express";
import { RepositoryAdapterSqlite } from "./adapters/db/RepositoryAdapterSqlite";
import { CreateUserController } from "./adapters/http/CreateUserController";
import { ListUsersController } from "./adapters/http/ListUsersController";
import { CreateUserUsecase } from "./usecases/CreateUserUsecase";
import { ListUsersUsecase } from "./usecases/ListUsersUsecase";

const router = Router();
const repo = new RepositoryAdapterSqlite();

// Instanciando controllers
const createUserController = new CreateUserController(
	new CreateUserUsecase(repo)
);
const listUsersController = new ListUsersController(new ListUsersUsecase(repo));

// Rotas
router.post("/users", createUserController.handle);
router.get("/users", listUsersController.handle);

// Buscar usuário por email
router.get("/users/email/:email", async (req, res) => {
	const email = req.params.email;
	try {
		const user = await repo.findByEmail(email); // método que precisa existir no repo
		if (!user)
			return res.status(404).json({ message: "Usuário não encontrado" });
		res.json(user);
	} catch (err: any) {
		res.status(500).json({
			message: "Erro no servidor",
			error: err.message,
		});
	}
});

export { router };
