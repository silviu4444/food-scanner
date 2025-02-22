import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { map } from 'rxjs';
import { Dto } from '../interfaces/dto.interfaces';

@Injectable()
export class DtoInterceptor<T> implements NestInterceptor<T, Dto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): any {
    return next.handle().pipe(map((data) => ({ data }) satisfies Dto<T>));
  }
}
