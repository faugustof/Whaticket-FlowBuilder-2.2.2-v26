import {
  Model,
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({
  tableName: "FlowBuilders"
})
export class FlowBuilderModel extends Model<FlowBuilderModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  user_id: number;

  @Column
  name: string;

  @Column
  company_id: number;

  @Column
  active: boolean;

  @Column(DataType.JSON)
  flow: {} | null;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
