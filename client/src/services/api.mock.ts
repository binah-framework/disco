import {
  Invitation,
  InvitationInsert,
  Room,
  RoomData,
  User,
  UserData,
  UserSignUp,
  RecvMessage,
  SendMessage,
  MessageId
} from "@/models";

function delay(ms = 1000) {
  if (process.env.NODE_ENV === "development") {
    return new Promise(resolve => setTimeout(resolve, ms));
  } else {
    return Promise.resolve();
  }
}

const NOW = new Date().getTime();

const MESSAGES: RecvMessage[] = [
  {
    senderId: 1,
    receiverId: null,
    messageText: "1 The FIRST message",
    messageId: 1,
    timestamp: NOW
  },
  {
    senderId: 2,
    receiverId: null,
    messageText: "2 The SECOND message",
    messageId: 2,
    timestamp: NOW + 10000
  },
  // { senderId: 3, receiverId: -1, messageText: "3 The THIRD message"  , messageId: 3,  timestamp: NOW + 20000  },
  // { senderId: 4, receiverId: -1, messageText: "4 The FOURTH message" , messageId: 3,  timestamp: NOW + 40000  },
  // { senderId: 3, receiverId: -1, messageText: "5 The FIFTH message"  , messageId: 4,  timestamp: NOW + 90000  },
  // { senderId: 1, receiverId: -1, messageText: "6 The SIXTH message"  , messageId: 5, timestamp: NOW + 150000 },
  {
    senderId: 2,
    receiverId: null,
    messageText: "7 The SEVENTH message",
    messageId: 4,
    timestamp: NOW + 200000
  }
];

const INVITATION: Invitation = {
  id: 1,
  emailAddress: "charlie@hba.org",
  firstName: "Charlie",
  lastName: "Papazian",
  institution: "Home Brewers Association",
  accepted: false
};

const ROOMS: { [id: string]: Room } = {
  1: {
    id: 1,
    name: "Green Room",
    capacity: 8,
    zoomLink: "https://meet.jit.si/109283740293847",
    color: "#00ff00",
    topic: "Stuffs"
  },
  2: {
    id: 2,
    name: "Red Room",
    capacity: 5,
    zoomLink: "https://meet.jit.si/018471092384710",
    color: "#ff0000",
    topic: ""
  },
  3: {
    id: 3,
    name: "Blue Room",
    capacity: 10,
    zoomLink: "https://meet.jit.si/102389471203487",
    color: "#0000ff",
    topic: ""
  }
};

const USERS: { [id: string]: User } = {
  1: {
    id: 1,
    photoURL:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Avatar_cat.png/120px-Avatar_cat.png",
    displayName: "Firstname Q. Lastname, Ph. D.",
    institution: "Homebrewers",
    pronouns: "they/them",
    bio: "",
    website: "#ThisIsAMisleadingHashtag",
    level: "organizer",
    room: "1"
    // room: null
  },
  2: {
    id: 2,
    photoURL: null,
    displayName: "昔追能変",
    institution: "",
    pronouns: "he/him",
    bio: "",
    website: "https://example.com",
    level: "attendee",
    room: "1"
  },
  3: {
    id: 3,
    photoURL:
      "https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif",

    displayName: "ţ̶̨̛͎̤͍̥̝̺̦̖̪͎̮̖̪̗̣̤̦͓͛̌̀̓̑̅̈̅͆̅͋̏̆̀̔̈́̈́̓́̈̿̀̈́̂̏͌͗͜͠͝͝͝h̸̨̧̢̛̟͎̯̠͕͈͔̥̙͕̳͍̫͔̬͖̖̣͖̳̫͕̰̗̣̭͙̘͕͎͕͍̤͈̦̦̳̠́̓͆̄͗͑̈́͂̔̈́̎͒͂̇̎̌͐͌̓̂̔̃̏̾̓̈́̏͌̐̄͜͝ͅi̷̡̨̧̨̢̢̡̫͎̬̪͓͉̳̥̬̖̫̖͎̤̯̤̜͓͉̼͙̼̭̩͉̻̣̝͖͇̲̖̹̣͍͙͓̯̇͛͆ş̶̨͙̥͈̝̞̜̥̯̻̦̥͖̯͕͚̦̫̭͍̱͚̑́̋̽͂̒̇͆̄̊͗̿̈̈́͋͒̏͒͊̆́͋͛͛̄̀̑͆̆͘͘͝͝͝ ̵̧̩̬͇̦̯͈̭͕̥̯̯̮͚̱̜̳͎͎̤̯͇̏̃̽̈́̈́n̸̨̡̡̨̧̫̗͔̗̗̠͔̪͔̠̝̖̝͇̪̳̝̙̰̣̘̤̮͎̲̙̖̺̼̹̖̱̦̰̑̌̅̑̍́͗́̆̿̈͛̏̀̀̍̽̀̒̎͘͘͠͝ͅą̶̧̯̩̬̰̮̬̝͙̬͕̰̰̫͕̬̗̜͍͖̱͚̱̳̰̫͍͙͕͋̓̑̇̀͗̓̃̐͒͠ͅͅm̴̨̪̩̦͙̱̰̺͍͓̹̥̗̠̞͎͇͔̤͉̺͙̹̼͈̳̓̏̀͜e̶̡̧̡̧̛̦͉͎̫̺̦̫͖͙͓͇̥̮̫͇͇̳͇̱̥̮̝̭̜̻̺̼̼̱̪̲̼̿͒̈̌̉̐̿͛̽̑́̄̎̓͑͌̈́ͅͅ ̵̡̧̢̧̙̲̼̯̗̖̟̜͈̦̟͈̪̣͉̙͂̈́̅̈́̇́̐̔̊̏̎̃̆̅͊̈́̕̕͝͝ͅh̴̡̢̨̡͈̰̖̦̺̯̱̻̭̲̗͚͚͓̖͈̥͈̪̼͍͔̺͇͔̺̱̼͉͙͚̃́́̍̇͐̐̉͜͝ͅa̴̢͍̪̰̗̓̋̈́͂̋̀̈́͒s̶̨̨͎̭͕̖͓͍̹͎͚̻͇͖̫͇͔̲̣͙̑̇̇͝ͅͅ ̵̢̞͍͇̪̌̋͆͌̐͂̓̽̀͂̒̈̇͒͋͛̽͆͒̓̌̆̅͗̾̎̄̆͠ļ̴̡̜̰̦͓̗̀̉̄́͛̀͌̿͋̈́́̈́̆̚ǫ̷̢̬͉̞͓͐̾̀̾̿͛̊̔̃͒̔͊̅̏̎̑̿͂͑͗̽̈́͛̄͆̉̾͂̉̚͘͘͝͝͝ṱ̶̤̗͉̱͈̺̠̤̉͜s̸̨̛̭̜̼̬̮͕̤̻͉̯͙̥̟̤̩̘̃̈́̈͌̑́͂͑̉͒̉̀͑̄̃̀͊͒̈́͌̉̾͗̓̽̉́̂́̋́͐̓̉̄̉̈͘͘͘̕͜͝͠͝ͅ ̵̢̗̯̹͈̦͚̮̭̝̭͙̜̭̖̪͕̹̲͙͍͕̱̤̝͚̜͔͚̘̣͔͙̫̠̔̈́̂́̔͐́̏͆͑͆̌̿̋̎̍̀̂͌̓͆̌̅͗̚̚͜͜ͅớ̵̡̡̢̨̘̝̟̤͙͚̟̳̩͉̹͙̦̪̥̻̻̘̝͓͙̰̽̈́̄̇͆͌́̈̋̄́̍͌̏̏̓̂̓́̋̾͗̓̈́̎̃̐̔̏̓͂͒̈́̓̿̽͗̇̈̓̚̕͜͜͜͝ͅf̶͓̠͕̯̲̟̻̱̹̦̼͍̱̗͚̠̙̲̬̠̯̖͖̺̟̟̈́͌ͅͅͅ ̶̢̞͙̐̓̔̈́͗͋͊̎͋͊̎̐̅̎̀̐̀̈́̚͝ą̴̧̡̧̢̢̛͖̝͓̩͓͍̭͇̣͇͚̦̗̠̼̜͍̹̘͎̠͍͚̩̥͎̺͚̰͈̱̰̈́̄́̊͂͐̃͐̓́̎̂̌̉͛̒̾̐̿̊̂̑̽̄̏͋̈́͒͆̽͛͑͘̚̚͝͝͠ͅç̷̧̢̧̨̬̥̪̯̪͖̭̣̩̤̺̘͍̣̝̘̝̗̭̹͍̮͉̯̥̝̱̜̙͙̲̗̯̺͙̀̏̏͊̇̓̈̀̏͑̃̿̐͂͛͆͆̃̓̕͘̕̚͜͝ͅc̵̢̡̛̛̛̛̭͉͚̙̲̠̼̹͓̦̳̰̤͈̞̭̙̥̓͋̐͊̎͋̏̔̈́̈́̿́̊̓̽͐̑͑̀̎̃͋̎̽̚͜͝͠͝͝͠e̵̡̢̢̡̧̨̛͚̣̞͎͚̳͚̫̪̰̺̦̗̱͉̮̦̙͇̺̭̳̯͓͓͖͇̻̤̹̯̞̘̲̯̞͔̹͌̂̒͆̒̅͊̈́̋̾́̇̆̾̀̓̊͑͑͐̾̄̇̅͋͛̄̇͒̕̚͜͠n̷͇̗̣̖̣͚̲̒̀̐̇̐̇͊̽͆̎̂̅͑̊̒̒́̑̕͝t̴̡̢̡̢̛̝̟͚̙̦̘̖͎̼̱̜͓̮͇̞̹͈̼͓̖̹͚̟̔͗̉̓̊̃̆̒́̈́̎̈̇͒̍̂̈́̊̈́̔̾́͊̔́͊̂͐̉̐̃͋̿͆̆̋̓͌͘̕̚̚̚͠ͅs̷̨̢̧̫̞̞̼͈̦̟̲̠̺̥̦͈̝̠̬̞̪̠͖̼̈̊̿̇̅̌̾͒͠ͅͅ",

    institution: "Russian River",
    pronouns: "או אנא רשימות",
    bio: "A bio",
    website: "",
    level: "attendee",
    room: "2"
  },
  4: {
    id: 4,
    photoURL:
      "https://upload.wikimedia.org/wikipedia/commons/a/a1/Johnrogershousemay2020.webp",
    displayName: "Vinnie Cilurzo",
    institution: "Russian River",
    pronouns: "",
    bio:
      "فسقط مشاركة لليابان مع لها. مع وبعض غينيا أما. بـ قام ووصف الحدود, و جيوب فكان الدولارات بحث, مدن احداث تكتيكاً ماليزيا، بـ. ضرب أم بوابة اتّجة, بـ ضمنها للجزر ولم.\nأسيا انتهت فصل مع. إذ وسوء أحدث الستار كلا, جعل سكان فهرست الضغوط ما, مليارات الأوروبيّون لان ثم. هنا؟ مواقعها والكوري حين عل, كل به، الأوضاع والفلبين",
    website: "",
    level: "attendee",
    room: "2"
  },
  5: {
    id: 5,
    photoURL: null,
    displayName: "Greg Koch",
    institution: "את עזה שפות הבתב שמות ננקטת ע",
    pronouns: "he/him/his or they/them/theirs",
    bio: "",
    website: "",
    level: "attendee",
    room: "3"
  },
  6: {
    id: 6,
    photoURL:
      "https://upload.wikimedia.org/wikipedia/commons/8/87/SVG_animation_using_CSS.svg",
    displayName: "Ratiöňibûş O’Foobarlingtonshire",
    institution: "Stone Brewing",
    pronouns: "",
    bio: "",
    website:
      "ThisIsALongLineWithNoNaturalBreaks0987654321abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    level: "attendee",
    room: "3"
  },
  9: {
    id: 9, // Skipped a couple of ids on purpose
    photoURL: null,
    displayName: "واندونيسيا، هو, سكان شاسعة أعلنت ",
    institution: "Stone Brewing",
    pronouns: "",
    bio: "",
    website: "",
    level: "attendee",
    room: "3"
  }
};

const SESSION_USER_ID = "1";

/* eslint-disable @typescript-eslint/no-unused-vars */
class ApiService {
  constructor(private accessToken: string | null) {}

  readUpto: MessageId = 0;

  currentClock = 0;

  get sessionUserId(): string | null {
    if (!this.accessToken) {
      return null;
    }
    return SESSION_USER_ID;
  }

  // Auth

  async signIn(emailAddress: string, password: string): Promise<User> {
    await delay();
    this.accessToken = "accessToken";
    return USERS[SESSION_USER_ID];
  }

  async signUp(data: UserSignUp): Promise<User> {
    await delay();
    return USERS[SESSION_USER_ID];
  }

  signedIn() {
    return this.accessToken !== null;
  }

  signOut() {
    this.accessToken = null;
    return Promise.resolve();
  }

  // Invitations

  async getInvitation(param: string): Promise<Invitation> {
    await delay();
    return INVITATION;
  }

  sendInvitations(invitations: InvitationInsert[]): Promise<string[]> {
    return Promise.reject("Not implemented");
  }

  getInvitations(): Promise<Invitation[]> {
    return Promise.reject("Not implemented");
  }

  // Users

  async user(userId: number): Promise<User> {
    await delay();
    const user = USERS[SESSION_USER_ID];
    if (user) {
      return user;
    } else {
      return this.errorResponse(404);
    }
  }

  async users(): Promise<User[]> {
    await delay();
    return Object.values(USERS);
  }

  async updateUserDataMe(data: UserData): Promise<User> {
    await delay();
    const user = USERS[SESSION_USER_ID];
    if (user) {
      return { ...user, ...data };
    } else {
      return this.errorResponse(404);
    }
  }

  // Rooms

  rooms(): Promise<Room[]> {
    return Promise.resolve(Object.values(ROOMS));
  }

  updateRoom(id: number, data: RoomData): Promise<Room> {
    return Promise.resolve({ ...data, id });
  }

  updateTopic(id: number, topic: string): Promise<Room> {
    return Promise.resolve({ ...ROOMS[id], topic });
  }

  updateRooms(updates: Room[], inserts: RoomData[]): Promise<number[]> {
    return Promise.reject("Not implemented");
  }

  joinRoom(roomId: string): Promise<string> {
    return Promise.resolve(ROOMS[roomId].zoomLink);
  }

  leaveRoom(): Promise<void> {
    return Promise.reject("Not implemented");
  }

  // Files

  async uploadFile(file: File, code?: string): Promise<string> {
    await delay();
    return Promise.resolve(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Avatar_cat.png/120px-Avatar_cat.png"
    );
  }

  // Messages

  recvMessages(): Promise<RecvMessage[]> {
    const msgs = MESSAGES.filter(
      v => this.readUpto < v.messageId && v.messageId <= this.currentClock
    );
    this.currentClock += 1;
    return Promise.resolve(msgs);
  }

  markRead(msgId: MessageId): Promise<string> {
    const alreadyReadUpto = this.readUpto;
    if (alreadyReadUpto < msgId) {
      this.readUpto = msgId;
    }
    return Promise.resolve("ok");
  }

  sendMessage(sendMsg: SendMessage): Promise<string> {
    const recvMsg: RecvMessage = Object.assign(sendMsg, {
      messageId: this.currentClock
    });
    MESSAGES.push(recvMsg);
    // console.log("Sending a message:", recvMsg);
    return Promise.resolve("ok");
  }

  // Errors

  errorResponse(status: number): Promise<any> {
    return Promise.reject({ response: { status: status } });
  }
}

export default new ApiService("accessToken");
