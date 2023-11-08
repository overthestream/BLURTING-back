import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, SchemaOptions } from 'mongoose';
import { ChatUserDto } from 'src/dtos/chat.dto';

const options: SchemaOptions = {
  id: false,
  collection: 'room',
};

const ChatUser = new MongooseSchema(
  {
    userId: { required: true, type: Number },
    userImage: { type: String },
    hasRead: { required: true, type: Date },
    isDeleted: { required: true, type: Boolean },
  },
  { _id: false },
);

@Schema(options)
export class Room extends Document {
  @Prop({
    unique: true,
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @Prop({
    required: true,
    type: [ChatUser],
    default: [],
  })
  @IsNotEmpty()
  users: ChatUserDto[];

  @Prop({
    required: true,
    type: Boolean,
  })
  @IsNotEmpty()
  @IsBoolean()
  connected: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
