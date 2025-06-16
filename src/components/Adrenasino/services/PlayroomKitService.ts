import { myPlayer, setState } from 'playroomkit';

export class PlayroomKitService {
  private static instance: PlayroomKitService;
  private isInitialized = false;

  public static getInstance(): PlayroomKitService {
    if (!PlayroomKitService.instance) {
      PlayroomKitService.instance = new PlayroomKitService();
    }
    return PlayroomKitService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.isInitialized = true;
      console.log('PlayroomKit initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PlayroomKit:', error);
    }
  }

  public getMyPlayer() {
    return myPlayer;
  }

  public setState(key: string, value: unknown) {
    setState(key, value);
  }

  public destroy(): void {
    this.isInitialized = false;
  }
}

export default PlayroomKitService;
