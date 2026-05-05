import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationEntity } from './location.entity';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,
    private readonly kafka: KafkaService,
  ) {}

  async createLocation(data: {
    name: string;
    countryId: string;
    parentId?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const parentId = data.parentId && data.parentId.trim() !== "" ? data.parentId : null;

    try {
      let level = 1;

      // 1. Calculate Hierarchy Level
      if (parentId) {
        const parent = await this.locationRepo.findOne({ 
          where: { id: parentId },
          select: ['level'] 
        });

        if (!parent) throw new NotFoundException('Parent location not found');
        level = parent.level + 1;
      }

      // 2. Create instance
      const newLocation = this.locationRepo.create({
        name: data.name,
        countryId: data.countryId,
        parentId: parentId,
        level: level,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      // 3. Persist to DB
      const savedLocation = await this.locationRepo.save(newLocation);

      // 4. Kafka Emission for scaling
      await this.kafka.emit(
        'location.created',
        {
          locationId: savedLocation.id,
          countryId: savedLocation.countryId,
          level: savedLocation.level,
        },
        savedLocation.countryId // Partitioned by country
      );

      return savedLocation;

    } catch (error: unknown) {
      // Type narrowing for the 'unknown' error
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as { code: string };
        
        // 23505 is the PostgreSQL code for Unique Constraint Violation
        if (dbError.code === '23505') {
          throw new ConflictException(
            `Location '${data.name}' already exists in this specific region/country.`
          );
        }
      }

      // Re-throw if it's a different kind of error (e.g., connection lost)
      throw error;
    }
  }

  async findOne(id: string): Promise<LocationEntity | null> {
    return this.locationRepo.findOne({ where: { id } });
  }

  async getChildren(parentId: string): Promise<LocationEntity[]> {
    return this.locationRepo.find({ where: { parentId } });
  }

  // Optimized Recursive Tree Query
  async getLocationTree(rootId: string) {
    const results = await this.locationRepo.query(
      `
      WITH RECURSIVE location_tree AS (
        SELECT id, name, country_id, parent_id, level, latitude, longitude
        FROM locations
        WHERE id = $1
        UNION ALL
        SELECT l.id, l.name, l.country_id, l.parent_id, l.level, l.latitude, l.longitude
        FROM locations l
        INNER JOIN location_tree lt ON l.parent_id = lt.id
      )
      SELECT * FROM location_tree;
      `,
      [rootId]
    );

    return this.buildTree(results);
  }

  private buildTree(rows: any[]) {
    const map = new Map();
    let root = null;

    rows.forEach(row => {
      const node = { ...row, countryId: row.country_id, parentId: row.parent_id, children: [] };
      map.set(row.id, node);
    });

    rows.forEach(row => {
      const node = map.get(row.id);
      if (row.parent_id && map.has(row.parent_id)) {
        map.get(row.parent_id).children.push(node);
      } else {
        root = node;
      }
    });

    return root;
  }
}