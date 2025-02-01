import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  PrimaryKey,
  AutoIncrement,
  Default,
  HasMany,
  BelongsToMany,
  ForeignKey,
  BelongsTo,
  BeforeDestroy
} from "sequelize-typescript";
import { hash, compare } from "bcryptjs";
import Ticket from "./Ticket";
import Queue from "./Queue";
import UserQueue from "./UserQueue";
import Company from "./Company";
import QuickMessage from "./QuickMessage";
import Whatsapp from "./Whatsapp";
import Chatbot from "./Chatbot";

@Table
class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  email: string;

  @Column(DataType.VIRTUAL)
  password: string;

  @Column
  passwordHash: string;

  @Default(0)
  @Column
  tokenVersion: number;

  @Default("admin")
  @Column
  profile: string;

  @Default(null)
  @Column
  profileImage: string;
  
  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;
  
  @Column
  super: boolean;

  @Column
  online: boolean;

  @Default("00:00")
  @Column
  startWork: string;

  @Default("23:59")
  @Column
  endWork: string;

  @Default("")
  @Column
  color: string;

  @Default("disable")
  @Column
  allTicket: string;

  @Default(false)
  @Column
  allowGroup: boolean;

  @Default("light")
  @Column
  defaultTheme: string;

  @Default("closed")
  @Column
  defaultMenu: string;

  @Default("")
  @Column(DataType.TEXT)
  farewellMessage: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @BelongsToMany(() => Queue, () => UserQueue)
  queues: Queue[];

  @HasMany(() => QuickMessage, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  quickMessages: QuickMessage[];

  @BeforeUpdate
  @BeforeCreate
  static hashPassword = async (instance: User): Promise<void> => {
    if (instance.password) {
      instance.passwordHash = await hash(instance.password, 8);
    }
  };

  public checkPassword = async (password: string): Promise<boolean> => {
    return compare(password, this.getDataValue("passwordHash"));
  };

  @Default("disabled")
  @Column
  allHistoric: string;

  @HasMany(() => Chatbot, {
    onUpdate: "SET NULL",
    onDelete: "SET NULL",
    hooks: true
  })
  chatbot: Chatbot[];

  @Default("disabled")
  @Column
  allUserChat: string;

  @Default("enabled")
  @Column
  userClosePendingTicket: string;

  @Default("disabled")
  @Column
  showDashboard: string;

  @Default(550)
  @Column
  defaultTicketsManagerWidth: number;

  @Default("disable")
  @Column
  allowRealTime: string;

  @Default("disable")
  @Column
  allowConnections: string;

  @BeforeDestroy
  static async updateChatbotsUsersReferences(user: User) {
    // Atualizar os registros na tabela Chatbots onde optQueueId é igual ao ID da fila que será excluída
    await Chatbot.update({ optUserId: null }, { where: { optUserId: user.id } });
  }
}

export default User;
