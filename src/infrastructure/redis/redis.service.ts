import {
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';

import Redis from 'ioredis';

@Injectable()
export class RedisService
implements OnModuleDestroy {

  public readonly client:Redis;

  constructor(){

    this.client =
      new Redis({

        host:'localhost',

        port:6379,
      });
  }

  async onModuleDestroy(){

    await this.client.quit();
  }

  // =====================================================
  // GET
  // =====================================================

  async get(
    key:string,
  ){

    return this.client.get(
      key,
    );
  }

  // =====================================================
  // SET
  // =====================================================

 async set(
  key:string,
  value:string,
  mode?:'EX',
  duration?:number,
){

  if (mode && duration){
    return this.client.set(key,value,mode,duration,);
  }
  return this.client.set(key,value, );
}
  


  // EXISTS
  async exists(key:string,){
    return this.client.exists(
      key,
    );
  }



  // INCR  
  async incr(key:string,  ){
    return this.client.incr(key,  );
  }

  
  
  // INCRBY
  async incrBy(key:string, value:number,){
    return this.client.incrby(key,value, );
  }

  
  // DECR
  async decr(key:string,  ){
    return this.client.decr( key,    );
  }

 
  
  // DEL
  async del(key:string,){
    return this.client.del(
      key,
    );
  }
}