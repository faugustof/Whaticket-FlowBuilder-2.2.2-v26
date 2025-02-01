import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    AllowNull,
    HasMany,
    Unique
} from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "Invoices" })
class Invoices extends Model<Invoices> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => Company)
    @Column
    companyId: number;

    @Column
    dueDate: string;

    @Column
    detail: string;

    @Column
    status: string;

    @Column
    value: number;

    @Column
    users: number;
  
    @Column
    connections: number;
  
    @Column
    queues: number;
  
    @Column
    useWhatsapp: boolean;   
  
    @Column
    useFacebook: boolean;   
  
    @Column
    useInstagram: boolean;   
    
    @Column
    useCampaigns: boolean;   
  
    @Column
    useSchedules: boolean;   
  
    @Column
    useInternalChat: boolean;   
    
    @Column
    useExternalApi: boolean;   

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @Column
    linkInvoice: string;
}

export default Invoices;
