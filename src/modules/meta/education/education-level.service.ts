import { Injectable } from "@nestjs/common";
import { EducationLevelEntity } from "../../user/entities/education-level.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class EducationLevelService {
  constructor(
    @InjectRepository(EducationLevelEntity)
    private repo: Repository<EducationLevelEntity>,
  ) {}

  create(name: string, order: number) {
    return this.repo.save({ name, order });
  }

  findAll() {
    return this.repo.find({ order: { order: 'ASC' } });
  }
}