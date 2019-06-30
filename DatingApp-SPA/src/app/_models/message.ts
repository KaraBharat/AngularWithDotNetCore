export interface Message {
    id: number;
    senderId: number;
    recipientId: number;
    senderKnownAs: string;
    recipientKnownAs: string;
    senderPhotoUrl: string;
    recipientPhotoUrl: string;
    content: string;
    isRead: boolean;
    dateRead: Date;
    messageSent: Date;
}
