import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryResolver } from './country.resolver';
import { CountryService } from './country.service';
import { CountryEntity } from './country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CountryEntity])],
  providers: [CountryResolver, CountryService],
  exports: [TypeOrmModule]
})
export class CountryModule {}