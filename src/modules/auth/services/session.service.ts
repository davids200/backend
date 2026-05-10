import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthSessionEntity } from "../entities/auth-session.entity";
import { Repository } from "typeorm";

@Injectable()

export class SessionService {

  constructor(

    @InjectRepository(
      AuthSessionEntity,
    )
    private readonly repo:
      Repository<AuthSessionEntity>,
  ) {}

  async createSession(
    data: Partial<AuthSessionEntity>,
  ) {

    const session =
      this.repo.create(
        data,
      );

    return this.repo.save(
      session,
    );
  }
}