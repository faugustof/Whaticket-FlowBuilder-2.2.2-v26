import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default
} from "sequelize-typescript";
import Queue from "./Queue";
import User from "./User";
import QueueIntegrations from "./QueueIntegrations";
import Files from "./Files";

@Table
class Chatbot extends Model<Chatbot> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Column
  greetingMessage: string;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue, "queueId")
  queue: Queue;

  @ForeignKey(() => Chatbot)
  @Column
  chatbotId: number;

  @Column
  isAgent: boolean;

  @BelongsTo(() => Chatbot)
  mainChatbot: Chatbot;

  @HasMany(() => Chatbot)
  options: Chatbot[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  queueType: string;

  @ForeignKey(() => Queue)
  @Column
  optQueueId: number;

  @BelongsTo(() => Queue, "optQueueId")
  optQueue: Queue;

  @ForeignKey(() => User)
  @Column
  optUserId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => QueueIntegrations)
  @Column
  optIntegrationId: number;

  @BelongsTo(() => QueueIntegrations)
  queueIntegrations: QueueIntegrations;

  @ForeignKey(() => Files)
  @Column
  optFileId: number;

  @BelongsTo(() => Files)
  file: Files;

  @Default(false)
  @Column
  closeTicket: boolean;
}

export default Chatbot;
