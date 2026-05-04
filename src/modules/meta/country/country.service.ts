import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CountryEntity } from './country.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(CountryEntity)
    private repo: Repository<CountryEntity>,
  ) {}

  create(name: string, code: string) {
    return this.repo.save({ name, code });
  }

  findAll() {
    return this.repo.find();
  }
}