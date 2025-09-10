import { SOCKET_URL } from "@/environment"
import { io } from 'socket.io-client';
const socket = io(SOCKET_URL);
export default socket;
