import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Item, ItemStatus} from "../common/database/entities/item.entity";
import {DeepPartial, EntityManager, Repository} from "typeorm";

@Injectable()
export class ItemsService {
    constructor(@InjectRepository(Item) private readonly itemRepository: Repository<Item>) {
    }

    for(manager: EntityManager): ItemsService {
        return new ItemsService(manager.getRepository(Item));
    }

    async findAllUnfulfilledByShop(shopId: string): Promise<Item[]> {
        return await this.itemRepository.find({
            where: {
                shop: {
                    id: shopId
                },
                status: ItemStatus.CREATED
            }
        });
    }

    async findByIdLocked(id: string): Promise<Item | null> {
        return await this.itemRepository.findOne({
            where: {
                id
            },
            lock: {
                mode: "for_no_key_update"
            }
        });
    }

    async create(data: DeepPartial<Item>): Promise<Item> {
        const item = this.itemRepository.create(data);
        await this.itemRepository.save(item);
        return item;
    }

    async update(item: Item): Promise<Item> {
        await this.itemRepository.save(item);
        return item;
    }

    async transaction<T>(transactionFn: (manager: EntityManager) => Promise<T>): Promise<T> {
        return await this.itemRepository.manager.transaction(transactionFn);
    }
}