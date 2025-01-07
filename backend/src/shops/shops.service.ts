import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Shop} from "../common/database/entities/shop.entity";
import {DeepPartial, EntityManager, Repository} from "typeorm";

@Injectable()
export class ShopsService {
    constructor(@InjectRepository(Shop) private shopRepository: Repository<Shop>) {
    }

    for(manager: EntityManager): ShopsService {
        return new ShopsService(manager.getRepository(Shop));
    }

    async findAll(): Promise<Shop[]> {
        return await this.shopRepository.find();
    }

    async findById(id: string): Promise<Shop | null> {
        return await this.shopRepository.findOne({
            where: {
                id
            }
        });
    }

    async create(data: DeepPartial<Shop>): Promise<Shop> {
        const shop = this.shopRepository.create(data);
        await this.shopRepository.save(shop);
        return shop;
    }

    async transaction<T>(transactionFn: (manager: EntityManager) => Promise<T>): Promise<T> {
        return await this.shopRepository.manager.transaction(transactionFn);
    }
}