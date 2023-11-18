import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AddChatDto, ChatDto, InRoomDto } from 'src/dtos/chat.dto';
import { ChatService } from './chat.service';

@WebSocketGateway({ namespace: 'whisper' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  private server: Server;

  afterInit() {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const validated = await this.chatService.validateSocket(client);
    if (!validated) return;

    this.chatService.updateSocketUser(client.data.userId, client.id);
    const chatRooms = await this.chatService.getChatRooms(client.data.userId);
    for (const room of chatRooms) {
      client.join(`${room.roomId}_list`);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const validated = await this.chatService.validateSocket(client);
    if (!validated) return;

    this.chatService.updateSocketUser(client.data.userId, null);
  }

  @SubscribeMessage('create_room')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() user: number,
  ) {
    const users: number[] = [user, client.data.userId];
    const roomId = await this.chatService.newChatRoom(users);
    client.join(roomId);
    client.emit('create_room', roomId);

    const socketId = await this.chatService.findUserSocketId(user);
    if (socketId) {
      this.server.to(socketId).emit('invite_chat', roomId);
    } else {
      this.chatService.pushCreateRoom(user);
    }
  }

  @SubscribeMessage('join_chat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(`${roomId}_list`);
  }

  @SubscribeMessage('in_room')
  handleInOutChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() inRoomDto: InRoomDto,
  ) {
    if (inRoomDto.inRoom) {
      client.leave(`${inRoomDto.roomId}_list`);
      client.join(inRoomDto.roomId);
    } else {
      client.leave(inRoomDto.roomId);
      client.join(`${inRoomDto.roomId}_list`);
    }
    this.chatService.updateReadTime(inRoomDto.roomId, client.data.userId);
  }

  @SubscribeMessage('send_chat')
  handleChatting(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatData: AddChatDto,
  ) {
    const addChat: ChatDto = { ...chatData, userId: client.data.userId };
    const adapter = this.server.adapter as any;
    let read = true;
    if (
      adapter.rooms.get(chatData.roomId) ||
      adapter.rooms.get(chatData.roomId) != undefined
    ) {
      this.chatService.addChat(addChat);

      if (adapter.rooms.get(chatData.roomId).size < 2) {
        read = false;
        this.server
          .to(`${chatData.roomId}_list`)
          .emit('new_chat', { ...addChat, read: read });
      }
      this.server
        .to(chatData.roomId)
        .emit('new_chat', { ...addChat, read: read });
      this.chatService.pushNewChat(chatData.roomId);
    }
  }
}
