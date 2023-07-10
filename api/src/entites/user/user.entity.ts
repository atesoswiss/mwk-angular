import { Entity } from 'typeorm';
import { MwkDefaultUser } from '@mwk/mwk-api';

@Entity()
export class UserEntity extends MwkDefaultUser {
}
