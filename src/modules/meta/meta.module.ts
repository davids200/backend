import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CountryEntity } from './country/country.entity'; 
import { SchoolEntity } from './school/school.entity'; 

import { CountryService } from './country/country.service'; 
import { SchoolService } from './school/school.service';
import { EducationLevelService } from './education/education-level.service';

import { CountryResolver } from './country/country.resolver'; 
import { SchoolResolver } from './school/school.resolver';
import { EducationLevelResolver } from './education/education-level.resolver'; 
import { EducationLevelEntity } from '../user/entities/education-level.entity';  
import { LocationEntity } from './location/location.entity';
import { LocationService } from './location/location.service';
import { LocationResolver } from './location/location.resolver';
import { PostgresModule } from '../../infrastructure/postgresql/postgres.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CountryEntity,
      LocationEntity,
      SchoolEntity,
      EducationLevelEntity,
    ]),
    PostgresModule
  ],
  providers: [
    CountryService,
    LocationService,
    SchoolService,
    EducationLevelService,
    CountryResolver,
    LocationResolver,
    SchoolResolver,
    EducationLevelResolver,
  ],
  exports: [
    CountryService,
    LocationService,
    SchoolService,
    EducationLevelService,
  ],
})
export class MetaModule {}