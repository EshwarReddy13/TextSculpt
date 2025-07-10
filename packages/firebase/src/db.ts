import { getDatabase } from "firebase/database";
import { app } from "./firebase";

export const db = getDatabase(app); 