import { Table, Column, CreatedAt, UpdatedAt, Model, PrimaryKey, AutoIncrement, DataType, BelongsTo, ForeignKey, HasMany, AllowNull, Default } from "sequelize-typescript";

@Table
class ScheduledMessagesEnvio extends Model<ScheduledMessagesEnvio> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @Column
    mediaPath: string;

    @Column
    mediaName: string;

    @Column(DataType.TEXT)
    mensagem: string;

    @Column
    companyId: number

    @Column
    data_envio: Date;

    @Column
    scheduledmessages: number;

    @Column
    key: string;

}

export default ScheduledMessagesEnvio;
