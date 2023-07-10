import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MwkBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;
}
