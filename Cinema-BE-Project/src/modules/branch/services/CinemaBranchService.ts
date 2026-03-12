import { AppDataSource } from "../../../data-source";
import { CinemaBranch } from "../models/CinemaBranch";

export class CinemaBranchService {
    private branchRepo = AppDataSource.getRepository(CinemaBranch);

    async create(data: { name: string; address: string; hotline: string }) {
        const existing = await this.branchRepo.findOne({
            where: { name: data.name },
        });
        if (existing) {
            throw new Error("Branch name already exists");
        }
        const branch = this.branchRepo.create(data);
        return this.branchRepo.save(branch);
    }

    async findAll() {
        return this.branchRepo.find({
            order: { name: "ASC" },
        });
    }

    async findById(id: number) {
        const branch = await this.branchRepo.findOne({
            where: { id },
        });
        if (!branch) {
            throw new Error("Branch not found");
        }
        return branch;
    }

    async update(
        id: number,
        data: Partial<{ name: string; address: string; hotline: string }>
    ) {
        const branch = await this.findById(id);
        Object.assign(branch, data);
        return this.branchRepo.save(branch);
    }
}

