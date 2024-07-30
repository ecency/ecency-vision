export interface Announcement {
  id: number;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
}

export interface LaterAnnouncement {
  id: number;
  dateTime: Date;
}
