export interface Club {
  Id: string;
  Name: string;
  ShortName?: string;
  Description?: string;
  Summary?: string;
  ProfilePicture?: string;
  CategoryNames?: string[];
  WebsiteKey?: string; // <--- ADD THIS LINE to fix the red squiggle
}