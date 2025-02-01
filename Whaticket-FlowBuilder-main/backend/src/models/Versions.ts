import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";

@Table({ tableName: "Versions" })
class Version extends Model<Version> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  versionFrontend: string;

  @Column
  versionBackend: string;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;
}

export default Version;
