export interface Announcement {
  id: number;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  path: string | Array<string>;
  auth: boolean;
}
