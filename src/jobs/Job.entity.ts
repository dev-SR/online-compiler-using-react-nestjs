import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum STATUS {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}
export enum LANGUAGE_EXT {
  cpp = 'cpp',
  C = 'c',
  PY = 'py',
  JS = 'js',
  ts = 'ts',
}

@Entity()
export class Jobs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LANGUAGE_EXT,
  })
  language_ext: LANGUAGE_EXT;

  @Column()
  filepath: string;

  @Column({ nullable: true })
  output: string;

  @Column({ nullable: true })
  inputPath: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  submitted_at: Date;

  @Column({ type: 'timestamptz', nullable: true }) // Recommended
  completedAt: Date;

  @Column({ type: 'timestamptz', nullable: true }) // Recommended
  startedAt: Date;

  @Column({
    type: 'enum',
    enum: STATUS,
    default: STATUS.PENDING,
  })
  status: STATUS;
}
