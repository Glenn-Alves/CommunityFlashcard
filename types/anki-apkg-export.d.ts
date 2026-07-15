declare module "anki-apkg-export" {
  export default class AnkiExport {
    constructor(deckName: string);
    addCard(front: string, back: string, options?: any): void;
    addMedia(name: string, data: any): void;
    save(): Promise<any>;
  }
}