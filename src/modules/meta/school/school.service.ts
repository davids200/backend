import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchoolEntity } from "./school.entity";
import { Repository } from "typeorm";

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(SchoolEntity)
    private repo: Repository<SchoolEntity>,
  ) {}

  create(name: string, locationId: string) {
    return this.repo.save({ name, locationId });
  }

  findByLocation(locationId: string) {
    return this.repo.find({ where: { locationId } });
  }
}