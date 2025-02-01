import { Table, Column, CreatedAt, UpdatedAt, Model, PrimaryKey, AutoIncrement, DataType, BelongsTo, ForeignKey, HasMany, AllowNull, Default } from "sequelize-typescript";
import Contact from "./Contact";
import Tag from "./Tag";

@Table
class ScheduledMessages extends Model<ScheduledMessages> {
    
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    data_mensagem_programada: Date;

    @Column
    id_conexao: String;

    @Column
    intervalo: string;

    @Column
    valor_intervalo: string;

    @Column(DataType.TEXT)
    mensagem: string;

    @Column
    tipo_dias_envio: string;

    @Default(false)
    @Column
    mostrar_usuario_mensagem: boolean;

    @Default(false)
    @Column
    criar_ticket: boolean;

    @Column({ type: DataType.JSONB })
    contatos: String[];

    @Column({ type: DataType.JSONB })
    tags: String[];

    @Column
    companyId: number;

    @Column
    nome: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @Column
    mediaPath: string;

    @Column
    mediaName: string;

    @Column
    tipo_arquivo: string;

    @Column
    usuario_envio: string;

    @Column
    enviar_quantas_vezes: string;

}

export default ScheduledMessages;
