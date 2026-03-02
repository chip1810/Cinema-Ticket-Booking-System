import { AppDataSource } from "../data-source";
import { Concession } from "../modules/concession/models/Concession";
import { CreateConcessionDTO } from "../dtos/CreateConcession.dto";

export class ConcessionService {
    private repo = AppDataSource.getRepository(Concession);

    async create(data: CreateConcessionDTO) {
        return this.repo.save(this.repo.create(data));
    }

    async getAll() {
        return this.repo.find();
    }

    async update(id: number, data: Partial<CreateConcessionDTO>) {
        const item = await this.repo.findOneBy({ id });
        if (!item) throw new Error("Concession not found");
        Object.assign(item, data);
        return this.repo.save(item);
    }

    async delete(id: number) {
        const item = await this.repo.findOneBy({ id });
        if (!item) throw new Error("Concession not found");
        return this.repo.remove(item);
    }
}
