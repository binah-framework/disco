import {
  Invitation,
  InvitationInsert,
  Room,
  RoomData,
  User,
  UserData,
  UserSignUp,
  RecvMessage,
  MessageId,
  SendMessage
} from "@/models";
import router from "@/router";
import axios, { AxiosRequestConfig } from "axios";
import _ from "lodash";

const API_URL = "/api";

function delay(ms = 1000) {
  if (process.env.NODE_ENV === "development") {
    return new Promise(resolve => setTimeout(resolve, ms));
  } else {
    return Promise.resolve();
  }
}

class ApiService {
  // Auth

  async signIn(emailAddress: string, password: string): Promise<User> {
    await delay();
    const response = await axios.post(`${API_URL}/signin`, {
      emailAddress: emailAddress,
      password: password
    });

    return response.data;
  }

  async signUp(data: UserSignUp): Promise<User> {
    await delay();
    const response = await axios.post(`${API_URL}/signup`, data);
    return response.data;
  }

  async signOut() {
    const _ = await axios.post(`${API_URL}/signout`);
  }

  // Invitations

  getInvitation(param: string): Promise<Invitation> {
    const [id, code] = _.split(param, ".", 2);
    return this.get(`/invitation/${id}?code=${code}`);
  }

  sendInvitations(invitations: InvitationInsert[]) {
    return this.put("/invitation", invitations);
  }

  getInvitations(): Promise<Invitation[]> {
    return this.get("/invitation");
  }

  // Users

  users(): Promise<[User]> {
    return this.get("/user");
  }

  user(userId: number | "me"): Promise<User> {
    return this.get(`/user/${userId}`);
  }

  updateUserDataMe(data: UserData): Promise<User> {
    return this.post(`/user/me`, data);
  }

  // Rooms

  rooms(): Promise<Room[]> {
    return this.get("/room");
  }

  updateRoom(id: number, data: RoomData): Promise<Room> {
    return this.post(`/room/${id}`, data);
  }

  updateTopic(id: number, topic: string): Promise<Room> {
    return this.post(`/room/${id}/topic`, { topic });
  }

  updateRooms(updates: Room[], inserts: RoomData[]): Promise<number[]> {
    return this.post("/room", {
      inserts: inserts,
      updates: updates
    });
  }

  joinRoom(roomId: string): Promise<string> {
    return this.post(`/room/${roomId}/join`);
  }

  leaveRoom(): Promise<void> {
    return this.post("/room/current/leave");
  }

  // Files

  presignURL(param?: string): Promise<string> {
    if (param) {
      const [id, code] = _.split(param, ".");
      return axios
        .get(`${API_URL}/signurl?code=${code}&id=${id}`)
        .then(r => r.data);
    } else {
      return this.get("/signurl");
    }
  }

  async uploadFile(file: File, code?: string): Promise<string> {
    const presigned = await this.presignURL(code);
    await axios.put(presigned, file, {
      headers: { "Content-Type": file.type }
    });
    const u = new URL(presigned);
    return `${u.protocol}//${u.host}${u.pathname}`;
  }

  // Messages

  recvMessages(): Promise<RecvMessage[]> {
    return this.get(`/message/receive`);
  }

  markRead(msgId: MessageId): Promise<string> {
    return this.post(`/message/read/${msgId}`);
  }

  sendMessage(msg: SendMessage): Promise<string> {
    return this.post(`/message/send`, msg);
  }

  // Beacon

  sendBeacon() {
    navigator.sendBeacon(`${API_URL}/room/current/leave`);
  }

  // Raw Requests

  async post(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    await delay();
    try {
      const response = await axios.post(`${API_URL}${path}`, data, config);
      return response.data;
    } catch (error) {
      if (error.response?.status == 401) {
        this.redirectToSignIn();
        return Promise.race([]);
      } else {
        throw error;
      }
    }
  }

  async get(path: string, config?: AxiosRequestConfig): Promise<any> {
    await delay();
    try {
      const response = await axios.get(`${API_URL}${path}`, config);
      return response.data;
    } catch (error) {
      if (error.response?.status == 401) {
        this.redirectToSignIn();
        return Promise.race([]);
      } else {
        throw error;
      }
    }
  }

  async put(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    await delay();
    try {
      const response = await axios.put(`${API_URL}${path}`, data, config);
      return response.data;
    } catch (error) {
      if (error.response?.status == 401) {
        this.redirectToSignIn();
        return Promise.race([]);
      } else {
        throw error;
      }
    }
  }

  async redirectToSignIn() {
    if (router.currentRoute.name != "SignIn") {
      router.replace({ name: "SignIn" });
    }
  }
}

export default new ApiService();
