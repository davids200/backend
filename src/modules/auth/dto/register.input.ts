import {
  Field,
  InputType,
} from '@nestjs/graphql';

@InputType()
export class RegisterInput {

  @Field()
  username?: string;

  @Field({    nullable: true,  })
  displayName?: string;

  @Field({    nullable: true,  })
  email?: string;

  @Field({    nullable: true,  })
  phone?: string;  

  @Field({    nullable: true,  })
  password?: string;
}